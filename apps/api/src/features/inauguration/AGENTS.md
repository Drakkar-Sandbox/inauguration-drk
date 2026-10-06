# apps/api/src/features/inauguration KNOWLEDGE BASE

## OVERVIEW

Drakkar office-inauguration domain (spec: `docs/inauguration/SPEC.md`): public token-based invitations, staff back-office, and day-J kiosk/speech screens. Event content lives in `config/event.ts` (`TODO(contenu)` placeholders); avatar name is `EVENT_AVATAR_NAME` (default "Leif") and must never be hard-coded.

## STRUCTURE

```text
inauguration/
├── invitation/              # public /invitations/:token (view, rsvp, consent, plus-one, .ics, qr.png) + emails
├── backoffice/guests/       # CRUD, CSV import/export, QR png/svg + print sheet JSON
├── backoffice/staff/        # users list (referent picker)
├── backoffice/dashboard/    # KPI counts
├── backoffice/handoffs/     # list (status, mine) + status update
├── backoffice/conversations/# transcripts/summaries (staff only)
├── kiosk/checkin/           # QR check-in (token or full URL), name search
└── kiosk/speech/            # operator cues → speech screen (Redis state, polled)
```

## CONVENTIONS

- Route names: `inauguration.invitations.*`, `inauguration.backoffice.<feature>.*`, `inauguration.kiosk.*`, `inauguration.kiosk.speech.*`.
- Public routes have no auth; the 32-char guest token is the credential and `invitationLimiter` rate-limits them. Back-office and kiosk routes use `middleware.auth({ guards: ["web"] })` (every user is staff).
- One policy per feature folder with one method per action (instead of one policy per controller).
- Models: `Guest`, `Conversation`, `Handoff` in `src/models`; enums are exported tuples (`GUEST_STATUSES`, ...). `Guest.qrUrl` = `FRONTEND_URL/i/<token>`.
- Response shaping lives in `src/presenters/{invitation,guest,kiosk_guest,conversation,handoff}.presenter.ts` (exported to the web as `@workspace/api/data` types).
- Mail jobs take `{ guestId }` and reload the guest, then send on queue `emails` with the QR embedded (`cid:qrcode`) and an `.ics` attachment.
- Binary responses are streamed (`response.stream`) so the superjson middleware never re-encodes them; use a `Content-Disposition` header, not `response.attachment()` (that one serves a file from disk).

## ANTI-PATTERNS

- Never expose angle sheet, referent, conversations or other guests' data from `invitation/` or `kiosk/` presenters.
- Do not keep more than one plus-one per primary (DB unique on `host_guest_id`); replacing deletes the old one so its QR stops working.
- Do not store conversation summaries without guest consent (enforced by the conversation engine writing to `conversations`).

## NOTES

- Plus-one is editable by a confirmed primary until the end of J-`plusOneDeadlineDaysBefore` (event timezone). Declining deletes the plus-one.
- CSV import accepts `,` or `;`, upserts primaries by email, skips empty cells on update, and reports row errors by line (header = 1).
- CSV export neutralizes formula-like cells (CSV injection).
