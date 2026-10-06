import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { toast } from "@workspace/ui-react/components/toast";

import { fullName } from "#/features/inauguration/backoffice/utils/format";
import { inauguration } from "#/libs/tuyau";

const POLL_INTERVAL = 5_000;

/**
 * Polls the pending handoffs assigned to the current user and notifies (toast + browser
 * notification when granted) every time a new one shows up. Mount it once, in the app shell.
 */
export function usePendingHandoffsWatcher() {
	const { t } = useTranslation("features.inauguration.backoffice.handoffs.hooks.watcher");

	const navigate = useNavigate();
	const knownIds = useRef<Set<number> | null>(null);

	const { data: handoffs } = useQuery(
		inauguration.backoffice.handoffs.list.queryOptions(
			{ query: { status: "pending", mine: true } },
			{ refetchInterval: POLL_INTERVAL, refetchIntervalInBackground: true },
		),
	);

	useEffect(() => {
		if (!handoffs) return;

		const previous = knownIds.current;
		knownIds.current = new Set(handoffs.map((handoff) => handoff.id));

		// First load seeds the known ids: only handoffs appearing afterwards are notified.
		if (!previous) return;

		for (const handoff of handoffs) {
			if (previous.has(handoff.id)) continue;

			const title = t("title", { name: fullName(handoff.guest) ?? t("unknown-guest") });
			const open = () => navigate({ to: "/backoffice/handoffs" });

			toast.info(title, {
				description: handoff.reason,
				duration: 15_000,
				action: { label: t("action.open"), onClick: open },
			});

			if (typeof Notification !== "undefined" && Notification.permission === "granted") {
				const notification = new Notification(title, {
					body: handoff.reason,
					tag: `handoff-${handoff.id}`,
				});
				notification.onclick = () => {
					window.focus();
					open();
				};
			}
		}
	}, [handoffs, navigate, t]);

	return { pendingCount: handoffs?.length ?? 0 };
}
