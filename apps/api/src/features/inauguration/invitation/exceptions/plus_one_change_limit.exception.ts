import { Exception } from "@adonisjs/core/exceptions";

export default class PlusOneChangeLimitException extends Exception {
	static status = 429;
	static code = "E_PLUS_ONE_CHANGE_LIMIT";
	static message = "The plus-one has been changed too many times. Please contact the organizers.";
}
