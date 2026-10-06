import { tv, type VariantProps } from "tailwind-variants";

/*
 * PROVISIONAL WORDMARK — replace with the official logo.
 * The SVG lives on the company Google Drive. Drop it as
 * `packages/ui/react/src/components/drakkar-logo/drakkar-logo.svg`, inline its paths here
 * (with `fill="currentColor"` so `tone` keeps working) and keep the props unchanged.
 */

const drakkarLogoVariants = tv({
	base: "inline-flex select-none items-baseline font-extrabold font-sans leading-none tracking-[-0.04em]",
	variants: {
		size: {
			sm: "text-base",
			md: "text-2xl",
			lg: "text-4xl",
			xl: "text-6xl",
		},
		tone: {
			ink: "text-neutral-12",
			paper: "text-white",
			current: "text-current",
		},
	},
	defaultVariants: {
		size: "md",
		tone: "ink",
	},
});

export type DrakkarLogoRootProps = VariantProps<typeof drakkarLogoVariants> & {
	/** Coral full stop after the wordmark. @default true */
	accent?: boolean;
	className?: string;
};

export function DrakkarLogoRoot(props: DrakkarLogoRootProps) {
	const { size, tone, accent = true, className } = props;

	return (
		<span
			role="img"
			aria-label="Drakkar"
			className={drakkarLogoVariants({ size, tone, className })}
		>
			<span aria-hidden="true">DRAKKAR</span>
			{accent && (
				<span aria-hidden="true" className="text-primary-9">
					.
				</span>
			)}
		</span>
	);
}
