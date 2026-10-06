import router from "@adonisjs/core/services/router";

import { controllers } from "#generated/controllers";
import { leifVoiceLimiter } from "#start/limiter";

router
	.group(() => {
		router.post("/tts", [controllers.features.inauguration.leif.voice.Tts]);
		// Listed in `bodyparser.multipart.processManually`: the audio never touches the disk.
		router.post("/stt", [controllers.features.inauguration.leif.voice.Stt]);
	})
	.use(leifVoiceLimiter)
	.prefix("/leif")
	.as("inauguration.leif");
