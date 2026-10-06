import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@workspace/ui-react/components/button";
import { Dialog } from "@workspace/ui-react/components/dialog";
import { Spinner } from "@workspace/ui-react/components/spinner";
import { UploadIcon } from "@workspace/ui-react/icons";

import { useImportGuestsMutation } from "#/features/inauguration/backoffice/guests/hooks/use-import-mutation";

const CSV_COLUMNS = "first_name,last_name,email,company,referent_email,angle_topic,angle_notes";

export function ImportGuestsDialog() {
	const { t } = useTranslation(
		"features.inauguration.backoffice.guests.components.import-guests-dialog",
	);

	const [file, setFile] = useState<File | null>(null);
	const { mutate: importGuests, data: report, isPending, reset } = useImportGuestsMutation();

	return (
		<Dialog
			onOpenChange={(open) => {
				if (!open) {
					setFile(null);
					reset();
				}
			}}
		>
			<Dialog.Trigger
				render={
					<Button>
						<UploadIcon />
						{t("trigger")}
					</Button>
				}
			/>

			<Dialog.Content className="grid max-h-[90svh] gap-6 overflow-auto sm:max-w-2xl">
				<div className="grid gap-1">
					<Dialog.Title className="font-semibold text-lg text-neutral-12">
						{t("title")}
					</Dialog.Title>
					<Dialog.Description className="text-neutral-11 text-sm">
						{t("description")}
					</Dialog.Description>
					<code className="mt-2 block overflow-x-auto rounded-md bg-neutral-3 px-2 py-1.5 font-mono text-neutral-12 text-xs">
						{CSV_COLUMNS}
					</code>
					<p className="text-neutral-11 text-xs">{t("hint")}</p>
				</div>

				<form
					className="flex flex-wrap items-center gap-3"
					onSubmit={(e) => {
						e.preventDefault();
						if (file) importGuests({ body: { file } });
					}}
				>
					<input
						type="file"
						accept=".csv,text/csv,text/plain"
						aria-label={t("file")}
						className="min-w-0 flex-1 text-neutral-12 text-sm file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-neutral-7 file:bg-neutral-1 file:px-3 file:py-1.5 file:font-medium file:text-neutral-12 file:text-sm hover:file:bg-neutral-3"
						onChange={(e) => {
							setFile(e.target.files?.[0] ?? null);
							reset();
						}}
					/>
					<Button type="submit" variant="primary" disabled={!file || isPending}>
						{isPending && <Spinner />}
						{t("action.submit")}
					</Button>
				</form>

				{report && (
					<div className="grid gap-3">
						<p className="text-neutral-12 text-sm">
							{t("report.summary", { created: report.created, updated: report.updated })}
						</p>

						{report.errors.length > 0 && (
							<div className="grid gap-2 rounded-lg border border-error-6 bg-error-2 p-3">
								<p className="font-semibold text-error-11 text-sm">
									{t("report.errors", { count: report.errors.length })}
								</p>
								<ul className="grid max-h-64 gap-1 overflow-auto text-sm">
									{report.errors.map((error) => (
										<li key={error.line} className="grid grid-cols-[auto_1fr] gap-3">
											<span className="font-mono text-error-11 tabular-nums">
												{t("report.line", { line: error.line })}
											</span>
											<span className="text-neutral-12">{error.messages.join(" · ")}</span>
										</li>
									))}
								</ul>
							</div>
						)}
					</div>
				)}

				<div className="flex justify-end">
					<Dialog.Close render={<Button />}>{t("action.close")}</Dialog.Close>
				</div>
			</Dialog.Content>
		</Dialog>
	);
}
