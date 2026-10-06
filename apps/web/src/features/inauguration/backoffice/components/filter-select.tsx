import { Select } from "@workspace/ui-react/components/select";

type FilterSelectProps<Value extends string> = {
	label: string;
	value: Value | undefined;
	options: { value: Value; label: string }[];
	/** Label of the "no filter" option. Omit to make a value mandatory. */
	allLabel?: string;
	onValueChange: (value: Value | undefined) => void;
	className?: string;
};

export function FilterSelect<Value extends string>(props: FilterSelectProps<Value>) {
	const { label, value, options, allLabel, onValueChange, className } = props;

	const items = allLabel ? [{ value: null, label: allLabel }, ...options] : options;

	return (
		<Select<Value | null>
			items={items}
			value={value ?? null}
			onValueChange={(next) => onValueChange(next ?? undefined)}
		>
			<Select.Input aria-label={label} className={className}>
				<span className="flex min-w-0 items-center gap-1.5">
					<span className="shrink-0 text-neutral-11 text-xs">{label}</span>
					<Select.Value />
				</span>
			</Select.Input>
			<Select.Dropdown>
				{items.map((item) => (
					<Select.Option key={item.value ?? "__all"} value={item.value}>
						{item.label}
					</Select.Option>
				))}
			</Select.Dropdown>
		</Select>
	);
}
