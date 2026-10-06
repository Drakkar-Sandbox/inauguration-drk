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
			reply: { text: turn.text },
			step: turn.step,
			choices: turn.choices,
			form: turn.form,
			done: turn.done,
			invitation: this.invitationPresenter.toJSON(turn.guest),
		};
	}
}
