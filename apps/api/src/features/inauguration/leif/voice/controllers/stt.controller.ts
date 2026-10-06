import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";

import GuestNotFoundException from "#exceptions/guest_not_found.exception";
import InvitationService from "#features/inauguration/invitation/services/invitation.service";
import LeifAudioInvalidException from "#features/inauguration/leif/exceptions/leif_audio_invalid.exception";
import LeifQuotaService from "#features/inauguration/leif/services/leif_quota.service";
import LeifVoicePolicy from "#features/inauguration/leif/voice/policies/leif_voice.policy";
import LeifSpeechService from "#features/inauguration/leif/voice/services/leif_speech.service";

// ~30 s of compressed speech; kiosks (directional mic, longer pitches) get more room.
const MAX_GUEST_AUDIO_BYTES = 1024 * 1024;
const MAX_STAFF_AUDIO_BYTES = 2 * 1024 * 1024;
const MAX_GUEST_TRANSCRIPTIONS_PER_DAY = 60;
const AUDIO_TYPES = /^(audio\/(webm|ogg|mp4|mpeg|wav|x-m4a)|video\/(webm|mp4))\b/;

/**
 * Transcribes a push-to-talk recording (multipart field `audio`, French; ≤ 1 MB for guests,
 * 60 per guest per day; ≤ 2 MB for staff kiosks). The audio is
 * streamed into memory, sent to the speech provider and dropped: never written to disk
 * nor stored. Guests authenticate with the `X-Invitation-Token` header.
 */
@inject()
export default class LeifSttController {
	constructor(
		protected leifSpeechService: LeifSpeechService,
		protected invitationService: InvitationService,
		protected leifQuotaService: LeifQuotaService,
	) {}

	async handle({ request, auth, bouncer }: HttpContext) {
		await bouncer.with(LeifVoicePolicy).authorize("stt");

		let maxBytes = MAX_STAFF_AUDIO_BYTES;
		if (!auth.isAuthenticated) {
			const guestToken = request.header("x-invitation-token");
			if (!guestToken) throw new GuestNotFoundException();
			const guest = await this.invitationService.findByToken(guestToken);
			await this.leifQuotaService.consume(
				"stt",
				String(guest.id),
				MAX_GUEST_TRANSCRIPTIONS_PER_DAY,
			);
			maxBytes = MAX_GUEST_AUDIO_BYTES;
		}

		const chunks: Buffer[] = [];
		let size = 0;
		let mimeType = "";
		request.multipart.onFile("audio", {}, async (part) => {
			mimeType = part.headers["content-type"] ?? "";
			for await (const chunk of part) {
				size += chunk.length;
				// Keep draining the stream, but stop buffering past the limit.
				if (size <= maxBytes) chunks.push(chunk);
			}
			return {};
		});
		await request.multipart.process({ limit: maxBytes + 64 * 1024 });

		if (chunks.length === 0 || size > maxBytes || !AUDIO_TYPES.test(mimeType)) {
			throw new LeifAudioInvalidException();
		}

		const audio = Buffer.concat(chunks);
		chunks.length = 0;

		return { text: await this.leifSpeechService.transcribe(audio, mimeType) };
	}
}
