import { Field } from "@workspace/ui-react/components/field";
import { Select } from "@workspace/ui-react/components/select";

import { useFieldContext } from "#/libs/form";

type SelectFieldProps<Value> = {
	label?: string;
	description?: string;
	required?: boolean;
	disabled?: boolean;
	placeholder?: string;
	options: { value: Value; label: string }[];
};

export function SelectField<Value>(props: SelectFieldProps<Value>) {
	const { label, description, required, disabled, placeholder, options } = props;

	const field = useFieldContext<Value>();
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	return (
		<Field
			name={field.name}
			invalid={isInvalid}
			disabled={disabled}
			className="flex flex-col gap-1"
		>
			{label && (
				<Field.Label htmlFor={field.name} required={required}>
					{label}
				</Field.Label>
			)}
			<Select<Value>
				name={field.name}
				items={options}
				value={field.state.value}
				disabled={disabled}
				onValueChange={(value) => field.handleChange(value as Value)}
				onOpenChange={(open) => !open && field.handleBlur()}
			>
				<Select.Input id={field.name} aria-invalid={isInvalid} className="w-full">
					<Select.Value placeholder={placeholder} />
				</Select.Input>
				<Select.Dropdown>
					{options.map((option) => (
						<Select.Option key={String(option.value)} value={option.value}>
							{option.label}
						</Select.Option>
					))}
				</Select.Dropdown>
			</Select>
			{description && <Field.Description>{description}</Field.Description>}
			{isInvalid &&
				field.state.meta.errors.map((error) => (
					<Field.Error key={`${error.code}-${error.path}`}>{error.message}</Field.Error>
				))}
		</Field>
	);
}
