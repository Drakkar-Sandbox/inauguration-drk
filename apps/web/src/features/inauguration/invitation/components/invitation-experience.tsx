import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Dialog } from "@workspace/ui-react/components/dialog";
import { DrakkarLogo } from "@workspace/ui-react/components/drakkar-logo";
import { TicketIcon, XIcon } from "@workspace/ui-react/icons";

import { InvitationCard } from "#/features/inauguration/invitation/components/invitation-card";
import { InvitationForm } from "#/features/inauguration/invitation/components/invitation-form";
import {
	InvitationFarewell,
	InvitationIntro,
	InvitationLoading,
	InvitationNotFound,
	InvitationUnavailable,
} from "#/features/inauguration/invitation/components/invitation-screens";
import { LeifConversation } from "#/features/inauguration/invitation/components/leif-conversation";
import { useInvitationQuery } from "#/features/inauguration/invitation/hooks/use-invitation-query";
import { useSignupConversation } from "#/features/inauguration/invitation/hooks/use-signup-conversation";
import { StageBackdrop } from "#/features/inauguration/leif/components/stage-backdrop";
import { useDarkDocument } from "#/features/inauguration/leif/hooks/use-dark-document";
import type { Invitation } from "#/features/inauguration/leif/types";
import { errorStatus } from "#/features/inauguration/leif/utils/api";
import { unlockAudio } from "#/features/inauguration/leif/utils/audio";

type Phase = "intro" | "conversation" | "farewell" | "form";

/**
 * Public invitation page (`/i/:token`): intro + sound gate, conversation with Leif, farewell,
 * and the form-based fallback. The invitation card stays one tap away on every phase.
 */
export function InvitationExperience(props: { token: string }) {
	const { token } = props;

	useDarkDocument();
	const { data: invitation, error, refetch, isPending } = useInvitationQuery(token);

	let content: React.ReactNode;
	if (isPending) content = <InvitationLoading />;
	else if (error && errorStatus(error) === 404) content = <InvitationNotFound />;
	else if (error || !invitation) content = <InvitationUnavailable onRetry={() => refetch()} />;
	else return <InvitationJourney token={token} invitation={invitation} />;

	return (
		<Stage>
			<header className="relative z-10 flex items-center px-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-10">
				<DrakkarLogo size="sm" tone="paper" />
			</header>
			<main className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-5 sm:px-10">
				{content}
			</main>
		</Stage>
	);
}

function InvitationJourney(props: { token: string; invitation: Invitation }) {
	const { token, invitation } = props;

	const { t } = useTranslation("features.inauguration.invitation.components.invitation-experience");

	const [phase, setPhase] = useState<Phase>("intro");
	const [muted, setMuted] = useState(false);
	const [cardOpen, setCardOpen] = useState(false);

	const conversation = useSignupConversation({ token, muted });
	const { turn, voice } = conversation;

	// Once Leif has said goodbye, the farewell screen takes over.
	useEffect(() => {
		if (phase === "conversation" && turn?.done && !voice.speaking && !voice.preparing) {
			const timeout = setTimeout(() => setPhase("farewell"), 900);
			return () => clearTimeout(timeout);
		}
	}, [phase, turn, voice.speaking, voice.preparing]);

	const enter = (withSound: boolean) => {
		setMuted(!withSound);
		if (withSound) void unlockAudio();
		setPhase("conversation");
		void conversation.start();
	};

	const openForm = () => {
		voice.stop();
		setCardOpen(false);
		setPhase("form");
	};

	const card = (
		<InvitationCard token={token} invitation={invitation} onAnswerWithoutLeif={openForm} />
	);
	const showCardPanel = phase === "conversation";

	return (
		<Stage intensity={phase === "conversation" ? voice.mouthOpenness : 0}>
			<header className="relative z-10 flex items-center justify-between gap-4 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-10">
				<DrakkarLogo size="sm" tone="paper" />
				{phase !== "intro" && (
					<Dialog open={cardOpen} onOpenChange={setCardOpen}>
						<Dialog.Trigger className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-6 bg-neutral-2/70 px-4 font-semibold text-neutral-12 text-xs outline-none backdrop-blur-md transition hover:border-primary-9 focus-visible:ring-3 focus-visible:ring-primary-7 lg:hidden [&_svg]:size-4">
							<TicketIcon aria-hidden="true" className="text-primary-9" />
							{t("my-invitation")}
						</Dialog.Trigger>
						<Dialog.Content className="max-h-[88svh] overflow-y-auto rounded-3xl border-neutral-6 bg-neutral-2 p-6 sm:max-w-md">
							<Dialog.Title className="sr-only">{t("my-invitation")}</Dialog.Title>
							<Dialog.Close
								aria-label={t("close")}
								className="absolute top-4 right-4 grid size-9 place-items-center rounded-full text-neutral-11 outline-none hover:bg-neutral-4 focus-visible:ring-3 focus-visible:ring-primary-7 [&_svg]:size-4"
							>
								<XIcon aria-hidden="true" />
							</Dialog.Close>
							{card}
						</Dialog.Content>
					</Dialog>
				)}
			</header>

			<div className="relative z-10 flex min-h-0 flex-1">
				<main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 sm:px-10">
					{phase === "intro" && (
						<InvitationIntro
							invitation={invitation}
							onEnter={enter}
							onAnswerWithoutLeif={openForm}
						/>
					)}
					{phase === "conversation" && (
						<LeifConversation
							avatarName={invitation.event.avatarName}
							conversation={conversation}
						/>
					)}
					{phase === "farewell" && (
						<InvitationFarewell
							token={token}
							invitation={invitation}
							onContinue={() => setPhase("conversation")}
							onAnswerWithoutLeif={openForm}
						/>
					)}
					{phase === "form" && (
						<InvitationForm
							token={token}
							invitation={invitation}
							onBack={() => {
								setPhase("conversation");
								if (!turn) void conversation.start();
							}}
						/>
					)}
				</main>

				{showCardPanel && (
					<aside className="hidden w-96 shrink-0 overflow-y-auto border-neutral-5/70 border-l bg-neutral-2/40 px-8 py-10 backdrop-blur-sm lg:block">
						{card}
					</aside>
				)}
			</div>
		</Stage>
	);
}

function Stage(props: { children: React.ReactNode; intensity?: number }) {
	return (
		<div className="relative flex h-dvh flex-col overflow-hidden bg-neutral-1 text-neutral-12">
			<StageBackdrop spotlight="top" intensity={props.intensity} />
			{props.children}
		</div>
	);
}
