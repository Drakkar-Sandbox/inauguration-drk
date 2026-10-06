import { allowGuest, BasePolicy } from "@adonisjs/bouncer";

/**
 * Open to staff sessions (kiosks) and to guests holding a valid invitation token, which
 * the controllers check.
 */
export default class LeifVoicePolicy extends BasePolicy {
	@allowGuest()
	tts() {
		return true;
	}

	@allowGuest()
	stt() {
		return true;
	}
}
