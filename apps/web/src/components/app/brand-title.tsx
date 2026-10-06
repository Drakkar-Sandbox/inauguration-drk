import type { ReactNode } from "react";
import { cn } from "tailwind-variants";

type BrandTitleProps = {
	children: ReactNode;
	/** Short pixel-style label above the title (Handjet). */
	kicker?: ReactNode;
	className?: string;
};

/** Drakkar page heading: Urbanist extra-bold, tight tracking, coral full stop as the only accent. */
export function BrandTitle(props: BrandTitleProps) {
	const { children, kicker, className } = props;

	return (
		<div className={cn("grid gap-3", className)}>
			{kicker && (
				<p className="font-pixel font-semibold text-lg text-primary-9 uppercase leading-none tracking-[0.12em]">
					{kicker}
				</p>
			)}
			<h1 className="text-balance font-extrabold text-4xl text-neutral-12 leading-[0.95] tracking-[-0.035em] sm:text-5xl">
				{children}
				<span className="text-primary-9">.</span>
			</h1>
		</div>
	);
}
