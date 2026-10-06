import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "tailwind-variants";

import { DrakkarLogo } from "@workspace/ui-react/components/drakkar-logo";
import { PushToTalkButton } from "@workspace/ui-react/components/push-to-talk-button";
import {
	BellRingIcon,
	CameraIcon,
	CameraOffIcon,
	CheckIcon,
	ShieldCheckIcon,
} from "@workspace/ui-react/icons";

import {
	type ChallengePhase,
	useChallengeSession,
} from "#/features/inauguration/kiosk/challenge/hooks/use-challenge-session";
import { AudioUnlockGate } from "#/features/inauguration/kiosk/components/audio-unlock-gate";
import { CameraScanner } from "#/features/inauguration/kiosk/components/camera-scanner";
import { ScanFrame } from "#/features/inauguration/kiosk/components/scan-frame";
import { useCameraPreference } from "#/features/inauguration/kiosk/hooks/use-camera-preference";
import { useScannerInput } from "#/features/inauguration/kiosk/hooks/use-scanner-input";
import {
	LiveLeifAvatar,
	LiveLeifSubtitles,
} from "#/features/inauguration/leif/components/live-leif";
import { StageBackdrop } from "#/features/inauguration/leif/components/stage-backdrop";
import { KIOSK_AVATAR_NAME, LEIF_FULLBODY_SRC } from "#/features/inauguration/leif/constants";

/**
 * « Défiez Leif » kiosk: attract loop, QR identification, push-to-talk conversation, handoff to
 * the guest's referent, thanks, and a calm resting screen if anything fails.
 */
export function ChallengeScreen() {
	const { t } = useTranslation("features.inauguration.kiosk.challenge.components.challenge-screen");

	const challenge = useChallengeSession();
	const { phase, session, state, voice } = challenge;
	const [camera, setCamera] = useCameraPreference("challenge");
	const [cameraFailed, setCameraFailed] = useState(false);

	useScannerInput({ onScan: (code) => void challenge.start(code), enabled: phase === "idle" });

	const name = KIOSK_AVATAR_NAME;
	const dimmed = phase === "resting";

	return (
		<div className="relative grid size-full grid-rows-[auto_1fr_auto] overflow-hidden">
			<StageBackdrop spotlight="left" frame={voice.frame} muted={dimmed} />
			<AudioUnlockGate />

			<header className="relative z-10 flex items-center justify-between gap-6 px-[5vmin] pt-[4.5vmin]">
				<DrakkarLogo tone="paper" className="text-[3vmin]" />
				{phase === "session" && session ? (
					<div className="flex items-center gap-4">
						<p className="rounded-full border border-neutral-6 bg-neutral-2/70 px-5 py-2.5 font-semibold text-[1.8vmin] text-neutral-11 backdrop-blur-md">
							<span className="text-neutral-12">
								{session.guest.firstName} {session.guest.lastName}
							</span>
							{session.guest.company && <span> · {session.guest.company}</span>}
						</p>
						<button
							type="button"
							onClick={() => void challenge.finish()}
							className="rounded-full border border-neutral-6 px-5 py-2.5 font-semibold text-[1.8vmin] text-neutral-12 outline-none transition hover:border-primary-9 focus-visible:ring-3 focus-visible:ring-primary-7"
						>
							{t("session.end")}
						</button>
					</div>
				) : (
					<p className="font-bold text-[1.5vmin] text-neutral-10 uppercase tracking-[0.3em]">
						{t("kicker")}
					</p>
				)}
			</header>

			<main className="relative z-10 grid min-h-0 portrait:grid-rows-[minmax(0,5fr)_minmax(0,6fr)] landscape:grid-cols-[minmax(0,4fr)_minmax(0,6fr)]">
				<div className="flex min-h-0 items-end justify-center landscape:pb-[2vmin]">
					<div
						className={cn(
							"aspect-9/16 h-full max-w-full transition-opacity duration-1000",
							dimmed && "opacity-40",
						)}
					>
						<LiveLeifAvatar
							name={name}
							state={dimmed ? "idle" : state}
							frame={voice.frame}
							framing="fullbody"
							size="fill"
							imageSrc={LEIF_FULLBODY_SRC}
						/>
					</div>
				</div>

				<section
					aria-live="polite"
					className="justify-center-safe flex min-h-0 flex-col gap-[3.5vmin] overflow-y-auto px-[6vmin] py-[2vmin] [scrollbar-width:none] portrait:items-center portrait:text-center landscape:pr-[8vmin]"
				>
					<PhaseContent
						phase={phase}
						challenge={challenge}
						camera={camera && !cameraFailed}
						onCameraUnavailable={() => setCameraFailed(true)}
					/>
				</section>
			</main>

			<footer className="relative z-10 flex items-center justify-between gap-6 px-[5vmin] pb-[4vmin]">
				<button
					type="button"
					onClick={() => {
						setCameraFailed(false);
						setCamera(!camera);
					}}
					aria-label={camera ? t("camera.off") : t("camera.on")}
					className={cn(
						"grid size-12 place-items-center rounded-full border border-neutral-5 text-neutral-9 opacity-60 outline-none transition hover:text-neutral-12 hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-3 focus-visible:ring-primary-7 [&_svg]:size-5",
						phase !== "idle" && "invisible",
					)}
				>
					{camera ? <CameraIcon aria-hidden="true" /> : <CameraOffIcon aria-hidden="true" />}
				</button>
				<p className="flex max-w-[90vmin] items-center gap-3 text-pretty text-[1.6vmin] text-neutral-9 [&_svg]:size-[2vmin] [&_svg]:shrink-0">
					<ShieldCheckIcon aria-hidden="true" />
					{t("consent")}
				</p>
				<span className="size-12" />
			</footer>
		</div>
	);
}

