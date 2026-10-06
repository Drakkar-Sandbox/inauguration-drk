import { revalidateLogic } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";
import z from "zod";

import { useCreateGuestMutation } from "#/features/inauguration/backoffice/guests/hooks/use-create-mutation";
import { useUpdateGuestMutation } from "#/features/inauguration/backoffice/guests/hooks/use-update-mutation";
import { GUEST_STATUSES, type GuestStatus } from "#/features/inauguration/backoffice/types";
import { useAppForm } from "#/libs/form";

export type GuestIdentityValues = {
	firstName: string;
	lastName: string;
	email: string;
	company: string;
	status: GuestStatus;
};

export type UseGuestIdentityFormParams = {
	/** Updates this guest when set, creates a new primary guest otherwise. */
	guestId?: number;
	defaultValues?: Partial<GuestIdentityValues>;
	onSuccess?: (guest: { id: number }) => void;
};

export function useGuestIdentityForm(params?: UseGuestIdentityFormParams) {
	const { guestId, defaultValues, onSuccess } = params ?? {};

	const { t } = useTranslation("features.inauguration.backoffice.guests.hooks.forms");

	const { mutateAsync: createGuest } = useCreateGuestMutation();
	const { mutateAsync: updateGuest } = useUpdateGuestMutation();

	const schema = z.object({
		firstName: z
			.string()
			.trim()
			.min(1, { error: t("validation.first-name") })
			.max(100, { error: t("validation.max", { max: 100 }) }),
		lastName: z
			.string()
			.trim()
			.min(1, { error: t("validation.last-name") })
			.max(100, { error: t("validation.max", { max: 100 }) }),
		email: z.union([z.literal(""), z.email({ error: t("validation.email") })]),
		company: z.string().max(200, { error: t("validation.max", { max: 200 }) }),
		status: z.enum(GUEST_STATUSES),
	});

	return useAppForm({
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			company: "",
			status: "invited",
			...defaultValues,
		} as GuestIdentityValues,
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: schema,
		},
		onSubmit: async ({ value, formApi }) => {
			const body = {
				firstName: value.firstName.trim(),
				lastName: value.lastName.trim(),
				email: value.email.trim() || null,
				company: value.company.trim() || null,
				status: value.status,
			};

			const guest = guestId
				? await updateGuest({ params: { id: guestId }, body })
				: await createGuest({ body });

			if (!guestId) formApi.reset();
			onSuccess?.(guest);
		},
	});
}
