import router from "@adonisjs/core/services/router";

import { controllers } from "#generated/controllers";
import { middleware } from "#start/kernel";

router
	.group(() => {
		router.post("/checkin", [controllers.features.inauguration.kiosk.checkin.Checkin]);
		router.get("/guests/search", [controllers.features.inauguration.kiosk.checkin.Search]);
	})
	.use(middleware.auth({ guards: ["web"] }))
	.prefix("/kiosk")
	.as("inauguration.kiosk");
