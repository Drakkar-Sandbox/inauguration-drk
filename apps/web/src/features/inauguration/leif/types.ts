import type { ResponseOf } from "@tuyau/core/types";

import type { routes } from "@workspace/api/registry";

type Routes = typeof routes;

export type Invitation = ResponseOf<Routes["inauguration.invitations.view"]>;
export type SignupTurn = ResponseOf<Routes["inauguration.invitations.leif.message"]>;
export type LeifSpeech = ResponseOf<Routes["inauguration.leif.tts"]>;
export type KioskGuest = ResponseOf<Routes["inauguration.kiosk.checkin"]>["guest"];
export type KioskGreeting = ResponseOf<Routes["inauguration.kiosk.leif.greeting"]>;
export type KioskTurn = ResponseOf<Routes["inauguration.kiosk.leif.message"]>;
export type SpeechCue = ResponseOf<Routes["inauguration.kiosk.speech.cues"]>[number];
export type SpeechCurrent = ResponseOf<Routes["inauguration.kiosk.speech.current"]>;

/** Synthesized line as returned by the API (character timings in seconds). */
export type SynthesizedSpeech = {
	audioBase64: string;
	alignment: { characters: string[]; startTimes: number[]; endTimes: number[] };
};
