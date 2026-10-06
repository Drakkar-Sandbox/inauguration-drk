import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { BrandTitle } from "#/components/app/brand-title";
import { ForgotPasswordForm } from "#/features/user_management/password/components/forgot-form";

export const Route = createFileRoute("/(guest)/(auth)/forgot-password/")({
	component: Page,
});

function Page() {
	const { t } = useTranslation("routes.(guest).(auth).forgot-password");

	return (
		<>
			<BrandTitle className="mb-8">{t("title")}</BrandTitle>

			<ForgotPasswordForm />
		</>
	);
}
