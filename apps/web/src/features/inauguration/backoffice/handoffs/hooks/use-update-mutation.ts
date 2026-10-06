import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toastifyBackofficeError } from "#/features/inauguration/backoffice/utils/api";
import { inauguration } from "#/libs/tuyau";

export function useUpdateHandoffMutation() {
	const queryClient = useQueryClient();

	return useMutation(
		inauguration.backoffice.handoffs.update.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: inauguration.backoffice.pathKey() });
			},
			onError: (error) => {
				toastifyBackofficeError(error);
			},
		}),
	);
}
