import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import vine from "@vinejs/vine";

import LeifSignupPolicy from "#features/inauguration/leif/signup/policies/leif_signup.policy";
import SignupConversationService from "#features/inauguration/leif/signup/services/signup_conversation.service";
import LeifSignupTurnPresenter from "#presenters/leif_signup_turn.presenter";

/**
 * Sends a message to the avatar during signup. An empty body starts (or restarts) the
 * dialogue with a greeting.
 */
@inject()
export default class LeifSignupMessageController {
	constructor(
		protected signupConversationService: SignupConversationService,
		protected leifSignupTurnPresenter: LeifSignupTurnPresenter,
	) {}

	async handle({ params, request, bouncer }: HttpContext) {
		await bouncer.with(LeifSignupPolicy).authorize("message");

		const payload = await request.validateUsing(LeifSignupMessageController.payloadSchema);

		const turn = await this.signupConversationService.handle(params.token, payload);

		return this.leifSignupTurnPresenter.toJSON(turn);
	}

	static payloadSchema = vine.create({
		text: vine.string().trim().maxLength(500).optional(),
		choice: vine.string().maxLength(50).optional(),
		plusOne: vine
			.object({
				firstName: vine.string().trim().minLength(1).maxLength(100),
				lastName: vine.string().trim().minLength(1).maxLength(100),
				email: vine.string().trim().maxLength(254),
			})
			.optional(),
	});
}
