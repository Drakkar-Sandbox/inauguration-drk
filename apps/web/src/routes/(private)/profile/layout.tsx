import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { Tabs } from "@workspace/ui-react/components/tabs";
import { FingerprintPatternIcon, ShieldIcon, UserIcon } from "@workspace/ui-react/icons";

import { BrandTitle } from "#/components/app/brand-title";

export const Route = createFileRoute("/(private)/profile")({
	component: Layout,
});

function Layout() {
	const { t } = useTranslation("routes.(private).profile.layout");

	const location = useLocation();

	const TABS = [
		{
			label: t("tabs.profile"),
			icon: <UserIcon />,
			href: "/profile",
		},
		{
			label: t("tabs.security"),
			icon: <ShieldIcon />,
			href: "/profile/security",
		},
		{
			label: t("tabs.privacy"),
			icon: <FingerprintPatternIcon />,
			href: "/profile/privacy",
		},
	];

	return (
		<main className="mx-auto grid max-w-5xl gap-8">
			<BrandTitle className="mb-4">{t("title")}</BrandTitle>

			<Tabs value={location.pathname}>
				<Tabs.List>
					{TABS.map((tab) => (
						<Tabs.Tab
							key={tab.href}
							value={tab.href}
							nativeButton={false}
							render={<Link to={tab.href} />}
						>
							{tab.icon}
							{tab.label}
						</Tabs.Tab>
					))}
				</Tabs.List>
			</Tabs>

			<Outlet />
		</main>
	);
}
