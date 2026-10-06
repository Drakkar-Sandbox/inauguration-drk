import { useEffect } from "react";

/**
 * Keeps kiosk screens awake. The lock is released by the browser whenever the tab is hidden,
 * so it is requested again each time the page becomes visible.
 */
export function useWakeLock() {
	useEffect(() => {
		if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;

		let sentinel: WakeLockSentinel | null = null;
		let disposed = false;
		const request = async () => {
			if (document.visibilityState !== "visible") return;
			try {
				sentinel = await navigator.wakeLock.request("screen");
				if (disposed) await sentinel.release();
			} catch {
				// Denied (battery saver, permissions policy): the screen settings take over.
			}
		};
		const handleVisibility = () => void request();

		void request();
		document.addEventListener("visibilitychange", handleVisibility);
		return () => {
			disposed = true;
			document.removeEventListener("visibilitychange", handleVisibility);
			void sentinel?.release().catch(() => undefined);
		};
	}, []);
}
