import router from "@adonisjs/core/services/router";

import { controllers } from "#generated/controllers";
import { middleware } from "#start/kernel";

router
	.group(() => {
		router.get("/", [controllers.features.inauguration.backoffice.conversations.List]);
		router
			.get("/:id", [controllers.features.inauguration.backoffice.conversations.View])
			.where("id", router.matchers.number());
	})
	.use(middleware.auth({ guards: ["web"] }))
	.prefix("/backoffice/conversations")
	.as("inauguration.backoffice.conversations");
