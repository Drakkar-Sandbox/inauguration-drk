import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { toast } from "@workspace/ui-react/components/toast";

import { toastifyBackofficeError } from "#/features/inauguration/backoffice/utils/api";
import { inauguration } from "#/libs/tuyau";

export function useUpdateGuestMutation() {
	const { t } = useTranslation("features.inauguration.backoffice.guests.hooks.mutations");

	const queryClient = useQueryClient();

	return useMutation(
		inauguration.backoffice.guests.update.mutationOptions({
			onSuccess: () => {
				toast.success(t("update.success"));
				queryClient.invalidateQueries({ queryKey: inauguration.backoffice.pathKey() });
			},
			onError: (error) => {
				toastifyBackofficeError(error);
			},
		}),
	);
}
