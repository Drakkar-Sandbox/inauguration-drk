import { Exception } from "@adonisjs/core/exceptions";

export default class LeifSessionNotFoundException extends Exception {
	static status = 404;
	static code = "E_LEIF_SESSION_NOT_FOUND";
	static message = "Kiosk session not found or expired.";
}
