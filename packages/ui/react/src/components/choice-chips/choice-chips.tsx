import type { ReactNode } from "react";
import { tv, type VariantProps } from "tailwind-variants";

export interface ChoiceChip {
	/** Value sent back through `onChoose`. */
	value: string;
	label: ReactNode;
	/** `primary` highlights the expected answer (e.g. « Je serai présent »). */
	tone?: "default" | "primary";
	disabled?: boolean;
}

const choiceChipsVariants = tv({
	slots: {
		root: "m-0 flex min-w-0 flex-wrap gap-3 border-0 p-0",
		chip: [
			"inline-flex animate-rise cursor-pointer select-none items-center justify-center rounded-full border font-semibold outline-none transition motion-reduce:animate-none",
			"focus-visible:ring-3 focus-visible:ring-primary-7 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-1",
			"disabled:cursor-not-allowed disabled:opacity-40",
		],
	},
	variants: {
		tone: {
			default: {
				chip: [
					"border-neutral-7 bg-transparent text-neutral-12",
					"hover:not-disabled:border-primary-9 hover:not-disabled:text-primary-11",
					"active:not-disabled:bg-neutral-3",
				],
			},
			primary: {
				chip: [
					"border-primary-9 bg-primary-9 text-neutral-1 dark:text-neutral-12",
					"hover:not-disabled:border-primary-10 hover:not-disabled:bg-primary-10",
				],
			},
		},
		size: {
			md: { chip: "h-10 px-4 text-sm" },
			lg: { chip: "h-14 px-6 text-base sm:text-lg" },
		},
		align: {
			start: { root: "justify-start" },
			center: { root: "justify-center" },
		},
	},
	defaultVariants: {
		tone: "default",
		size: "md",
		align: "center",
	},
});

export type ChoiceChipsRootProps = Omit<VariantProps<typeof choiceChipsVariants>, "tone"> & {
	choices: ChoiceChip[];
	onChoose?: (value: string) => void;
	/** Disables every chip, e.g. while Leif is answering. */
	disabled?: boolean;
	/** Accessible name of the group. */
	"aria-label"?: string;
	className?: string;
};

export function ChoiceChipsRoot(props: ChoiceChipsRootProps) {
	const { choices, onChoose, disabled, size, align, "aria-label": ariaLabel, className } = props;
	const styles = choiceChipsVariants({ size, align });

	return (
		<fieldset aria-label={ariaLabel} disabled={disabled} className={styles.root({ className })}>
			{choices.map((choice, index) => (
				<button
					key={choice.value}
					type="button"
					disabled={choice.disabled}
					onClick={() => onChoose?.(choice.value)}
					className={choiceChipsVariants({ size, tone: choice.tone }).chip()}
					style={{ animationDelay: `${index * 60}ms` }}
				>
					{choice.label}
				</button>
			))}
		</fieldset>
	);
}
