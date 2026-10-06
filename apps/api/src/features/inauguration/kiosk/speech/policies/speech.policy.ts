import { BasePolicy } from "@adonisjs/bouncer";

export default class SpeechPolicy extends BasePolicy {
	view() {
		return true;
	}

	trigger() {
		return true;
	}
}
