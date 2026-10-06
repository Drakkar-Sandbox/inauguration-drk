import { useDebouncedCallback } from "@tanstack/react-pacer";
import { keepPreviousData, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";

import { Input } from "@workspace/ui-react/components/input";
import { Skeleton } from "@workspace/ui-react/components/skeleton";
import { Table } from "@workspace/ui-react/components/table";
import { CornerDownRightIcon, SearchIcon } from "@workspace/ui-react/icons";

import {
	Badge,
	GuestStatusBadge,
	MeetingStatusBadge,
} from "#/features/inauguration/backoffice/components/badges";
import { FilterSelect } from "#/features/inauguration/backoffice/components/filter-select";
import { Pagination } from "#/features/inauguration/backoffice/components/pagination";
import {
	GUEST_KINDS,
	GUEST_STATUSES,
	type GuestKind,
	type GuestListItem,
	type GuestStatus,
} from "#/features/inauguration/backoffice/types";
import { formatTime, fullName } from "#/features/inauguration/backoffice/utils/format";
import { inauguration } from "#/libs/tuyau";

const PER_PAGE = 50;

export type GuestsFilters = {
	status?: GuestStatus;
	kind?: GuestKind;
	checkedIn?: "yes" | "no";
	referent?: number;
	search?: string;
	page?: number;
};

type GuestsTableProps = {
	filters: GuestsFilters;
	onFiltersChange: (filters: GuestsFilters) => void;
};

export function GuestsTable(props: GuestsTableProps) {
	const { filters, onFiltersChange } = props;

	const { t } = useTranslation("features.inauguration.backoffice.guests.components.guests-table");
	const { t: tLabels } = useTranslation("features.inauguration.backoffice.labels");

	const { data: staff } = useSuspenseQuery(inauguration.backoffice.staff.list.queryOptions());

	// Without kind filter, list primary guests and nest each +1 under its host.
	const nested = !filters.kind;

	const { data: guests, isFetching } = useQuery(
		inauguration.backoffice.guests.list.queryOptions(
			{
				query: {
					status: filters.status,
					kind: filters.kind ?? "primary",
					checkedIn: filters.checkedIn ? filters.checkedIn === "yes" : undefined,
					referentUserId: filters.referent,
					search: filters.search || undefined,
					page: filters.page,
					perPage: PER_PAGE,
				},
			},
			{ placeholderData: keepPreviousData, refetchInterval: 15_000 },
		),
	);

	const setFilter = (patch: GuestsFilters) =>
		onFiltersChange({ ...filters, ...patch, page: undefined });
	const setSearch = useDebouncedCallback(
		(search: string) => setFilter({ search: search || undefined }),
		{ wait: 300 },
	);

	return (
		<div className="grid gap-4">
			<div className="flex flex-wrap items-center gap-2">
				<Input
					type="search"
					className="w-72"
					placeholder={t("filters.search")}
					leftSlot={<SearchIcon className="mx-1 size-4 text-neutral-11" />}
					defaultValue={filters.search}
					onValueChange={setSearch}
				/>
				<FilterSelect
					label={t("filters.status")}
					allLabel={tLabels("all")}
					value={filters.status}
					options={GUEST_STATUSES.map((status) => ({
						value: status,
						label: tLabels(`guest-status.${status}`),
					}))}
					onValueChange={(status) => setFilter({ status })}
				/>
				<FilterSelect
					label={t("filters.kind")}
					allLabel={t("filters.kind-nested")}
					value={filters.kind}
					options={GUEST_KINDS.map((kind) => ({
						value: kind,
						label: tLabels(`guest-kind.${kind}`),
					}))}
					onValueChange={(kind) => setFilter({ kind })}
				/>
				<FilterSelect
					label={t("filters.checked-in")}
					allLabel={tLabels("all")}
					value={filters.checkedIn}
					options={[
						{ value: "yes" as const, label: t("filters.checked-in-yes") },
						{ value: "no" as const, label: t("filters.checked-in-no") },
					]}
					onValueChange={(checkedIn) => setFilter({ checkedIn })}
				/>
				<FilterSelect
					label={t("filters.referent")}
					allLabel={tLabels("all")}
					value={filters.referent ? String(filters.referent) : undefined}
					options={staff.map((user) => ({ value: String(user.id), label: user.name }))}
					onValueChange={(referent) =>
						setFilter({ referent: referent ? Number(referent) : undefined })
					}
				/>
			</div>

			<Table className={isFetching ? "opacity-80 transition" : "transition"}>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell>{t("columns.name")}</Table.HeaderCell>
						<Table.HeaderCell>{t("columns.email")}</Table.HeaderCell>
						<Table.HeaderCell>{t("columns.status")}</Table.HeaderCell>
						<Table.HeaderCell>{t("columns.referent")}</Table.HeaderCell>
						<Table.HeaderCell>{t("columns.angle")}</Table.HeaderCell>
						<Table.HeaderCell>{t("columns.meeting")}</Table.HeaderCell>
						<Table.HeaderCell>{t("columns.checked-in")}</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{!guests &&
						Array.from({ length: 8 }, (_, index) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows
							<Table.Row key={index}>
								<Table.Cell colSpan={7}>
									<Skeleton className="block h-5 w-full rounded" />
								</Table.Cell>
							</Table.Row>
						))}
					{guests?.data.length === 0 && (
						<Table.Row>
							<Table.Cell colSpan={7} className="py-10 text-center text-neutral-11">
								{t("empty")}
							</Table.Cell>
						</Table.Row>
					)}
					{guests?.data.map((guest) => (
						<Fragment key={guest.id}>
							<GuestRow guest={guest} />
							{nested && guest.plusOne && <PlusOneRow plusOne={guest.plusOne} />}
						</Fragment>
					))}
				</Table.Body>
			</Table>

			{guests && (
				<Pagination
					meta={guests.meta}
					onPageChange={(page) => onFiltersChange({ ...filters, page })}
				/>
			)}
		</div>
	);
}

