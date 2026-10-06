import { BasePolicy } from "@adonisjs/bouncer";

/**
 * Back-office guest management is open to every authenticated staff member.
 */
export default class GuestPolicy extends BasePolicy {
	list() {
		return true;
	}

	view() {
		return true;
	}

	create() {
		return true;
	}

	update() {
		return true;
	}

	delete() {
		return true;
	}

	import() {
		return true;
	}

	export() {
		return true;
	}
}
