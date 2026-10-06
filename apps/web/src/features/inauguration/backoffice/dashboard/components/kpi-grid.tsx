import { useSuspenseQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "tailwind-variants";

import { Card } from "@workspace/ui-react/components/card";

import { MeetingStatusBadge } from "#/features/inauguration/backoffice/components/badges";
import { MEETING_STATUSES } from "#/features/inauguration/backoffice/types";
import { inauguration } from "#/libs/tuyau";

const REFRESH_INTERVAL = 10_000;

function percent(value: number, total: number) {
	return total > 0 ? Math.round((value / total) * 100) : 0;
}

type KpiProps = {
	label: string;
	value: ReactNode;
	hint?: ReactNode;
	highlight?: boolean;
};

function Kpi(props: KpiProps) {
	const { label, value, hint, highlight } = props;

	return (
		<Card className={cn("grid gap-1 p-4", { "border-primary-7 bg-primary-2": highlight })}>
			<p className="text-neutral-11 text-xs uppercase tracking-wide">{label}</p>
			<p
				className={cn("font-bold text-3xl text-neutral-12 tabular-nums", {
					"text-primary-11": highlight,
				})}
			>
				{value}
			</p>
			{hint && <p className="text-neutral-11 text-xs">{hint}</p>}
		</Card>
	);
}

function KpiSection(props: { title: string; children: ReactNode }) {
	const { title, children } = props;

	return (
		<section className="grid gap-3">
			<h2 className="font-semibold text-neutral-12 text-sm">{title}</h2>
			<div className="grid grid-cols-2 gap-3 md:grid-cols-4">{children}</div>
		</section>
	);
}

export function DashboardKpiGrid() {
	const { t } = useTranslation("features.inauguration.backoffice.dashboard.components.kpi-grid");

	const { data: stats, dataUpdatedAt } = useSuspenseQuery({
		...inauguration.backoffice.dashboard.view.queryOptions(),
		refetchInterval: REFRESH_INTERVAL,
	});

	const { guests, conversations, handoffs, meetings } = stats;
	const expected = guests.confirmed + guests.plusOnes;

	return (
		<div className="grid gap-8">
			<KpiSection title={t("sections.invitations")}>
				<Kpi label={t("kpi.invited")} value={guests.primaries} />
				<Kpi
					label={t("kpi.confirmed")}
					value={guests.confirmed}
					hint={t("hint.rate", { rate: percent(guests.confirmed, guests.primaries) })}
				/>
				<Kpi
					label={t("kpi.declined")}
					value={guests.declined}
					hint={t("hint.rate", { rate: percent(guests.declined, guests.primaries) })}
				/>
				<Kpi
					label={t("kpi.pending")}
					value={guests.pending}
					hint={t("hint.rate", { rate: percent(guests.pending, guests.primaries) })}
				/>
			</KpiSection>

			<KpiSection title={t("sections.event")}>
				<Kpi label={t("kpi.plus-ones")} value={guests.plusOnes} />
				<Kpi
					label={t("kpi.checked-in")}
					value={guests.checkedIn}
					hint={t("hint.of-expected", { expected, rate: percent(guests.checkedIn, expected) })}
					highlight
				/>
				<Kpi
					label={t("kpi.kiosk")}
					value={conversations.kiosk}
					hint={t("hint.kiosk-guests", { count: conversations.kioskGuests })}
				/>
				<Kpi label={t("kpi.signup")} value={conversations.signup} />
			</KpiSection>

			<KpiSection title={t("sections.follow-up")}>
				<Kpi label={t("kpi.handoffs-pending")} value={handoffs.pending} highlight />
				<Kpi label={t("kpi.handoffs-seen")} value={handoffs.seen} />
				<Kpi label={t("kpi.handoffs-done")} value={handoffs.done} />
				<Kpi
					label={t("kpi.consent")}
					value={guests.consentGiven}
					hint={t("hint.rate", { rate: percent(guests.consentGiven, guests.total) })}
				/>
			</KpiSection>

			<section className="grid gap-3">
				<h2 className="font-semibold text-neutral-12 text-sm">{t("sections.meetings")}</h2>
				<Card className="flex flex-wrap gap-6 p-4">
					{MEETING_STATUSES.map((status) => (
						<div key={status} className="grid gap-1">
							<MeetingStatusBadge status={status} />
							<p className="font-bold text-2xl text-neutral-12 tabular-nums">{meetings[status]}</p>
						</div>
					))}
				</Card>
			</section>

			<p className="text-neutral-10 text-xs">
				{t("updated-at", { time: new Date(dataUpdatedAt).toLocaleTimeString("fr-FR") })}
			</p>
		</div>
	);
}
