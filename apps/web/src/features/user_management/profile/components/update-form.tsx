import { useTranslation } from "react-i18next";

import { Card } from "@workspace/ui-react/components/card";

import {
	type UseUpdateProfileFormParams,
	useUpdateProfileForm,
} from "#/features/user_management/profile/hooks/use-update-form";

type UpdateProfileFormProps = UseUpdateProfileFormParams;

export function UpdateProfileForm(props: UpdateProfileFormProps) {
	const { defaultValues } = props;

	const { t } = useTranslation("features.web.account_management.profile.components.update-form");

	const form = useUpdateProfileForm({
		defaultValues,
	});

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
			<Card.Header className="flex items-center justify-between">
				<div className="grid gap-0.5">
					<h2 className="font-semibold text-md text-neutral-12">{t("title")}</h2>
					<p className="font-text text-neutral-11 text-xs">{t("description")}</p>
				</div>

				<form.AppForm>
					<form.SubmitButton variant="primary">{t("action.submit")}</form.SubmitButton>
				</form.AppForm>
			</Card.Header>

			<Card.Content className="grid max-w-96 gap-4">
				<form.AppField name="name">
					{(field) => <field.TextField label={t("fields.name.label")} />}
				</form.AppField>
			</Card.Content>
		</Card>
	);
}
