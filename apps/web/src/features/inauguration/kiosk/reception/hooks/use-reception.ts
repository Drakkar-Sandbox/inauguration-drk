import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useLeifState } from "#/features/inauguration/leif/hooks/use-leif-state";
import { useLeifVoice } from "#/features/inauguration/leif/hooks/use-leif-voice";
import type { KioskGuest } from "#/features/inauguration/leif/types";
import { synthesizeSpeech } from "#/features/inauguration/leif/utils/api";
import { inauguration } from "#/libs/tuyau";

/** A welcome stays on screen at least this long, and a little after Leif's last word. */
const MIN_WELCOME_MS = 15_000;
const AFTER_SPEECH_MS = 3_500;
/** A new scan can interrupt a welcome only after this delay (double scans, shaky hands). */
const SCAN_LOCK_MS = 2_500;

export type ReceptionVisit = {
	id: number;
	guest: KioskGuest | null;
	returning: boolean;
	/** The check-in answered (guest found or not). */
	settled: boolean;
};

/**
 * Reception flow: check-in, personalised welcome spoken by Leif, then back to the attract loop.
 * Any failure ends in a warm generic welcome, never in an error.
 */
export function useReception() {
	const { t } = useTranslation("features.inauguration.kiosk.reception.hooks.reception");

	const [visit, setVisit] = useState<ReceptionVisit | null>(null);
	const [waiting, setWaiting] = useState(false);
	const startedAt = useRef(0);
	const backToIdle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const visitId = useRef(0);

	const voice = useLeifVoice({ synthesize: (text) => synthesizeSpeech(text) });
	const { mutateAsync: checkin } = useMutation(inauguration.kiosk.checkin.mutationOptions());
	const { mutateAsync: greet } = useMutation(inauguration.kiosk.leif.greeting.mutationOptions());

	const reset = useCallback(() => {
		clearTimeout(backToIdle.current);
		voice.clear();
		setVisit(null);
		setWaiting(false);
	}, [voice.clear]);

	/** Welcomes a guest from a scanned code (token or invitation URL) or a manual pick (id). */
	const welcome = useCallback(
		async (ref: { token: string } | { guestId: number }) => {
			const now = performance.now();
			if (visitId.current > 0 && visit && now - startedAt.current < SCAN_LOCK_MS) return;

			clearTimeout(backToIdle.current);
			voice.clear();
			const id = ++visitId.current;
			const isCurrent = () => visitId.current === id;
			startedAt.current = now;
			setVisit({ id, guest: null, returning: false, settled: false });
			setWaiting(true);

			let line: { text: string; speech?: Awaited<ReturnType<typeof greet>>["audio"] } = {
				text: t("generic"),
			};
			try {
				const { guest, alreadyCheckedIn } = await checkin({ body: ref });
				if (!isCurrent()) return;
				setVisit({ id, guest, returning: alreadyCheckedIn, settled: true });

				if (alreadyCheckedIn) {
					line = { text: t("returning", { name: guest.firstName }) };
				} else {
					try {
						const greeting = await greet({ body: { guestId: guest.id } });
						line = { text: greeting.reply.text, speech: greeting.audio };
					} catch {
						line = { text: t("fallback", { name: guest.firstName }) };
					}
				}
			} catch {
				// Unknown code or API down: the guest is still welcomed; hosts take it from there.
			}
			if (!isCurrent()) return;

			setVisit((current) => current && { ...current, settled: true });
			setWaiting(false);
			await voice.speak(line.text, line.speech === undefined ? {} : { speech: line.speech });
			if (!isCurrent()) return;

			const remaining = Math.max(
				AFTER_SPEECH_MS,
				MIN_WELCOME_MS - (performance.now() - startedAt.current),
			);
			backToIdle.current = setTimeout(() => {
				if (isCurrent()) reset();
			}, remaining);
		},
		[checkin, greet, reset, t, visit, voice.clear, voice.speak],
	);

	useEffect(() => () => clearTimeout(backToIdle.current), []);

	const state = useLeifState({
		speaking: voice.speaking,
		listening: false,
		waiting: waiting || voice.preparing,
		thinkingDelayMs: 300,
	});

	return { visit, welcome, reset, state, voice };
}