function GuestRow(props: { guest: GuestListItem }) {
	const { guest } = props;

	const { t } = useTranslation("features.inauguration.backoffice.guests.components.guests-table");
	const { t: tLabels } = useTranslation("features.inauguration.backoffice.labels");

	return (
		<Table.Row>
			<Table.Cell>
				<Link
					to="/backoffice/guests/$guestId"
					params={{ guestId: String(guest.id) }}
					className="grid hover:underline"
				>
					<span className="flex items-center gap-2 font-medium">
						{fullName(guest)}
						{guest.kind === "plus_one" && <Badge>{tLabels("guest-kind.plus_one")}</Badge>}
					</span>
					<span className="text-neutral-11 text-xs">
						{guest.host ? t("plus-one-of", { name: fullName(guest.host) }) : guest.company}
					</span>
				</Link>
			</Table.Cell>
			<Table.Cell className="max-w-56 text-neutral-11">{guest.email ?? "—"}</Table.Cell>
			<Table.Cell>
				<GuestStatusBadge status={guest.status} />
			</Table.Cell>
			<Table.Cell className="text-neutral-11">{guest.referent?.name ?? "—"}</Table.Cell>
			<Table.Cell className="max-w-56 text-neutral-11">{guest.angleTopic ?? "—"}</Table.Cell>
			<Table.Cell>
				<MeetingStatusBadge status={guest.meetingStatus} />
			</Table.Cell>
			<Table.Cell className="tabular-nums">
				{guest.checkedInAt ? (
					<Badge tone="primary">{formatTime(guest.checkedInAt)}</Badge>
				) : (
					<span className="text-neutral-10">—</span>
				)}
			</Table.Cell>
		</Table.Row>
	);
}

function PlusOneRow(props: { plusOne: NonNullable<GuestListItem["plusOne"]> }) {
	const { plusOne } = props;

	const { t: tLabels } = useTranslation("features.inauguration.backoffice.labels");

	return (
		<Table.Row className="bg-neutral-2">
			<Table.Cell>
				<Link
					to="/backoffice/guests/$guestId"
					params={{ guestId: String(plusOne.id) }}
					className="flex items-center gap-2 pl-4 hover:underline"
				>
					<CornerDownRightIcon className="size-4 text-neutral-9" />
					<span>{fullName(plusOne)}</span>
					<Badge>{tLabels("guest-kind.plus_one")}</Badge>
				</Link>
			</Table.Cell>
			<Table.Cell className="max-w-56 text-neutral-11">{plusOne.email ?? "—"}</Table.Cell>
			<Table.Cell>
				<GuestStatusBadge status={plusOne.status} />
			</Table.Cell>
			<Table.Cell colSpan={3} />
			<Table.Cell className="tabular-nums">
				{plusOne.checkedInAt ? (
					<Badge tone="primary">{formatTime(plusOne.checkedInAt)}</Badge>
				) : (
					<span className="text-neutral-10">—</span>
				)}
			</Table.Cell>
		</Table.Row>
	);
}
