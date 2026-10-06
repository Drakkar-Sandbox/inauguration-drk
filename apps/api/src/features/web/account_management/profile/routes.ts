import router from "@adonisjs/core/services/router";

import { controllers } from "#generated/controllers";
import { middleware } from "#start/kernel";

router
	.group(() => {
		// Kiosk devices may read who is logged in, not change the account.
		router
			.get("/", [controllers.features.web.accountManagement.profile.View])
			.use(middleware.auth({ guards: ["web"], roles: ["admin", "kiosk"] }));
		router
			.put("/", [controllers.features.web.accountManagement.profile.Update])
			.use(middleware.auth({ guards: ["web"] }));
		router
			.delete("/", [controllers.features.web.accountManagement.profile.Delete])
			.use(middleware.auth({ guards: ["web"] }));
	})
	.prefix("/web/account-management/profile")
	.as("web.account_management.profile");
