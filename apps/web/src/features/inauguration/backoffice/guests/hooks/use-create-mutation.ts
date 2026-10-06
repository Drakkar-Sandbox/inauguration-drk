import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { toast } from "@workspace/ui-react/components/toast";

import { toastifyBackofficeError } from "#/features/inauguration/backoffice/utils/api";
import { inauguration } from "#/libs/tuyau";

export function useCreateGuestMutation() {
	const { t } = useTranslation("features.inauguration.backoffice.guests.hooks.mutations");

	const queryClient = useQueryClient();

	return useMutation(
		inauguration.backoffice.guests.create.mutationOptions({
			onSuccess: (guest) => {
				toast.success(t("create.success", { name: `${guest.firstName} ${guest.lastName}` }));
				queryClient.invalidateQueries({ queryKey: inauguration.backoffice.pathKey() });
			},
			onError: (error) => {
				toastifyBackofficeError(error);
			},
		}),
	);
}
