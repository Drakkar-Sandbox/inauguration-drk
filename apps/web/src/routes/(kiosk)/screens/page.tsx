import { createFileRoute } from "@tanstack/react-router";

import { KioskShell } from "#/features/inauguration/kiosk/components/kiosk-shell";
import { ScreenPicker } from "#/features/inauguration/kiosk/components/screen-picker";

export const Route = createFileRoute("/(kiosk)/screens/")({
	head: () => ({ meta: [{ title: "Écrans — Drakkar" }] }),
	component: Page,
});

function Page() {
	return (
		<KioskShell console>
			<ScreenPicker />
		</KioskShell>
	);
}
