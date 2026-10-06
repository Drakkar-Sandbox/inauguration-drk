import router from "@adonisjs/core/services/router";

import { controllers } from "#generated/controllers";
import { middleware } from "#start/kernel";

router
	.group(() => {
		router.get("/", [controllers.features.inauguration.backoffice.guests.List]);
		router.post("/", [controllers.features.inauguration.backoffice.guests.Create]);
		router.post("/import", [controllers.features.inauguration.backoffice.guests.Import]);
		router.get("/export.csv", [controllers.features.inauguration.backoffice.guests.Export]);
		router.get("/qr-sheet", [controllers.features.inauguration.backoffice.guests.QrSheet]);

		router
			.group(() => {
				router.get("/", [controllers.features.inauguration.backoffice.guests.View]);
				router.put("/", [controllers.features.inauguration.backoffice.guests.Update]);
				router.delete("/", [controllers.features.inauguration.backoffice.guests.Delete]);
				router.get("/qr.png", [controllers.features.inauguration.backoffice.guests.QrPng]);
				router.get("/qr.svg", [controllers.features.inauguration.backoffice.guests.QrSvg]);
			})
			.prefix("/:id")
			.where("id", router.matchers.number());
	})
	.use(middleware.auth({ guards: ["web"] }))
	.prefix("/backoffice/guests")
	.as("inauguration.backoffice.guests");
