import * as Sentry from "@sentry/tanstackstart-react";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@workspace/ui-react/components/button";

import { BrandTitle } from "#/components/app/brand-title";

export function UnexpectedPage(props: ErrorComponentProps) {
	const { error, reset } = props;

	const { t } = useTranslation("componoent.pages.unexpected");

	useEffect(() => {
		Sentry.captureException(error);
	}, [error]);

	return (
		<main className="flex min-h-svh flex-col items-center justify-center p-4 text-center">
			<BrandTitle className="mb-3">{t("title")}</BrandTitle>
			<p className="mb-8 font-text text-neutral-11 text-sm">{t("description")}</p>
			<Button variant="primary" onClick={reset}>
				{t("retry")}
			</Button>
		</main>
	);
}
