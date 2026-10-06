import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import z from "zod";

import { toast } from "@workspace/ui-react/components/toast";

import { BrandTitle } from "#/components/app/brand-title";
import { ResetPasswordForm } from "#/features/user_management/password/components/reset-form";

const searchParamsSchema = z.object({
	token: z.string().optional(),
});

export const Route = createFileRoute("/(guest)/(auth)/reset-password/")({
	validateSearch: searchParamsSchema,
	component: Page,
});

function Page() {
	const { t } = useTranslation("routes.(guest).(auth).reset-password");

	const { token } = Route.useSearch();
	const navigate = Route.useNavigate();

	useEffect(() => {
		if (token) return;

		const timeout = setTimeout(() => {
			toast.error(t("error.invalid-token.title"), {
				description: t("error.invalid-token.description"),
			});
		});
		navigate({ to: "/login", replace: true });

		return () => clearTimeout(timeout);
	}, [token, t, navigate]);

	if (!token) return null;

	return (
		<>
			<BrandTitle className="mb-8">{t("title")}</BrandTitle>

			<ResetPasswordForm token={token} />
		</>
	);
}
