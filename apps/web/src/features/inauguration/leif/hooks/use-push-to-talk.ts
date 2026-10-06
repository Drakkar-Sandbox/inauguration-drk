import { useCallback, useEffect, useRef, useState } from "react";

import type { PushToTalkState } from "@workspace/ui-react/components/push-to-talk-button";

import {
	analyserLevel,
	getAudioContext,
	setAudioSessionType,
} from "#/features/inauguration/leif/utils/audio";

const MIME_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
const MIN_RECORDING_MS = 400;
const TRANSIENT_RETRY_MS = 600;
/** After a non-permission microphone failure, the button comes back after this delay. */
const TRANSIENT_RECOVERY_MS = 8_000;

type UsePushToTalkParams = {
	/** Sends the recording to speech-to-text. Resolve `null` when no transcription is available. */
	transcribe: (audio: File) => Promise<string | null>;
	/** Called with the non-empty transcript. */
	onTranscript: (text: string) => void;
	/** Nothing intelligible was heard (silence, too short, empty transcript). */
	onNothingHeard?: () => void;
	/** @default 30_000 */
	maxDurationMs?: number;
	/** Keep the microphone open between turns (kiosk) instead of releasing it (phone). */
	keepStreamAlive?: boolean;
};

/**
 * Push-to-talk recording with a live level meter. The microphone is optional everywhere: when
 * it is unsupported, denied or when speech-to-text is unavailable, the hook settles on the
 * `disabled` state and surfaces fall back to buttons and text.
 */
