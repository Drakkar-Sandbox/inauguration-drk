import { type ComponentType, useId } from "react";
import { cn, tv, type VariantProps } from "tailwind-variants";

/** What Leif is currently doing. Drives the whole visual language of the avatar. */
export type LeifAvatarState = "idle" | "listening" | "thinking" | "speaking";

/** `portrait` = head & shoulders (mobile, cards); `fullbody` = standing figure (kiosk screens). */
export type LeifAvatarFraming = "portrait" | "fullbody";

/**
 * Contract every Leif renderer must honour. The provisional renderer, a future Three.js GLB
 * renderer and a talking-image video renderer all receive exactly these props, so consumers of
 * `LeifAvatar` never change when the visual pipeline does.
 */
export interface LeifAvatarRendererProps {
	state: LeifAvatarState;
	/** Mouth aperture in `[0, 1]`, already clamped. Updated at audio frame rate while speaking. */
	mouthOpenness: number;
	framing: LeifAvatarFraming;
	/** Static reference image of the character, when one has been generated. */
	imageSrc?: string;
	/** Display name of the avatar (configurable, never hard-coded). */
	name: string;
}

/**
 * A renderer is a plain component: it may own a `<canvas>`, a `<video>` or a WebRTC stream and
 * must fill its parent box (`size-full`). Sizing, framing and accessibility stay in `LeifAvatar`.
 */
export type LeifAvatarRenderer = ComponentType<LeifAvatarRendererProps>;

const leifAvatarVariants = tv({
	base: "relative isolate shrink-0 select-none",
	variants: {
		framing: {
			portrait: "aspect-square",
			fullbody: "aspect-[9/16]",
		},
		size: {
			sm: "",
			md: "",
			lg: "",
			fill: "size-full",
		},
	},
	compoundVariants: [
		{ framing: "portrait", size: "sm", className: "w-24" },
		{ framing: "portrait", size: "md", className: "w-48" },
		{ framing: "portrait", size: "lg", className: "w-80" },
		{ framing: "fullbody", size: "sm", className: "h-72" },
		{ framing: "fullbody", size: "md", className: "h-128" },
		{ framing: "fullbody", size: "lg", className: "h-192" },
	],
	defaultVariants: {
		framing: "portrait",
		size: "md",
	},
});

export type LeifAvatarRootProps = Omit<VariantProps<typeof leifAvatarVariants>, "framing"> & {
	/** Display name of the avatar, used for the monogram and the accessible label. */
	name: string;
	/** Current conversational state. */
	state: LeifAvatarState;
	/**
	 * Lip-sync driver in `[0, 1]` (0 = closed). Feed it from an audio analyser or from TTS
	 * alignment timestamps; values outside the range are clamped.
	 * @default 0
	 */
	mouthOpenness?: number;
	/** @default "portrait" */
	framing?: LeifAvatarFraming;
	/** Static reference image of Leif. Without it the provisional renderer draws an abstract presence. */
	imageSrc?: string;
	/**
	 * Inject the definitive renderer (3D model, talking-image stream…) without touching consumers.
	 * @default LeifAvatar.ProvisionalRenderer
	 */
	renderer?: LeifAvatarRenderer;
	/** Accessible label. @default name */
	"aria-label"?: string;
	className?: string;
};

export function LeifAvatarRoot(props: LeifAvatarRootProps) {
	const {
		name,
		state,
		mouthOpenness = 0,
		framing = "portrait",
		size,
		imageSrc,
		renderer: Renderer = LeifAvatarProvisionalRenderer,
		"aria-label": ariaLabel,
		className,
	} = props;

	return (
		<div
			role="img"
			aria-label={ariaLabel ?? name}
			data-state={state}
			data-framing={framing}
			className={leifAvatarVariants({ framing, size, className })}
		>
			<Renderer
				state={state}
				mouthOpenness={clamp01(mouthOpenness)}
				framing={framing}
				imageSrc={imageSrc}
				name={name}
			/>
		</div>
	);
}

/**
 * Placeholder renderer used until the generated character is animated. Draws Leif's reference
 * image when available, an abstract coral-on-ink presence otherwise.
 */
export function LeifAvatarProvisionalRenderer(props: LeifAvatarRendererProps) {
	const { framing, imageSrc } = props;

	if (imageSrc) {
		return framing === "fullbody" ? <FullbodyImage {...props} /> : <PortraitImage {...props} />;
	}

	return framing === "fullbody" ? <FullbodyFigure {...props} /> : <PortraitEmblem {...props} />;
}

