import { Exception } from "@adonisjs/core/exceptions";

export default class PlusOneDeadlinePassedException extends Exception {
	static status = 403;
	static code = "E_PLUS_ONE_DEADLINE_PASSED";
	static message = "The plus-one can no longer be modified.";
}
