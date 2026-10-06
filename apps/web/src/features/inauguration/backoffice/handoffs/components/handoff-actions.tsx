import { useTranslation } from "react-i18next";

import { Button } from "@workspace/ui-react/components/button";
import { CheckCheckIcon, EyeIcon, RotateCcwIcon } from "@workspace/ui-react/icons";

import { useUpdateHandoffMutation } from "#/features/inauguration/backoffice/handoffs/hooks/use-update-mutation";
import type { Handoff } from "#/features/inauguration/backoffice/types";

type HandoffActionsProps = {
	handoff: Pick<Handoff, "id" | "status">;
};

export function HandoffActions(props: HandoffActionsProps) {
	const { handoff } = props;

	const { t } = useTranslation(
		"features.inauguration.backoffice.handoffs.components.handoff-actions",
	);

	const { mutate: updateHandoff, isPending } = useUpdateHandoffMutation();

	const setStatus = (status: Handoff["status"]) =>
		updateHandoff({ params: { id: handoff.id }, body: { status } });

	return (
		<div className="flex items-center justify-end gap-2">
			{handoff.status === "pending" && (
				<Button disabled={isPending} onClick={() => setStatus("seen")}>
					<EyeIcon />
					{t("seen")}
				</Button>
			)}
			{handoff.status !== "done" ? (
				<Button variant="primary" disabled={isPending} onClick={() => setStatus("done")}>
					<CheckCheckIcon />
					{t("done")}
				</Button>
			) : (
				<Button variant="ghost" disabled={isPending} onClick={() => setStatus("pending")}>
					<RotateCcwIcon />
					{t("reopen")}
				</Button>
			)}
		</div>
	);
}
