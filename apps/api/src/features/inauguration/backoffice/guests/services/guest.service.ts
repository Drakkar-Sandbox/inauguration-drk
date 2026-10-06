import Guest, { type GuestKind, type GuestStatus, type MeetingStatus } from "#models/guest";

export type GuestFilters = {
	page?: number;
	perPage?: number;
	status?: GuestStatus;
	kind?: GuestKind;
	checkedIn?: boolean;
	referentUserId?: number;
	meetingStatus?: MeetingStatus;
	search?: string;
};

export default class GuestService {
	async list(filters: GuestFilters) {
		const query = Guest.query()
			.preload("plusOne")
			.preload("host")
			.preload("referent")
			.orderBy("last_name", "asc")
			.orderBy("first_name", "asc")
			.orderBy("id", "asc");

		if (filters.status) query.where("status", filters.status);
		if (filters.kind) query.where("kind", filters.kind);
		if (filters.meetingStatus) query.where("meeting_status", filters.meetingStatus);
		if (filters.referentUserId) query.where("referent_user_id", filters.referentUserId);
		if (filters.checkedIn !== undefined) {
			if (filters.checkedIn) query.whereNotNull("checked_in_at");
			else query.whereNull("checked_in_at");
		}
		if (filters.search) this.applySearch(query, filters.search);

		return query.paginate(filters.page ?? 1, filters.perPage ?? 50);
	}

	/**
	 * Case-insensitive match on first name, last name, full name, email and company.
	 */
	applySearch(query: ReturnType<typeof Guest.query>, search: string) {
		const term = `%${search.trim().replace(/[\\%_]/g, (char) => `\\${char}`)}%`;

		query.where((builder) => {
			builder
				.whereILike("first_name", term)
				.orWhereILike("last_name", term)
				.orWhereRaw("(first_name || ' ' || last_name) ILIKE ?", [term])
				.orWhereRaw("(last_name || ' ' || first_name) ILIKE ?", [term])
				.orWhereILike("email", term)
				.orWhereILike("company", term);
		});
	}

	async find(id: number) {
		return Guest.query()
			.where("id", id)
			.preload("plusOne")
			.preload("host")
			.preload("referent")
			.preload("conversations", (query) => query.orderBy("started_at", "desc"))
			.preload("handoffs", (query) => query.preload("referent").orderBy("created_at", "desc"))
			.firstOrFail();
	}
}