export function usePushToTalk(params: UsePushToTalkParams) {
	const { maxDurationMs = 30_000, keepStreamAlive = false } = params;

	const [state, setState] = useState<PushToTalkState>(() =>
		isRecordingSupported() ? "idle" : "disabled",
	);
	const [level, setLevel] = useState(0);

	const paramsRef = useRef(params);
	paramsRef.current = params;
	const stream = useRef<MediaStream | null>(null);
	const recorder = useRef<MediaRecorder | null>(null);
	const meter = useRef<{ frame: number; source: MediaStreamAudioSourceNode } | null>(null);
	const maxTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const startedAt = useRef(0);
	const pressed = useRef(false);
	const discard = useRef(false);
	const acquiring = useRef(false);
	const disposed = useRef(false);
	const recoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	const releaseStream = useCallback(() => {
		for (const track of stream.current?.getTracks() ?? []) track.stop();
		stream.current = null;
	}, []);

	const stopMeter = useCallback(() => {
		if (!meter.current) return;
		cancelAnimationFrame(meter.current.frame);
		meter.current.source.disconnect();
		meter.current = null;
		setLevel(0);
	}, []);

	const startMeter = useCallback((mediaStream: MediaStream) => {
		const context = getAudioContext();
		if (!context) return;
		void context.resume().catch(() => undefined);

		const source = context.createMediaStreamSource(mediaStream);
		const analyser = context.createAnalyser();
		analyser.fftSize = 1024;
		source.connect(analyser);
		const samples = new Float32Array(analyser.fftSize);
		let smoothed = 0;
		const tick = () => {
			const value = Math.min(1, analyserLevel(analyser, samples) * 6);
			smoothed = smoothed * 0.7 + value * 0.3;
			setLevel(smoothed);
			if (meter.current) meter.current.frame = requestAnimationFrame(tick);
		};
		meter.current = { frame: requestAnimationFrame(tick), source };
	}, []);

	const finishRecording = useCallback(
		async (chunks: Blob[], mimeType: string) => {
			stopMeter();
			if (!keepStreamAlive) releaseStream();

			const durationMs = performance.now() - startedAt.current;
			if (discard.current || chunks.length === 0 || durationMs < MIN_RECORDING_MS) {
				setState("idle");
				if (!discard.current) paramsRef.current.onNothingHeard?.();
				return;
			}

			setState("processing");
			const type = mimeType.split(";")[0] || "audio/webm";
			const extension = type.includes("mp4") ? "m4a" : type.includes("ogg") ? "ogg" : "webm";
			const file = new File(chunks, `speech.${extension}`, { type });

			try {
				const text = (await paramsRef.current.transcribe(file))?.trim();
				if (text === undefined) {
					// No speech-to-text configured: the voice cannot work, switch to text and buttons.
					setState("disabled");
					return;
				}
				setState("idle");
				if (text) paramsRef.current.onTranscript(text);
				else paramsRef.current.onNothingHeard?.();
			} catch {
				setState("idle");
				paramsRef.current.onNothingHeard?.();
			}
		},
		[keepStreamAlive, releaseStream, stopMeter],
	);

	/** Live, usable stream: reused between turns on kiosks unless the device went away. */
	const liveStream = useCallback(() => {
		const current = stream.current;
		if (current?.active && current.getAudioTracks().every((track) => track.readyState === "live")) {
			return current;
		}
		releaseStream();
		return null;
	}, [releaseStream]);

	const acquireStream = useCallback(async () => {
		const existing = liveStream();
		if (existing) return existing;

		const request = () =>
			navigator.mediaDevices.getUserMedia({
				audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
			});
		let acquired: MediaStream;
		try {
			acquired = await request();
		} catch (error) {
			if (isPermissionError(error)) throw error;
			// Transient (device busy, unplugged, waking up): one more try before giving up.
			await new Promise((resolve) => setTimeout(resolve, TRANSIENT_RETRY_MS));
			acquired = await request();
		}

		if (disposed.current) {
			for (const track of acquired.getTracks()) track.stop();
			throw new Error("unmounted");
		}
		for (const track of acquired.getAudioTracks()) {
			track.addEventListener("ended", () => {
				if (stream.current === acquired) stream.current = null;
			});
		}
		stream.current = acquired;
		return acquired;
	}, [liveStream]);

	const start = useCallback(async () => {
		// A second press while the microphone is still opening is ignored.
		if (recorder.current || acquiring.current || state === "disabled" || state === "processing") {
			return;
		}
		pressed.current = true;
		discard.current = false;
		setAudioSessionType("play-and-record");

		let mediaStream: MediaStream;
		acquiring.current = true;
		try {
			mediaStream = await acquireStream();
		} catch (error) {
			pressed.current = false;
			setAudioSessionType("playback");
			if (disposed.current) return;
			if (isPermissionError(error)) {
				setState("disabled");
				return;
			}
			// Not a refusal: offer the microphone again a little later.
			setState("disabled");
			clearTimeout(recoverTimer.current);
			recoverTimer.current = setTimeout(() => setState("idle"), TRANSIENT_RECOVERY_MS);
			return;
		} finally {
			acquiring.current = false;
		}
		// Released before the microphone was ready: nothing to record.
		if (!pressed.current || disposed.current) {
			if (!keepStreamAlive) releaseStream();
			setAudioSessionType("playback");
			return;
		}

		const mimeType = MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
		const chunks: Blob[] = [];
		let mediaRecorder: MediaRecorder;
		try {
			mediaRecorder = new MediaRecorder(mediaStream, mimeType ? { mimeType } : undefined);
			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) chunks.push(event.data);
			};
			mediaRecorder.onstop = () => {
				recorder.current = null;
				clearTimeout(maxTimer.current);
				setAudioSessionType("playback");
				void finishRecording(chunks, mediaRecorder.mimeType || mimeType);
			};
			recorder.current = mediaRecorder;
			startedAt.current = performance.now();
			mediaRecorder.start();
		} catch {
			// Stale stream or recorder refusal: reset so the next press starts clean.
			recorder.current = null;
			pressed.current = false;
			releaseStream();
			stopMeter();
			setAudioSessionType("playback");
			setState("idle");
			return;
		}

		startMeter(mediaStream);
		setState("recording");
		maxTimer.current = setTimeout(() => recorder.current?.stop(), maxDurationMs);
	}, [
		state,
		keepStreamAlive,
		maxDurationMs,
		acquireStream,
		finishRecording,
		releaseStream,
		startMeter,
		stopMeter,
	]);

	/** Stops and sends the recording. */
	const stop = useCallback(() => {
		pressed.current = false;
		if (recorder.current?.state === "recording") recorder.current.stop();
	}, []);

	/** Stops and drops the recording. */
	const cancel = useCallback(() => {
		pressed.current = false;
		discard.current = true;
		if (recorder.current?.state === "recording") recorder.current.stop();
	}, []);

	useEffect(() => {
		disposed.current = false;
		return () => {
			disposed.current = true;
			discard.current = true;
			clearTimeout(maxTimer.current);
			clearTimeout(recoverTimer.current);
			if (recorder.current?.state === "recording") recorder.current.stop();
			stopMeter();
			releaseStream();
		};
	}, [releaseStream, stopMeter]);

	return { state, level, start, stop, cancel, available: state !== "disabled" };
}

function isRecordingSupported() {
	return (
		typeof window !== "undefined" &&
		typeof MediaRecorder !== "undefined" &&
		Boolean(navigator.mediaDevices?.getUserMedia)
	);
}

/** Only an explicit refusal is permanent; anything else may work on the next press. */
function isPermissionError(error: unknown) {
	return (
		error instanceof DOMException &&
		(error.name === "NotAllowedError" || error.name === "SecurityError")
	);
}
