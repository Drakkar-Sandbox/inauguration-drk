import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Staff land on the back-office. Anonymous visitors and kiosk accounts are redirected by the
 * private layout (login page, screen picker).
 */
export const Route = createFileRoute("/(private)/(home)/")({
	beforeLoad: () => {
		throw redirect({ to: "/backoffice", replace: true });
	},
});
