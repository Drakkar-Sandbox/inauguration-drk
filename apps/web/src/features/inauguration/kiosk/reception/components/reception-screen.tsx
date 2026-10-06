import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "tailwind-variants";

import { DrakkarLogo } from "@workspace/ui-react/components/drakkar-logo";
import { CameraIcon, CameraOffIcon } from "@workspace/ui-react/icons";

import { AudioUnlockGate } from "#/features/inauguration/kiosk/components/audio-unlock-gate";
import { CameraScanner } from "#/features/inauguration/kiosk/components/camera-scanner";
import { CheckinDrawer } from "#/features/inauguration/kiosk/components/checkin-drawer";
import { ScanFrame } from "#/features/inauguration/kiosk/components/scan-frame";
import { useCameraPreference } from "#/features/inauguration/kiosk/hooks/use-camera-preference";
import { useScannerInput } from "#/features/inauguration/kiosk/hooks/use-scanner-input";
import { useReception } from "#/features/inauguration/kiosk/reception/hooks/use-reception";
import {
	LiveLeifAvatar,
	LiveLeifSubtitles,
} from "#/features/inauguration/leif/components/live-leif";
import { StageBackdrop } from "#/features/inauguration/leif/components/stage-backdrop";
import { KIOSK_AVATAR_NAME, LEIF_FULLBODY_SRC } from "#/features/inauguration/leif/constants";

const ATTRACT_LINE_MS = 6_500;

/**
 * Reception screen (vertical 75", also landscape): attract loop until a QR code is scanned,
 * then Leif welcomes the guest by name before going back to idle.
 */
export function ReceptionScreen() {
	const { t } = useTranslation("features.inauguration.kiosk.reception.components.reception-screen");

	const { visit, welcome, state, voice } = useReception();
	const [camera, setCamera] = useCameraPreference("reception");
	const [cameraFailed, setCameraFailed] = useState(false);

	useScannerInput({ onScan: (code) => void welcome({ token: code }) });

	const welcoming = visit !== null;
	const guest = visit?.guest ?? null;

	return (
		<div className="relative grid size-full grid-rows-[auto_1fr] overflow-hidden">
			<StageBackdrop spotlight="center" frame={voice.frame} />
			<AudioUnlockGate />

			<header className="relative z-10 flex items-center justify-between px-[5vmin] pt-[5vmin]">
				<DrakkarLogo tone="paper" className="text-[3.2vmin]" />
				<p className="font-bold text-[1.5vmin] text-neutral-10 uppercase tracking-[0.3em]">
					{t("kicker")}
				</p>
			</header>

			<main className="relative z-10 grid min-h-0 portrait:grid-rows-[1fr_auto] landscape:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
				<div className="relative flex min-h-0 items-end justify-center portrait:pt-[2vmin] landscape:pb-[4vmin]">
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

				<section
					aria-live="polite"
					className="justify-center-safe flex min-h-0 flex-col gap-[3vmin] overflow-hidden px-[6vmin] portrait:pb-[8vmin] portrait:text-center landscape:pr-[8vmin]"
				>
					{welcoming ? (
						<Welcome
							key={visit.id}
							kicker={
								visit.returning
									? t("welcome.returning")
									: guest || !visit.settled
										? t("welcome.kicker")
										: t("welcome.generic-kicker")
							}
							firstName={guest?.firstName ?? null}
							details={
								guest
									? guest.kind === "plus_one" && guest.hostFirstName
										? t("welcome.plus-one", { name: guest.hostFirstName })
										: [guest.lastName, guest.company].filter(Boolean).join(" · ")
									: null
							}
							pending={!visit.settled}
							fallbackTitle={t("welcome.generic")}
						/>
					) : (
						<Attract
							title={t("attract.title")}
							lines={[t("attract.line-1"), t("attract.line-2"), t("attract.line-3")]}
							camera={camera && !cameraFailed}
							onScan={(code) => void welcome({ token: code })}
							onCameraUnavailable={() => setCameraFailed(true)}
						/>
					)}

					<div className="min-h-[14vmin] portrait:mx-auto">
						{welcoming && voice.line && (
							<LiveLeifSubtitles
								key={voice.line.id}
								text={voice.line.text}
								alignment={voice.line.words}
								frame={voice.frame}
								align="start"
								size="lg"
								className="max-w-none animate-rise motion-reduce:animate-none portrait:items-center portrait:text-center [&>p]:text-[3.2vmin] [&>p]:leading-snug"
							/>
						)}
					</div>
				</section>
			</main>

			<footer className="absolute inset-x-[4vmin] bottom-[4vmin] z-20 flex items-center justify-between">
				<button
					type="button"
					onClick={() => {
						setCameraFailed(false);
						setCamera(!camera);
					}}
					aria-label={camera ? t("camera.off") : t("camera.on")}
					className="grid size-12 place-items-center rounded-full border border-neutral-5 text-neutral-9 opacity-60 outline-none transition hover:text-neutral-12 hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-3 focus-visible:ring-primary-7 [&_svg]:size-5"
				>
					{camera ? <CameraIcon aria-hidden="true" /> : <CameraOffIcon aria-hidden="true" />}
				</button>
				<CheckinDrawer onCheckin={(selected) => void welcome({ guestId: selected.id })} />
			</footer>
		</div>
	);
}

