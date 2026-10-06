import { inject } from "@adonisjs/core";

import type { SignupTurn } from "#features/inauguration/leif/signup/services/signup_conversation.service";
import InvitationPresenter from "#presenters/invitation.presenter";

/**
 * One turn of the signup dialogue with the avatar, plus the up-to-date public invitation.
 */
@inject()
export default class LeifSignupTurnPresenter {
	constructor(private invitationPresenter: InvitationPresenter) {}

	toJSON(turn: SignupTurn) {
		return {
			// `text` is displayed; only `spoken` may be sent to TTS (no guest-typed values).
			reply: { text: turn.text, spoken: turn.spoken },
			step: turn.step,
			choices: turn.choices,
			form: turn.form,
			done: turn.done,
			invitation: this.invitationPresenter.toJSON(turn.guest),
		};
	}
}
