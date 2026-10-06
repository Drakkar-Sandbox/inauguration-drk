import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "tailwind-variants";

import { ArrowLeftIcon, CheckIcon } from "@workspace/ui-react/icons";

import { PlusOneForm } from "#/features/inauguration/invitation/components/plus-one-form";
import { useInvitationMutations } from "#/features/inauguration/invitation/hooks/use-invitation-mutations";
import { shortDateLabel } from "#/features/inauguration/invitation/utils/format";
import type { Invitation } from "#/features/inauguration/leif/types";
import { errorCode, errorStatus } from "#/features/inauguration/leif/utils/api";

type InvitationFormProps = {
	token: string;
	invitation: Invitation;
	onBack: () => void;
};

/**
 * Accessible journey without the avatar: the same answers as the conversation, as a plain form.
 */
export function InvitationForm(props: InvitationFormProps) {
	const { token, invitation, onBack } = props;
	const { guest, plusOne, plusOneEditable, plusOneDeadline, event } = invitation;

	const { t } = useTranslation("features.inauguration.invitation.components.invitation-form");

	const { consent, respond, updatePlusOne, deletePlusOne } = useInvitationMutations(token);
	const [feedback, setFeedback] = useState<{ section: string; message: string } | null>(null);

	const run = async (section: string, action: () => Promise<unknown>, success: string) => {
		setFeedback(null);
		try {
			await action();
			setFeedback({ section, message: success });
		} catch (error) {
			const status = errorStatus(error);
			setFeedback({
				section,
				message:
					errorCode(error) === "E_PLUS_ONE_CHANGE_LIMIT"
						? t("error.change-limit")
						: status === 403
							? t("error.closed")
							: status === 422
								? t("error.invalid")
								: t("error.generic"),
			});
		}
	};

	const isPrimary = guest.kind === "primary";
	const busy =
		consent.isPending || respond.isPending || updatePlusOne.isPending || deletePlusOne.isPending;

	return (
		<div className="mx-auto grid w-full max-w-2xl gap-10 py-6">
			<header className="grid gap-4">
				<button
					type="button"
					onClick={onBack}
					className="inline-flex w-fit items-center gap-2 rounded-full font-semibold text-neutral-11 text-sm outline-none transition hover:text-neutral-12 focus-visible:ring-3 focus-visible:ring-primary-7 [&_svg]:size-4"
				>
					<ArrowLeftIcon aria-hidden="true" />
					{t("back", { name: event.avatarName })}
				</button>
				<p className="font-pixel font-semibold text-base text-primary-9 uppercase leading-none tracking-[0.12em]">
					{t("kicker")}
				</p>
				<h1 className="text-balance font-extrabold text-4xl text-neutral-12 leading-[0.95] tracking-tight sm:text-5xl">
					{t("title", { name: guest.firstName })}
				</h1>
			</header>

			<Section
				index={1}
				title={t("consent.title")}
				feedback={feedback?.section === "consent" ? feedback.message : null}
			>
				<p className="text-pretty font-text text-neutral-11 text-sm leading-relaxed">
					{event.dataPolicy}
				</p>
				<Options
					label={t("consent.title")}
					disabled={busy}
					value={guest.consent}
					options={[
						{ value: "given", label: t("consent.yes") },
						{ value: "refused", label: t("consent.no") },
					]}
					onChange={(value) =>
						run(
							"consent",
							() => consent.mutateAsync({ params: { token }, body: { given: value === "given" } }),
							t("saved"),
						)
					}
				/>
			</Section>

			{isPrimary && (
				<Section
					index={2}
					title={t("rsvp.title", { date: event.dateLabel })}
					feedback={feedback?.section === "rsvp" ? feedback.message : null}
				>
					<Options
						label={t("rsvp.title", { date: event.dateLabel })}
						disabled={busy}
						value={guest.status}
						options={[
							{ value: "confirmed", label: t("rsvp.yes") },
							{ value: "declined", label: t("rsvp.no") },
						]}
						onChange={(value) =>
							run(
								"rsvp",
								() =>
									respond.mutateAsync({
										params: { token },
										body: { response: value as "confirmed" | "declined" },
									}),
								value === "confirmed" ? t("rsvp.confirmed") : t("rsvp.declined"),
							)
						}
					/>
				</Section>
			)}

			{isPrimary && guest.status === "confirmed" && (
				<Section
					index={3}
					title={t("plus-one.title")}
					feedback={feedback?.section === "plus-one" ? feedback.message : null}
				>
					{plusOneEditable ? (
						<>
							<p className="font-text text-neutral-11 text-sm">
								{t("plus-one.description", {
									date: shortDateLabel(plusOneDeadline, event.timezone),
								})}
							</p>
							<PlusOneForm
								key={plusOne?.email ?? "new"}
								defaultValues={plusOne && { ...plusOne, email: plusOne.email ?? "" }}
								disabled={busy}
								submitLabel={plusOne ? t("plus-one.update") : t("plus-one.add")}
								onSubmit={(values) =>
									run(
										"plus-one",
										() => updatePlusOne.mutateAsync({ params: { token }, body: values }),
										t("plus-one.saved", { name: values.firstName }),
									)
								}
								actions={
									plusOne && (
										<button
											type="button"
											disabled={busy}
											onClick={() =>
												run(
													"plus-one",
													() => deletePlusOne.mutateAsync({ params: { token } }),
													t("plus-one.removed"),
												)
											}
											className="h-11 rounded-full px-4 font-semibold text-neutral-11 text-sm outline-none transition hover:text-neutral-12 focus-visible:ring-3 focus-visible:ring-primary-7 disabled:opacity-50"
										>
											{t("plus-one.remove")}
										</button>
									)
								}
							/>
						</>
					) : (
						<p className="font-text text-neutral-11 text-sm">
							{plusOne
								? t("plus-one.locked-with", { name: `${plusOne.firstName} ${plusOne.lastName}` })
								: t("plus-one.locked")}
						</p>
					)}
				</Section>
			)}
		</div>
	);
}

