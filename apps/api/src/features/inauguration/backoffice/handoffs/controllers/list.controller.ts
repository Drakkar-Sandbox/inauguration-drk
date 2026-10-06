import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import vine from "@vinejs/vine";

import HandoffPolicy from "#features/inauguration/backoffice/handoffs/policies/handoff.policy";
import Handoff, { HANDOFF_STATUSES } from "#models/handoff";
import HandoffPresenter from "#presenters/handoff.presenter";

@inject()
export default class ListHandoffsController {
	constructor(protected handoffPresenter: HandoffPresenter) {}

	async handle({ request, auth, bouncer }: HttpContext) {
		await bouncer.with(HandoffPolicy).authorize("list");

		const { status, mine } = await request.validateUsing(ListHandoffsController.payloadSchema);

		const handoffs = await Handoff.query()
			.preload("guest")
			.preload("referent")
			.if(status, (query) => query.where("status", status!))
			.if(mine, (query) => query.where("referent_user_id", auth.user!.id))
			.orderBy("created_at", "desc")
			.limit(500);

		return handoffs.map((handoff) => this.handoffPresenter.toJSON(handoff));
	}

	static payloadSchema = vine.create({
		status: vine.enum(HANDOFF_STATUSES).optional(),
		mine: vine.boolean().optional(),
	});
}
