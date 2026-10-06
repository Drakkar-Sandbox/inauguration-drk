import { useDebouncedCallback } from "@tanstack/react-pacer";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "tailwind-variants";

import { DialogHeadless } from "@workspace/ui-react/components/dialog";
import { CheckIcon, SearchIcon, UsersRoundIcon, XIcon } from "@workspace/ui-react/icons";

import type { KioskGuest } from "#/features/inauguration/leif/types";
import { inauguration } from "#/libs/tuyau";

type CheckinDrawerProps = {
	/** Runs the same welcome as a scanned QR code. */
	onCheckin: (guest: KioskGuest) => void;
	className?: string;
};

/**
 * Host-only drawer for guests arriving without their QR code: search by name, then welcome them
 * exactly as if they had scanned it.
 */
export function CheckinDrawer(props: CheckinDrawerProps) {
	const { onCheckin, className } = props;

	const { t } = useTranslation("features.inauguration.kiosk.components.checkin-drawer");

	const [open, setOpen] = useState(false);
	const [input, setInput] = useState("");
	const [query, setQuery] = useState("");
	const updateQuery = useDebouncedCallback(setQuery, { wait: 250 });

	const { data: guests, isFetching } = useQuery(
		inauguration.kiosk.search.queryOptions(
			{ query: { q: query } },
			{ enabled: open && query.length >= 2, staleTime: 5_000 },
		),
	);

	const close = () => {
		setOpen(false);
		setInput("");
		setQuery("");
	};

	return (
		<DialogHeadless.Root open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
			<DialogHeadless.Trigger
				aria-label={t("open")}
				className={cn(
					"grid size-12 place-items-center rounded-full border border-neutral-5 text-neutral-9 opacity-60 outline-none transition hover:text-neutral-12 hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-3 focus-visible:ring-primary-7 [&_svg]:size-5",
					className,
				)}
			>
				<UsersRoundIcon aria-hidden="true" />
			</DialogHeadless.Trigger>
			<DialogHeadless.Portal>
				<DialogHeadless.Backdrop className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0" />
				<DialogHeadless.Popup className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col gap-6 border-neutral-6 border-l bg-neutral-2 p-8 text-neutral-12 transition duration-300 data-ending-style:translate-x-full data-starting-style:translate-x-full">
					<header className="flex items-start justify-between gap-4">
						<div className="grid gap-2">
							<p className="font-pixel font-semibold text-base text-primary-9 uppercase leading-none tracking-[0.12em]">
								{t("kicker")}
							</p>
							<DialogHeadless.Title className="font-extrabold text-3xl tracking-tight">
								{t("title")}
							</DialogHeadless.Title>
						</div>
						<DialogHeadless.Close
							aria-label={t("close")}
							className="grid size-10 place-items-center rounded-full text-neutral-11 outline-none hover:bg-neutral-4 focus-visible:ring-3 focus-visible:ring-primary-7 [&_svg]:size-5"
						>
							<XIcon aria-hidden="true" />
						</DialogHeadless.Close>
					</header>

					<label className="relative block">
						<span className="sr-only">{t("search")}</span>
						<SearchIcon
							aria-hidden="true"
							className="absolute top-1/2 left-5 size-5 -translate-y-1/2 text-neutral-9"
						/>
						<input
							value={input}
							onChange={(event) => {
								setInput(event.target.value);
								updateQuery(event.target.value.trim());
							}}
							placeholder={t("search")}
							autoComplete="off"
							className="h-14 w-full rounded-2xl border border-neutral-6 bg-neutral-1 pr-5 pl-14 text-lg outline-none transition placeholder:text-neutral-9 focus:border-primary-8 focus-visible:ring-3 focus-visible:ring-primary-7/40"
						/>
					</label>

					<ul
						className="-mx-2 grid flex-1 content-start gap-1 overflow-y-auto"
						aria-busy={isFetching}
					>
						{query.length >= 2 && guests?.length === 0 && (
							<li className="px-2 py-6 text-neutral-10">{t("empty")}</li>
						)}
						{guests?.map((guest) => (
							<li key={guest.id}>
								<button
									type="button"
									onClick={() => {
										close();
										onCheckin(guest);
									}}
									className="flex w-full items-center justify-between gap-4 rounded-xl px-4 py-3 text-left outline-none transition hover:bg-neutral-4 focus-visible:ring-3 focus-visible:ring-primary-7"
								>
									<span className="grid min-w-0 gap-0.5">
										<span className="truncate font-bold text-lg">
											{guest.firstName} {guest.lastName}
										</span>
										<span className="truncate text-neutral-10 text-sm">
											{guest.kind === "plus_one" && guest.hostFirstName
												? t("plus-one-of", {
														name: `${guest.hostFirstName} ${guest.hostLastName ?? ""}`.trim(),
													})
												: (guest.company ?? t(`status.${guest.status}`))}
										</span>
									</span>
									{guest.checkedInAt ? (
										<span className="inline-flex shrink-0 items-center gap-1.5 text-primary-11 text-sm [&_svg]:size-4">
											<CheckIcon aria-hidden="true" />
											{t("arrived")}
										</span>
									) : (
										<span className="shrink-0 rounded-full bg-primary-9 px-4 py-2 font-semibold text-sm text-white">
											{t("checkin")}
										</span>
									)}
								</button>
							</li>
						))}
					</ul>
				</DialogHeadless.Popup>
			</DialogHeadless.Portal>
		</DialogHeadless.Root>
	);
}
