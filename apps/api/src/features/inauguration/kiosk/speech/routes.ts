import router from "@adonisjs/core/services/router";

import { controllers } from "#generated/controllers";
import { middleware } from "#start/kernel";

router
	.group(() => {
		router.get("/cues", [controllers.features.inauguration.kiosk.speech.Cues]);
		router.get("/current", [controllers.features.inauguration.kiosk.speech.Current]);
		router.post("/trigger", [controllers.features.inauguration.kiosk.speech.Trigger]);
		router.post("/reset", [controllers.features.inauguration.kiosk.speech.Reset]);
	})
	.use(middleware.auth({ guards: ["web"] }))
	.prefix("/kiosk/speech")
	.as("inauguration.kiosk.speech");
