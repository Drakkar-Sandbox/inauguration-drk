import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "tailwind-variants";

import { DrakkarLogo } from "@workspace/ui-react/components/drakkar-logo";
import { ExternalLinkIcon, PlayIcon, RotateCcwIcon } from "@workspace/ui-react/icons";

import {
	type CueSpeechStatus,
	useCueSpeeches,
} from "#/features/inauguration/kiosk/speech/hooks/use-cue-speeches";
import { KIOSK_AVATAR_NAME } from "#/features/inauguration/leif/constants";
import type { SpeechCurrent } from "#/features/inauguration/leif/types";
import { inauguration } from "#/libs/tuyau";

const POLL_INTERVAL_MS = 1_000;

/**
 * Operator console (laptop/tablet) driving the speech screen: one big trigger per cue, keyboard
 * shortcuts 1–9 (0 resets), and a live view of what the screen is saying.
 */
export function OperatorConsole() {
	const { t } = useTranslation("features.inauguration.kiosk.speech.components.operator-console");

	const queryClient = useQueryClient();
	const [failed, setFailed] = useState(false);

	const { data: cues = [] } = useQuery(
		inauguration.kiosk.speech.cues.queryOptions({}, { staleTime: Number.POSITIVE_INFINITY }),
	);
	// Also warms the server speech cache before the speech screen needs it.
	const { statuses } = useCueSpeeches(cues);
	const { data: current, isError: offline } = useQuery(
		inauguration.kiosk.speech.current.queryOptions(
			{},
			{ refetchInterval: POLL_INTERVAL_MS, refetchIntervalInBackground: true, retry: true },
		),
	);

	const onSuccess = (next: SpeechCurrent) => {
		setFailed(false);
		queryClient.setQueryData(inauguration.kiosk.speech.current.queryKey({}), next);
	};
	const onError = () => setFailed(true);
	const trigger = useMutation(
		inauguration.kiosk.speech.trigger.mutationOptions({ onSuccess, onError }),
	);
	const reset = useMutation(
		inauguration.kiosk.speech.reset.mutationOptions({ onSuccess, onError }),
	);

	const fire = useRef((cueId: string) => trigger.mutate({ body: { cueId } }));
	fire.current = (cueId: string) => trigger.mutate({ body: { cueId } });
	const clear = useRef(() => reset.mutate({}));
	clear.current = () => reset.mutate({});

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
			if (event.key === "0") {
				event.preventDefault();
				clear.current();
				return;
			}
			const index = Number(event.key) - 1;
			const cue = Number.isInteger(index) && index >= 0 ? cues[index] : undefined;
			if (cue) {
				event.preventDefault();
				fire.current(cue.id);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [cues]);

	const openScreen = () =>
		window.open("/screens/discours", "leif-discours", "popup,width=1280,height=720");

	return (
		<div className="mx-auto grid w-full max-w-5xl gap-10 px-6 py-10 sm:px-10">
			<header className="flex flex-wrap items-end justify-between gap-6">
				<div className="grid gap-3">
					<DrakkarLogo size="sm" tone="paper" />
					<p className="font-pixel font-semibold text-base text-primary-9 uppercase leading-none tracking-[0.12em]">
						{t("kicker")}
					</p>
					<h1 className="font-extrabold text-4xl text-neutral-12 leading-none tracking-tight sm:text-5xl">
						{t("title", { name: KIOSK_AVATAR_NAME })}
					</h1>
				</div>
				<div className="flex flex-wrap gap-3">
					<button type="button" onClick={openScreen} className={GHOST_BUTTON}>
						<ExternalLinkIcon aria-hidden="true" />
						{t("open-screen")}
					</button>
					<button
						type="button"
						onClick={() => clear.current()}
						disabled={reset.isPending}
						className={GHOST_BUTTON}
					>
						<RotateCcwIcon aria-hidden="true" />
						{t("reset")}
						<kbd className={KBD}>0</kbd>
					</button>
				</div>
			</header>

			<LiveStatus current={current} offline={offline || failed} />

			<ol className="grid gap-3">
				{cues.map((cue, index) => {
					const active = current?.cue?.id === cue.id;
					return (
						<li
							key={cue.id}
							className={cn(
								"grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-4 rounded-3xl border p-5 transition sm:grid-cols-[auto_1fr_auto] sm:p-6",
								active ? "border-primary-9 bg-primary-9/10" : "border-neutral-5 bg-neutral-2",
							)}
						>
							<span
								className={cn(
									"grid size-12 place-items-center rounded-2xl font-extrabold text-xl tabular-nums",
									active ? "bg-primary-9 text-white" : "bg-neutral-4 text-neutral-11",
								)}
							>
								{index + 1}
							</span>
							<div className="grid min-w-0 gap-1.5">
								<p className="flex flex-wrap items-center gap-3 font-bold text-lg text-neutral-12">
									{cue.label}
									<AudioBadge status={statuses[cue.id] ?? "loading"} />
									{active && (
										<span className="rounded-full bg-primary-9 px-2.5 py-0.5 font-bold text-[0.65rem] text-white uppercase tracking-[0.16em]">
											{t("live")}
										</span>
									)}
								</p>
								<p className="line-clamp-2 text-pretty text-neutral-10 text-sm leading-relaxed">
									{cue.text}
								</p>
							</div>
							<button
								type="button"
								onClick={() => fire.current(cue.id)}
								disabled={trigger.isPending}
								className="col-span-2 inline-flex h-14 items-center justify-center gap-3 rounded-full bg-primary-9 px-8 font-bold text-base text-white outline-none transition hover:bg-primary-10 focus-visible:ring-4 focus-visible:ring-primary-7 active:scale-[0.98] disabled:opacity-60 sm:col-span-1 [&_svg]:size-5"
							>
								<PlayIcon aria-hidden="true" />
								{t("trigger")}
							</button>
						</li>
					);
				})}
			</ol>

			<p className="text-neutral-9 text-sm">{t("shortcuts")}</p>
		</div>
	);
}

