import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";

import GuestNotFoundException from "#exceptions/guest_not_found.exception";
import InvitationService from "#features/inauguration/invitation/services/invitation.service";
import LeifAudioInvalidException from "#features/inauguration/leif/exceptions/leif_audio_invalid.exception";
import LeifVoicePolicy from "#features/inauguration/leif/voice/policies/leif_voice.policy";
import LeifSpeechService from "#features/inauguration/leif/voice/services/leif_speech.service";

const MAX_AUDIO_BYTES = 5 * 1024 * 1024;
const AUDIO_TYPES = /^(audio\/(webm|ogg|mp4|mpeg|wav|x-m4a)|video\/(webm|mp4))\b/;

/**
 * Transcribes a push-to-talk recording (multipart field `audio`, French). The audio is
 * streamed into memory, sent to the speech provider and dropped: never written to disk
 * nor stored. Guests authenticate with the `X-Invitation-Token` header.
 */
@inject()
export default class LeifSttController {
	constructor(
		protected leifSpeechService: LeifSpeechService,
		protected invitationService: InvitationService,
	) {}

	async handle({ request, auth, bouncer }: HttpContext) {
		await bouncer.with(LeifVoicePolicy).authorize("stt");

		if (!auth.isAuthenticated) {
			const guestToken = request.header("x-invitation-token");
			if (!guestToken) throw new GuestNotFoundException();
			await this.invitationService.findByToken(guestToken);
		}

		const chunks: Buffer[] = [];
		let size = 0;
		let mimeType = "";
		request.multipart.onFile("audio", {}, async (part) => {
			mimeType = part.headers["content-type"] ?? "";
			for await (const chunk of part) {
				size += chunk.length;
				// Keep draining the stream, but stop buffering past the limit.
				if (size <= MAX_AUDIO_BYTES) chunks.push(chunk);
			}
			return {};
		});
		await request.multipart.process();

		if (chunks.length === 0 || size > MAX_AUDIO_BYTES || !AUDIO_TYPES.test(mimeType)) {
			throw new LeifAudioInvalidException();
		}

		const audio = Buffer.concat(chunks);
		chunks.length = 0;

		return { text: await this.leifSpeechService.transcribe(audio, mimeType) };
	}
}
