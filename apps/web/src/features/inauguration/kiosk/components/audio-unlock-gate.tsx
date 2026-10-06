import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Volume2Icon } from "@workspace/ui-react/icons";

import {
	getAudioContext,
	isAudioUnlocked,
	unlockAudio,
} from "#/features/inauguration/leif/utils/audio";

/**
 * Browsers only allow sound after a user gesture. Kiosk screens show this veil once at start-up
 * (unless the browser runs with an autoplay policy that already allows it).
 */
export function AudioUnlockGate() {
	const { t } = useTranslation("features.inauguration.kiosk.components.audio-unlock-gate");

	const [unlocked, setUnlocked] = useState(true);

	useEffect(() => {
		const context = getAudioContext();
		if (!context) return;
		void context.resume().catch(() => undefined);
		const timeout = setTimeout(() => setUnlocked(isAudioUnlocked()), 300);
		return () => clearTimeout(timeout);
	}, []);

	useEffect(() => {
		if (unlocked) return;
		const unlock = () => void unlockAudio().then(setUnlocked);
		window.addEventListener("pointerdown", unlock);
		window.addEventListener("keydown", unlock);
		return () => {
			window.removeEventListener("pointerdown", unlock);
			window.removeEventListener("keydown", unlock);
		};
	}, [unlocked]);

	if (unlocked) return null;

	return (
		<div className="absolute inset-x-0 bottom-8 z-50 flex justify-center">
			<p className="inline-flex animate-rise items-center gap-3 rounded-full border border-neutral-6 bg-neutral-2/90 px-5 py-3 font-semibold text-neutral-11 text-sm backdrop-blur-md motion-reduce:animate-none [&_svg]:size-4">
				<Volume2Icon aria-hidden="true" className="text-primary-9" />
				{t("hint")}
			</p>
		</div>
	);
}
