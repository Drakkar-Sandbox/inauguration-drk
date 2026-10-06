import { Link, type NotFoundRouteProps } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { Button } from "@workspace/ui-react/components/button";

import { BrandTitle } from "#/components/app/brand-title";

export function NotFoundPage(_props: NotFoundRouteProps) {
	const { t } = useTranslation("components.pages.not-found");

	return (
		<main className="flex min-h-svh flex-col items-center justify-center p-4 text-center">
			<BrandTitle className="mb-3">{t("title")}</BrandTitle>
			<p className="mb-8 font-text text-neutral-11 text-sm">{t("descritpion")}</p>
			<Button nativeButton={false} variant="primary" render={<Link to="/" />}>
				{t("back")}
			</Button>
		</main>
	);
}
