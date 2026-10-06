import type { ReactNode } from "react";
import { cn } from "tailwind-variants";

import { useIdleCursor } from "#/features/inauguration/kiosk/hooks/use-idle-cursor";
import { useWakeLock } from "#/features/inauguration/kiosk/hooks/use-wake-lock";
import { useDarkDocument } from "#/features/inauguration/leif/hooks/use-dark-document";

type KioskShellProps = {
	children: ReactNode;
	/** Operator console keeps its cursor and scrolls. */
	console?: boolean;
	className?: string;
};

/**
 * Full-screen, chrome-less frame for day-J screens: always dark, screen kept awake, no
 * scrollbars and the cursor fades away when nobody touches the mouse.
 */
export function KioskShell(props: KioskShellProps) {
	const { children, console = false, className } = props;

	useDarkDocument();
	useWakeLock();
	const idle = useIdleCursor();

	return (
		<div
			className={cn(
				"relative isolate bg-neutral-1 text-neutral-12 antialiased",
				console ? "min-h-svh" : "h-svh w-screen select-none overflow-hidden",
				!console && idle && "cursor-none [&_*]:cursor-none",
				className,
			)}
		>
			{children}
		</div>
	);
}
