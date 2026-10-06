import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "tailwind-variants";

import { ChoiceChips } from "@workspace/ui-react/components/choice-chips";
import { PushToTalkButton } from "@workspace/ui-react/components/push-to-talk-button";
import { ArrowUpIcon, KeyboardIcon, MicIcon } from "@workspace/ui-react/icons";

import { PlusOneForm } from "#/features/inauguration/invitation/components/plus-one-form";
import type { useSignupConversation } from "#/features/inauguration/invitation/hooks/use-signup-conversation";
import {
	LiveLeifAvatar,
	LiveLeifSubtitles,
} from "#/features/inauguration/leif/components/live-leif";
import { LEIF_PORTRAIT_SRC } from "#/features/inauguration/leif/constants";

/** Beyond this length the reply gets a smaller type and Leif steps back. */
const LONG_LINE_CHARACTERS = 140;

/** Answers that move the invitation forward get the coral treatment. */
const PRIMARY_CHOICES = new Set([
	"consent_yes",
	"confirm",
	"plus_one_confirm",
	"plus_one_keep",
	"done",
]);

type LeifConversationProps = {
	avatarName: string;
	conversation: ReturnType<typeof useSignupConversation>;
};

/**
 * The conversation stage: Leif in his spotlight, the subtitles as the main typography, and a
 * dock with quick replies, push-to-talk and a discreet keyboard.
 */
export function LeifConversation(props: LeifConversationProps) {
	const { avatarName, conversation } = props;
	const { turn, guestLine, send, pending, state, voice, ptt } = conversation;

	const { t } = useTranslation("features.inauguration.invitation.components.leif-conversation");

	const [typing, setTyping] = useState(false);
	const showKeyboard = typing || !ptt.available;
	const choices = turn?.choices ?? [];
	const busy = pending || voice.preparing;
	const longLine = (voice.line?.text.length ?? 0) > LONG_LINE_CHARACTERS;

	// Keep each new reply in view when it is taller than the stage.
	const stage = useRef<HTMLDivElement>(null);
	const lineId = voice.line?.id;
	useEffect(() => {
		if (lineId === undefined) return;
		stage.current?.scrollTo({ top: stage.current.scrollHeight, behavior: "smooth" });
	}, [lineId]);

	// Each answer replaces the controls: keep keyboard and screen-reader users in the dock by
	// focusing the first new choice (or the text field on devices with a physical keyboard).
	const dock = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (!turn || !dock.current) return;
		const active = document.activeElement;
		const lost = !active || active === document.body || !active.isConnected;
		if (!lost && !dock.current.contains(active)) return;

		const chip = dock.current.querySelector<HTMLElement>("fieldset button");
		const field = window.matchMedia("(pointer: fine)").matches
			? dock.current.querySelector<HTMLElement>("input")
			: null;
		(chip ?? field)?.focus({ preventScroll: true });
	}, [turn]);

	return (
		<div className="flex min-h-0 flex-1 flex-col items-center">
			<div
				ref={stage}
				className="-mx-5 min-h-0 w-[calc(100%+2.5rem)] flex-1 overflow-y-auto px-5 [mask-image:linear-gradient(to_bottom,transparent,black_1.5rem,black_calc(100%-2rem),transparent)] [scrollbar-width:none]"
			>
				<div className="flex min-h-full flex-col items-center justify-center gap-6 py-6 sm:gap-8">
					<LiveLeifAvatar
						name={avatarName}
						state={state}
						frame={voice.frame}
						framing="portrait"
						size="fill"
						imageSrc={LEIF_PORTRAIT_SRC}
						className={cn(
							"shrink-0 transition-[width] duration-500 sm:w-56 lg:w-64",
							longLine ? "w-28" : "w-40",
						)}
					/>

					<div className="flex min-h-40 w-full max-w-2xl flex-col items-center gap-4 px-1 text-center">
						{guestLine && (
							<p
								key={guestLine}
								className="line-clamp-2 max-w-md animate-rise text-neutral-9 text-sm italic motion-reduce:animate-none"
							>
								<span className="sr-only">{t("you-said")} </span>« {guestLine} »
							</p>
						)}
						{voice.line ? (
							<LiveLeifSubtitles
								announce={false}
								key={voice.line.id}
								text={voice.line.text}
								alignment={voice.line.words}
								frame={voice.frame}
								speaker={avatarName}
								size="md"
								className={cn(
									"animate-rise motion-reduce:animate-none",
									longLine
										? "[&>p]:text-lg sm:[&>p]:text-xl"
										: "lg:[&>p]:text-3xl lg:[&>p]:leading-tight",
								)}
							/>
						) : (
							<p className="font-pixel font-semibold text-base text-primary-9 uppercase leading-none tracking-[0.12em]">
								{avatarName}
							</p>
						)}
					</div>
				</div>
			</div>

			{/* One persistent live region: remounting ones are not announced reliably. */}
			<p aria-live="polite" className="sr-only">
				{voice.line?.text}
			</p>

			<div
				ref={dock}
				className="grid w-full max-w-2xl shrink-0 gap-4 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:gap-5"
			>
				{turn?.form === "plus_one" && (
					<div className="rounded-3xl border border-neutral-5 bg-neutral-2/85 p-5 backdrop-blur-md">
						<PlusOneForm
							key={turn.reply.text}
							compact
							submitLabel={t("plus-one.submit")}
							disabled={busy}
							onSubmit={(values) =>
								send(
									{ plusOne: values },
									`${values.firstName} ${values.lastName} — ${values.email}`,
								)
							}
						/>
					</div>
				)}

				{choices.length > 0 && (
					<ChoiceChips
						key={choices.map((choice) => choice.value).join()}
						aria-label={t("choices")}
						choices={choices.map((choice) => ({
							value: choice.value,
							label: choice.label,
							tone: PRIMARY_CHOICES.has(choice.value) ? "primary" : "default",
						}))}
						busy={busy}
						className="max-sm:-mx-5 max-sm:flex-nowrap max-sm:justify-start max-sm:overflow-x-auto max-sm:px-5 max-sm:pb-1 max-sm:[scrollbar-width:none] [&>button]:shrink-0"
						onChoose={(value) =>
							send({ choice: value }, choices.find((choice) => choice.value === value)?.label)
						}
					/>
				)}

				{turn?.form === "plus_one" ? null : showKeyboard ? (
					<Composer
						disabled={busy}
						autoFocus={typing}
						placeholder={t("composer.placeholder", { name: avatarName })}
						sendLabel={t("composer.send")}
						onSubmit={(text) => send({ text }, text)}
						trailing={
							ptt.available && (
								<button
									type="button"
									onClick={() => setTyping(false)}
									aria-label={t("composer.use-voice")}
									className="grid size-12 shrink-0 place-items-center rounded-full border border-neutral-6 text-neutral-11 outline-none transition hover:border-primary-9 hover:text-primary-11 focus-visible:ring-3 focus-visible:ring-primary-7 [&_svg]:size-5"
								>
									<MicIcon aria-hidden="true" />
								</button>
							)
						}
					/>
				) : (
					<div className="grid grid-cols-[1fr_auto_1fr] items-start">
						<button
							type="button"
							onClick={() => setTyping(true)}
							aria-label={t("composer.use-keyboard")}
							className="mt-4 grid size-12 place-items-center justify-self-end rounded-full border border-neutral-6 text-neutral-11 outline-none transition hover:border-primary-9 hover:text-primary-11 focus-visible:ring-3 focus-visible:ring-primary-7 [&_svg]:size-5"
						>
							<KeyboardIcon aria-hidden="true" />
						</button>
						<PushToTalkButton
							size="md"
							state={busy && ptt.state === "idle" ? "processing" : ptt.state}
							level={ptt.level}
							showMeter={false}
							labels={{ idle: t("ptt.idle"), processing: t("ptt.processing") }}
							onPressStart={ptt.start}
							onPressEnd={ptt.stop}
							onPressCancel={ptt.cancel}
							className="px-4"
						/>
						<span />
					</div>
				)}
			</div>
		</div>
	);
}

