import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "tailwind-variants";

import { DrakkarLogo } from "@workspace/ui-react/components/drakkar-logo";
import { LeifAvatar } from "@workspace/ui-react/components/leif-avatar";
import { CalendarPlusIcon, RotateCcwIcon, Volume2Icon } from "@workspace/ui-react/icons";

import { capitalize, eventDayLabel } from "#/features/inauguration/invitation/utils/format";
import { LEIF_PORTRAIT_SRC } from "#/features/inauguration/leif/constants";
import type { Invitation } from "#/features/inauguration/leif/types";
import { invitationFileUrl } from "#/features/inauguration/leif/utils/api";

const PRIMARY_CTA =
	"inline-flex h-14 items-center justify-center gap-3 rounded-full bg-primary-9 px-9 font-bold text-base text-white outline-none transition hover:bg-primary-10 focus-visible:ring-4 focus-visible:ring-primary-7 focus-visible:ring-offset-4 focus-visible:ring-offset-neutral-1 active:scale-[0.98] [&_svg]:size-5";
const SECONDARY_CTA =
	"inline-flex h-12 items-center justify-center gap-2 rounded-full border border-neutral-7 px-6 font-semibold text-neutral-12 text-sm outline-none transition hover:border-primary-9 hover:text-primary-11 focus-visible:ring-3 focus-visible:ring-primary-7 [&_svg]:size-4";
const TEXT_LINK =
	"rounded font-medium text-neutral-10 text-sm underline decoration-neutral-7 underline-offset-4 outline-none transition hover:text-neutral-12 focus-visible:ring-2 focus-visible:ring-primary-7";

/** Staggered entrance for the editorial screens. */
function rise(index: number, className?: string) {
	return {
		className: cn("animate-rise motion-reduce:animate-none", className),
		style: { animationDelay: `${120 + index * 110}ms` },
	};
}

type InvitationIntroProps = {
	invitation: Invitation;
	onEnter: (withSound: boolean) => void;
	onAnswerWithoutLeif: () => void;
};

/** First screen: the sound gate (a user gesture unlocks audio on iOS). */
export function InvitationIntro(props: InvitationIntroProps) {
	const { invitation, onEnter, onAnswerWithoutLeif } = props;
	const { guest, event } = invitation;

	const { t } = useTranslation("features.inauguration.invitation.components.invitation-screens");

	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-10 py-8 text-center sm:gap-12">
			<div {...rise(0)}>
				<LeifAvatar
					name={event.avatarName}
					state="idle"
					framing="portrait"
					size="fill"
					imageSrc={LEIF_PORTRAIT_SRC}
					className="w-36 sm:w-48"
				/>
			</div>

			<div className="grid max-w-3xl justify-items-center gap-5">
				<p {...rise(1)}>
					<span className="font-bold text-primary-9 text-xs uppercase tracking-[0.28em]">
						{t("intro.kicker", { name: guest.firstName })}
					</span>
				</p>
				<h1
					{...rise(
						2,
						"text-balance font-extrabold text-5xl text-neutral-12 leading-[0.92] tracking-[-0.04em] sm:text-7xl",
					)}
				>
					{t("intro.title", { name: event.avatarName })}
					<span className="text-primary-9">.</span>
				</h1>
				<p {...rise(3, "max-w-md text-pretty text-neutral-11 text-base sm:text-lg")}>
					{event.title}
					<span className="mt-1 block font-semibold text-neutral-12">
						{capitalize(event.dateLabel)} · {event.timeLabel}
					</span>
				</p>
			</div>

			<div {...rise(4, "grid justify-items-center gap-4")}>
				<button type="button" className={PRIMARY_CTA} onClick={() => onEnter(true)}>
					<Volume2Icon aria-hidden="true" />
					{t("intro.enter")}
				</button>
				<p className="text-neutral-9 text-xs">{t("intro.sound-hint")}</p>
				<button type="button" className={TEXT_LINK} onClick={() => onEnter(false)}>
					{t("intro.enter-muted")}
				</button>
			</div>

			<button
				type="button"
				className={cn(TEXT_LINK, "mt-auto text-xs")}
				onClick={onAnswerWithoutLeif}
			>
				{t("intro.without-leif", { name: event.avatarName })}
			</button>
		</div>
	);
}

type InvitationFarewellProps = {
	token: string;
	invitation: Invitation;
	onContinue: () => void;
	onAnswerWithoutLeif: () => void;
	children?: ReactNode;
};

