import { useEffect, useState } from "react";

/** `true` once the pointer has not moved for `delayMs`: kiosks hide the cursor. */
export function useIdleCursor(delayMs = 3_000) {
	const [idle, setIdle] = useState(false);

	useEffect(() => {
		let timeout = setTimeout(() => setIdle(true), delayMs);
		const wake = () => {
			setIdle(false);
			clearTimeout(timeout);
			timeout = setTimeout(() => setIdle(true), delayMs);
		};

		window.addEventListener("pointermove", wake);
		window.addEventListener("pointerdown", wake);
		return () => {
			clearTimeout(timeout);
			window.removeEventListener("pointermove", wake);
			window.removeEventListener("pointerdown", wake);
		};
	}, [delayMs]);

	return idle;
}