type ComposerProps = {
	disabled: boolean;
	autoFocus: boolean;
	placeholder: string;
	sendLabel: string;
	onSubmit: (text: string) => void;
	trailing?: React.ReactNode;
};

function Composer(props: ComposerProps) {
	const { disabled, autoFocus, placeholder, sendLabel, onSubmit, trailing } = props;
	const [value, setValue] = useState("");
	const input = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (autoFocus) input.current?.focus();
	}, [autoFocus]);

	return (
		<form
			className="flex animate-rise items-center gap-3 motion-reduce:animate-none"
			onSubmit={(event) => {
				event.preventDefault();
				const text = value.trim();
				if (!text || disabled) return;
				onSubmit(text);
				setValue("");
			}}
		>
			<div className="relative flex-1">
				<input
					ref={input}
					value={value}
					onChange={(event) => setValue(event.target.value)}
					placeholder={placeholder}
					aria-label={placeholder}
					maxLength={500}
					enterKeyHint="send"
					className="h-12 w-full rounded-full border border-neutral-6 bg-neutral-2/85 pr-14 pl-5 text-base text-neutral-12 outline-none backdrop-blur-md transition placeholder:text-neutral-9 focus:border-primary-8 focus-visible:ring-3 focus-visible:ring-primary-7/40"
				/>
				<button
					type="submit"
					aria-disabled={disabled || !value.trim() || undefined}
					aria-label={sendLabel}
					className={cn(
						"absolute top-1.5 right-1.5 grid size-9 place-items-center rounded-full bg-primary-9 text-white outline-none transition focus-visible:ring-3 focus-visible:ring-primary-7 [&_svg]:size-4",
						"aria-disabled:bg-neutral-5 aria-disabled:text-neutral-9",
					)}
				>
					<ArrowUpIcon aria-hidden="true" />
				</button>
			</div>
			{trailing}
		</form>
	);
}
