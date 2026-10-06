import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "tailwind-variants";

import {
	type PlusOneValues,
	usePlusOneForm,
} from "#/features/inauguration/invitation/hooks/use-plus-one-form";

type PlusOneFormProps = {
	defaultValues?: Partial<PlusOneValues> | null;
	onSubmit: (values: PlusOneValues) => Promise<unknown> | unknown;
	submitLabel: string;
	/** Extra actions next to the submit button (remove, cancel…). */
	actions?: ReactNode;
	disabled?: boolean;
	/** Tighter layout for the conversation dock (names side by side, no help text). */
	compact?: boolean;
	className?: string;
};

export function PlusOneForm(props: PlusOneFormProps) {
	const { defaultValues, onSubmit, submitLabel, actions, disabled, compact, className } = props;

	const { t } = useTranslation("features.inauguration.invitation.components.plus-one-form");

	const form = usePlusOneForm({ defaultValues, onSubmit });

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			noValidate
			className={cn("grid animate-rise gap-4 motion-reduce:animate-none", className)}
		>
			<div className={cn("grid gap-4", compact ? "grid-cols-2 gap-3" : "sm:grid-cols-2")}>
				<form.AppField name="firstName">
					{(field) => (
						<field.TextField
							label={t("first-name")}
							required
							disabled={disabled}
							inputProps={{ autoComplete: "off", className: "h-11 text-base sm:text-sm" }}
						/>
					)}
				</form.AppField>
				<form.AppField name="lastName">
					{(field) => (
						<field.TextField
							label={t("last-name")}
							required
							disabled={disabled}
							inputProps={{ autoComplete: "off", className: "h-11 text-base sm:text-sm" }}
						/>
					)}
				</form.AppField>
			</div>
			<form.AppField name="email">
				{(field) => (
					<field.TextField
						label={t("email")}
						description={compact ? undefined : t("email-description")}
						required
						disabled={disabled}
						inputProps={{
							type: "email",
							inputMode: "email",
							autoComplete: "off",
							className: "h-11 text-base sm:text-sm",
						}}
					/>
				)}
			</form.AppField>
			<div className="flex flex-wrap items-center gap-3">
				<form.AppForm>
					<form.SubmitButton
						variant="primary"
						disabled={disabled}
						className="h-11 rounded-full px-6 font-semibold"
					>
						{submitLabel}
					</form.SubmitButton>
				</form.AppForm>
				{actions}
			</div>
		</form>
	);
}
