import { allowGuest, BasePolicy } from "@adonisjs/bouncer";

/**
 * Invitation routes are public: the unguessable guest token in the URL is the credential.
 */
export default class InvitationPolicy extends BasePolicy {
	@allowGuest()
	view() {
		return true;
	}

	@allowGuest()
	respond() {
		return true;
	}

	@allowGuest()
	consent() {
		return true;
	}

	@allowGuest()
	updatePlusOne() {
		return true;
	}

	@allowGuest()
	deletePlusOne() {
		return true;
	}

	@allowGuest()
	calendar() {
		return true;
	}

	@allowGuest()
	qrCode() {
		return true;
	}
}
