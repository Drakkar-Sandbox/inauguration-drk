import type { ReactNode } from "react";
import { cn } from "tailwind-variants";

type ScanFrameProps = {
	/** Live camera preview rendered inside the frame. */
	children?: ReactNode;
	className?: string;
};

/** Coral viewfinder corners with a slow scanning line: "present your QR code here". */
export function ScanFrame(props: ScanFrameProps) {
	const { children, className } = props;

	return (
		<div className={cn("relative aspect-square overflow-hidden rounded-[12%]", className)}>
			<div className="absolute inset-0 bg-neutral-2/60">{children}</div>
			<div aria-hidden="true" className="absolute inset-0">
				{[
					"top-0 left-0 border-t-4 border-l-4 rounded-tl-[40%]",
					"top-0 right-0 border-t-4 border-r-4 rounded-tr-[40%]",
					"bottom-0 left-0 border-b-4 border-l-4 rounded-bl-[40%]",
					"right-0 bottom-0 border-r-4 border-b-4 rounded-br-[40%]",
				].map((corner) => (
					<span key={corner} className={cn("absolute size-1/4 border-primary-9", corner)} />
				))}
				<span className="absolute inset-x-[12%] top-1/2 h-0.5 animate-[scan_3.2s_ease-in-out_infinite] rounded-full bg-primary-9 shadow-[0_0_24px_4px] shadow-primary-9/60 motion-reduce:animate-none" />
			</div>
		</div>
	);
}
