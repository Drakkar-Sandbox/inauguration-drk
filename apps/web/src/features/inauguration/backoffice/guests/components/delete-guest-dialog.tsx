import { useTranslation } from "react-i18next";

import {
	AlertDialog,
	AlertDialogHeadless,
	type AlertDialogTriggerProps,
} from "@workspace/ui-react/components/alert-dialog";
import { Button } from "@workspace/ui-react/components/button";
import { Spinner } from "@workspace/ui-react/components/spinner";

import { useDeleteGuestMutation } from "#/features/inauguration/backoffice/guests/hooks/use-delete-mutation";

type DeleteGuestDialogProps = {
	guestId: number;
	name: string;
	trigger: AlertDialogTriggerProps["render"];
};

export function DeleteGuestDialog(props: DeleteGuestDialogProps) {
	const { guestId, name, trigger } = props;

	const { t } = useTranslation(
		"features.inauguration.backoffice.guests.components.delete-guest-dialog",
	);

	const alertDialogHandler = AlertDialogHeadless.createHandle();
	const { mutateAsync: deleteGuest, isPending: isDeleting } = useDeleteGuestMutation();

	const handleDelete = async () => {
		await deleteGuest({ params: { id: guestId } });
		alertDialogHandler.close();
	};

	return (
		<AlertDialog handle={alertDialogHandler}>
			<AlertDialog.Trigger render={trigger} />

			<AlertDialog.Content className="sm:max-w-sm">
				<AlertDialog.Title className="mb-1 font-semibold text-lg text-neutral-12">
					{t("title", { name })}
				</AlertDialog.Title>
				<AlertDialog.Description className="mb-8 text-neutral-11 text-sm">
					{t("description")}
				</AlertDialog.Description>

				<div className="flex flex-col justify-end gap-2 sm:flex-row sm:items-center">
					<AlertDialog.Close render={<Button />} disabled={isDeleting}>
						{t("action.cancel")}
					</AlertDialog.Close>
					<Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
						{isDeleting && <Spinner />}
						{t("action.delete")}
					</Button>
				</div>
			</AlertDialog.Content>
		</AlertDialog>
	);
}
