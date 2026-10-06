import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import vine from "@vinejs/vine";

import eventConfig from "#config/event";
import SpeechPolicy from "#features/inauguration/kiosk/speech/policies/speech.policy";
import SpeechService from "#features/inauguration/kiosk/speech/services/speech.service";

@inject()
export default class TriggerSpeechController {
	constructor(protected speechService: SpeechService) {}

	async handle({ request, bouncer }: HttpContext) {
		await bouncer.with(SpeechPolicy).authorize("trigger");

		const { cueId } = await request.validateUsing(TriggerSpeechController.payloadSchema);

		return this.speechService.trigger(cueId);
	}

	static payloadSchema = vine.create({
		cueId: vine.string().in(eventConfig.speechCues.map((cue) => cue.id)),
	});
}
