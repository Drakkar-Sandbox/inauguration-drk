import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";

import DashboardPolicy from "#features/inauguration/backoffice/dashboard/policies/dashboard.policy";
import DashboardService from "#features/inauguration/backoffice/dashboard/services/dashboard.service";

@inject()
export default class ViewDashboardController {
	constructor(protected dashboardService: DashboardService) {}

	async handle({ bouncer }: HttpContext) {
		await bouncer.with(DashboardPolicy).authorize("view");

		return this.dashboardService.stats();
	}
}
