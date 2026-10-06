import type { TuyauError } from "@tuyau/core/client";

import i18n from "#/libs/i18n/config";
import { client } from "#/libs/tuyau";
import { toastifyTuyauError } from "#/utils/tuyau";

/**
 * Absolute URL of a back-office file endpoint (CSV export, QR PNG/SVG). These responses are
 * binary/text downloads, so they are opened as plain links instead of going through Tuyau.
 */
export function backofficeFileUrl(
	name:
		| "inauguration.backoffice.guests.export"
		| "inauguration.backoffice.guests.qr_png"
		| "inauguration.backoffice.guests.qr_svg",
	params: { id?: number } = {},
) {
	const { url } = client.getRoute(name, { params } as never);

	return `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "")}${url}`;
}

export function toastifyBackofficeError(error: TuyauError) {
	const t = i18n.getFixedT(null, "features.inauguration.backoffice.utils.api");

	return toastifyTuyauError(error, {
		E_NETWORK: [t("error.E_NETWORK.title"), { description: t("error.E_NETWORK.description") }],
		E_VALIDATION: [
			t("error.E_VALIDATION.title"),
			{ description: t("error.E_VALIDATION.description") },
		],
		E_UNAUTHENTICATED: [
			t("error.E_UNAUTHENTICATED.title"),
			{ description: t("error.E_UNAUTHENTICATED.description") },
		],
		E_ROW_NOT_FOUND: [
			t("error.E_ROW_NOT_FOUND.title"),
			{ description: t("error.E_ROW_NOT_FOUND.description") },
		],
		E_UNEXPECTED: [
			t("error.E_UNEXPECTED.title"),
			{ description: t("error.E_UNEXPECTED.description") },
		],
	});
}
