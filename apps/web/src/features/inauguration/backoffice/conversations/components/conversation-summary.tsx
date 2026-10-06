import { useTranslation } from "react-i18next";

import { InterestBadge } from "#/features/inauguration/backoffice/components/badges";
import type { Conversation } from "#/features/inauguration/backoffice/types";

type ConversationSummaryProps = {
	summary: Conversation["summary"];
};

export function ConversationSummary(props: ConversationSummaryProps) {
	const { summary } = props;

	const { t } = useTranslation(
		"features.inauguration.backoffice.conversations.components.conversation-summary",
	);

	if (!summary) {
		return <p className="text-neutral-11 text-sm italic">{t("empty")}</p>;
	}

	const rows = [
		{ label: t("need"), value: summary.need },
		{ label: t("idea"), value: summary.idea },
		{ label: t("notes"), value: summary.notes },
	];

	return (
		<dl className="grid gap-3">
			<div className="grid gap-1">
				<dt className="font-pixel text-neutral-11 text-sm uppercase tracking-[0.08em]">
					{t("interest")}
				</dt>
				<dd>
					<InterestBadge level={summary.interestLevel} />
				</dd>
			</div>
			{rows.map((row) => (
				<div key={row.label} className="grid gap-1">
					<dt className="font-pixel text-neutral-11 text-sm uppercase tracking-[0.08em]">
						{row.label}
					</dt>
					<dd className="whitespace-pre-line text-neutral-12 text-sm">{row.value ?? "—"}</dd>
				</div>
			))}
		</dl>
	);
}