function PortraitEmblem(props: LeifAvatarRendererProps) {
	const { state, mouthOpenness, name } = props;
	const id = useId();
	const speaking = state === "speaking";

	return (
		<svg viewBox="-100 -100 200 200" className="size-full overflow-visible" aria-hidden="true">
			<AuraDefs id={id} />
			<VoiceAura id={id} cx={0} cy={0} r={54} state={state} mouthOpenness={mouthOpenness} />
			<g
				className={cn(
					"origin-center transition-opacity duration-500 [transform-box:fill-box]",
					(state === "idle" || state === "listening") &&
						"animate-breathe motion-reduce:animate-none",
					state === "thinking" && "opacity-70",
				)}
			>
				<circle r={54} className="fill-neutral-2 stroke-neutral-6" strokeWidth={0.75} />
				<circle r={47} className="fill-none stroke-neutral-4" strokeWidth={0.5} />
				<text
					y={-2}
					textAnchor="middle"
					dominantBaseline="central"
					fontSize={52}
					letterSpacing={-2}
					className="fill-neutral-12 font-extrabold font-sans"
				>
					{name.charAt(0).toUpperCase()}
				</text>
				<rect
					x={-(7 + 13 * (speaking ? mouthOpenness : 0))}
					y={25 - (speaking ? 2 * mouthOpenness : 0)}
					width={14 + 26 * (speaking ? mouthOpenness : 0)}
					height={2 + (speaking ? 4 * mouthOpenness : 0)}
					rx={1.5}
					className="fill-primary-9"
				/>
				<text
					y={39}
					textAnchor="middle"
					fontSize={6}
					letterSpacing={2.4}
					className="fill-neutral-10 font-bold font-sans uppercase"
				>
					{name}
				</text>
			</g>
		</svg>
	);
}

