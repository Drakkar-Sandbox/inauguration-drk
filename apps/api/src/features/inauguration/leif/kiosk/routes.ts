import router from "@adonisjs/core/services/router";

import { controllers } from "#generated/controllers";
import { middleware } from "#start/kernel";

router
	.group(() => {
		router.post("/greeting", [controllers.features.inauguration.leif.kiosk.Greeting]);
		router.post("/sessions", [controllers.features.inauguration.leif.kiosk.StartSession]);
		router.post("/sessions/:id/message", [controllers.features.inauguration.leif.kiosk.Message]);
		router.post("/sessions/:id/handoff", [controllers.features.inauguration.leif.kiosk.Handoff]);
		router.post("/sessions/:id/end", [controllers.features.inauguration.leif.kiosk.EndSession]);
	})
	.use(middleware.auth({ guards: ["web"] }))
	.prefix("/kiosk/leif")
	.as("inauguration.kiosk.leif");
