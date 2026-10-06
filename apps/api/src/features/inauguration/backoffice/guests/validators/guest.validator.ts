import vine from "@vinejs/vine";

import { GUEST_STATUSES, MEETING_STATUSES } from "#models/guest";

export const GuestNameValidator = vine.string().minLength(1).maxLength(100);

export const GuestEmailValidator = vine.string().email().maxLength(254);

export const GuestReferentValidator = vine.number().exists({ table: "users", column: "id" });

export const GuestFieldsSchema = {
	email: GuestEmailValidator.clone().nullable().optional(),
	company: vine.string().maxLength(200).nullable().optional(),
	status: vine.enum(GUEST_STATUSES).optional(),
	referentUserId: GuestReferentValidator.clone().nullable().optional(),
	angleTopic: vine.string().maxLength(2000).nullable().optional(),
	angleNotes: vine.string().maxLength(10000).nullable().optional(),
	meetingStatus: vine.enum(MEETING_STATUSES).optional(),
};
