import { Exception } from "@adonisjs/core/exceptions";

export default class LeifTurnLimitException extends Exception {
	static status = 429;
	static code = "E_LEIF_TURN_LIMIT";
	static message = "Conversation limit reached, please try again later.";
}
