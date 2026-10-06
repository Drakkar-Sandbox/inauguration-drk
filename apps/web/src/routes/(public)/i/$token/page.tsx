import { createFileRoute } from "@tanstack/react-router";

import { InvitationExperience } from "#/features/inauguration/invitation/components/invitation-experience";

export const Route = createFileRoute("/(public)/i/$token/")({
	head: () => ({
		meta: [
			{ title: "Votre invitation — Drakkar" },
			{ name: "theme-color", content: "#0b0c0f" },
			{ name: "robots", content: "noindex, nofollow" },
		],
	}),
	component: Page,
});

function Page() {
	const { token } = Route.useParams();

	return <InvitationExperience token={token} />;
}
