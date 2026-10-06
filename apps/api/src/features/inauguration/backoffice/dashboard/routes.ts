import router from "@adonisjs/core/services/router";

import { controllers } from "#generated/controllers";
import { middleware } from "#start/kernel";

router
	.group(() => {
		router.get("/", [controllers.features.inauguration.backoffice.dashboard.View]);
	})
	.use(middleware.auth({ guards: ["web"] }))
	.prefix("/backoffice/dashboard")
	.as("inauguration.backoffice.dashboard");
