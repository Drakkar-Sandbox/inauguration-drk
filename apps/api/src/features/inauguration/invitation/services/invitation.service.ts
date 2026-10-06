import { inject } from "@adonisjs/core";
import db from "@adonisjs/lucid/services/db";
import { DateTime } from "luxon";

import GuestNotFoundException from "#exceptions/guest_not_found.exception";
import PlusOneDeadlinePassedException from "#features/inauguration/invitation/exceptions/plus_one_deadline_passed.exception";
import PlusOneNotAllowedException from "#features/inauguration/invitation/exceptions/plus_one_not_allowed.exception";
import SendInvitationConfirmation from "#features/inauguration/invitation/jobs/send_invitation_confirmation.job";
import SendPlusOneInvitation from "#features/inauguration/invitation/jobs/send_plus_one_invitation.job";
import Guest from "#models/guest";
import EventService from "#services/event.service";

@inject()
export default class InvitationService {
	constructor(protected eventService: EventService) {}

	async findByToken(token: string) {
		const guest = await Guest.query()
			.where("token", token)
			.preload("host")
			.preload("plusOne")
			.first();
		if (!guest) throw new GuestNotFoundException();

		return guest;
	}

	async respond(guest: Guest, response: "confirmed" | "declined") {
		const wasConfirmed = guest.status === "confirmed";

		await db.transaction(async (trx) => {
			guest.useTransaction(trx);
			await guest.merge({ status: response, respondedAt: DateTime.now() }).save();

			// A declined host does not bring a plus-one.
			if (response === "declined") {
				await Guest.query({ client: trx }).where("host_guest_id", guest.id).delete();
			}
		});

		if (response === "confirmed" && !wasConfirmed && guest.email) {
			await SendInvitationConfirmation.dispatch({ guestId: guest.id });
		}

		return this.findByToken(guest.token);
	}

	async consent(guest: Guest, given: boolean) {
		const now = DateTime.now();

		await guest
			.merge({
				consentGivenAt: given ? now : null,
				consentRefusedAt: given ? null : now,
			})
			.save();

		return this.findByToken(guest.token);
	}

	/**
	 * Creates the plus-one of a primary guest, or replaces the existing one. A replaced
	 * plus-one is deleted so its QR code stops working; the new one gets a fresh token.
	 */
	async upsertPlusOne(
		guest: Guest,
		payload: { firstName: string; lastName: string; email: string },
	) {
		this.#assertCanManagePlusOne(guest);

		const plusOne = await db.transaction(async (trx) => {
			await Guest.query({ client: trx }).where("host_guest_id", guest.id).delete();

			return Guest.create(
				{
					...payload,
					email: payload.email.toLowerCase(),
					company: null,
					kind: "plus_one",
					hostGuestId: guest.id,
					status: "confirmed",
					respondedAt: DateTime.now(),
					referentUserId: guest.referentUserId,
				},
				{ client: trx },
			);
		});

		await SendPlusOneInvitation.dispatch({ guestId: plusOne.id });

		return this.findByToken(guest.token);
	}

	async deletePlusOne(guest: Guest) {
		this.#assertCanManagePlusOne(guest);

		await Guest.query().where("host_guest_id", guest.id).delete();

		return this.findByToken(guest.token);
	}

	#assertCanManagePlusOne(guest: Guest) {
		if (guest.kind !== "primary" || guest.status !== "confirmed") {
			throw new PlusOneNotAllowedException();
		}
		if (!this.eventService.isPlusOneEditable()) {
			throw new PlusOneDeadlinePassedException();
		}
	}
}