function LiveStatus(props: { current: SpeechCurrent | undefined; offline: boolean }) {
	const { current, offline } = props;

	const { t } = useTranslation("features.inauguration.kiosk.speech.components.operator-console");

	return (
		<div
			role="status"
			className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-neutral-5 bg-neutral-2/60 px-6 py-5"
		>
			<p className="flex items-center gap-3 font-semibold text-neutral-12">
				<span
					aria-hidden="true"
					className={cn(
						"size-2.5 rounded-full",
						offline
							? "bg-warning-9"
							: current?.cue
								? "animate-halo bg-primary-9 motion-reduce:animate-none"
								: "bg-neutral-8",
					)}
				/>
				{offline
					? t("status.offline")
					: current?.cue
						? t("status.live", { label: current.cue.label })
						: t("status.idle")}
			</p>
			<p className="text-neutral-10 text-sm tabular-nums">
				{t("status.sequence", { sequence: current?.sequence ?? 0 })}
				{current?.triggeredAt && (
					<>
						{" · "}
						{new Date(current.triggeredAt).toLocaleTimeString("fr-FR", {
							hour: "2-digit",
							minute: "2-digit",
							second: "2-digit",
						})}
					</>
				)}
			</p>
		</div>
	);
}

function AudioBadge(props: { status: CueSpeechStatus }) {
	const { status } = props;

	const { t } = useTranslation("features.inauguration.kiosk.speech.components.operator-console");

	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-semibold text-[0.7rem]",
				status === "audio" && "border-success-7 text-success-11",
				status === "text" && "border-neutral-6 text-neutral-10",
				status === "loading" && "border-neutral-6 text-neutral-10",
				status === "error" && "border-warning-7 text-warning-11",
			)}
		>
			<span
				aria-hidden="true"
				className={cn(
					"size-1.5 rounded-full",
					status === "audio" && "bg-success-9",
					status === "text" && "bg-neutral-8",
					status === "loading" && "animate-pulse bg-neutral-9 motion-reduce:animate-none",
					status === "error" && "bg-warning-9",
				)}
			/>
			{t(`audio.${status}`)}
		</span>
	);
}

const GHOST_BUTTON =
	"inline-flex h-11 items-center gap-2 rounded-full border border-neutral-6 px-5 font-semibold text-neutral-12 text-sm outline-none transition hover:border-primary-9 focus-visible:ring-3 focus-visible:ring-primary-7 disabled:opacity-60 [&_svg]:size-4";
const KBD = "ml-1 rounded-md border border-neutral-6 px-1.5 font-mono text-neutral-10 text-xs";
