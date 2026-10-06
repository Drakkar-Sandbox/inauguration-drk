import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import vine from "@vinejs/vine";

import HandoffPolicy from "#features/inauguration/backoffice/handoffs/policies/handoff.policy";
import Handoff, { HANDOFF_STATUSES } from "#models/handoff";
import HandoffPresenter from "#presenters/handoff.presenter";

@inject()
export default class UpdateHandoffController {
	constructor(protected handoffPresenter: HandoffPresenter) {}

	async handle({ params, request, bouncer }: HttpContext) {
		await bouncer.with(HandoffPolicy).authorize("update");

		const { status } = await request.validateUsing(UpdateHandoffController.payloadSchema);

		const handoff = await Handoff.findOrFail(params.id);
		await handoff.merge({ status }).save();
		await handoff.load((loader) => loader.load("guest").load("referent"));

		return this.handoffPresenter.toJSON(handoff);
	}

	static payloadSchema = vine.create({
		status: vine.enum(HANDOFF_STATUSES),
	});
}
