type AudioContextConstructor = typeof AudioContext;

let sharedContext: AudioContext | null = null;

/**
 * One AudioContext for the whole page (playback + microphone meter). Browsers cap the number
 * of contexts and iOS only unlocks a context from a user gesture, so it must be shared.
 */
export function getAudioContext() {
	if (typeof window === "undefined") return null;
	if (sharedContext) return sharedContext;

	const Context: AudioContextConstructor | undefined =
		window.AudioContext ??
		(window as unknown as { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext;
	if (!Context) return null;

	sharedContext = new Context();
	return sharedContext;
}

type AudioSessionType = "playback" | "play-and-record";

/**
 * iOS 17+ routes Web Audio through the ringer unless the page declares its audio session:
 * `playback` keeps Leif audible in silent mode, `play-and-record` while the microphone is open.
 */
export function setAudioSessionType(type: AudioSessionType) {
	const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
	if (!session) return;
	try {
		session.type = type;
	} catch {
		// Unsupported value on this platform.
	}
}

export function isAudioUnlocked() {
	return getAudioContext()?.state === "running";
}

/**
 * Must run inside a user gesture (click, key press): resumes the context and plays one silent
 * frame, which is what iOS Safari needs to allow later programmatic playback.
 */
export async function unlockAudio() {
	const context = getAudioContext();
	if (!context) return false;
	setAudioSessionType("playback");

	try {
		const silence = context.createBuffer(1, 1, 22_050);
		const source = context.createBufferSource();
		source.buffer = silence;
		source.connect(context.destination);
		source.start(0);
		if (context.state !== "running") await context.resume();
	} catch {
		return false;
	}

	return context.state === "running";
}

const decoded = new WeakMap<object, Promise<AudioBuffer>>();

/**
 * Decodes a synthesized line once; later plays (speech screen cues) start from memory.
 */
export function decodeSpeechAudio(context: AudioContext, speech: { audioBase64: string }) {
	let buffer = decoded.get(speech);
	if (!buffer) {
		buffer = context.decodeAudioData(decodeBase64(speech.audioBase64));
		buffer.catch(() => decoded.delete(speech));
		decoded.set(speech, buffer);
	}
	return buffer;
}

export function decodeBase64(base64: string) {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);

	return bytes.buffer;
}

/** Root mean square of the current analyser frame, in `[0, 1]`. */
export function analyserLevel(analyser: AnalyserNode, buffer: Float32Array<ArrayBuffer>) {
	analyser.getFloatTimeDomainData(buffer);
	let sum = 0;
	for (const sample of buffer) sum += sample * sample;

	return Math.sqrt(sum / buffer.length);
}

export function prefersReducedMotion() {
	return (
		typeof window !== "undefined" &&
		window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
	);
}
