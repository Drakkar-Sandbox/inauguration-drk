import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

import { useLeifState } from "#/features/inauguration/leif/hooks/use-leif-state";
import { useLeifVoice } from "#/features/inauguration/leif/hooks/use-leif-voice";
import { usePushToTalk } from "#/features/inauguration/leif/hooks/use-push-to-talk";
import type { KioskTurn } from "#/features/inauguration/leif/types";
import {
	errorStatus,
	synthesizeSpeech,
	transcribeSpeech,
} from "#/features/inauguration/leif/utils/api";
import { inauguration } from "#/libs/tuyau";

const INACTIVITY_MS = 90_000;
const INACTIVITY_WARNING_MS = 70_000;
const THANKS_MS = 8_000;
const RESTING_MS = 10_000;
/** Only show Leif thinking when the answer is slow, never for a quick reply. */
const THINKING_DELAY_MS = 1_500;

export type ChallengePhase = "idle" | "starting" | "session" | "thanks" | "resting";

type Session = Pick<
	KioskTurn,
	"sessionId" | "guest" | "offerHandoff" | "handoffRequested" | "referentFirstName"
>;

/**
 * "Défiez Leif" kiosk session: QR scan → conversation by push-to-talk → optional handoff to the
 * guest's referent → thanks. Ends after 90 s of inactivity. Any failure shows the resting screen
 * and the kiosk goes back to its attract loop on its own.
 */
export function useChallengeSession() {
	const [phase, setPhase] = useState<ChallengePhase>("idle");
	const [session, setSession] = useState<Session | null>(null);
	const [guestLine, setGuestLine] = useState<string | null>(null);
	const [inactive, setInactive] = useState(false);

	const sessionRef = useRef<Session | null>(null);
	sessionRef.current = session;
	const lastActivity = useRef(0);
	const phaseTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	const voice = useLeifVoice({ synthesize: (text) => synthesizeSpeech(text) });

	const { mutateAsync: startSession } = useMutation(
		inauguration.kiosk.leif.startSession.mutationOptions(),
	);
	const { mutateAsync: sendMessage, isPending: isSending } = useMutation(
		inauguration.kiosk.leif.message.mutationOptions(),
	);
	const { mutateAsync: requestHandoff, isPending: isHandingOff } = useMutation(
		inauguration.kiosk.leif.handoff.mutationOptions(),
	);
	const { mutateAsync: endSession } = useMutation(
		inauguration.kiosk.leif.endSession.mutationOptions(),
	);

	const touch = useCallback(() => {
		lastActivity.current = performance.now();
		setInactive(false);
	}, []);

	const backToIdleAfter = useCallback(
		(delayMs: number) => {
			clearTimeout(phaseTimer.current);
			phaseTimer.current = setTimeout(() => {
				voice.clear();
				setSession(null);
				setGuestLine(null);
				setPhase("idle");
			}, delayMs);
		},
		[voice.clear],
	);

	const closeSession = useCallback(async () => {
		const current = sessionRef.current;
		if (!current) return;
		try {
			await endSession({ params: { id: current.sessionId } });
		} catch {
			// The session expires on its own server-side.
		}
	}, [endSession]);

	const rest = useCallback(() => {
		voice.stop();
		setPhase("resting");
		void closeSession();
		backToIdleAfter(RESTING_MS);
	}, [backToIdleAfter, closeSession, voice.stop]);

	const finish = useCallback(async () => {
		if (!sessionRef.current) return;
		voice.stop();
		setPhase("thanks");
		await closeSession();
		backToIdleAfter(THANKS_MS);
	}, [backToIdleAfter, closeSession, voice.stop]);

	const applyTurn = useCallback(
		async (turn: KioskTurn) => {
			setSession({
				sessionId: turn.sessionId,
				guest: turn.guest,
				offerHandoff: turn.offerHandoff,
				handoffRequested: turn.handoffRequested,
				referentFirstName: turn.referentFirstName,
			});
			await voice.speak(turn.reply.text);
			touch();
		},
		[touch, voice.speak],
	);

	const start = useCallback(
		async (token: string) => {
			if (phase !== "idle") return;
			clearTimeout(phaseTimer.current);
			setPhase("starting");
			setGuestLine(null);
			touch();
			try {
				const turn = await startSession({ body: { token } });
				setPhase("session");
				await applyTurn(turn);
			} catch {
				rest();
			}
		},
		[applyTurn, phase, rest, startSession, touch],
	);

	const say = useCallback(
		async (text: string) => {
			const current = sessionRef.current;
			if (!current) return;
			voice.stop();
			setGuestLine(text);
			touch();
			try {
				await applyTurn(await sendMessage({ params: { id: current.sessionId }, body: { text } }));
			} catch (error) {
				// Turn limit reached: a graceful goodbye rather than an outage.
				if (errorStatus(error) === 429) void finish();
				else rest();
			}
		},
		[applyTurn, finish, rest, sendMessage, touch, voice.stop],
	);

	const handoff = useCallback(async () => {
		const current = sessionRef.current;
		if (!current) return;
		voice.stop();
		touch();
		try {
			await applyTurn(await requestHandoff({ params: { id: current.sessionId } }));
		} catch {
			rest();
		}
	}, [applyTurn, requestHandoff, rest, touch, voice.stop]);

	const ptt = usePushToTalk({
		transcribe: (audio) => transcribeSpeech(audio),
		onTranscript: (text) => void say(text),
		onNothingHeard: touch,
		keepStreamAlive: true,
	});

	// Inactivity: warn, then end the session on the guest's behalf.
	useEffect(() => {
		if (phase !== "session") return;
		const interval = setInterval(() => {
			if (voice.speaking || isSending || isHandingOff || ptt.state === "recording") {
				lastActivity.current = performance.now();
				return;
			}
			const idleFor = performance.now() - lastActivity.current;
			setInactive(idleFor > INACTIVITY_WARNING_MS);
			if (idleFor > INACTIVITY_MS) void finish();
		}, 1_000);
		return () => clearInterval(interval);
	}, [phase, finish, isSending, isHandingOff, ptt.state, voice.speaking]);

	useEffect(() => () => clearTimeout(phaseTimer.current), []);

	const state = useLeifState({
		speaking: voice.speaking,
		listening: ptt.state === "recording",
		waiting:
			phase === "starting" ||
			isSending ||
			isHandingOff ||
			voice.preparing ||
			ptt.state === "processing",
		thinkingDelayMs: THINKING_DELAY_MS,
	});

	return {
		phase,
		session,
		guestLine,
		inactive,
		busy: phase === "starting" || isSending || isHandingOff || ptt.state === "processing",
		state,
		voice,
		// Talking over Leif interrupts him, like in a real conversation.
		ptt: {
			...ptt,
			start: () => {
				voice.stop();
				return ptt.start();
			},
		},
		start,
		say,
		handoff,
		finish,
		touch,
	};
}