type WelcomeProps = {
	kicker: string;
	/** Check-in in flight: only the kicker shows, the name lands right after. */
	pending: boolean;
	firstName: string | null;
	details: string | null;
	fallbackTitle: string;
};

function Welcome(props: WelcomeProps) {
	const { kicker, pending, firstName, details, fallbackTitle } = props;

	return (
		<div className="grid gap-[2vmin]">
			<p className="animate-rise font-bold text-[2.2vmin] text-primary-9 uppercase tracking-[0.3em] motion-reduce:animate-none">
				{kicker}
			</p>
			{pending ? (
				<span className="h-[17vmin] portrait:mx-auto">
					<span className="block h-0.5 w-[12vmin] animate-pulse rounded-full bg-primary-9 motion-reduce:animate-none" />
				</span>
			) : firstName ? (
				<h1
					key={firstName}
					className="animate-rise break-words font-extrabold text-[min(17vmin,13rem)] text-neutral-12 leading-[0.86] tracking-[-0.055em] [animation-delay:120ms] motion-reduce:animate-none"
				>
					{firstName}
					<span className="text-primary-9">.</span>
				</h1>
			) : (
				<h1 className="text-balance font-extrabold text-[9vmin] text-neutral-12 leading-[0.9] tracking-[-0.045em]">
					{fallbackTitle}
					<span className="text-primary-9">.</span>
				</h1>
			)}
			{details && (
				<p className="animate-rise font-semibold text-[3vmin] text-neutral-11 tracking-tight [animation-delay:240ms] motion-reduce:animate-none">
					{details}
				</p>
			)}
		</div>
	);
}

type AttractProps = {
	title: string;
	lines: string[];
	camera: boolean;
	onScan: (code: string) => void;
	onCameraUnavailable: () => void;
};

function Attract(props: AttractProps) {
	const { title, lines, camera, onScan, onCameraUnavailable } = props;

	const [index, setIndex] = useState(0);
	useEffect(() => {
		const interval = setInterval(
			() => setIndex((current) => (current + 1) % lines.length),
			ATTRACT_LINE_MS,
		);
		return () => clearInterval(interval);
	}, [lines.length]);

	return (
		<div className="grid gap-[4vmin] portrait:justify-items-center">
			<h1 className="text-balance font-extrabold text-[min(11vmin,9rem)] text-neutral-12 leading-[0.88] tracking-[-0.05em]">
				{title}
				<span className="text-primary-9">.</span>
			</h1>
			<div className="flex items-center gap-[4vmin] portrait:flex-col">
				<ScanFrame className={cn("w-[22vmin] shrink-0", !camera && "opacity-80")}>
					{camera && <CameraScanner onScan={onScan} onUnavailable={onCameraUnavailable} />}
				</ScanFrame>
				<p
					key={index}
					className="max-w-[60vmin] animate-rise text-pretty text-[2.8vmin] text-neutral-11 leading-snug motion-reduce:animate-none"
				>
					{lines[index]}
				</p>
			</div>
		</div>
	);
}
