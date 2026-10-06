import { useTranslation } from "react-i18next";
import { cn } from "tailwind-variants";

import type { Conversation } from "#/features/inauguration/backoffice/types";
import { formatTime } from "#/features/inauguration/backoffice/utils/format";

type ConversationTranscriptProps = {
	transcript: Conversation["transcript"];
};

export function ConversationTranscript(props: ConversationTranscriptProps) {
	const { transcript } = props;

	const { t } = useTranslation(
		"features.inauguration.backoffice.conversations.components.conversation-transcript",
	);

	if (transcript.length === 0) {
		return <p className="text-neutral-11 text-sm italic">{t("empty")}</p>;
	}

	return (
		<ol className="grid gap-3">
			{transcript.map((entry, index) => (
				<li
					// biome-ignore lint/suspicious/noArrayIndexKey: transcript entries are append-only and have no id
					key={index}
					className={cn("grid max-w-[80%] gap-1", {
						"justify-self-end text-end": entry.role === "guest",
						"justify-self-center text-center": entry.role === "system",
					})}
				>
					<span className="text-neutral-11 text-xs">
						{t(`role.${entry.role}`)} · {formatTime(entry.at)}
					</span>
					<p
						className={cn("whitespace-pre-line rounded-xl px-3 py-2 text-sm", {
							"bg-primary-3 text-primary-12": entry.role === "guest",
							"bg-neutral-3 text-neutral-12": entry.role === "avatar",
							"text-neutral-11 italic": entry.role === "system",
						})}
					>
						{entry.text}
					</p>
				</li>
			))}
		</ol>
	);
}
