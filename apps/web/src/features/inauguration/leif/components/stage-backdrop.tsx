import { cn } from "tailwind-variants";

import {
	useVoiceFrame,
	type VoiceFrameStore,
} from "#/features/inauguration/leif/utils/frame-store";

const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
	'<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>',
)}")`;

type StageBackdropProps = {
	/** Where the spotlight falls, as a CSS position (e.g. `50% 35%`). */
	spotlight?: "top" | "center" | "left";
	/** Leif's voice: the coral glow brightens with it. */
	frame?: VoiceFrameStore;
	/** Dims the glow (resting screen). */
	muted?: boolean;
	className?: string;
};

/**
 * Theatre backdrop shared by the guest surfaces: ink stage, a coral spotlight behind Leif, a soft
 * vignette and a film grain so large dark areas never band on big screens.
 */
export function StageBackdrop(props: StageBackdropProps) {
	const { spotlight = "top", frame, muted = false, className } = props;

	return (
		<div
			aria-hidden="true"
			className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
		>
			{frame && !muted ? (
				<VoiceGlow spotlight={spotlight} frame={frame} />
			) : (
				<Glow spotlight={spotlight} intensity={0} />
			)}
			<div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-neutral-7 to-transparent opacity-40" />
			<div className="absolute inset-0 bg-radial-[ellipse_at_center] from-transparent via-transparent to-black/70" />
			<div
				className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
				style={{ backgroundImage: GRAIN }}
			/>
		</div>
	);
}

type GlowProps = { spotlight: NonNullable<StageBackdropProps["spotlight"]>; intensity: number };

function VoiceGlow(props: { spotlight: GlowProps["spotlight"]; frame: VoiceFrameStore }) {
	const { mouthOpenness } = useVoiceFrame(props.frame);

	return <Glow spotlight={props.spotlight} intensity={mouthOpenness} />;
}

function Glow(props: GlowProps) {
	const { spotlight, intensity } = props;

	return (
		<div
			className={cn(
				"absolute inset-0 from-primary-9/25 via-primary-9/5 to-transparent transition-opacity duration-700",
				spotlight === "top" && "bg-radial-[ellipse_70%_55%_at_50%_28%]",
				spotlight === "center" && "bg-radial-[ellipse_60%_60%_at_50%_45%]",
				spotlight === "left" && "bg-radial-[ellipse_55%_75%_at_30%_45%]",
			)}
			style={{ opacity: 0.55 + Math.min(1, Math.max(0, intensity)) * 0.45 }}
		/>
	);
}
