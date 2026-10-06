import { tv, type VariantProps } from "tailwind-variants";

/** One spoken word with its timing, relative to the start of the audio clip. */
export interface LeifSubtitleWord {
	text: string;
	startMs: number;
	endMs: number;
}

/** Character-level alignment as returned by ElevenLabs `/with-timestamps` endpoints. */
export interface CharacterAlignment {
	characters: string[];
	character_start_times_seconds: number[];
	character_end_times_seconds: number[];
}

/** Groups an ElevenLabs character alignment into words usable by `LeifSubtitles`. */
export function wordsFromCharacterAlignment(alignment: CharacterAlignment): LeifSubtitleWord[] {
	const words: LeifSubtitleWord[] = [];
	let current: LeifSubtitleWord | null = null;

	for (const [index, character] of alignment.characters.entries()) {
		const startMs = Math.round((alignment.character_start_times_seconds[index] ?? 0) * 1000);
		const endMs = Math.round((alignment.character_end_times_seconds[index] ?? 0) * 1000);

		if (/\s/.test(character)) {
			current = null;
			continue;
		}
		if (current) {
			current.text += character;
			current.endMs = endMs;
			continue;
		}
		current = { text: character, startMs, endMs };
		words.push(current);
	}

	return words;
}

const leifSubtitlesVariants = tv({
	slots: {
		root: "flex max-w-4xl flex-col gap-3",
		speaker:
			"font-pixel font-semibold text-base text-primary-9 uppercase leading-none tracking-[0.12em]",
		line: "text-balance font-bold text-neutral-12 tracking-tight",
		word: "transition-colors duration-150",
		srOnly: "sr-only",
	},
	variants: {
		size: {
			md: { line: "text-xl leading-snug sm:text-2xl" },
			lg: { line: "text-2xl leading-snug sm:text-4xl sm:leading-tight" },
			xl: { line: "text-4xl leading-tight sm:text-6xl sm:leading-[1.08]" },
		},
		align: {
			start: { root: "items-start text-left" },
			center: { root: "items-center text-center" },
		},
	},
	defaultVariants: {
		size: "lg",
		align: "center",
	},
});

export type LeifSubtitlesRootProps = VariantProps<typeof leifSubtitlesVariants> & {
	/** Full sentence being spoken. Always rendered for assistive technologies. */
	text: string;
	/** Word timings. Without them the sentence is shown as plain, fully lit text. */
	alignment?: LeifSubtitleWord[];
	/** Playback position of the audio clip, in milliseconds. */
	currentTimeMs?: number;
	/**
	 * Announce the line in a polite live region. Turn off when the page owns a persistent live
	 * region (a remounting one is not announced reliably). @default true
	 */
	announce?: boolean;
	/** Small uppercase kicker above the line, e.g. the avatar name. */
	speaker?: string;
	className?: string;
};

export function LeifSubtitlesRoot(props: LeifSubtitlesRootProps) {
	const {
		text,
		alignment,
		currentTimeMs,
		announce = true,
		speaker,
		size,
		align,
		className,
	} = props;
	const styles = leifSubtitlesVariants({ size, align });

	return (
		<div className={styles.root({ className })}>
			{speaker && <span className={styles.speaker()}>{speaker}</span>}
			{announce && (
				<p aria-live="polite" className={styles.srOnly()}>
					{text}
				</p>
			)}
			<p aria-hidden="true" className={styles.line()}>
				{alignment && alignment.length > 0 && currentTimeMs !== undefined
					? alignment.map((word) => {
							const status =
								currentTimeMs >= word.endMs
									? "spoken"
									: currentTimeMs >= word.startMs
										? "current"
										: "upcoming";

							return (
								<span key={`${word.startMs}-${word.text}`}>
									<span
										data-status={status}
										className={styles.word({
											className:
												status === "upcoming"
													? "text-neutral-8"
													: status === "current"
														? "text-neutral-12 underline decoration-2 decoration-primary-9 underline-offset-[0.2em]"
														: "text-neutral-12",
										})}
									>
										{word.text}
									</span>{" "}
								</span>
							);
						})
					: text}
			</p>
		</div>
	);
}
