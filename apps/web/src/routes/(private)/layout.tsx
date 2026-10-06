import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { Sidebar } from "#/components/app/sidebar";
import { isAuthenticated, isKioskAccount } from "#/utils/auth";

export const Route = createFileRoute("/(private)")({
	beforeLoad: async ({ context, location }) => {
		if (!(await isAuthenticated(context.queryClient))) {
			throw redirect({
				to: "/login",
				search: {
					redirectTo: location.pathname,
				},
			});
		}
		// Kiosk devices never load the back-office shell (its data is admin-only).
		if (isKioskAccount(context.queryClient)) {
			throw redirect({ to: "/screens", replace: true });
		}
	},
	component: Layout,
});

function Layout() {
	return (
		<div className="ml-72 p-4 pt-8 print:m-0 print:p-0">
			<Sidebar />
			<Outlet />
		</div>
	);
}
