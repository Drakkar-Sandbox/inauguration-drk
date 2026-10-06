import { useEffect } from "react";

/**
 * Keeps kiosk screens awake. The browser releases the lock whenever the tab is hidden (and
 * sometimes on its own, e.g. power-saving): it is requested again on every release while the
 * page is visible, and on every return to visibility.
 */
export function useWakeLock() {
	useEffect(() => {
		if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;

		let sentinel: WakeLockSentinel | null = null;
		let disposed = false;
		let requesting = false;

		const request = async () => {
			if (disposed || requesting || document.visibilityState !== "visible") return;
			if (sentinel && !sentinel.released) return;
			requesting = true;
			try {
				const previous = sentinel;
				sentinel = await navigator.wakeLock.request("screen");
				void previous?.release().catch(() => undefined);
				if (disposed) {
					await sentinel.release();
					return;
				}
				sentinel.addEventListener("release", () => void request());
			} catch {
				// Denied (battery saver, permissions policy): the screen settings take over.
			} finally {
				requesting = false;
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
