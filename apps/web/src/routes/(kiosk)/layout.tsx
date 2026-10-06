import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { KioskRecover } from "#/features/inauguration/kiosk/components/kiosk-recover";
import { isAuthenticated } from "#/utils/auth";

/** Day-J screens: staff session required, but no app chrome. */
export const Route = createFileRoute("/(kiosk)")({
	beforeLoad: async ({ context, location }) => {
		if (!(await isAuthenticated(context.queryClient))) {
			throw redirect({
				to: "/login",
				search: {
					redirectTo: location.pathname,
				},
			});
		}
	},
	head: () => ({ meta: [{ name: "theme-color", content: "#0b0c0f" }] }),
	errorComponent: KioskRecover,
	component: Outlet,
});
