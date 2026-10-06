import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import vine from "@vinejs/vine";

import GuestNotFoundException from "#exceptions/guest_not_found.exception";
import InvitationService from "#features/inauguration/invitation/services/invitation.service";
import LeifTextNotAllowedException from "#features/inauguration/leif/exceptions/leif_text_not_allowed.exception";
import SignupConversationService from "#features/inauguration/leif/signup/services/signup_conversation.service";
import LeifVoicePolicy from "#features/inauguration/leif/voice/policies/leif_voice.policy";
import LeifSpeechService from "#features/inauguration/leif/voice/services/leif_speech.service";

/**
 * Speaks a line with timestamps (subtitles + lip-sync). Returns null audio when no voice
 * is configured: clients then show the text only. Guests (token) can only voice exactly
 * the `reply.spoken` of their last signup turn; staff sessions can voice any line.
 */
@inject()
export default class LeifTtsController {
	constructor(
		protected leifSpeechService: LeifSpeechService,
		protected invitationService: InvitationService,
		protected signupConversationService: SignupConversationService,
	) {}

	async handle({ request, auth, bouncer }: HttpContext) {
		await bouncer.with(LeifVoicePolicy).authorize("tts");

		const { text, token } = await request.validateUsing(LeifTtsController.payloadSchema);

		if (!auth.isAuthenticated) {
			const guestToken = token ?? request.header("x-invitation-token");
			if (!guestToken) throw new GuestNotFoundException();
			const guest = await this.invitationService.findByToken(guestToken);

			if (
				this.leifSpeechService.enabled &&
				!(await this.signupConversationService.canVoice(guest, text))
			) {
				throw new LeifTextNotAllowedException();
			}
		}

		const { speech, cached } = await this.leifSpeechService.speak(text);

		return {
			audioBase64: speech?.audioBase64 ?? null,
			alignment: speech?.alignment ?? null,
			cached,
		};
	}

	static payloadSchema = vine.create({
		text: vine.string().trim().minLength(1).maxLength(1000),
		token: vine.string().maxLength(64).optional(),
	});
}
