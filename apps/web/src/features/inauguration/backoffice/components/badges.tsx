import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { tv, type VariantProps } from "tailwind-variants";

import type {
	GuestStatus,
	HandoffStatus,
	MeetingStatus,
} from "#/features/inauguration/backoffice/types";

const badgeVariants = tv({
	base: "inline-flex h-6 w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2 font-medium text-xs [&_svg]:size-3.5",
	variants: {
		tone: {
			neutral: "border-neutral-6 bg-neutral-3 text-neutral-11",
			primary: "border-primary-6 bg-primary-3 text-primary-11",
			success: "border-success-6 bg-success-3 text-success-11",
			warning: "border-warning-6 bg-warning-3 text-warning-11",
			error: "border-error-6 bg-error-3 text-error-11",
			info: "border-info-6 bg-info-3 text-info-11",
		},
	},
	defaultVariants: {
		tone: "neutral",
	},
});

type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>;

type BadgeProps = VariantProps<typeof badgeVariants> & ComponentProps<"span">;

export function Badge(props: BadgeProps) {
	const { tone, className, ...rest } = props;

	return <span className={badgeVariants({ tone, className })} {...rest} />;
}

const GUEST_STATUS_TONES: Record<GuestStatus, BadgeTone> = {
	invited: "neutral",
	confirmed: "success",
	declined: "error",
};

export function GuestStatusBadge(props: { status: GuestStatus; checkedIn?: boolean }) {
	const { status, checkedIn } = props;

	const { t } = useTranslation("features.inauguration.backoffice.labels");

	if (checkedIn) {
		return <Badge tone="primary">{t("checked-in")}</Badge>;
	}

	return <Badge tone={GUEST_STATUS_TONES[status]}>{t(`guest-status.${status}`)}</Badge>;
}

const MEETING_STATUS_TONES: Record<MeetingStatus, BadgeTone> = {
	none: "neutral",
	to_propose: "warning",
	proposed: "info",
	held: "success",
	mission: "primary",
};

export function MeetingStatusBadge(props: { status: MeetingStatus }) {
	const { status } = props;

	const { t } = useTranslation("features.inauguration.backoffice.labels");

	return <Badge tone={MEETING_STATUS_TONES[status]}>{t(`meeting-status.${status}`)}</Badge>;
}

const HANDOFF_STATUS_TONES: Record<HandoffStatus, BadgeTone> = {
	pending: "primary",
	seen: "warning",
	done: "success",
};

export function HandoffStatusBadge(props: { status: HandoffStatus }) {
	const { status } = props;

	const { t } = useTranslation("features.inauguration.backoffice.labels");

	return <Badge tone={HANDOFF_STATUS_TONES[status]}>{t(`handoff-status.${status}`)}</Badge>;
}

const INTEREST_TONES: Record<"low" | "medium" | "high", BadgeTone> = {
	low: "neutral",
	medium: "info",
	high: "success",
};

export function InterestBadge(props: { level: "low" | "medium" | "high" }) {
	const { level } = props;

	const { t } = useTranslation("features.inauguration.backoffice.labels");

	return <Badge tone={INTEREST_TONES[level]}>{t(`interest.${level}`)}</Badge>;
}
