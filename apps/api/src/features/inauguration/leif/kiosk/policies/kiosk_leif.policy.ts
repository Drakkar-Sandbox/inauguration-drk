import { BasePolicy } from "@adonisjs/bouncer";

/**
 * Day-J screens are logged-in staff devices.
 */
export default class KioskLeifPolicy extends BasePolicy {
	greeting() {
		return true;
	}

	startSession() {
		return true;
	}

	message() {
		return true;
	}

	handoff() {
		return true;
	}

	endSession() {
		return true;
	}
}
