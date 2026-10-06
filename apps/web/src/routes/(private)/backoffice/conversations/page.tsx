import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { FilterSelect } from "#/features/inauguration/backoffice/components/filter-select";
import { PageHeader } from "#/features/inauguration/backoffice/components/page-header";
import { ConversationsTable } from "#/features/inauguration/backoffice/conversations/components/conversations-table";
import { CONVERSATION_CHANNELS } from "#/features/inauguration/backoffice/types";

const searchParamsSchema = z.object({
	channel: z.enum(CONVERSATION_CHANNELS).optional().catch(undefined),
	page: z.coerce.number().int().positive().optional().catch(undefined),
});

export const Route = createFileRoute("/(private)/backoffice/conversations/")({
	validateSearch: searchParamsSchema,
	component: Page,
});

function Page() {
	const { t } = useTranslation("routes.(private).backoffice.conversations");
	const { t: tLabels } = useTranslation("features.inauguration.backoffice.labels");

	const { channel, page } = Route.useSearch();
	const navigate = Route.useNavigate();

	return (
		<main className="mx-auto grid max-w-7xl gap-6">
			<PageHeader
				title={t("title")}
				description={t("description")}
				actions={
					<FilterSelect
						label={t("filters.channel")}
						allLabel={tLabels("all")}
						value={channel}
						options={CONVERSATION_CHANNELS.map((value) => ({
							value,
							label: tLabels(`channel.${value}`),
						}))}
						onValueChange={(next) => navigate({ search: { channel: next }, replace: true })}
					/>
				}
			/>

			<ConversationsTable
				channel={channel}
				page={page ?? 1}
				onPageChange={(next) => navigate({ search: (prev) => ({ ...prev, page: next }) })}
			/>
		</main>
	);
}
