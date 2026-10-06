import { Exception } from "@adonisjs/core/exceptions";

export default class LeifTextNotAllowedException extends Exception {
	static status = 403;
	static code = "E_LEIF_TEXT_NOT_ALLOWED";
	static message = "Only lines said by the avatar to this guest can be voiced.";
}
