import router from "@adonisjs/core/services/router";

import { controllers } from "#generated/controllers";
import { middleware } from "#start/kernel";
import { brutForceLimiter } from "#start/limiter";

router
	.group(() => {
		router
			.post("/login", [controllers.features.web.accountManagement.authentication.Login])
			.use(middleware.guest())
			.use(brutForceLimiter);
		router
			.delete("/logout", [controllers.features.web.accountManagement.authentication.Logout])
			.use(middleware.auth({ guards: ["web"], roles: ["admin", "kiosk"] }));
	})
	.prefix("/web/account-management/authentication")
	.as("web.account_management.authentication");