type PhaseContentProps = {
	phase: ChallengePhase;
	challenge: ReturnType<typeof useChallengeSession>;
	camera: boolean;
	onCameraUnavailable: () => void;
};

function PhaseContent(props: PhaseContentProps) {
	const { phase, challenge, camera, onCameraUnavailable } = props;
	const { session, guestLine, inactive, busy, voice, ptt } = challenge;

	const { t } = useTranslation("features.inauguration.kiosk.challenge.components.challenge-screen");
	const name = KIOSK_AVATAR_NAME;

	if (phase === "idle" || phase === "starting") {
		return (
			<div key="idle" className="grid gap-[4vmin] portrait:justify-items-center">
				<div className="grid gap-[2.5vmin]">
					<p className="animate-rise font-bold text-[2.2vmin] text-primary-9 uppercase tracking-[0.32em] motion-reduce:animate-none">
						{t("attract.kicker", { name })}
					</p>
					<h1 className="animate-rise text-balance font-extrabold text-[min(10vmin,8.5rem)] text-neutral-12 leading-[0.88] tracking-[-0.05em] [animation-delay:100ms] motion-reduce:animate-none">
						{t("attract.title")}
						<span className="text-primary-9">.</span>
					</h1>
					<p className="animate-rise text-balance font-semibold text-[4vmin] text-neutral-10 leading-tight tracking-tight [animation-delay:200ms] motion-reduce:animate-none">
						{t("attract.promise", { name })}
					</p>
				</div>
				<div className="flex animate-rise items-center gap-[3.5vmin] [animation-delay:320ms] motion-reduce:animate-none portrait:flex-col">
					<ScanFrame className="w-[18vmin] shrink-0">
						{camera && phase === "idle" && (
							<CameraScanner
								onScan={(code) => void challenge.start(code)}
								onUnavailable={onCameraUnavailable}
							/>
						)}
					</ScanFrame>
					<p className="max-w-[48vmin] text-pretty text-[2.6vmin] text-neutral-11 leading-snug">
						{phase === "starting" ? t("attract.starting", { name }) : t("attract.scan")}
					</p>
				</div>
			</div>
		);
	}

	if (phase === "thanks") {
		return (
			<div key="thanks" className="grid gap-[3vmin]">
				<p className="animate-rise font-bold text-[2.2vmin] text-primary-9 uppercase tracking-[0.32em] motion-reduce:animate-none">
					{t("thanks.kicker")}
				</p>
				<h1 className="animate-rise font-extrabold text-[min(14vmin,11rem)] text-neutral-12 leading-[0.86] tracking-[-0.055em] [animation-delay:100ms] motion-reduce:animate-none">
					{t("thanks.title", { name: session?.guest.firstName ?? "" })}
					<span className="text-primary-9">.</span>
				</h1>
				<p className="animate-rise text-balance font-semibold text-[3.4vmin] text-neutral-11 tracking-tight [animation-delay:200ms] motion-reduce:animate-none">
					{session?.handoffRequested
						? t("thanks.handoff", { name: session.referentFirstName ?? t("thanks.someone") })
						: t("thanks.description")}
				</p>
			</div>
		);
	}

	if (phase === "resting") {
		return (
			<div key="resting" className="grid gap-[3vmin]">
				<p className="animate-rise font-bold text-[2.2vmin] text-neutral-10 uppercase tracking-[0.32em] motion-reduce:animate-none">
					{t("resting.kicker")}
				</p>
				<h1 className="animate-rise text-balance font-extrabold text-[min(9vmin,7.5rem)] text-neutral-12 leading-[0.9] tracking-[-0.05em] [animation-delay:100ms] motion-reduce:animate-none">
					{t("resting.title", { name })}
				</h1>
				<p className="animate-rise text-balance font-semibold text-[3.4vmin] text-neutral-11 tracking-tight [animation-delay:200ms] motion-reduce:animate-none">
					{t("resting.description")}
				</p>
			</div>
		);
	}

	const offerHandoff = session?.offerHandoff && !session.handoffRequested;
	const referent = session?.referentFirstName ?? null;

	return (
		<div key="session" className="grid w-full gap-[4vmin] portrait:justify-items-center">
			<div className="grid min-h-[30vmin] content-end gap-[2.5vmin]">
				{guestLine && (
					<p
						key={guestLine}
						className="line-clamp-2 max-w-[80vmin] animate-rise text-[2.4vmin] text-neutral-9 italic motion-reduce:animate-none"
					>
						<span className="mr-3 font-bold text-[1.6vmin] text-neutral-10 uppercase not-italic tracking-[0.24em]">
							{t("session.you")}
						</span>
						« {guestLine} »
					</p>
				)}
				{voice.line && (
					<LiveLeifSubtitles
						key={voice.line.id}
						text={voice.line.text}
						alignment={voice.line.words}
						frame={voice.frame}
						speaker={name}
						align="start"
						className={cn(
							"max-w-none animate-rise motion-reduce:animate-none portrait:items-center portrait:text-center [&>p]:leading-snug [&>span]:text-[1.6vmin]",
							kioskLineSize(voice.line.text),
						)}
					/>
				)}
			</div>

			<div className="flex flex-wrap items-center gap-[4vmin] portrait:justify-center">
				{ptt.available ? (
					<PushToTalkButton
						size="xl"
						globalHotkey
						state={busy && ptt.state === "idle" ? "processing" : ptt.state}
						level={ptt.level}
						labels={{ idle: t("session.ptt"), recording: t("session.listening") }}
						onPressStart={ptt.start}
						onPressEnd={ptt.stop}
						onPressCancel={ptt.cancel}
					/>
				) : (
					<KioskComposer
						disabled={busy}
						placeholder={t("session.type", { name })}
						onSubmit={(text) => void challenge.say(text)}
					/>
				)}

				{offerHandoff && (
					<button
						type="button"
						disabled={busy}
						onClick={() => void challenge.handoff()}
						className="inline-flex h-[9vmin] animate-rise items-center gap-[2vmin] rounded-full bg-primary-9 px-[5vmin] font-bold text-[2.8vmin] text-white shadow-[0_0_60px_-10px] shadow-primary-9/70 outline-none transition hover:bg-primary-10 focus-visible:ring-4 focus-visible:ring-primary-7 disabled:opacity-60 motion-reduce:animate-none [&_svg]:size-[3vmin]"
					>
						<BellRingIcon aria-hidden="true" />
						{referent ? t("session.handoff", { name: referent }) : t("session.handoff-team")}
					</button>
				)}
				{session?.handoffRequested && (
					<p className="inline-flex items-center gap-[1.5vmin] rounded-full border border-primary-7 px-[3vmin] py-[1.5vmin] font-semibold text-[2.4vmin] text-primary-11 [&_svg]:size-[2.6vmin]">
						<CheckIcon aria-hidden="true" />
						{referent
							? t("session.handoff-done", { name: referent })
							: t("session.handoff-done-team")}
					</p>
				)}
			</div>

			{inactive && (
				<p
					role="status"
					className="animate-rise text-[2.4vmin] text-neutral-10 motion-reduce:animate-none"
				>
					{t("session.inactive")}
				</p>
			)}
		</div>
	);
}

