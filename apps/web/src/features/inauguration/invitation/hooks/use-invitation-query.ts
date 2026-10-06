import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import type { Invitation } from "#/features/inauguration/leif/types";
import { errorStatus } from "#/features/inauguration/leif/utils/api";
import { inauguration } from "#/libs/tuyau";

export function useInvitationQuery(token: string) {
	return useQuery(
		inauguration.invitations.view.queryOptions(
			{ params: { token } },
			{
				retry: (failureCount, error) => errorStatus(error) !== 404 && failureCount < 2,
				refetchOnWindowFocus: false,
				staleTime: 30_000,
			},
		),
	);
}

/** Replaces the cached invitation with the fresh copy returned by any invitation endpoint. */
export function useSetInvitation(token: string) {
	const queryClient = useQueryClient();

	return useCallback(
		(invitation: Invitation) =>
			queryClient.setQueryData(
				inauguration.invitations.view.queryKey({ params: { token } }),
				invitation,
			),
		[queryClient, token],
	);
}
