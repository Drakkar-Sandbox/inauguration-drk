import { Exception } from "@adonisjs/core/exceptions";

export default class PlusOneNotAllowedException extends Exception {
	static status = 403;
	static code = "E_PLUS_ONE_NOT_ALLOWED";
	static message = "Only a confirmed primary guest can manage a plus-one.";
}
