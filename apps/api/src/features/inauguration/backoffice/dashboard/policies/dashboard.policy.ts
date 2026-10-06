import { BasePolicy } from "@adonisjs/bouncer";

export default class DashboardPolicy extends BasePolicy {
	view() {
		return true;
	}
}
