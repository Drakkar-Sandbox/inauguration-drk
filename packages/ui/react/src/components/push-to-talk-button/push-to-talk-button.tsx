import {
	type KeyboardEvent,
	type PointerEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { tv, type VariantProps } from "tailwind-variants";

import { LoaderCircleIcon, MicIcon } from "../../icons";

export type PushToTalkState = "idle" | "recording" | "processing" | "disabled";

const DEFAULT_LABELS: Record<PushToTalkState, string> = {
	idle: "Maintenez pour parler",
	recording: "Je vous écoute…",
	processing: "Un instant…",
	disabled: "Micro indisponible",
};

const METER_SEGMENTS = 12;

const pushToTalkVariants = tv({
	slots: {
		root: "inline-flex flex-col items-center gap-4",
		stage: "relative grid place-items-center",
		halo: "pointer-events-none absolute inset-0 rounded-full bg-primary-9 transition-[transform,opacity] duration-75",
		button: [
			"relative grid touch-none select-none place-items-center rounded-full outline-none transition",
			"focus-visible:ring-4 focus-visible:ring-primary-7 focus-visible:ring-offset-4 focus-visible:ring-offset-neutral-1",
			"disabled:cursor-not-allowed",
		],
		label: "font-bold text-neutral-11 text-xs uppercase tracking-[0.2em]",
		meter: "flex h-1.5 items-center gap-1",
		segment: "h-full w-2 rounded-full transition-colors duration-75",
	},
	variants: {
		state: {
			idle: {
				button: [
					"cursor-pointer bg-neutral-3 text-primary-9 ring-1 ring-neutral-7",
					"hover:bg-neutral-4 hover:ring-primary-8",
				],
			},
			recording: {
				button: "scale-105 cursor-pointer bg-primary-9 text-neutral-1 dark:text-neutral-12",
			},
			processing: { button: "bg-neutral-3 text-neutral-11 ring-1 ring-neutral-6" },
			disabled: { button: "bg-neutral-3 text-neutral-8 opacity-60 ring-1 ring-neutral-6" },
		},
		size: {
			md: { stage: "size-20", button: "size-16 [&_svg]:size-6" },
			lg: { stage: "size-28", button: "size-22 [&_svg]:size-8" },
			xl: { stage: "size-40", button: "size-32 [&_svg]:size-12" },
		},
	},
	defaultVariants: {
		state: "idle",
		size: "lg",
	},
});

export type PushToTalkButtonRootProps = VariantProps<typeof pushToTalkVariants> & {
	/** @default "idle" */
	state?: PushToTalkState;
	/** Live input level in `[0, 1]` shown by the halo and the segment meter while recording. */
	level?: number;
	/** Fired when the user starts holding (pointer down or Space down). */
	onPressStart?: () => void;
	/** Fired when the user releases: the recording should be sent. */
	onPressEnd?: () => void;
	/** Fired when the press is interrupted (pointer cancelled, focus lost): discard the recording. */
	onPressCancel?: () => void;
	/** Also listen to Space anywhere on the page (kiosk mode), except inside text fields. */
	globalHotkey?: boolean;
	/** Visible captions per state; French defaults. */
	labels?: Partial<Record<PushToTalkState, string>>;
	/** Hide the level meter. @default true */
	showMeter?: boolean;
	className?: string;
};

export function PushToTalkButtonRoot(props: PushToTalkButtonRootProps) {
	const {
		state = "idle",
		level = 0,
		size,
		onPressStart,
		onPressEnd,
		onPressCancel,
		globalHotkey = false,
		labels,
		showMeter = true,
		className,
	} = props;
	const styles = pushToTalkVariants({ state, size });
	const [pressed, setPressed] = useState(false);
	const pressedRef = useRef(false);
	const interactive = state === "idle" || state === "recording";
	const caption = labels?.[state] ?? DEFAULT_LABELS[state];
	const clampedLevel = state === "recording" ? Math.min(1, Math.max(0, level)) : 0;

	const start = useCallback(() => {
		if (pressedRef.current || !interactive) return;
		pressedRef.current = true;
		setPressed(true);
		onPressStart?.();
	}, [interactive, onPressStart]);

	const finish = useCallback(
		(cancelled: boolean) => {
			if (!pressedRef.current) return;
			pressedRef.current = false;
			setPressed(false);
			if (cancelled) onPressCancel?.();
			else onPressEnd?.();
		},
		[onPressCancel, onPressEnd],
	);

	// A disabled button no longer receives pointerup: release any press still in progress.
	useEffect(() => {
		if (!interactive) finish(true);
	}, [interactive, finish]);

	useEffect(() => {
		if (!globalHotkey) return;

		const isTyping = (target: EventTarget | null) =>
			target instanceof HTMLElement &&
			(target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
		const handleDown = (event: globalThis.KeyboardEvent) => {
			if (event.code !== "Space" || event.repeat || isTyping(event.target)) return;
			event.preventDefault();
			start();
		};
		const handleUp = (event: globalThis.KeyboardEvent) => {
			if (event.code !== "Space") return;
			finish(false);
		};
		const handleBlur = () => finish(true);

		window.addEventListener("keydown", handleDown);
		window.addEventListener("keyup", handleUp);
		window.addEventListener("blur", handleBlur);
		return () => {
			window.removeEventListener("keydown", handleDown);
			window.removeEventListener("keyup", handleUp);
			window.removeEventListener("blur", handleBlur);
		};
	}, [globalHotkey, start, finish]);

	const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
		if (event.button !== 0) return;
		event.currentTarget.setPointerCapture(event.pointerId);
		start();
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
		if (event.key !== " " && event.key !== "Enter") return;
		event.preventDefault();
		event.stopPropagation();
		if (!event.repeat) start();
	};

	const handleKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
		if (event.key !== " " && event.key !== "Enter") return;
		event.preventDefault();
		event.stopPropagation();
		finish(false);
	};

	return (
		<div className={styles.root({ className })} data-state={state}>
			<div className={styles.stage()}>
				<span
					aria-hidden="true"
					className={styles.halo()}
					style={{
						opacity: state === "recording" ? 0.12 + clampedLevel * 0.3 : 0,
						transform: `scale(${0.8 + clampedLevel * 0.35})`,
					}}
				/>
				{state === "recording" && (
					<span
						aria-hidden="true"
						className="pointer-events-none absolute inset-[8%] animate-ripple rounded-full border border-primary-9 motion-reduce:animate-none"
					/>
				)}
				<button
					type="button"
					aria-label={caption}
					aria-pressed={pressed || state === "recording"}
					aria-busy={state === "processing"}
					disabled={!interactive}
					className={styles.button()}
					onPointerDown={handlePointerDown}
					onPointerUp={() => finish(false)}
					onPointerCancel={() => finish(true)}
					onLostPointerCapture={() => finish(false)}
					onKeyDown={handleKeyDown}
					onKeyUp={handleKeyUp}
					onBlur={() => finish(true)}
					onContextMenu={(event) => event.preventDefault()}
				>
					{state === "processing" ? (
						<LoaderCircleIcon className="animate-spin" aria-hidden="true" />
					) : (
						<MicIcon aria-hidden="true" />
					)}
				</button>
			</div>
			{showMeter && (
				<>
					<meter
						aria-label="Niveau du micro"
						min={0}
						max={1}
						value={clampedLevel}
						className="sr-only"
					/>
					<div aria-hidden="true" className={styles.meter()}>
						{Array.from({ length: METER_SEGMENTS }, (_, index) => (
							<span
								// biome-ignore lint/suspicious/noArrayIndexKey: fixed-length static segments
								key={index}
								className={styles.segment({
									className:
										clampedLevel * METER_SEGMENTS > index ? "bg-primary-9" : "bg-neutral-5",
								})}
							/>
						))}
					</div>
				</>
			)}
			<span aria-hidden="true" className={styles.label()}>
				{caption}
			</span>
		</div>
	);
}
