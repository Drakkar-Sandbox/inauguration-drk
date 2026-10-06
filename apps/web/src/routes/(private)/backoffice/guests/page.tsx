import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Button } from "@workspace/ui-react/components/button";
import { DownloadIcon, QrCodeIcon } from "@workspace/ui-react/icons";

import { PageHeader } from "#/features/inauguration/backoffice/components/page-header";
import { CreateGuestDialog } from "#/features/inauguration/backoffice/guests/components/create-guest-dialog";
import { GuestsTable } from "#/features/inauguration/backoffice/guests/components/guests-table";
import { ImportGuestsDialog } from "#/features/inauguration/backoffice/guests/components/import-guests-dialog";
import { GUEST_KINDS, GUEST_STATUSES } from "#/features/inauguration/backoffice/types";
import { backofficeFileUrl } from "#/features/inauguration/backoffice/utils/api";

const searchParamsSchema = z.object({
	status: z.enum(GUEST_STATUSES).optional().catch(undefined),
	kind: z.enum(GUEST_KINDS).optional().catch(undefined),
	checkedIn: z.enum(["yes", "no"]).optional().catch(undefined),
	referent: z.coerce.number().int().positive().optional().catch(undefined),
	search: z.string().optional().catch(undefined),
	page: z.coerce.number().int().positive().optional().catch(undefined),
});

export const Route = createFileRoute("/(private)/backoffice/guests/")({
	validateSearch: searchParamsSchema,
	component: Page,
});

function Page() {
	const { t } = useTranslation("routes.(private).backoffice.guests");

	const filters = Route.useSearch();
	const navigate = Route.useNavigate();

	return (
		<main className="mx-auto grid max-w-7xl gap-6">
			<PageHeader
				title={t("title")}
				description={t("description")}
				actions={
					<>
						<Button nativeButton={false} render={<Link to="/backoffice/qr-sheet" />}>
							<QrCodeIcon />
							{t("action.qr-sheet")}
						</Button>
						<Button
							nativeButton={false}
							render={
								<a href={backofficeFileUrl("inauguration.backoffice.guests.export")} download />
							}
						>
							<DownloadIcon />
							{t("action.export")}
						</Button>
						<ImportGuestsDialog />
						<CreateGuestDialog />
					</>
				}
			/>

			<GuestsTable
				filters={filters}
				onFiltersChange={(next) => navigate({ search: next, replace: true })}
			/>
		</main>
	);
}
