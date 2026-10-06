import { useTranslation } from "react-i18next";

import { Button } from "@workspace/ui-react/components/button";

import { DeleteProfileConfirmationDialog } from "#/features/user_management/profile/components/delete-confirmation-dialog";

export function DeleteProfileSection() {
	const { t } = useTranslation("features.web.account_management.profile.components.delete-section");

	return (
		<div className="flex items-center justify-between">
			<div className="grid gap-0.5">
				<h3 className="font-semibold text-neutral-12 text-sm">{t("title")}</h3>
				<p className="font-text text-neutral-11 text-xs">{t("description")}</p>
			</div>

			<DeleteProfileConfirmationDialog
				trigger={<Button variant="destructive">{t("button")}</Button>}
			/>
		</div>
	);
}
