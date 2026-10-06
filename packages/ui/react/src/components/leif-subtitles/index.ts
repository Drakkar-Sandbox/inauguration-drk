import { LeifSubtitlesRoot } from "./leif-subtitles";

export const LeifSubtitles = Object.assign(LeifSubtitlesRoot, {});

export type {
	CharacterAlignment,
	LeifSubtitlesRootProps as LeifSubtitlesProps,
	LeifSubtitleWord,
} from "./leif-subtitles";
export { wordsFromCharacterAlignment } from "./leif-subtitles";
