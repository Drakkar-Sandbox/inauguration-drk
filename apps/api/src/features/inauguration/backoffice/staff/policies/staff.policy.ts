import { BasePolicy } from "@adonisjs/bouncer";

export default class StaffPolicy extends BasePolicy {
	list() {
		return true;
	}
}
