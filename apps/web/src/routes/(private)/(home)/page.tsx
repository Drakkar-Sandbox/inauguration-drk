import { createFileRoute, redirect } from "@tanstack/react-router";

import { api } from "#/libs/tuyau";

/**
 * Staff land on the back-office, kiosk devices on the reception screen (the private layout
 * already sends anonymous visitors to the login page).
 */
export const Route = createFileRoute("/(private)/(home)/")({
	beforeLoad: async ({ context }) => {
		const user = await context.queryClient.ensureQueryData(
			api.accountManagement.profile.view.queryOptions(),
		);

		throw redirect({
			to: user?.role === "kiosk" ? "/screens/accueil" : "/backoffice",
			replace: true,
		});
	},
});
