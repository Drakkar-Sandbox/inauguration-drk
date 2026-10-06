import { useTranslation } from "react-i18next";

import type { GuestIdentityValues } from "#/features/inauguration/backoffice/guests/hooks/use-identity-form";
import { GUEST_STATUSES } from "#/features/inauguration/backoffice/types";
import { withForm } from "#/libs/form";

export const GuestIdentityFields = withForm({
	defaultValues: {} as GuestIdentityValues,
	render: function Render({ form }) {
		const { t } = useTranslation(
			"features.inauguration.backoffice.guests.components.guest-identity-fields",
		);
		const { t: tLabels } = useTranslation("features.inauguration.backoffice.labels");

		return (
			<div className="grid gap-4 sm:grid-cols-2">
				<form.AppField name="firstName">
					{(field) => <field.TextField label={t("first-name")} required />}
				</form.AppField>
				<form.AppField name="lastName">
					{(field) => <field.TextField label={t("last-name")} required />}
				</form.AppField>
				<form.AppField name="email">
					{(field) => (
						<field.TextField
							label={t("email")}
							inputProps={{ type: "email", autoComplete: "off" }}
						/>
					)}
				</form.AppField>
				<form.AppField name="company">
					{(field) => <field.TextField label={t("company")} />}
				</form.AppField>
				<form.AppField name="status">
					{(field) => (
						<field.SelectField
							label={t("status")}
							options={GUEST_STATUSES.map((status) => ({
								value: status,
								label: tLabels(`guest-status.${status}`),
							}))}
						/>
					)}
				</form.AppField>
			</div>
		);
	},
});
