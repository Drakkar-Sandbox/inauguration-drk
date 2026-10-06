import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import {
	BellRingIcon,
	ExternalLinkIcon,
	LayoutDashboardIcon,
	MessagesSquareIcon,
	MonitorIcon,
	QrCodeIcon,
	UsersIcon,
} from "@workspace/ui-react/icons";

import { usePendingHandoffsWatcher } from "#/features/inauguration/backoffice/handoffs/hooks/use-pending-handoffs-watcher";

type NavItem = {
	to:
		| "/backoffice"
		| "/backoffice/guests"
		| "/backoffice/handoffs"
		| "/backoffice/conversations"
		| "/backoffice/qr-sheet";
	label: string;
	icon: ReactNode;
	exact?: boolean;
	badge?: number;
};

/** Day-J screens open in their own tab (full screen, no app chrome). */
const SCREENS = [
	{ to: "/screens/accueil", key: "accueil" },
	{ to: "/screens/borne", key: "borne" },
	{ to: "/screens/discours", key: "discours" },
	{ to: "/screens/operateur", key: "operateur" },
] as const;

export function SidebarNav() {
	const { t } = useTranslation("components.app.sidebar.nav");

	const { pendingCount } = usePendingHandoffsWatcher();

	const items: NavItem[] = [
		{ to: "/backoffice", label: t("dashboard"), icon: <LayoutDashboardIcon />, exact: true },
		{ to: "/backoffice/guests", label: t("guests"), icon: <UsersIcon /> },
		{
			to: "/backoffice/handoffs",
			label: t("handoffs"),
			icon: <BellRingIcon />,
			badge: pendingCount,
		},
		{ to: "/backoffice/conversations", label: t("conversations"), icon: <MessagesSquareIcon /> },
		{ to: "/backoffice/qr-sheet", label: t("qr-sheet"), icon: <QrCodeIcon /> },
	];

	return (
		<nav className="grid gap-0.5">
			<p className="px-2 pb-1 font-pixel text-neutral-10 text-sm uppercase tracking-[0.1em]">
				{t("section")}
			</p>
			{items.map((item) => (
				<Link
					key={item.to}
					to={item.to}
					activeOptions={{ exact: item.exact }}
					className="flex h-9 items-center gap-3 rounded-lg px-2 text-neutral-11 text-sm outline-none ring-neutral-7 transition hover:bg-neutral-3 hover:text-neutral-12 focus-visible:ring-3 data-[status=active]:bg-neutral-3 data-[status=active]:font-medium data-[status=active]:text-neutral-12 [&_svg]:size-4"
				>
					{item.icon}
					<span className="flex-1">{item.label}</span>
					{!!item.badge && (
						<span
							role="status"
							aria-label={t("pending-handoffs", { count: item.badge })}
							className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-9 px-1.5 font-semibold text-primary-1 text-xs tabular-nums"
						>
							{item.badge}
						</span>
					)}
				</Link>
			))}

			<p className="px-2 pt-5 pb-1 font-pixel text-neutral-10 text-sm uppercase tracking-[0.1em]">
				{t("screens.section")}
			</p>
			{SCREENS.map((screen) => (
				<a
					key={screen.to}
					href={screen.to}
					target="_blank"
					rel="noreferrer"
					className="flex h-9 items-center gap-3 rounded-lg px-2 text-neutral-11 text-sm outline-none ring-neutral-7 transition hover:bg-neutral-3 hover:text-neutral-12 focus-visible:ring-3 [&_svg]:size-4"
				>
					<MonitorIcon />
					<span className="flex-1">{t(`screens.${screen.key}`)}</span>
					<ExternalLinkIcon aria-label={t("screens.new-tab")} className="text-neutral-9" />
				</a>
			))}
		</nav>
	);
}
