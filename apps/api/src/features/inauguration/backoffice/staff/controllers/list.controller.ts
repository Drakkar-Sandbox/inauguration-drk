import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";

import StaffPolicy from "#features/inauguration/backoffice/staff/policies/staff.policy";
import User from "#models/user";
import UserPresenter from "#presenters/user.presenter";

/**
 * Staff members (application users), used to pick a guest referent.
 */
@inject()
export default class ListStaffController {
	constructor(protected userPresenter: UserPresenter) {}

	async handle({ bouncer }: HttpContext) {
		await bouncer.with(StaffPolicy).authorize("list");

		const users = await User.query().orderBy("name", "asc");

		return users.map((user) => this.userPresenter.toJSON(user));
	}
}
