import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { useSetInvitation } from "#/features/inauguration/invitation/hooks/use-invitation-query";
import { useLeifState } from "#/features/inauguration/leif/hooks/use-leif-state";
import { useLeifVoice } from "#/features/inauguration/leif/hooks/use-leif-voice";
import { usePushToTalk } from "#/features/inauguration/leif/hooks/use-push-to-talk";
import type { SignupTurn } from "#/features/inauguration/leif/types";
import {
	errorCode,
	errorStatus,
	synthesizeSpeech,
	transcribeSpeech,
} from "#/features/inauguration/leif/utils/api";
import { inauguration } from "#/libs/tuyau";

export type SignupInput = {
	text?: string;
	choice?: string;
	plusOne?: { firstName: string; lastName: string; email: string };
};

type UseSignupConversationParams = {
	token: string;
	/** Guest entered without sound: subtitles only. */
	muted: boolean;
};

/**
 * The guided signup dialogue: sends the guest's turn (button, text, voice or plus-one form),
 * keeps the invitation cache in sync and has Leif say the reply. Failures never surface as
 * errors: Leif apologises in his own words and the guest can try again.
 */
export function useSignupConversation(params: UseSignupConversationParams) {
	const { token, muted } = params;

	const { t } = useTranslation("features.inauguration.invitation.hooks.conversation");

	const setInvitation = useSetInvitation(token);
	const [turn, setTurn] = useState<SignupTurn | null>(null);
	const [guestLine, setGuestLine] = useState<string | null>(null);

	const voice = useLeifVoice({
		synthesize: (text) => synthesizeSpeech(text, token),
		muted,
	});

	const { mutateAsync: sendMessage, isPending } = useMutation(
		inauguration.invitations.leif.message.mutationOptions(),
	);

	const send = useCallback(
		async (input: SignupInput, said?: string) => {
			voice.stop();
			setGuestLine(said ?? null);

			try {
				const next = await sendMessage({ params: { token }, body: input });
				setTurn(next);
				setInvitation(next.invitation);
				// Only `spoken` may be voiced for guests; `text` (shown) can echo what they typed.
				await voice.speak(next.reply.text, { voicedText: next.reply.spoken });
			} catch (error) {
				const status = errorStatus(error);
				const apology =
					errorCode(error) === "E_LEIF_TURN_LIMIT"
						? t("apology.turn-limit")
						: status === 429
							? t("apology.busy")
							: status === 422
								? t("apology.invalid")
								: t("apology.generic");
				await voice.speak(apology, { speech: null });
			}
		},
		[sendMessage, setInvitation, t, token, voice.speak, voice.stop],
	);

	const ptt = usePushToTalk({
		transcribe: (audio) => transcribeSpeech(audio, token),
		onTranscript: (text) => void send({ text }, text),
		onNothingHeard: () => void voice.speak(t("apology.not-heard"), { speech: null }),
	});

	const state = useLeifState({
		speaking: voice.speaking,
		listening: ptt.state === "recording",
		waiting: isPending || voice.preparing || ptt.state === "processing",
	});

	return {
		turn,
		guestLine,
		send,
		start: () => send({}),
		pending: isPending || ptt.state === "processing",
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
	};
}
