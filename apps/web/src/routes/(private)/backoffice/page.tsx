import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Card } from "@workspace/ui-react/components/card";
import {
	BellRingIcon,
	DownloadIcon,
	MessagesSquareIcon,
	QrCodeIcon,
	UsersIcon,
} from "@workspace/ui-react/icons";

import { PageHeader } from "#/features/inauguration/backoffice/components/page-header";
import { DashboardKpiGrid } from "#/features/inauguration/backoffice/dashboard/components/kpi-grid";
import { backofficeFileUrl } from "#/features/inauguration/backoffice/utils/api";

export const Route = createFileRoute("/(private)/backoffice/")({
	component: Page,
});

function QuickLink(props: { icon: ReactNode; label: string; render: React.ReactElement }) {
	const { icon, label, render } = props;

	return (
		<Card
			render={render}
			className="flex items-center gap-3 p-4 font-medium text-neutral-12 text-sm transition hover:border-primary-7 hover:bg-primary-2 [&_svg]:size-5 [&_svg]:text-primary-9"
		>
			{icon}
			{label}
		</Card>
	);
}

function Page() {
	const { t } = useTranslation("routes.(private).backoffice.dashboard");

	return (
		<main className="mx-auto grid max-w-6xl gap-8">
			<PageHeader title={t("title")} description={t("description")} />

			<nav className="grid grid-cols-2 gap-3 md:grid-cols-5">
				<QuickLink
					icon={<UsersIcon />}
					label={t("links.guests")}
					render={<Link to="/backoffice/guests" />}
				/>
				<QuickLink
					icon={<BellRingIcon />}
					label={t("links.handoffs")}
					render={<Link to="/backoffice/handoffs" />}
				/>
				<QuickLink
					icon={<MessagesSquareIcon />}
					label={t("links.conversations")}
					render={<Link to="/backoffice/conversations" />}
				/>
				<QuickLink
					icon={<QrCodeIcon />}
					label={t("links.qr-sheet")}
					render={<Link to="/backoffice/qr-sheet" />}
				/>
				<QuickLink
					icon={<DownloadIcon />}
					label={t("links.export")}
					render={<a href={backofficeFileUrl("inauguration.backoffice.guests.export")} download />}
				/>
			</nav>

			<DashboardKpiGrid />
		</main>
	);
}
