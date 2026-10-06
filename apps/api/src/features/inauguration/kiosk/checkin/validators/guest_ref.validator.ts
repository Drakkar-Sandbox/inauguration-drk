import vine from "@vinejs/vine";

/**
 * How a day-J screen designates a guest: the scanned QR code (raw token or full URL) or,
 * after a manual name search, the guest id.
 */
export const GuestRefSchema = {
	token: vine.string().minLength(1).maxLength(2048).optional().requiredIfMissing("guestId"),
	guestId: vine.number().withoutDecimals().positive().optional().requiredIfMissing("token"),
};

export type GuestRef = { token?: string; guestId?: number };
