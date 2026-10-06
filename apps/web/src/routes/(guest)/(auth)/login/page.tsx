import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { BrandTitle } from "#/components/app/brand-title";
import { LoginForm } from "#/features/user_management/authentication/components/login-form";

const searchParamsSchema = z.object({
	redirectTo: z.string().optional(),
});

export const Route = createFileRoute("/(guest)/(auth)/login/")({
	validateSearch: searchParamsSchema,
	component: Page,
});

function Page() {
	const { t } = useTranslation("routes.(guest).(auth).login");

	const { redirectTo } = Route.useSearch();

	return (
		<>
			<BrandTitle className="mb-8">{t("title")}</BrandTitle>

			<LoginForm redirectTo={redirectTo} />
		</>
	);
}
