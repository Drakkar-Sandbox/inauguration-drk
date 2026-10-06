import { useEffect, useRef } from "react";

/** USB scanners type a whole code in a few milliseconds; humans do not. */
const MAX_KEY_GAP_MS = 80;
const MIN_CODE_LENGTH = 8;

type UseScannerInputParams = {
	onScan: (code: string) => void;
	enabled?: boolean;
};

/**
 * Listens to a QR scanner in keyboard-wedge mode: a burst of key presses ending with Enter.
 * Typing in a text field is ignored, so the host search keeps working.
 */
export function useScannerInput(params: UseScannerInputParams) {
	const { enabled = true } = params;

	const onScan = useRef(params.onScan);
	onScan.current = params.onScan;

	useEffect(() => {
		if (!enabled) return;

		let buffer = "";
		let lastKeyAt = 0;
		const handleKeyDown = (event: KeyboardEvent) => {
			const target = event.target;
			if (
				target instanceof HTMLElement &&
				(target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
			) {
				return;
			}

			const now = performance.now();
			if (now - lastKeyAt > MAX_KEY_GAP_MS) buffer = "";
			lastKeyAt = now;

			if (event.key === "Enter") {
				const code = buffer.trim();
				buffer = "";
				if (code.length >= MIN_CODE_LENGTH) {
					event.preventDefault();
					onScan.current(code);
				}
				return;
			}
			if (event.key.length === 1) buffer += event.key;
		};

		window.addEventListener("keydown", handleKeyDown, { capture: true });
		return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
	}, [enabled]);
}
