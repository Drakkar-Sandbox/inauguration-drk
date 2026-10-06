import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";

import SpeechPolicy from "#features/inauguration/kiosk/speech/policies/speech.policy";
import SpeechService from "#features/inauguration/kiosk/speech/services/speech.service";

@inject()
export default class CuesSpeechController {
	constructor(protected speechService: SpeechService) {}

	async handle({ bouncer }: HttpContext) {
		await bouncer.with(SpeechPolicy).authorize("view");

		return this.speechService.cues();
	}
}
