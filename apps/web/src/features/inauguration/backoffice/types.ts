import type { ResponseOf } from "@tuyau/core/types";

import type { routes } from "@workspace/api/registry";

type Routes = typeof routes;

export type Guest = ResponseOf<Routes["inauguration.backoffice.guests.view"]>;
export type GuestListItem = ResponseOf<
	Routes["inauguration.backoffice.guests.list"]
>["data"][number];
export type Handoff = ResponseOf<Routes["inauguration.backoffice.handoffs.list"]>[number];
export type Conversation = ResponseOf<Routes["inauguration.backoffice.conversations.view"]>;
export type QrSheetEntry = ResponseOf<Routes["inauguration.backoffice.guests.qr_sheet"]>[number];

// Mirrors of the API enums (apps/api/src/models/*), used for filters and selects.
export const GUEST_STATUSES = ["invited", "confirmed", "declined"] as const;
export const GUEST_KINDS = ["primary", "plus_one"] as const;
export const MEETING_STATUSES = ["none", "to_propose", "proposed", "held", "mission"] as const;
export const HANDOFF_STATUSES = ["pending", "seen", "done"] as const;
export const CONVERSATION_CHANNELS = ["signup", "kiosk"] as const;

export type GuestStatus = (typeof GUEST_STATUSES)[number];
export type GuestKind = (typeof GUEST_KINDS)[number];
export type MeetingStatus = (typeof MEETING_STATUSES)[number];
export type HandoffStatus = (typeof HANDOFF_STATUSES)[number];
export type ConversationChannel = (typeof CONVERSATION_CHANNELS)[number];
