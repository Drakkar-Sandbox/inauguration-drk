import { TuyauError } from "@tuyau/core/client";

import type { SynthesizedSpeech } from "#/features/inauguration/leif/types";
import { client } from "#/libs/tuyau";

/**
 * Leif's voice endpoints. Guests authenticate with their invitation token; kiosks with the
 * staff session cookie (omit the token).
 */
export async function synthesizeSpeech(
	text: string,
	invitationToken?: string,
): Promise<SynthesizedSpeech | null> {
	const response = await client.request("inauguration.leif.tts", {
		body: { text, token: invitationToken },
		timeout: 15_000,
	});

	if (!response.audioBase64 || !response.alignment) return null;

	return { audioBase64: response.audioBase64, alignment: response.alignment };
}

export async function transcribeSpeech(audio: File, invitationToken?: string) {
	// The audio is read as a multipart stream server-side, so the route declares no body schema.
	const response = await client.request("inauguration.leif.stt", {
		body: { audio },
		// Per-request headers replace the superjson plugin's: keep its marker so the reply is encoded
		// the way the client decodes it.
		headers: {
			"x-superjson": "true",
			...(invitationToken ? { "X-Invitation-Token": invitationToken } : {}),
		},
		timeout: 30_000,
	} as never);

	return response.text;
}

/** Absolute URL of a public invitation file (.ics, QR code), opened as a plain link. */
export function invitationFileUrl(
	name: "inauguration.invitations.calendar" | "inauguration.invitations.qr_code",
	token: string,
) {
	const { url } = client.getRoute(name, { params: { token } } as never);

	return `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "")}${url}`;
}

/** HTTP status of a failed Tuyau call (`null` for network errors and anything else). */
export function errorStatus(error: unknown) {
	return error instanceof TuyauError ? (error.status ?? null) : null;
}
