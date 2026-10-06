import { Exception } from "@adonisjs/core/exceptions";

export default class LeifAudioInvalidException extends Exception {
	static status = 422;
	static code = "E_LEIF_AUDIO_INVALID";
	static message = "Audio is missing, too large or not a supported format.";
}
