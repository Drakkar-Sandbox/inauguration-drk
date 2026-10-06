import { useEffect } from "react";

/**
 * Guest-facing surfaces are always dark, whatever the staff theme preference. Theming the body
 * (instead of a wrapper only) keeps iOS overscroll, portals and the canvas background in ink.
 */
export function useDarkDocument() {
	useEffect(() => {
		const { body } = document;
		const previous = body.dataset.theme;
		body.dataset.theme = "dark";
		body.style.colorScheme = "dark";

		return () => {
			if (previous) body.dataset.theme = previous;
			else delete body.dataset.theme;
			body.style.colorScheme = "";
		};
	}, []);
}
