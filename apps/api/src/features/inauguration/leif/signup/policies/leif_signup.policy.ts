import { allowGuest, BasePolicy } from "@adonisjs/bouncer";

/**
 * Like invitations, the signup dialogue is public: the guest token is the credential.
 */
export default class LeifSignupPolicy extends BasePolicy {
	@allowGuest()
	message() {
		return true;
	}
}
