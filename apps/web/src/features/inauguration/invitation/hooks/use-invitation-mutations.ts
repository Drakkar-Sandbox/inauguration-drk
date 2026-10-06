import { useMutation } from "@tanstack/react-query";

import { useSetInvitation } from "#/features/inauguration/invitation/hooks/use-invitation-query";
import { inauguration } from "#/libs/tuyau";

/**
 * Form-based answers (no avatar). Each endpoint returns the up-to-date invitation, which
 * replaces the cached one.
 */
export function useInvitationMutations(token: string) {
	const setInvitation = useSetInvitation(token);

	const consent = useMutation(
		inauguration.invitations.consent.mutationOptions({ onSuccess: setInvitation }),
	);
	const respond = useMutation(
		inauguration.invitations.respond.mutationOptions({ onSuccess: setInvitation }),
	);
	const updatePlusOne = useMutation(
		inauguration.invitations.updatePlusOne.mutationOptions({ onSuccess: setInvitation }),
	);
	const deletePlusOne = useMutation(
		inauguration.invitations.deletePlusOne.mutationOptions({ onSuccess: setInvitation }),
	);

	return { consent, respond, updatePlusOne, deletePlusOne };
}
