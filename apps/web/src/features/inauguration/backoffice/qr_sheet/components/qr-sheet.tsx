import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { DrakkarLogo } from "@workspace/ui-react/components/drakkar-logo";

import type { GuestKind, QrSheetEntry } from "#/features/inauguration/backoffice/types";
import { fullName } from "#/features/inauguration/backoffice/utils/format";
import { inauguration } from "#/libs/tuyau";

// A4 portrait, 3 × 4 cards of 63 × 68 mm per page.
const PRINT_STYLES = `
@page { size: A4 portrait; margin: 10mm; }
@media print {
	html, body { background: white !important; }
}
`;

const CUT_MARKS = [
	"-top-px -left-px border-t border-l",
	"-top-px -right-px border-t border-r",
	"-bottom-px -left-px border-b border-l",
	"-bottom-px -right-px border-b border-r",
];

function QrCard(props: { entry: QrSheetEntry }) {
	const { entry } = props;

	const { t: tLabels } = useTranslation("features.inauguration.backoffice.labels");

	return (
		<article className="relative flex h-[68mm] break-inside-avoid flex-col items-center justify-between bg-white p-[4mm] text-center text-black">
			{CUT_MARKS.map((position) => (
				<span
					key={position}
					aria-hidden
					className={`absolute size-[4mm] border-black ${position}`}
				/>
			))}

			<DrakkarLogo size="sm" tone="current" />
			<img
				src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(entry.qrSvg)}`}
				alt={entry.url}
				className="size-[38mm]"
			/>
			<div className="grid w-full gap-0.5">
				<p className="truncate font-bold text-[11pt] leading-tight">{fullName(entry.guest)}</p>
				<p className="truncate text-[8pt] text-neutral-11 leading-tight">
					{entry.guest.kind === "plus_one"
						? tLabels("guest-kind.plus_one")
						: (entry.guest.company ?? " ")}
				</p>
			</div>
		</article>
	);
}

type QrSheetProps = {
	kind?: GuestKind;
};

export function QrSheet(props: QrSheetProps) {
	const { kind } = props;

	const { t } = useTranslation("features.inauguration.backoffice.qr_sheet.components.qr-sheet");

	const { data: entries } = useSuspenseQuery(
		inauguration.backoffice.guests.qrSheet.queryOptions({ query: { kind } }),
	);

	if (entries.length === 0) {
		return (
			<p className="rounded-lg border border-neutral-6 border-dashed p-8 text-center text-neutral-11 text-sm">
				{t("empty")}
			</p>
		);
	}

	return (
		<>
			<style>{PRINT_STYLES}</style>
			<div className="mx-auto w-[190mm] bg-white shadow-lg print:w-full print:shadow-none">
				<div className="grid grid-cols-3">
					{entries.map((entry) => (
						<QrCard key={entry.guest.id} entry={entry} />
					))}
				</div>
			</div>
		</>
	);
}
