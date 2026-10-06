import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Button } from "@workspace/ui-react/components/button";
import { ArrowLeftIcon, PrinterIcon } from "@workspace/ui-react/icons";

import { FilterSelect } from "#/features/inauguration/backoffice/components/filter-select";
import { PageHeader } from "#/features/inauguration/backoffice/components/page-header";
import { QrSheet } from "#/features/inauguration/backoffice/qr_sheet/components/qr-sheet";
import { GUEST_KINDS } from "#/features/inauguration/backoffice/types";

const searchParamsSchema = z.object({
	kind: z.enum(GUEST_KINDS).optional().catch(undefined),
});

export const Route = createFileRoute("/(private)/backoffice/qr-sheet/")({
	validateSearch: searchParamsSchema,
	component: Page,
});

function Page() {
	const { t } = useTranslation("routes.(private).backoffice.qr-sheet");
	const { t: tLabels } = useTranslation("features.inauguration.backoffice.labels");

	const { kind } = Route.useSearch();
	const navigate = Route.useNavigate();

	return (
		<main className="mx-auto grid max-w-5xl gap-6 print:block print:max-w-none">
			<div className="grid gap-6 print:hidden">
				<Link
					to="/backoffice/guests"
					className="flex w-fit items-center gap-1 text-neutral-11 text-sm hover:text-neutral-12"
				>
					<ArrowLeftIcon className="size-4" />
					{t("back")}
				</Link>

				<PageHeader
					title={t("title")}
					description={t("description")}
					actions={
						<>
							<FilterSelect
								label={t("filter")}
								allLabel={tLabels("all")}
								value={kind}
								options={GUEST_KINDS.map((value) => ({
									value,
									label: tLabels(`guest-kind.${value}`),
								}))}
								onValueChange={(next) => navigate({ search: { kind: next }, replace: true })}
							/>
							<Button variant="primary" onClick={() => window.print()}>
								<PrinterIcon />
								{t("print")}
							</Button>
						</>
					}
				/>
			</div>

			<QrSheet kind={kind} />
		</main>
	);
}
