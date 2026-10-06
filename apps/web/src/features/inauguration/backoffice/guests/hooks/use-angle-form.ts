import { revalidateLogic } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";
import z from "zod";

import { useUpdateGuestMutation } from "#/features/inauguration/backoffice/guests/hooks/use-update-mutation";
import { MEETING_STATUSES, type MeetingStatus } from "#/features/inauguration/backoffice/types";
import { useAppForm } from "#/libs/form";

export type UseGuestAngleFormParams = {
	guestId: number;
	defaultValues: {
		angleTopic: string;
		angleNotes: string;
		referentUserId: number | null;
		meetingStatus: MeetingStatus;
	};
};

export function useGuestAngleForm(params: UseGuestAngleFormParams) {
	const { guestId, defaultValues } = params;

	const { t } = useTranslation("features.inauguration.backoffice.guests.hooks.forms");

	const { mutateAsync: updateGuest } = useUpdateGuestMutation();

	const schema = z.object({
		angleTopic: z.string().max(2000, { error: t("validation.max", { max: 2000 }) }),
		angleNotes: z.string().max(10000, { error: t("validation.max", { max: 10000 }) }),
		referentUserId: z.number().nullable(),
		meetingStatus: z.enum(MEETING_STATUSES),
	});

	return useAppForm({
		defaultValues,
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: schema,
		},
		onSubmit: async ({ value }) => {
			await updateGuest({
				params: { id: guestId },
				body: {
					angleTopic: value.angleTopic.trim() || null,
					angleNotes: value.angleNotes.trim() || null,
					referentUserId: value.referentUserId,
					meetingStatus: value.meetingStatus,
				},
			});
		},
	});
}
