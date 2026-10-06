import router from "@adonisjs/core/services/router";

import { controllers } from "#generated/controllers";
import { invitationLimiter } from "#start/limiter";

router
	.group(() => {
		router.post("/message", [controllers.features.inauguration.leif.signup.Message]);
	})
	.use(invitationLimiter)
	.prefix("/invitations/:token/leif")
	.as("inauguration.invitations.leif");
