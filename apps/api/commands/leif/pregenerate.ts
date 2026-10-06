import { BaseCommand } from "@adonisjs/core/ace";
import type { CommandOptions } from "@adonisjs/core/types/ace";

import eventConfig from "#config/event";
import LeifLinesService from "#features/inauguration/leif/services/leif_lines.service";
import LeifSpeechService from "#features/inauguration/leif/voice/services/leif_speech.service";
import Guest from "#models/guest";

/**
 * Renders and caches the avatar audio for every reception greeting and speech cue, so
 * day J keeps working on a flaky network. Already cached lines are skipped.
 */
export default class LeifPregenerate extends BaseCommand {
	static commandName = "leif:pregenerate";
	static description = "Pre-generate the avatar voice for guest greetings and speech cues";

	static options: CommandOptions = {
		startApp: true,
	};

	async run() {
		const speechService = await this.app.container.make(LeifSpeechService);
		const lines = await this.app.container.make(LeifLinesService);

		if (!speechService.enabled) {
			this.logger.warning(
				"No voice configured (ELEVENLABS_API_KEY / ELEVENLABS_VOICE_ID): nothing to generate.",
			);
			return;
		}

		const guests = await Guest.query().preload("host").orderBy("id");
		const texts = [
			...guests.map((guest) => lines.receptionGreeting(guest)),
			...eventConfig.speechCues.map((cue) => cue.text),
		];

		let generated = 0;
		let cached = 0;
		let failed = 0;
		for (const text of texts) {
			try {
				const result = await speechService.speak(text);
				if (result.cached) cached++;
				else generated++;
			} catch (error) {
				failed++;
				this.logger.error(`Generation failed: ${(error as Error).message}`);
			}
		}

		this.logger.success(
			`${texts.length} lines: ${generated} generated, ${cached} already cached, ${failed} failed.`,
		);
		if (failed > 0) this.exitCode = 1;
	}
}
