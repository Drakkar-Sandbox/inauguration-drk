import { useCallback, useState } from "react";

/** Per-screen camera toggle, remembered on the kiosk machine. */
export function useCameraPreference(screen: string) {
	const key = `inauguration.kiosk.${screen}.camera`;

	const [enabled, setEnabled] = useState(() => {
		try {
			return window.localStorage.getItem(key) !== "off";
		} catch {
			return true;
		}
	});

	const update = useCallback(
		(next: boolean) => {
			setEnabled(next);
			try {
				window.localStorage.setItem(key, next ? "on" : "off");
			} catch {
				// Private mode: the toggle still works for this session.
			}
		},
		[key],
	);

	return [enabled, update] as const;
}