function Section(props: {
	index: number;
	title: string;
	feedback: string | null;
	children: ReactNode;
}) {
	const { index, title, feedback, children } = props;

	return (
		<section className="grid gap-5 border-neutral-5 border-t pt-8">
			<div className="flex items-baseline gap-4">
				<span className="font-bold text-primary-9 text-sm tabular-nums">
					{String(index).padStart(2, "0")}
				</span>
				<h2 className="text-balance font-extrabold text-2xl text-neutral-12 tracking-tight">
					{title}
				</h2>
			</div>
			{children}
			<p role="status" className="min-h-5 text-neutral-11 text-sm">
				{feedback}
			</p>
		</section>
	);
}

type OptionsProps = {
	label: string;
	value: string;
	options: { value: string; label: string }[];
	disabled: boolean;
	onChange: (value: string) => void;
};

function Options(props: OptionsProps) {
	const { label, value, options, disabled, onChange } = props;

	return (
		<div role="radiogroup" aria-label={label} className="grid gap-3 sm:grid-cols-2">
			{options.map((option) => {
				const selected = option.value === value;
				return (
					// biome-ignore lint/a11y/useSemanticElements: styled radio cards
					<button
						key={option.value}
						type="button"
						role="radio"
						aria-checked={selected}
						disabled={disabled}
						onClick={() => !selected && onChange(option.value)}
						className={cn(
							"flex min-h-14 items-center justify-between gap-3 rounded-2xl border px-5 text-left font-semibold outline-none transition focus-visible:ring-3 focus-visible:ring-primary-7 disabled:opacity-60 [&_svg]:size-4",
							selected
								? "border-primary-9 bg-primary-9/10 text-neutral-12"
								: "border-neutral-6 text-neutral-11 hover:border-neutral-8 hover:text-neutral-12",
						)}
					>
						{option.label}
						<span
							aria-hidden="true"
							className={cn(
								"grid size-6 place-items-center rounded-full border transition",
								selected
									? "border-primary-9 bg-primary-9 text-white"
									: "border-neutral-7 text-transparent",
							)}
						>
							<CheckIcon />
						</span>
					</button>
				);
			})}
		</div>
	);
}
