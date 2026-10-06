import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { Table } from "@workspace/ui-react/components/table";

import { Badge, InterestBadge } from "#/features/inauguration/backoffice/components/badges";
import { Pagination } from "#/features/inauguration/backoffice/components/pagination";
import type { ConversationChannel } from "#/features/inauguration/backoffice/types";
import { formatDateTime, fullName } from "#/features/inauguration/backoffice/utils/format";
import { inauguration } from "#/libs/tuyau";

const PER_PAGE = 50;

type ConversationsTableProps = {
	channel?: ConversationChannel;
	page: number;
	onPageChange: (page: number) => void;
};

export function ConversationsTable(props: ConversationsTableProps) {
	const { channel, page, onPageChange } = props;

	const { t } = useTranslation(
		"features.inauguration.backoffice.conversations.components.conversations-table",
	);
	const { t: tLabels } = useTranslation("features.inauguration.backoffice.labels");

	const { data: conversations } = useSuspenseQuery(
		inauguration.backoffice.conversations.list.queryOptions(
			{ query: { channel, page, perPage: PER_PAGE } },
			{ refetchInterval: 10_000 },
		),
	);

	if (conversations.data.length === 0) {
		return (
			<p className="rounded-lg border border-neutral-6 border-dashed p-8 text-center text-neutral-11 text-sm">
				{t("empty")}
			</p>
		);
	}

	return (
		<div className="grid gap-4">
			<Table>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell>{t("columns.started-at")}</Table.HeaderCell>
						<Table.HeaderCell>{t("columns.guest")}</Table.HeaderCell>
						<Table.HeaderCell>{t("columns.channel")}</Table.HeaderCell>
						<Table.HeaderCell>{t("columns.need")}</Table.HeaderCell>
						<Table.HeaderCell>{t("columns.interest")}</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{conversations.data.map((conversation) => (
						<Table.Row key={conversation.id} interactive>
							<Table.Cell className="tabular-nums">
								<Link
									to="/backoffice/conversations/$conversationId"
									params={{ conversationId: String(conversation.id) }}
									className="font-medium hover:underline"
								>
									{formatDateTime(conversation.startedAt)}
								</Link>
							</Table.Cell>
							<Table.Cell>
								<div className="grid">
									<span>{fullName(conversation.guest) ?? t("anonymous")}</span>
									<span className="text-neutral-11 text-xs">{conversation.guest?.company}</span>
								</div>
							</Table.Cell>
							<Table.Cell>
								<Badge>{tLabels(`channel.${conversation.channel}`)}</Badge>
							</Table.Cell>
							<Table.Cell className="max-w-md truncate text-neutral-11">
								{conversation.summary?.need ?? "—"}
							</Table.Cell>
							<Table.Cell>
								{conversation.summary ? (
									<InterestBadge level={conversation.summary.interestLevel} />
								) : (
									"—"
								)}
							</Table.Cell>
						</Table.Row>
					))}
				</Table.Body>
			</Table>

			<Pagination meta={conversations.meta} onPageChange={onPageChange} />
		</div>
	);
}
