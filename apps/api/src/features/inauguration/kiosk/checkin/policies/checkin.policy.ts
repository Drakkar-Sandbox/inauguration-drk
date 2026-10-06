import { BasePolicy } from "@adonisjs/bouncer";

/**
 * Day-J screens are logged-in staff devices.
 */
export default class CheckinPolicy extends BasePolicy {
	checkin() {
		return true;
	}

	search() {
		return true;
	}
}
