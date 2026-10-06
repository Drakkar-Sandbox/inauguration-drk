import type { QueryClient } from "@tanstack/react-query";

import { api } from "#/libs/tuyau";

export async function isAuthenticated(queryClient: QueryClient) {
	try {
		const currentUser = await queryClient.ensureQueryData(
			api.accountManagement.profile.view.queryOptions(),
		);
		return !!currentUser;
	} catch (_error) {
		// @ts-expect-error: Set null to prevent refetching the user profile until the next authentication attempt
		queryClient.setQueryData(api.accountManagement.profile.view.queryKey(), null);
		return false;
	}
}

/**
 * Role of the signed-in account (read from the profile cache filled by `isAuthenticated`).
 * Kiosk accounts only reach the day-J screens, never the back-office.
 */
export function isKioskAccount(queryClient: QueryClient) {
	return queryClient.getQueryData(api.accountManagement.profile.view.queryKey())?.role === "kiosk";
}