function KioskComposer(props: {
	disabled: boolean;
	placeholder: string;
	onSubmit: (text: string) => void;
}) {
	const { disabled, placeholder, onSubmit } = props;
	const [value, setValue] = useState("");

	return (
		<form
			className="w-full max-w-[80vmin]"
			onSubmit={(event) => {
				event.preventDefault();
				const text = value.trim();
				if (!text || disabled) return;
				onSubmit(text);
				setValue("");
			}}
		>
			<input
				value={value}
				onChange={(event) => setValue(event.target.value)}
				placeholder={placeholder}
				aria-label={placeholder}
				maxLength={1000}
				disabled={disabled}
				className="h-[8vmin] w-full rounded-full border border-neutral-6 bg-neutral-2/85 px-[3.5vmin] text-[2.6vmin] text-neutral-12 outline-none backdrop-blur-md transition placeholder:text-neutral-9 focus:border-primary-8 disabled:opacity-60"
			/>
		</form>
	);
}

/** Leif's replies vary from one line to a paragraph: the type steps down so they always fit. */
function kioskLineSize(text: string) {
	if (text.length > 260) return "[&>p]:text-[2.5vmin]";
	if (text.length > 140) return "[&>p]:text-[3vmin]";
	return "[&>p]:text-[3.6vmin]";
}
