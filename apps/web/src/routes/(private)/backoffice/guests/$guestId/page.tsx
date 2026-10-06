import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { Button } from "@workspace/ui-react/components/button";
import { Card } from "@workspace/ui-react/components/card";
import { ArrowLeftIcon, Trash2Icon } from "@workspace/ui-react/icons";

import { Badge, HandoffStatusBadge } from "#/features/inauguration/backoffice/components/badges";
import { PageHeader } from "#/features/inauguration/backoffice/components/page-header";
import { ConversationSummary } from "#/features/inauguration/backoffice/conversations/components/conversation-summary";
import { DeleteGuestDialog } from "#/features/inauguration/backoffice/guests/components/delete-guest-dialog";
import { GuestAngleForm } from "#/features/inauguration/backoffice/guests/components/guest-angle-form";
import { GuestIdentityForm } from "#/features/inauguration/backoffice/guests/components/guest-identity-form";
import { GuestOverviewCard } from "#/features/inauguration/backoffice/guests/components/guest-overview-card";
import { GuestQrCard } from "#/features/inauguration/backoffice/guests/components/guest-qr-card";
import { HandoffActions } from "#/features/inauguration/backoffice/handoffs/components/handoff-actions";
import { formatDateTime, fullName } from "#/features/inauguration/backoffice/utils/format";
import { inauguration } from "#/libs/tuyau";

export const Route = createFileRoute("/(private)/backoffice/guests/$guestId/")({
	component: Page,
});

function Page() {
	const { t } = useTranslation("routes.(private).backoffice.guests.$guestId");
	const { t: tLabels } = useTranslation("features.inauguration.backoffice.labels");

	const { guestId } = Route.useParams();
	const id = Number(guestId);

	const { data: guest } = useSuspenseQuery(
		inauguration.backoffice.guests.view.queryOptions({ params: { id } }),
	);

	return (
		<main className="mx-auto grid max-w-7xl gap-6">
			<Link
				to="/backoffice/guests"
				className="flex w-fit items-center gap-1 text-neutral-11 text-sm hover:text-neutral-12"
			>
				<ArrowLeftIcon className="size-4" />
				{t("back")}
			</Link>

			<PageHeader
				title={fullName(guest)}
				description={
					guest.host
						? t("plus-one-of", { name: fullName(guest.host) })
						: (guest.company ?? undefined)
				}
				actions={
					<DeleteGuestDialog
						guestId={guest.id}
						name={fullName(guest) ?? ""}
						trigger={
							<Button variant="destructive">
								<Trash2Icon />
								{t("action.delete")}
							</Button>
						}
					/>
				}
			/>

			<div className="grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
				<div className="grid gap-6">
					<GuestIdentityForm
						key={`identity-${guest.id}`}
						guestId={guest.id}
						defaultValues={{
							firstName: guest.firstName,
							lastName: guest.lastName,
							email: guest.email ?? "",
							company: guest.company ?? "",
							status: guest.status,
						}}
					/>

					<GuestAngleForm
						key={`angle-${guest.id}`}
						guestId={guest.id}
						defaultValues={{
							angleTopic: guest.angleTopic ?? "",
							angleNotes: guest.angleNotes ?? "",
							referentUserId: guest.referentUserId,
							meetingStatus: guest.meetingStatus,
						}}
					/>

					<Card>
						<Card.Header>
							<h2 className="font-semibold text-md text-neutral-12">
								{t("handoffs.title", { count: guest.handoffs.length })}
							</h2>
						</Card.Header>
						<Card.Content className="grid gap-3">
							{guest.handoffs.length === 0 && (
								<p className="text-neutral-11 text-sm">{t("handoffs.empty")}</p>
							)}
							{guest.handoffs.map((handoff) => (
								<div
									key={handoff.id}
									className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-6 p-3"
								>
									<div className="grid gap-1">
										<div className="flex items-center gap-2">
											<HandoffStatusBadge status={handoff.status} />
											<span className="text-neutral-11 text-xs">
												{formatDateTime(handoff.createdAt)}
												{handoff.referent && ` · ${handoff.referent.name}`}
											</span>
										</div>
										<p className="text-neutral-12 text-sm">{handoff.reason}</p>
									</div>
									<HandoffActions handoff={handoff} />
								</div>
							))}
						</Card.Content>
					</Card>

					<Card>
						<Card.Header>
							<h2 className="font-semibold text-md text-neutral-12">
								{t("conversations.title", { count: guest.conversations.length })}
							</h2>
						</Card.Header>
						<Card.Content className="grid gap-4">
							{guest.conversations.length === 0 && (
								<p className="text-neutral-11 text-sm">{t("conversations.empty")}</p>
							)}
							{guest.conversations.map((conversation) => (
								<div
									key={conversation.id}
									className="grid gap-3 rounded-lg border border-neutral-6 p-4"
								>
									<div className="flex items-center justify-between gap-3">
										<div className="flex items-center gap-2">
											<Badge>{tLabels(`channel.${conversation.channel}`)}</Badge>
											<span className="text-neutral-11 text-xs">
												{formatDateTime(conversation.startedAt)}
											</span>
										</div>
										<Link
											to="/backoffice/conversations/$conversationId"
											params={{ conversationId: String(conversation.id) }}
											className="text-primary-11 text-sm hover:underline"
										>
											{t("conversations.transcript")}
										</Link>
									</div>
									<ConversationSummary summary={conversation.summary} />
								</div>
							))}
						</Card.Content>
					</Card>
				</div>

				<aside className="grid gap-6">
					<GuestOverviewCard guest={guest} />
					<GuestQrCard guestId={guest.id} invitationUrl={guest.qrUrl} />
				</aside>
			</div>
		</main>
	);
}
