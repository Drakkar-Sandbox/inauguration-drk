import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

import { CheckboxField } from "#/components/form/checkbox-field";
import { NumberField } from "#/components/form/number-field";
import { PasswordField } from "#/components/form/password-field";
import { SelectField } from "#/components/form/select-field";
import { SubmitButton } from "#/components/form/submit-button";
import { SwitchField } from "#/components/form/switch-field";
import { TextField } from "#/components/form/text-field";
import { TextAreaField } from "#/components/form/textarea-field";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
	createFormHookContexts();

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {
		TextField,
		PasswordField,
		TextAreaField,
		NumberField,
		SwitchField,
		CheckboxField,
		SelectField,
	},
	formComponents: {
		SubmitButton,
	},
});
