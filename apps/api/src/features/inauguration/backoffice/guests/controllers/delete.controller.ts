import { HttpContext } from "@adonisjs/core/http";

import GuestPolicy from "#features/inauguration/backoffice/guests/policies/guest.policy";
import Guest from "#models/guest";

export default class DeleteGuestController {
	async handle({ params, bouncer }: HttpContext) {
		await bouncer.with(GuestPolicy).authorize("delete");

		const guest = await Guest.findOrFail(params.id);
		await guest.delete();

		return null;
	}
}
