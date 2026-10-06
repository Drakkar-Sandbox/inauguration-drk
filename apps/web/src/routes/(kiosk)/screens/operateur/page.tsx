import { createFileRoute } from "@tanstack/react-router";

import { KioskShell } from "#/features/inauguration/kiosk/components/kiosk-shell";
import { OperatorConsole } from "#/features/inauguration/kiosk/speech/components/operator-console";

export const Route = createFileRoute("/(kiosk)/screens/operateur/")({
	head: () => ({ meta: [{ title: "Console discours — Drakkar" }] }),
	component: Page,
});

function Page() {
	return (
		<KioskShell console>
			<OperatorConsole />
		</KioskShell>
	);
}
