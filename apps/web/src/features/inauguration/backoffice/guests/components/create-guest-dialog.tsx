import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { Button } from "@workspace/ui-react/components/button";
import { Dialog, DialogHeadless } from "@workspace/ui-react/components/dialog";
import { PlusIcon } from "@workspace/ui-react/icons";

import { GuestIdentityFields } from "#/features/inauguration/backoffice/guests/components/guest-identity-fields";
import { useGuestIdentityForm } from "#/features/inauguration/backoffice/guests/hooks/use-identity-form";

export function CreateGuestDialog() {
	const { t } = useTranslation(
		"features.inauguration.backoffice.guests.components.create-guest-dialog",
	);

	const navigate = useNavigate();
	const dialogHandle = DialogHeadless.createHandle();

	const form = useGuestIdentityForm({
		onSuccess: (guest) => {
			dialogHandle.close();
			navigate({ to: "/backoffice/guests/$guestId", params: { guestId: String(guest.id) } });
		},
	});

	return (
		<Dialog handle={dialogHandle}>
			<Dialog.Trigger
				render={
					<Button variant="primary">
						<PlusIcon />
						{t("trigger")}
					</Button>
				}
			/>

			<Dialog.Content className="sm:max-w-xl">
				<form
					className="grid gap-6"
					noValidate
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
				>
					<div className="grid gap-1">
						<Dialog.Title className="font-semibold text-lg text-neutral-12">
							{t("title")}
						</Dialog.Title>
						<Dialog.Description className="text-neutral-11 text-sm">
							{t("description")}
						</Dialog.Description>
					</div>

					<GuestIdentityFields form={form} />

					<div className="flex justify-end gap-2">
						<Dialog.Close render={<Button />}>{t("action.cancel")}</Dialog.Close>
						<form.AppForm>
							<form.SubmitButton variant="primary">{t("action.submit")}</form.SubmitButton>
						</form.AppForm>
					</div>
				</form>
			</Dialog.Content>
		</Dialog>
	);
}
