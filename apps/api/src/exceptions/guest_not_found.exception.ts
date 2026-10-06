import { Exception } from "@adonisjs/core/exceptions";

export default class GuestNotFoundException extends Exception {
	static status = 404;
	static code = "E_GUEST_NOT_FOUND";
	static message = "Invitation introuvable.";
}
