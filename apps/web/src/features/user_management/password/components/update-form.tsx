import { useTranslation } from "react-i18next";

import { Card } from "@workspace/ui-react/components/card";

import {
	type UseUpdatePasswordFormParams,
	useUpdatePasswordForm,
} from "#/features/user_management/password/hooks/use-update-form";

type UpdatePasswordFormProps = UseUpdatePasswordFormParams;

export function UpdatePasswordForm(props: UpdatePasswordFormProps) {
	const { defaultValues } = props;

	const { t } = useTranslation("features.web.account_management.password.components.update-form");

	const form = useUpdatePasswordForm({
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
				<form.AppField name="currentPassword">
					{(field) => <field.PasswordField label={t("fields.currentPassword.label")} />}
				</form.AppField>

				<form.AppField name="newPassword">
					{(field) => <field.PasswordField label={t("fields.newPassword.label")} />}
				</form.AppField>

				<form.AppField name="confirmNewPassword">
					{(field) => <field.PasswordField label={t("fields.confirmNewPassword.label")} />}
				</form.AppField>
			</Card.Content>
		</Card>
	);
}
