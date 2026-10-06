import router from "@adonisjs/core/services/router";

import { controllers } from "#generated/controllers";
import { middleware } from "#start/kernel";

router
	.group(() => {
		router.get("/", [controllers.features.inauguration.backoffice.handoffs.List]);
		router
			.patch("/:id", [controllers.features.inauguration.backoffice.handoffs.Update])
			.where("id", router.matchers.number());
	})
	.use(middleware.auth({ guards: ["web"] }))
	.prefix("/backoffice/handoffs")
	.as("inauguration.backoffice.handoffs");