/** Closing screen once the conversation is done. */
export function InvitationFarewell(props: InvitationFarewellProps) {
	const { token, invitation, onContinue, onAnswerWithoutLeif, children } = props;
	const { guest, event } = invitation;

	const { t } = useTranslation("features.inauguration.invitation.components.invitation-screens");

	const declined = guest.status === "declined";

	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-10 py-10 text-center">
			<div className="grid max-w-3xl justify-items-center gap-6">
				<p {...rise(0)}>
					<span className="font-bold text-primary-9 text-xs uppercase tracking-[0.28em]">
						{declined
							? t("farewell.kicker-declined")
							: t("farewell.kicker", { name: guest.firstName })}
					</span>
				</p>
				<h1
					{...rise(
						1,
						"text-balance font-extrabold text-6xl text-neutral-12 leading-[0.9] tracking-[-0.045em] sm:text-8xl",
					)}
				>
					{declined
						? t("farewell.title-declined", { name: guest.firstName })
						: t("farewell.title", { day: eventDayLabel(event) })}
					<span className="text-primary-9">.</span>
				</h1>
				<p {...rise(2, "max-w-md text-pretty text-neutral-11 text-base")}>
					{declined
						? t("farewell.description-declined")
						: guest.kind === "plus_one"
							? t("farewell.description-plus-one")
							: t("farewell.description")}
				</p>
			</div>

			{children}

			<div {...rise(3, "flex flex-wrap justify-center gap-3")}>
				{!declined && (
					<a
						href={invitationFileUrl("inauguration.invitations.calendar", token)}
						download="invitation.ics"
						className={SECONDARY_CTA}
					>
						<CalendarPlusIcon aria-hidden="true" />
						{t("farewell.calendar")}
					</a>
				)}
				<button type="button" className={SECONDARY_CTA} onClick={onContinue}>
					{t("farewell.continue", { name: event.avatarName })}
				</button>
			</div>
			<button type="button" className={cn(TEXT_LINK, "text-xs")} onClick={onAnswerWithoutLeif}>
				{t("farewell.edit")}
			</button>
		</div>
	);
}

/** Unknown or revoked token. */
export function InvitationNotFound() {
	const { t } = useTranslation("features.inauguration.invitation.components.invitation-screens");

	return (
		<StatusScreen
			kicker={t("not-found.kicker")}
			title={t("not-found.title")}
			description={t("not-found.description")}
		/>
	);
}

/** Network or server failure while loading the invitation. */
export function InvitationUnavailable(props: { onRetry: () => void }) {
	const { t } = useTranslation("features.inauguration.invitation.components.invitation-screens");

	return (
		<StatusScreen
			kicker={t("unavailable.kicker")}
			title={t("unavailable.title")}
			description={t("unavailable.description")}
		>
			<button type="button" className={SECONDARY_CTA} onClick={props.onRetry}>
				<RotateCcwIcon aria-hidden="true" />
				{t("unavailable.retry")}
			</button>
		</StatusScreen>
	);
}

export function InvitationLoading() {
	const { t } = useTranslation("features.inauguration.invitation.components.invitation-screens");

	return (
		<div role="status" className="flex flex-1 flex-col items-center justify-center gap-6">
			<DrakkarLogo size="lg" tone="paper" className="animate-halo motion-reduce:animate-none" />
			<span className="relative h-px w-32 overflow-hidden bg-neutral-5">
				<span className="absolute inset-0 animate-pulse bg-primary-9 motion-reduce:animate-none" />
			</span>
			<span className="sr-only">{t("loading")}</span>
		</div>
	);
}

function StatusScreen(props: {
	kicker: string;
	title: string;
	description: string;
	children?: ReactNode;
}) {
	const { kicker, title, description, children } = props;

	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-8 py-10 text-center">
			<div className="grid max-w-2xl justify-items-center gap-5">
				<p {...rise(0)}>
					<span className="font-bold text-primary-9 text-xs uppercase tracking-[0.28em]">
						{kicker}
					</span>
				</p>
				<h1
					{...rise(
						1,
						"text-balance font-extrabold text-5xl text-neutral-12 leading-[0.92] tracking-[-0.04em] sm:text-6xl",
					)}
				>
					{title}
				</h1>
				<p {...rise(2, "max-w-md text-pretty text-neutral-11")}>{description}</p>
			</div>
			{children}
		</div>
	);
}
