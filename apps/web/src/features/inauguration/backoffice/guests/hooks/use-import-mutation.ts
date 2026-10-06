import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { toast } from "@workspace/ui-react/components/toast";

import { toastifyBackofficeError } from "#/features/inauguration/backoffice/utils/api";
import { inauguration } from "#/libs/tuyau";

export function useImportGuestsMutation() {
	const { t } = useTranslation("features.inauguration.backoffice.guests.hooks.mutations");

	const queryClient = useQueryClient();

	return useMutation(
		inauguration.backoffice.guests.import.mutationOptions({
			onSuccess: (report) => {
				const message = t("import.success", { created: report.created, updated: report.updated });
				if (report.errors.length > 0) {
					toast.warning(message, {
						description: t("import.with-errors", { count: report.errors.length }),
					});
				} else {
					toast.success(message);
				}
				queryClient.invalidateQueries({ queryKey: inauguration.backoffice.pathKey() });
			},
			onError: (error) => {
				toastifyBackofficeError(error);
			},
		}),
	);
}
