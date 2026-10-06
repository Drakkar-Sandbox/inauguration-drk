import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { DrakkarLogo } from "@workspace/ui-react/components/drakkar-logo";

import { isAuthenticated } from "#/utils/auth";

export const Route = createFileRoute("/(guest)/(auth)")({
	beforeLoad: async ({ context }) => {
		if (await isAuthenticated(context.queryClient)) {
			throw redirect({ to: "/" });
		}
	},
	component: Layout,
});

function Layout() {
	const { t } = useTranslation("routes.(guest).(auth).layout");

	return (
		<main className="grid min-h-svh bg-neutral-2 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
			<aside
				data-theme="dark"
				className="relative hidden flex-col justify-between overflow-hidden bg-neutral-1 p-12 text-neutral-12 lg:flex xl:p-16"
			>
				<DrakkarLogo tone="paper" size="lg" className="self-start" />

				<div className="relative z-10 grid max-w-lg gap-6">
					<p className="font-pixel font-semibold text-primary-9 text-xl uppercase leading-none tracking-[0.12em]">
						{t("kicker")}
					</p>
					<p className="text-balance font-extrabold text-5xl leading-[0.95] tracking-[-0.04em] xl:text-6xl">
						{t("headline")}
						<span className="text-primary-9">.</span>
					</p>
					<p className="max-w-sm font-text text-base text-neutral-11 leading-relaxed">
						{t("description")}
					</p>
				</div>

				<p className="font-pixel text-lg text-neutral-9 tracking-[0.08em]">{t("footer")}</p>

				<DrakkarLogo
					tone="paper"
					className="pointer-events-none absolute -right-24 -bottom-10 h-56 opacity-[0.04]"
				/>
			</aside>

			<section className="flex flex-col items-center justify-center gap-10 px-4 py-12 sm:px-8">
				<DrakkarLogo size="md" className="lg:hidden" />

				<div className="w-full max-w-md rounded-2xl border border-neutral-5 bg-neutral-1 p-8 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-12px_rgb(0_0_0/0.12)] sm:p-10">
					<Outlet />
				</div>
			</section>
		</main>
	);
}
