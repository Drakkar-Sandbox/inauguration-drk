import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Card } from "@workspace/ui-react/components/card";

import {
	type UseGuestAngleFormParams,
	useGuestAngleForm,
} from "#/features/inauguration/backoffice/guests/hooks/use-angle-form";
import { MEETING_STATUSES } from "#/features/inauguration/backoffice/types";
import { inauguration } from "#/libs/tuyau";

type GuestAngleFormProps = UseGuestAngleFormParams;

export function GuestAngleForm(props: GuestAngleFormProps) {
	const { guestId, defaultValues } = props;

	const { t } = useTranslation(
		"features.inauguration.backoffice.guests.components.guest-angle-form",
	);
	const { t: tLabels } = useTranslation("features.inauguration.backoffice.labels");

	const { data: staff } = useSuspenseQuery(inauguration.backoffice.staff.list.queryOptions());

	const form = useGuestAngleForm({ guestId, defaultValues });

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
					<p className="font-text text-neutral-11 text-xs">{t("description")}</p>
				</div>

				<form.AppForm>
					<form.SubmitButton variant="primary">{t("action.submit")}</form.SubmitButton>
				</form.AppForm>
			</Card.Header>

			<Card.Content className="grid gap-4">
				<div className="grid gap-4 sm:grid-cols-2">
					<form.AppField name="referentUserId">
						{(field) => (
							<field.SelectField<number | null>
								label={t("fields.referent")}
								options={[
									{ value: null, label: t("no-referent") },
									...staff.map((user) => ({ value: user.id, label: user.name })),
								]}
							/>
						)}
					</form.AppField>
					<form.AppField name="meetingStatus">
						{(field) => (
							<field.SelectField
								label={t("fields.meeting-status")}
								options={MEETING_STATUSES.map((status) => ({
									value: status,
									label: tLabels(`meeting-status.${status}`),
								}))}
							/>
						)}
					</form.AppField>
				</div>
				<form.AppField name="angleTopic">
					{(field) => (
						<field.TextAreaField
							label={t("fields.angle-topic")}
							description={t("fields.angle-topic-description")}
							inputProps={{ rows: 2 }}
						/>
					)}
				</form.AppField>
				<form.AppField name="angleNotes">
					{(field) => (
						<field.TextAreaField label={t("fields.angle-notes")} inputProps={{ rows: 5 }} />
					)}
				</form.AppField>
			</Card.Content>
		</Card>
	);
}
