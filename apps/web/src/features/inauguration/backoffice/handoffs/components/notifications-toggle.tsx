import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@workspace/ui-react/components/button";
import { BellIcon, BellOffIcon, BellRingIcon } from "@workspace/ui-react/icons";

function currentPermission() {
	return typeof Notification === "undefined" ? "unsupported" : Notification.permission;
}

export function NotificationsToggle() {
	const { t } = useTranslation(
		"features.inauguration.backoffice.handoffs.components.notifications-toggle",
	);

	const [permission, setPermission] = useState(currentPermission);

	if (permission === "unsupported") return null;

	if (permission === "granted") {
		return (
			<p className="flex items-center gap-1.5 text-neutral-11 text-xs">
				<BellRingIcon className="size-4 text-success-9" />
				{t("granted")}
			</p>
		);
	}

	if (permission === "denied") {
		return (
			<p className="flex items-center gap-1.5 text-neutral-11 text-xs">
				<BellOffIcon className="size-4" />
				{t("denied")}
			</p>
		);
	}

	return (
		<Button onClick={async () => setPermission(await Notification.requestPermission())}>
			<BellIcon />
			{t("enable")}
		</Button>
	);
}
