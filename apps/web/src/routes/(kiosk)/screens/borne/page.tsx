import { createFileRoute } from "@tanstack/react-router";

import { ChallengeScreen } from "#/features/inauguration/kiosk/challenge/components/challenge-screen";
import { KioskShell } from "#/features/inauguration/kiosk/components/kiosk-shell";

export const Route = createFileRoute("/(kiosk)/screens/borne/")({
	head: () => ({ meta: [{ title: "Borne — Drakkar" }] }),
	component: Page,
});

function Page() {
	return (
		<KioskShell>
			<ChallengeScreen />
		</KioskShell>
	);
}