/** Abstract standing figure: tailored suit, beard, coral tie pin and pocket square. */
function FullbodyFigure(props: LeifAvatarRendererProps) {
	const { state, mouthOpenness } = props;
	const id = useId();
	const speaking = state === "speaking";

	return (
		<svg
			viewBox="0 0 180 320"
			preserveAspectRatio="xMidYMax meet"
			className="size-full overflow-visible"
			aria-hidden="true"
		>
			<AuraDefs id={id} />
			<defs>
				<linearGradient id={`${id}-suit`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="currentColor" className="text-neutral-4" />
					<stop offset="100%" stopColor="currentColor" className="text-neutral-1" />
				</linearGradient>
			</defs>
			<ellipse
				cx={90}
				cy={300}
				rx={78}
				ry={9}
				fill={`url(#${id}-glow)`}
				style={{ opacity: 0.35 + (speaking ? 0.4 * mouthOpenness : 0) }}
			/>
			<VoiceAura id={id} cx={90} cy={60} r={22} state={state} mouthOpenness={mouthOpenness} />
			<g
				className={cn(
					"origin-bottom [transform-box:fill-box]",
					state !== "speaking" && "animate-breathe motion-reduce:animate-none",
				)}
			>
				<path
					d="M82 84C70 88 52 92 46 104L40 196C40 202 50 202 51 196L56 130L60 196L62 296L84 296L88 206L92 206L96 296L118 296L120 196L124 130L129 196C130 202 140 202 140 196L134 104C128 92 110 88 98 84Z"
					fill={`url(#${id}-suit)`}
					className="stroke-neutral-7"
					strokeWidth={0.75}
					strokeLinejoin="round"
				/>
				<path d="M85 85L90 112L95 85Z" className="fill-neutral-10 opacity-60" />
				<path
					d="M79 88L90 140L101 88"
					className="fill-none stroke-neutral-8"
					strokeWidth={0.75}
					strokeLinejoin="round"
				/>
				<circle cx={90} cy={124} r={1.6} className="fill-primary-9" />
				<path d="M106 118L110 115L114 118Z" className="fill-primary-9" />
				<circle
					cx={90}
					cy={60}
					r={18}
					className="fill-neutral-3 stroke-neutral-7"
					strokeWidth={0.75}
				/>
				<path
					d={`M73 63Q90 ${92 + (speaking ? 4 * mouthOpenness : 0)} 107 63Q90 74 73 63Z`}
					className="fill-neutral-6"
				/>
			</g>
		</svg>
	);
}

function PortraitImage(props: LeifAvatarRendererProps) {
	const { state, mouthOpenness, imageSrc } = props;
	const id = useId();

	return (
		<div className="relative size-full">
			<svg viewBox="-100 -100 200 200" className="absolute inset-0 size-full" aria-hidden="true">
				<AuraDefs id={id} />
				<VoiceAura id={id} cx={0} cy={0} r={54} state={state} mouthOpenness={mouthOpenness} />
			</svg>
			<div
				className={cn(
					"absolute inset-[23%] overflow-hidden rounded-full bg-neutral-2 ring-1 ring-neutral-6",
					state !== "speaking" && "animate-breathe motion-reduce:animate-none",
				)}
			>
				<img
					src={imageSrc}
					alt=""
					className="size-full object-cover object-top"
					draggable={false}
				/>
			</div>
		</div>
	);
}

function FullbodyImage(props: LeifAvatarRendererProps) {
	const { state, mouthOpenness, imageSrc } = props;
	const id = useId();

	return (
		<div className="relative size-full">
			<img
				src={imageSrc}
				alt=""
				draggable={false}
				className={cn(
					"size-full origin-bottom object-contain object-bottom",
					state !== "speaking" && "animate-breathe motion-reduce:animate-none",
				)}
			/>
			<div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/5 bg-linear-to-t from-neutral-1" />
			<svg
				viewBox="-100 -100 200 200"
				className="absolute bottom-[3%] left-1/2 w-1/4 -translate-x-1/2"
				aria-hidden="true"
			>
				<AuraDefs id={id} />
				<VoiceAura id={id} cx={0} cy={0} r={34} state={state} mouthOpenness={mouthOpenness} />
				<circle r={4} className="fill-primary-9" />
			</svg>
		</div>
	);
}

function AuraDefs(props: { id: string }) {
	return (
		<defs>
			<radialGradient id={`${props.id}-glow`}>
				<stop offset="0%" stopColor="currentColor" className="text-primary-9" stopOpacity={0.55} />
				<stop offset="60%" stopColor="currentColor" className="text-primary-9" stopOpacity={0.08} />
				<stop offset="100%" stopColor="currentColor" className="text-primary-9" stopOpacity={0} />
			</radialGradient>
		</defs>
	);
}

const TICK_COUNT = 72;

type VoiceAuraProps = {
	id: string;
	cx: number;
	cy: number;
	r: number;
	state: LeifAvatarState;
	mouthOpenness: number;
};

/** Halo + radial voice ticks + per-state overlay (ripples when listening, orbit when thinking). */
function VoiceAura(props: VoiceAuraProps) {
	const { id, cx, cy, r, state, mouthOpenness } = props;
	const ringRadius = r * 1.16;
	const circumference = 2 * Math.PI * ringRadius;

	return (
		<g>
			<circle
				cx={cx}
				cy={cy}
				r={r * 1.8}
				fill={`url(#${id}-glow)`}
				className={cn(
					"origin-center transition-opacity duration-300 [transform-box:fill-box]",
					state === "idle" && "animate-halo motion-reduce:animate-none",
					state === "listening" && "opacity-80",
					state === "thinking" && "opacity-30",
				)}
				style={state === "speaking" ? { opacity: 0.35 + 0.65 * mouthOpenness } : undefined}
			/>
			<path
				d={ticksPath(cx, cy, r * 1.06, r, state, mouthOpenness)}
				strokeWidth={Math.max(0.6, r * 0.018)}
				strokeLinecap="round"
				className={cn(
					"fill-none transition-colors duration-300",
					state === "speaking" || state === "listening" ? "stroke-primary-9" : "stroke-neutral-7",
				)}
			/>
			{state === "listening" && (
				<>
					<circle
						cx={cx}
						cy={cy}
						r={ringRadius}
						strokeWidth={Math.max(0.6, r * 0.02)}
						className="origin-center animate-ripple fill-none stroke-primary-9 [transform-box:fill-box] motion-reduce:animate-none"
					/>
					<circle
						cx={cx}
						cy={cy}
						r={ringRadius}
						strokeWidth={Math.max(0.6, r * 0.02)}
						className="origin-center animate-ripple fill-none stroke-primary-9 [animation-delay:1.2s] [transform-box:fill-box] motion-reduce:animate-none"
					/>
				</>
			)}
			{state === "thinking" && (
				<>
					<circle
						cx={cx}
						cy={cy}
						r={ringRadius}
						strokeWidth={Math.max(0.5, r * 0.012)}
						className="fill-none stroke-neutral-6"
					/>
					<circle
						cx={cx}
						cy={cy}
						r={ringRadius}
						strokeWidth={Math.max(0.8, r * 0.03)}
						strokeLinecap="round"
						strokeDasharray={`${circumference * 0.16} ${circumference}`}
						className="origin-center animate-orbit fill-none stroke-primary-9 [transform-box:fill-box] motion-reduce:animate-none"
					/>
				</>
			)}
		</g>
	);
}

function ticksPath(
	cx: number,
	cy: number,
	innerRadius: number,
	r: number,
	state: LeifAvatarState,
	mouthOpenness: number,
) {
	const segments: string[] = [];

	for (let i = 0; i < TICK_COUNT; i++) {
		const angle = (i / TICK_COUNT) * Math.PI * 2 - Math.PI / 2;
		// Deterministic per-tick variation so the ring reads as a voice, not a gauge.
		const texture =
			0.35 + 0.65 * Math.abs(Math.sin(i * 0.9 + mouthOpenness * 7) * Math.cos(i * 0.37));
		const amplitude =
			state === "speaking"
				? 0.04 + 0.3 * mouthOpenness * texture
				: state === "listening"
					? 0.05
					: state === "idle"
						? 0.03
						: 0.015;
		const outerRadius = innerRadius + r * amplitude;
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		segments.push(
			`M${(cx + cos * innerRadius).toFixed(2)} ${(cy + sin * innerRadius).toFixed(2)}L${(cx + cos * outerRadius).toFixed(2)} ${(cy + sin * outerRadius).toFixed(2)}`,
		);
	}

	return segments.join("");
}

function clamp01(value: number) {
	if (!Number.isFinite(value)) return 0;
	return Math.min(1, Math.max(0, value));
}
