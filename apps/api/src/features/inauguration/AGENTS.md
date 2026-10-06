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
├── kiosk/speech/            # operator cues → speech screen (Redis state, polled)
└── leif/                    # avatar conversation + voice engine (see "Leif" below)
    ├── brain/               # LeifBrain (abstract) → AnthropicLeifBrain | ScriptedLeifBrain, prompts
    ├── voice/               # LeifVoice (abstract) → ElevenLabsLeifVoice | SilentLeifVoice, /leif/tts|stt, TTS cache
    ├── signup/              # POST /invitations/:token/leif/message (state machine)
    ├── kiosk/               # /kiosk/leif/{greeting,sessions,sessions/:id/{message,handoff,end}}
    ├── services/            # scripted lines (all copy), per-day turn quota
    └── leif_provider.ts     # binds brain/voice from env (registered in adonisrc)
```

## CONVENTIONS

- Route names: `inauguration.invitations.*` (incl. `.leif.message`), `inauguration.backoffice.<feature>.*`, `inauguration.kiosk.*`, `inauguration.kiosk.speech.*`, `inauguration.kiosk.leif.*`, `inauguration.leif.{tts,stt}`.
- Public routes have no auth; the 32-char guest token is the credential and `invitationLimiter` rate-limits them. Back-office and kiosk routes use `middleware.auth({ guards: ["web"] })` (every user is staff).
- One policy per feature folder with one method per action (instead of one policy per controller).
- Models: `Guest`, `Conversation`, `Handoff` in `src/models`; enums are exported tuples (`GUEST_STATUSES`, ...). `Guest.qrUrl` = `FRONTEND_URL/i/<token>`.
- Response shaping lives in `src/presenters/{invitation,guest,kiosk_guest,conversation,handoff}.presenter.ts` (exported to the web as `@workspace/api/data` types).
- Mail jobs take `{ guestId }` and reload the guest, then send on queue `emails` with the QR embedded (`cid:qrcode`) and an `.ics` attachment.
- Binary responses are streamed (`response.stream`) so the superjson middleware never re-encodes them; use a `Content-Disposition` header, not `response.attachment()` (that one serves a file from disk).

## LEIF

- All AI is optional. No `ANTHROPIC_API_KEY` → `ScriptedLeifBrain` (keyword NLU, scripted replies, quick-reply `choices` on every closed question). No `ELEVENLABS_API_KEY`/`ELEVENLABS_VOICE_ID` → `SilentLeifVoice` (TTS returns `audioBase64: null`, STT `text: null`). Any LLM error/refusal/invalid output falls back to the scripted brain for that call.
- Models: `ANTHROPIC_FAST_MODEL` (default `claude-haiku-4-5`) understands signup free text; `ANTHROPIC_MODEL` (default `claude-sonnet-5-5`, effort low, `between_tools` thinking) runs the kiosk dialogue and end-of-session summary. Outputs are JSON-schema constrained and re-validated with Vine.
- Signup: the server state machine (`signup_conversation.service.ts`) is the source of truth; the LLM only classifies intent/slots and phrases FAQ/off-topic answers. Actions reuse `InvitationService`; a plus-one is validated then confirmed before `upsertPlusOne`. State/transcript live in Redis (`inauguration:leif:signup:<guestId>`, 24 h) and are copied to `conversations` (channel `signup`) only once consent is given.
- Kiosk: session (transcript included) lives in Redis (`inauguration:leif:kiosk:<uuid>`, 2 h). `end` stores transcript + LLM summary with consent, otherwise an empty ended marker (counts as a kiosk visit). Handoffs are kept either way; without consent their reason carries no guest words.
- Voice: TTS is cached on Drive under `leif/tts/<sha256(voice:model\ntext)>.json`; `node ace leif:pregenerate` fills it for every reception greeting and speech cue. Guests (invitation token, body `token` or `X-Invitation-Token`) can only voice lines Leif just said to them; staff sessions can voice anything. STT (`/leif/stt`, multipart `audio`, ≤ 5 MB) is in `bodyparser.multipart.processManually`: audio is buffered in memory, never written to disk.
- Every avatar line lives in `leif/services/leif_lines.service.ts` and reads names/facts from `config/event.ts`; prompts live in `leif/brain/leif_prompts.ts`. Never hard-code the avatar name.
- Tests swap `LeifBrain` / `LeifVoice` in the container (`app.container.swap`) and clear `inauguration:leif:*` Redis keys; no network.

## ANTI-PATTERNS

- Never expose angle sheet, referent, conversations or other guests' data from `invitation/` or `kiosk/` presenters.
- Do not keep more than one plus-one per primary (DB unique on `host_guest_id`); replacing deletes the old one so its QR stops working.
- Do not store conversation summaries without guest consent (enforced by the conversation engine writing to `conversations`).
- Never let the LLM execute an action or reveal the angle sheet (`angleTopic`/`angleNotes` only steer kiosk ideas). Never log guest texts, audio or API keys.

## NOTES

- Plus-one is editable by a confirmed primary until the end of J-`plusOneDeadlineDaysBefore` (event timezone). Declining deletes the plus-one.
- CSV import accepts `,` or `;`, upserts primaries by email, skips empty cells on update, and reports row errors by line (header = 1).
- CSV export neutralizes formula-like cells (CSV injection).
