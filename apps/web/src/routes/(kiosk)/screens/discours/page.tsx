import { createFileRoute } from "@tanstack/react-router";

import { KioskShell } from "#/features/inauguration/kiosk/components/kiosk-shell";
import { SpeechScreen } from "#/features/inauguration/kiosk/speech/components/speech-screen";

export const Route = createFileRoute("/(kiosk)/screens/discours/")({
	head: () => ({ meta: [{ title: "Discours — Drakkar" }] }),
	component: Page,
});

function Page() {
	return (
		<KioskShell>
			<SpeechScreen />
		</KioskShell>
	);
}
