import { useTranslation } from "react-i18next";

import { Card } from "@workspace/ui-react/components/card";

import { GuestIdentityFields } from "#/features/inauguration/backoffice/guests/components/guest-identity-fields";
import {
	type UseGuestIdentityFormParams,
	useGuestIdentityForm,
} from "#/features/inauguration/backoffice/guests/hooks/use-identity-form";

type GuestIdentityFormProps = Required<
	Pick<UseGuestIdentityFormParams, "guestId" | "defaultValues">
>;

export function GuestIdentityForm(props: GuestIdentityFormProps) {
	const { guestId, defaultValues } = props;

	const { t } = useTranslation(
		"features.inauguration.backoffice.guests.components.guest-identity-form",
	);

	const form = useGuestIdentityForm({ guestId, defaultValues });

	return (
		<Card
			render={
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					noValidate
				/>
			}
		>
			<Card.Header className="flex items-center justify-between gap-4">
				<div className="grid gap-0.5">
					<h2 className="font-semibold text-md text-neutral-12">{t("title")}</h2>
					<p className="text-neutral-11 text-xs">{t("description")}</p>
				</div>

				<form.AppForm>
					<form.SubmitButton variant="primary">{t("action.submit")}</form.SubmitButton>
				</form.AppForm>
			</Card.Header>

			<Card.Content>
				<GuestIdentityFields form={form} />
			</Card.Content>
		</Card>
	);
}
