import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { toast } from "@workspace/ui-react/components/toast";

import { toastifyBackofficeError } from "#/features/inauguration/backoffice/utils/api";
import { inauguration } from "#/libs/tuyau";

export function useDeleteGuestMutation() {
	const { t } = useTranslation("features.inauguration.backoffice.guests.hooks.mutations");

	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation(
		inauguration.backoffice.guests.delete.mutationOptions({
			onSuccess: async () => {
				toast.success(t("delete.success"));
				await navigate({ to: "/backoffice/guests" });
				queryClient.invalidateQueries({ queryKey: inauguration.backoffice.pathKey() });
			},
			onError: (error) => {
				toastifyBackofficeError(error);
			},
		}),
	);
}
