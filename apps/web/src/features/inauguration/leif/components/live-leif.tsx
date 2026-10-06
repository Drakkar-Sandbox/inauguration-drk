import { LeifAvatar, type LeifAvatarProps } from "@workspace/ui-react/components/leif-avatar";
import {
	LeifSubtitles,
	type LeifSubtitlesProps,
} from "@workspace/ui-react/components/leif-subtitles";

import {
	useVoiceFrame,
	type VoiceFrameStore,
} from "#/features/inauguration/leif/utils/frame-store";

/** `LeifAvatar` fed by the voice frame store: the only part re-rendered at audio frame rate. */
export function LiveLeifAvatar(
	props: Omit<LeifAvatarProps, "mouthOpenness"> & { frame: VoiceFrameStore },
) {
	const { frame, ...rest } = props;
	const { mouthOpenness } = useVoiceFrame(frame);

	return <LeifAvatar {...rest} mouthOpenness={mouthOpenness} />;
}

/** `LeifSubtitles` following the voice playback position. */
export function LiveLeifSubtitles(
	props: Omit<LeifSubtitlesProps, "currentTimeMs"> & { frame: VoiceFrameStore },
) {
	const { frame, ...rest } = props;
	const { currentTimeMs } = useVoiceFrame(frame);

	return <LeifSubtitles {...rest} currentTimeMs={currentTimeMs} />;
}
