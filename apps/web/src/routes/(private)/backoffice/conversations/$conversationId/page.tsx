import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { Card } from "@workspace/ui-react/components/card";
import { ArrowLeftIcon } from "@workspace/ui-react/icons";

import { Badge, HandoffStatusBadge } from "#/features/inauguration/backoffice/components/badges";
import { PageHeader } from "#/features/inauguration/backoffice/components/page-header";
import { ConversationSummary } from "#/features/inauguration/backoffice/conversations/components/conversation-summary";
import { ConversationTranscript } from "#/features/inauguration/backoffice/conversations/components/conversation-transcript";
import { HandoffActions } from "#/features/inauguration/backoffice/handoffs/components/handoff-actions";
import { formatDateTime, fullName } from "#/features/inauguration/backoffice/utils/format";
import { inauguration } from "#/libs/tuyau";

export const Route = createFileRoute("/(private)/backoffice/conversations/$conversationId/")({
	component: Page,
});

function Page() {
	const { t } = useTranslation("routes.(private).backoffice.conversations.$conversationId");
	const { t: tLabels } = useTranslation("features.inauguration.backoffice.labels");

	const { conversationId } = Route.useParams();

	const { data: conversation } = useSuspenseQuery(
		inauguration.backoffice.conversations.view.queryOptions({
			params: { id: Number(conversationId) },
		}),
	);

	return (
		<main className="mx-auto grid max-w-6xl gap-6">
			<Link
				to="/backoffice/conversations"
				className="flex w-fit items-center gap-1 text-neutral-11 text-sm hover:text-neutral-12"
			>
				<ArrowLeftIcon className="size-4" />
				{t("back")}
			</Link>

			<PageHeader
				title={fullName(conversation.guest) ?? t("anonymous")}
				description={
					<span className="flex items-center gap-2">
						<Badge>{tLabels(`channel.${conversation.channel}`)}</Badge>
						{formatDateTime(conversation.startedAt)}
						{conversation.guest?.company && ` · ${conversation.guest.company}`}
					</span>
				}
				actions={
					conversation.guest && (
						<Link
							to="/backoffice/guests/$guestId"
							params={{ guestId: String(conversation.guest.id) }}
							className="text-primary-11 text-sm hover:underline"
						>
							{t("guest")}
						</Link>
					)
				}
			/>

			<div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
				<Card>
					<Card.Header>
						<h2 className="font-semibold text-md text-neutral-12">{t("transcript")}</h2>
					</Card.Header>
					<Card.Content>
						<ConversationTranscript transcript={conversation.transcript} />
					</Card.Content>
				</Card>

				<aside className="grid gap-6">
					<Card>
						<Card.Header>
							<h2 className="font-semibold text-md text-neutral-12">{t("summary")}</h2>
						</Card.Header>
						<Card.Content>
							<ConversationSummary summary={conversation.summary} />
						</Card.Content>
					</Card>

					{conversation.handoffs.length > 0 && (
						<Card>
							<Card.Header>
								<h2 className="font-semibold text-md text-neutral-12">{t("handoffs")}</h2>
							</Card.Header>
							<Card.Content className="grid gap-3">
								{conversation.handoffs.map((handoff) => (
									<div key={handoff.id} className="grid gap-2">
										<div className="flex items-center gap-2">
											<HandoffStatusBadge status={handoff.status} />
											<span className="text-neutral-11 text-xs">{handoff.referent?.name}</span>
										</div>
										<p className="text-neutral-12 text-sm">{handoff.reason}</p>
										<HandoffActions handoff={handoff} />
									</div>
								))}
							</Card.Content>
						</Card>
					)}
				</aside>
			</div>
		</main>
	);
}
