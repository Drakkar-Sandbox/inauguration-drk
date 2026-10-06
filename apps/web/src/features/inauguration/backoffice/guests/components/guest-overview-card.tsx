import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Card } from "@workspace/ui-react/components/card";

import {
	Badge,
	GuestStatusBadge,
	MeetingStatusBadge,
} from "#/features/inauguration/backoffice/components/badges";
import type { Guest } from "#/features/inauguration/backoffice/types";
import { formatDateTime, fullName } from "#/features/inauguration/backoffice/utils/format";

function Row(props: { label: string; children: ReactNode }) {
	const { label, children } = props;

	return (
		<div className="grid grid-cols-[8rem_1fr] items-center gap-3 text-sm">
			<dt className="text-neutral-11">{label}</dt>
			<dd className="min-w-0 text-neutral-12">{children}</dd>
		</div>
	);
}

type GuestOverviewCardProps = {
	guest: Guest;
};

export function GuestOverviewCard(props: GuestOverviewCardProps) {
	const { guest } = props;

	const { t } = useTranslation(
		"features.inauguration.backoffice.guests.components.guest-overview-card",
	);
	const { t: tLabels } = useTranslation("features.inauguration.backoffice.labels");

	return (
		<Card>
			<Card.Header>
				<h2 className="font-semibold text-md text-neutral-12">{t("title")}</h2>
			</Card.Header>
			<Card.Content>
				<dl className="grid gap-3">
					<Row label={t("status")}>
						<GuestStatusBadge status={guest.status} />
					</Row>
					<Row label={t("responded-at")}>{formatDateTime(guest.respondedAt) ?? "—"}</Row>
					<Row label={t("checked-in-at")}>
						{guest.checkedInAt ? (
							<Badge tone="primary">{formatDateTime(guest.checkedInAt)}</Badge>
						) : (
							"—"
						)}
					</Row>
					<Row label={t("consent")}>
						<Badge
							tone={
								guest.consent === "given"
									? "success"
									: guest.consent === "refused"
										? "error"
										: "neutral"
							}
						>
							{tLabels(`consent.${guest.consent}`)}
						</Badge>
					</Row>
					<Row label={t("meeting")}>
						<MeetingStatusBadge status={guest.meetingStatus} />
					</Row>
					<Row label={t("kind")}>{tLabels(`guest-kind.${guest.kind}`)}</Row>
					{guest.host && (
						<Row label={t("host")}>
							<Link
								to="/backoffice/guests/$guestId"
								params={{ guestId: String(guest.host.id) }}
								className="text-primary-11 hover:underline"
							>
								{fullName(guest.host)}
							</Link>
						</Row>
					)}
					{guest.kind === "primary" && (
						<Row label={t("plus-one")}>
							{guest.plusOne ? (
								<Link
									to="/backoffice/guests/$guestId"
									params={{ guestId: String(guest.plusOne.id) }}
									className="grid text-primary-11 hover:underline"
								>
									<span>{fullName(guest.plusOne)}</span>
									<span className="text-neutral-11 text-xs">
										{guest.plusOne.email}
										{guest.plusOne.checkedInAt && ` · ${tLabels("checked-in")}`}
									</span>
								</Link>
							) : (
								t("no-plus-one")
							)}
						</Row>
					)}
				</dl>
			</Card.Content>
		</Card>
	);
}
