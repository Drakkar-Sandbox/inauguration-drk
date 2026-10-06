import { revalidateLogic } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";
import z from "zod";

import { useAppForm } from "#/libs/form";

export type PlusOneValues = {
	firstName: string;
	lastName: string;
	email: string;
};

type UsePlusOneFormParams = {
	defaultValues?: Partial<PlusOneValues> | null;
	onSubmit: (values: PlusOneValues) => Promise<unknown> | unknown;
};

export function usePlusOneForm(params: UsePlusOneFormParams) {
	const { defaultValues, onSubmit } = params;

	const { t } = useTranslation("features.inauguration.invitation.hooks.plus-one-form");

	const schema = z.object({
		firstName: z
			.string()
			.trim()
			.min(1, { error: t("validation.first-name") })
			.max(100),
		lastName: z
			.string()
			.trim()
			.min(1, { error: t("validation.last-name") })
			.max(100),
		email: z.email({ error: t("validation.email") }).max(254),
	});

	return useAppForm({
		defaultValues: {
			firstName: defaultValues?.firstName ?? "",
			lastName: defaultValues?.lastName ?? "",
			email: defaultValues?.email ?? "",
		} as PlusOneValues,
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: schema,
		},
		onSubmit: async ({ value }) => {
			await onSubmit({
				firstName: value.firstName.trim(),
				lastName: value.lastName.trim(),
				email: value.email.trim(),
			});
		},
	});
}
