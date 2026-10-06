import { DrakkarLogo } from "@workspace/ui-react/components/drakkar-logo";

import { AudioUnlockGate } from "#/features/inauguration/kiosk/components/audio-unlock-gate";
import { useSpeechCue } from "#/features/inauguration/kiosk/speech/hooks/use-speech-cue";
import {
	LiveLeifAvatar,
	LiveLeifSubtitles,
} from "#/features/inauguration/leif/components/live-leif";
import { StageBackdrop } from "#/features/inauguration/leif/components/stage-backdrop";
import { KIOSK_AVATAR_NAME, LEIF_FULLBODY_SRC } from "#/features/inauguration/leif/constants";

/**
 * Speech screen (landscape, projected): Leif on stage, cues triggered by the operator console.
 * No interface at all — only presence and subtitles.
 */
export function SpeechScreen() {
	const { voice, state } = useSpeechCue();

	return (
		<div className="relative size-full overflow-hidden">
			<StageBackdrop spotlight="center" frame={voice.frame} />
			<AudioUnlockGate />

			<div className="absolute inset-x-0 top-[4vh] bottom-0 flex justify-center">
				<div className="aspect-9/16 h-full max-w-full">
					<LiveLeifAvatar
						name={KIOSK_AVATAR_NAME}
						state={state}
						frame={voice.frame}
						framing="fullbody"
						size="fill"
						imageSrc={LEIF_FULLBODY_SRC}
					/>
				</div>
			</div>

			<div className="absolute inset-x-0 bottom-0 flex min-h-[34vh] items-end justify-center bg-linear-to-t from-neutral-1 via-neutral-1/85 to-transparent px-[8vw] pb-[7vh]">
				{voice.line && (
					<LiveLeifSubtitles
						key={voice.line.id}
						text={voice.line.text}
						alignment={voice.line.words}
						frame={voice.frame}
						size="xl"
						className="max-w-[80vw] animate-rise motion-reduce:animate-none [&>p]:text-[4.6vmin] [&>p]:leading-[1.15]"
					/>
				)}
			</div>

			<DrakkarLogo
				tone="paper"
				accent
				className="absolute bottom-[3vh] left-[3vw] text-[1.8vmin] opacity-40"
			/>
		</div>
	);
}
