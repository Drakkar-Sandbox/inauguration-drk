import { type ErrorComponentProps, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

import { DrakkarLogo } from "@workspace/ui-react/components/drakkar-logo";

import { KioskShell } from "#/features/inauguration/kiosk/components/kiosk-shell";

const RECOVER_AFTER_MS = 4_000;

/**
 * Kiosk screens never stay on an error: show the brand on ink for a moment, then reload the
 * route.
 */
export function KioskRecover(props: ErrorComponentProps) {
	const { reset } = props;

	const router = useRouter();

	useEffect(() => {
		const timeout = setTimeout(() => {
			void router.invalidate().finally(reset);
		}, RECOVER_AFTER_MS);
		return () => clearTimeout(timeout);
	}, [router, reset]);

	return (
		<KioskShell className="grid place-items-center">
			<DrakkarLogo tone="paper" className="animate-halo text-[5vmin] motion-reduce:animate-none" />
		</KioskShell>
	);
}
