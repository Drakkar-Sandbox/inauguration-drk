import { createFileRoute } from "@tanstack/react-router";

import { KioskShell } from "#/features/inauguration/kiosk/components/kiosk-shell";
import { ReceptionScreen } from "#/features/inauguration/kiosk/reception/components/reception-screen";

export const Route = createFileRoute("/(kiosk)/screens/accueil/")({
	head: () => ({ meta: [{ title: "Accueil — Drakkar" }] }),
	component: Page,
});

function Page() {
	return (
		<KioskShell>
			<ReceptionScreen />
		</KioskShell>
	);
}
