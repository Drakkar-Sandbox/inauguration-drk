import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Switch } from "@workspace/ui-react/components/switch";

import { FilterSelect } from "#/features/inauguration/backoffice/components/filter-select";
import { PageHeader } from "#/features/inauguration/backoffice/components/page-header";
import { HandoffsTable } from "#/features/inauguration/backoffice/handoffs/components/handoffs-table";
import { NotificationsToggle } from "#/features/inauguration/backoffice/handoffs/components/notifications-toggle";
import { HANDOFF_STATUSES } from "#/features/inauguration/backoffice/types";

const searchParamsSchema = z.object({
	status: z.enum(HANDOFF_STATUSES).optional().catch(undefined),
	mine: z.boolean().optional().catch(undefined),
});

export const Route = createFileRoute("/(private)/backoffice/handoffs/")({
	validateSearch: searchParamsSchema,
	component: Page,
});

function Page() {
	const { t } = useTranslation("routes.(private).backoffice.handoffs");
	const { t: tLabels } = useTranslation("features.inauguration.backoffice.labels");

	const { status, mine } = Route.useSearch();
	const navigate = Route.useNavigate();

	return (
		<main className="mx-auto grid max-w-7xl gap-6">
			<PageHeader
				title={t("title")}
				description={t("description")}
				actions={<NotificationsToggle />}
			/>

			<div className="flex flex-wrap items-center gap-4">
				<FilterSelect
					label={t("filters.status")}
					allLabel={tLabels("all")}
					value={status}
					options={HANDOFF_STATUSES.map((value) => ({
						value,
						label: tLabels(`handoff-status.${value}`),
					}))}
					onValueChange={(next) =>
						navigate({ search: (prev) => ({ ...prev, status: next }), replace: true })
					}
				/>
				{/* biome-ignore lint/a11y/noLabelWithoutControl: the Switch renders the control */}
				<label className="flex cursor-pointer items-center gap-2 text-neutral-12 text-sm">
					<Switch
						checked={mine ?? false}
						onCheckedChange={(checked) =>
							navigate({
								search: (prev) => ({ ...prev, mine: checked || undefined }),
								replace: true,
							})
						}
					/>
					{t("filters.mine")}
				</label>
			</div>

			<HandoffsTable status={status} mine={mine ?? false} />
		</main>
	);
}
