import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "tailwind-variants";

import {
	CalendarPlusIcon,
	ClockIcon,
	MapPinIcon,
	ShirtIcon,
	UserRoundIcon,
} from "@workspace/ui-react/icons";

import { capitalize, shortDateLabel } from "#/features/inauguration/invitation/utils/format";
import type { Invitation } from "#/features/inauguration/leif/types";
import { invitationFileUrl } from "#/features/inauguration/leif/utils/api";

type InvitationCardProps = {
	token: string;
	invitation: Invitation;
	/** Opens the form-based journey (no avatar). */
	onAnswerWithoutLeif?: () => void;
	className?: string;
};

/**
 * Always-available summary of the guest's invitation: answer, plus-one, practical details,
 * calendar file and their personal access QR code.
 */
export function InvitationCard(props: InvitationCardProps) {
	const { token, invitation, onAnswerWithoutLeif, className } = props;
	const { guest, host, plusOne, plusOneEditable, plusOneDeadline, event } = invitation;

	const { t } = useTranslation("features.inauguration.invitation.components.invitation-card");

	const isPlusOne = guest.kind === "plus_one";
	const hasAccess = guest.status === "confirmed";

	return (
		<section
			aria-labelledby="invitation-card-title"
			className={cn("flex flex-col gap-7", className)}
		>
			<header className="grid gap-3">
				<p className="font-bold text-primary-9 text-xs uppercase tracking-[0.24em]">
					{t("kicker")}
				</p>
				<h2
					id="invitation-card-title"
					className="text-balance font-extrabold text-3xl text-neutral-12 leading-none tracking-tight"
				>
					{guest.firstName} {guest.lastName}
				</h2>
				{guest.company && <p className="text-neutral-10 text-sm">{guest.company}</p>}
				<StatusPill status={guest.status} isPlusOne={isPlusOne}>
					{isPlusOne && host
						? t("status.plus-one", { name: `${host.firstName} ${host.lastName}` })
						: t(`status.${guest.status}`)}
				</StatusPill>
			</header>

			<dl className="grid gap-4 border-neutral-5 border-t pt-6 text-sm">
				<Detail icon={<ClockIcon />} label={t("details.when")}>
					{capitalize(event.dateLabel)}
					<span className="block text-neutral-10">{event.timeLabel}</span>
				</Detail>
				<Detail icon={<MapPinIcon />} label={t("details.where")}>
					{event.address.label}
					<span className="block text-neutral-10">{event.address.full}</span>
				</Detail>
				<Detail icon={<ShirtIcon />} label={t("details.dress-code")}>
					{event.dressCode}
				</Detail>
				{!isPlusOne && (
					<Detail icon={<UserRoundIcon />} label={t("details.plus-one")}>
						{plusOne ? (
							<>
								{plusOne.firstName} {plusOne.lastName}
								<span className="block text-neutral-10">{plusOne.email}</span>
							</>
						) : (
							<span className="text-neutral-11">{t("plus-one.none")}</span>
						)}
						{guest.status === "confirmed" && (
							<span className="mt-1 block text-neutral-9 text-xs">
								{plusOneEditable
									? t("plus-one.editable-until", {
											date: shortDateLabel(plusOneDeadline, event.timezone),
										})
									: t("plus-one.closed")}
							</span>
						)}
					</Detail>
				)}
			</dl>

			<details className="group border-neutral-5 border-t pt-5 text-sm">
				<summary className="flex cursor-pointer list-none items-center justify-between font-bold text-neutral-12 text-xs uppercase tracking-[0.2em] outline-none focus-visible:text-primary-11 [&::-webkit-details-marker]:hidden">
					{t("practical.title")}
					<span
						aria-hidden="true"
						className="text-lg text-primary-9 transition group-open:rotate-45"
					>
						+
					</span>
				</summary>
				<div className="grid gap-4 pt-4 text-neutral-11">
					<ol className="grid gap-2">
						{event.programme.map((item) => (
							<li key={`${item.time}-${item.label}`} className="flex gap-4">
								<span className="w-12 shrink-0 font-bold text-neutral-12 tabular-nums">
									{item.time}
								</span>
								<span>{item.label}</span>
							</li>
						))}
					</ol>
					<p>
						<span className="font-semibold text-neutral-12">{t("practical.access")} </span>
						{event.access}
					</p>
					<p>
						<span className="font-semibold text-neutral-12">{t("practical.parking")} </span>
						{event.parking}
					</p>
				</div>
			</details>

			{hasAccess && (
				<div className="flex items-center gap-4 rounded-2xl border border-neutral-5 bg-neutral-2/80 p-4">
					<img
						src={invitationFileUrl("inauguration.invitations.qr_code", token)}
						alt={t("qr.alt")}
						width={88}
						height={88}
						className="size-22 shrink-0 rounded-lg bg-white p-1.5"
					/>
					<div className="grid gap-1">
						<p className="font-bold text-neutral-12 text-sm">{t("qr.title")}</p>
						<p className="text-neutral-10 text-xs leading-relaxed">{t("qr.description")}</p>
					</div>
				</div>
			)}

			<div className="flex flex-col gap-3">
				<a
					href={invitationFileUrl("inauguration.invitations.calendar", token)}
					download="invitation.ics"
					className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-neutral-7 px-5 font-semibold text-neutral-12 text-sm outline-none transition hover:border-primary-9 hover:text-primary-11 focus-visible:ring-3 focus-visible:ring-primary-7 [&_svg]:size-4"
				>
					<CalendarPlusIcon aria-hidden="true" />
					{t("calendar")}
				</a>
				{onAnswerWithoutLeif && (
					<button
						type="button"
						onClick={onAnswerWithoutLeif}
						className="self-center rounded font-medium text-neutral-10 text-xs underline decoration-neutral-7 underline-offset-4 outline-none transition hover:text-neutral-12 focus-visible:ring-2 focus-visible:ring-primary-7"
					>
						{t("without-leif", { name: event.avatarName })}
					</button>
				)}
			</div>
		</section>
	);
}

function StatusPill(props: { status: string; isPlusOne: boolean; children: ReactNode }) {
	const { status, isPlusOne, children } = props;

	return (
		<p
			className={cn(
				"inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 font-semibold text-xs",
				status === "confirmed" || isPlusOne
					? "border-primary-7 text-primary-11"
					: status === "declined"
						? "border-neutral-6 text-neutral-10"
						: "border-neutral-7 text-neutral-11",
			)}
		>
			<span
				aria-hidden="true"
				className={cn(
					"size-1.5 rounded-full",
					status === "confirmed" || isPlusOne
						? "bg-primary-9"
						: status === "declined"
							? "bg-neutral-8"
							: "animate-halo bg-neutral-11 motion-reduce:animate-none",
				)}
			/>
			{children}
		</p>
	);
}

function Detail(props: { icon: ReactNode; label: string; children: ReactNode }) {
	const { icon, label, children } = props;

	return (
		<div className="flex gap-3">
			<span aria-hidden="true" className="mt-0.5 text-neutral-9 [&_svg]:size-4">
				{icon}
			</span>
			<div className="grid min-w-0 gap-0.5">
				<dt className="text-neutral-9 text-xs uppercase tracking-[0.16em]">{label}</dt>
				<dd className="text-pretty text-neutral-12">{children}</dd>
			</div>
		</div>
	);
}
