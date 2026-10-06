import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { Table } from "@workspace/ui-react/components/table";

import { HandoffStatusBadge } from "#/features/inauguration/backoffice/components/badges";
import { HandoffActions } from "#/features/inauguration/backoffice/handoffs/components/handoff-actions";
import { HANDOFF_STATUSES, type HandoffStatus } from "#/features/inauguration/backoffice/types";
import { formatDateTime, fullName } from "#/features/inauguration/backoffice/utils/format";
import { inauguration } from "#/libs/tuyau";

const POLL_INTERVAL = 5_000;

type HandoffsTableProps = {
	status?: HandoffStatus;
	mine: boolean;
};

export function HandoffsTable(props: HandoffsTableProps) {
	const { status, mine } = props;

	const { t } = useTranslation(
		"features.inauguration.backoffice.handoffs.components.handoffs-table",
	);

	const { data: handoffs } = useSuspenseQuery(
		inauguration.backoffice.handoffs.list.queryOptions(
			{ query: { status, mine: mine || undefined } },
			{ refetchInterval: POLL_INTERVAL },
		),
	);

	// Pending first, then seen, then done; most recent first inside each group (API order).
	const sorted = [...handoffs].sort(
		(a, b) => HANDOFF_STATUSES.indexOf(a.status) - HANDOFF_STATUSES.indexOf(b.status),
	);

	if (sorted.length === 0) {
		return (
			<p className="rounded-lg border border-neutral-6 border-dashed p-8 text-center text-neutral-11 text-sm">
				{t("empty")}
			</p>
		);
	}

	return (
		<Table>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell>{t("columns.status")}</Table.HeaderCell>
					<Table.HeaderCell>{t("columns.guest")}</Table.HeaderCell>
					<Table.HeaderCell>{t("columns.reason")}</Table.HeaderCell>
					<Table.HeaderCell>{t("columns.referent")}</Table.HeaderCell>
					<Table.HeaderCell>{t("columns.created-at")}</Table.HeaderCell>
					<Table.HeaderCell />
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{sorted.map((handoff) => (
					<Table.Row
						key={handoff.id}
						className={handoff.status === "pending" ? "bg-primary-2" : undefined}
					>
						<Table.Cell>
							<HandoffStatusBadge status={handoff.status} />
						</Table.Cell>
						<Table.Cell>
							{handoff.guest ? (
								<Link
									to="/backoffice/guests/$guestId"
									params={{ guestId: String(handoff.guest.id) }}
									className="grid hover:underline"
								>
									<span className="font-medium">{fullName(handoff.guest)}</span>
									<span className="text-neutral-11 text-xs">{handoff.guest.company}</span>
								</Link>
							) : (
								t("unknown-guest")
							)}
						</Table.Cell>
						<Table.Cell className="max-w-md whitespace-normal">
							<p>{handoff.reason}</p>
							{handoff.conversationId && (
								<Link
									to="/backoffice/conversations/$conversationId"
									params={{ conversationId: String(handoff.conversationId) }}
									className="text-primary-11 text-xs hover:underline"
								>
									{t("conversation")}
								</Link>
							)}
						</Table.Cell>
						<Table.Cell>{handoff.referent?.name ?? t("no-referent")}</Table.Cell>
						<Table.Cell className="text-neutral-11 tabular-nums">
							{formatDateTime(handoff.createdAt)}
						</Table.Cell>
						<Table.Cell>
							<HandoffActions handoff={handoff} />
						</Table.Cell>
					</Table.Row>
				))}
			</Table.Body>
		</Table>
	);
}
