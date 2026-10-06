import { useEffect, useRef } from "react";
import { cn } from "tailwind-variants";

const SAME_CODE_COOLDOWN_MS = 6_000;

type CameraScannerProps = {
	onScan: (code: string) => void;
	/** Front camera by default: the guest faces the screen. */
	facingMode?: "user" | "environment";
	/** Called when no camera is available or access is denied. */
	onUnavailable?: () => void;
	className?: string;
};

/**
 * Live camera QR reader (qr-scanner, loaded on demand). The same code is ignored for a few
 * seconds so a badge held in front of the lens triggers a single check-in.
 */
export function CameraScanner(props: CameraScannerProps) {
	const { facingMode = "user", className } = props;

	const video = useRef<HTMLVideoElement>(null);
	const callbacks = useRef(props);
	callbacks.current = props;

	useEffect(() => {
		const element = video.current;
		if (!element) return;

		let disposed = false;
		let scanner: { stop: () => void; destroy: () => void } | null = null;
		let last = { code: "", at: 0 };

		void import("qr-scanner")
			.then(async ({ default: QrScanner }) => {
				if (disposed) return;
				if (!window.isSecureContext || !(await QrScanner.hasCamera())) {
					callbacks.current.onUnavailable?.();
					return;
				}
				if (disposed) return;
				const instance = new QrScanner(
					element,
					(result) => {
						const now = performance.now();
						if (result.data === last.code && now - last.at < SAME_CODE_COOLDOWN_MS) return;
						last = { code: result.data, at: now };
						callbacks.current.onScan(result.data);
					},
					{ preferredCamera: facingMode, maxScansPerSecond: 6, returnDetailedScanResult: true },
				);
				scanner = instance;
				await instance.start();
			})
			.catch(() => {
				if (!disposed) callbacks.current.onUnavailable?.();
			});

		return () => {
			disposed = true;
			scanner?.stop();
			scanner?.destroy();
		};
	}, [facingMode]);

	return (
		<video
			ref={video}
			muted
			playsInline
			className={cn("size-full -scale-x-100 object-cover", className)}
		/>
	);
}
