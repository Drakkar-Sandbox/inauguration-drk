import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { DrakkarLogo } from "@workspace/ui-react/components/drakkar-logo";
import {
	ArrowUpRightIcon,
	LogOutIcon,
	MessagesSquareIcon,
	MicVocalIcon,
	ScanQrCodeIcon,
	SlidersHorizontalIcon,
} from "@workspace/ui-react/icons";

import { KIOSK_AVATAR_NAME } from "#/features/inauguration/leif/constants";
import { useLogoutMutation } from "#/features/user_management/authentication/hooks/use-logout-mutation";

type Screen = {
	to: "/screens/accueil" | "/screens/borne" | "/screens/discours" | "/screens/operateur";
	key: "accueil" | "borne" | "discours" | "operateur";
	icon: ReactNode;
};

const SCREENS: Screen[] = [
	{ to: "/screens/accueil", key: "accueil", icon: <ScanQrCodeIcon /> },
	{ to: "/screens/borne", key: "borne", icon: <MessagesSquareIcon /> },
	{ to: "/screens/discours", key: "discours", icon: <MicVocalIcon /> },
	{ to: "/screens/operateur", key: "operateur", icon: <SlidersHorizontalIcon /> },
];

/** Landing page of kiosk accounts: pick which day-J screen this device shows. */
export function ScreenPicker() {
	const { t } = useTranslation("features.inauguration.kiosk.components.screen-picker");

	const { mutate: logout, isPending } = useLogoutMutation();

	return (
		<div className="mx-auto grid w-full max-w-5xl gap-10 px-6 py-10 sm:px-10 sm:py-14">
			<header className="flex flex-wrap items-end justify-between gap-6">
				<div className="grid gap-3">
					<DrakkarLogo size="sm" tone="paper" />
					<p className="font-bold text-primary-9 text-xs uppercase tracking-[0.24em]">
						{t("kicker")}
					</p>
					<h1 className="font-extrabold text-4xl text-neutral-12 leading-none tracking-tight sm:text-5xl">
						{t("title")}
						<span className="text-primary-9">.</span>
					</h1>
				</div>
				<button
					type="button"
					onClick={() => logout({})}
					disabled={isPending}
					className="inline-flex h-11 items-center gap-2 rounded-full border border-neutral-6 px-5 font-semibold text-neutral-11 text-sm outline-none transition hover:border-neutral-8 hover:text-neutral-12 focus-visible:ring-3 focus-visible:ring-primary-7 disabled:opacity-60 [&_svg]:size-4"
				>
					<LogOutIcon aria-hidden="true" />
					{t("logout")}
				</button>
			</header>

			<ul className="grid gap-4 sm:grid-cols-2">
				{SCREENS.map((screen) => (
					<li key={screen.key}>
						<Link
							to={screen.to}
							className="group grid h-full gap-5 rounded-3xl border border-neutral-5 bg-neutral-2 p-6 outline-none transition hover:border-primary-9 hover:bg-neutral-3 focus-visible:ring-3 focus-visible:ring-primary-7 sm:p-7"
						>
							<span className="flex items-center justify-between">
								<span className="grid size-12 place-items-center rounded-2xl bg-neutral-4 text-primary-9 [&_svg]:size-6">
									{screen.icon}
								</span>
								<ArrowUpRightIcon
									aria-hidden="true"
									className="size-5 text-neutral-8 transition group-hover:text-primary-9"
								/>
							</span>
							<span className="grid gap-1.5">
								<span className="font-bold text-neutral-12 text-xl">
									{t(`screens.${screen.key}.title`, { name: KIOSK_AVATAR_NAME })}
								</span>
								<span className="text-pretty text-neutral-10 text-sm leading-relaxed">
									{t(`screens.${screen.key}.description`, { name: KIOSK_AVATAR_NAME })}
								</span>
							</span>
							<span className="font-mono text-neutral-9 text-xs">{screen.to}</span>
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}
