import router from "@adonisjs/core/services/router";

import { controllers } from "#generated/controllers";
import { invitationLimiter } from "#start/limiter";

router
	.group(() => {
		router.get("/", [controllers.features.inauguration.invitation.View]);
		router.post("/rsvp", [controllers.features.inauguration.invitation.Respond]);
		router.post("/consent", [controllers.features.inauguration.invitation.Consent]);
		router.put("/plus-one", [controllers.features.inauguration.invitation.UpdatePlusOne]);
		router.delete("/plus-one", [controllers.features.inauguration.invitation.DeletePlusOne]);
		router.get("/calendar.ics", [controllers.features.inauguration.invitation.Calendar]);
		router.get("/qr.png", [controllers.features.inauguration.invitation.QrCode]);
	})
	.use(invitationLimiter)
	.prefix("/invitations/:token")
	.as("inauguration.invitations");
