import { BasePolicy } from "@adonisjs/bouncer";

export default class HandoffPolicy extends BasePolicy {
	list() {
		return true;
	}

	update() {
		return true;
	}
}
