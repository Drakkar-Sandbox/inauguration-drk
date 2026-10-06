# apps/web/src/features/inauguration/{leif,invitation,kiosk} KNOWLEDGE BASE

## OVERVIEW

Guest-facing surfaces of the inauguration: public invitation with Leif (`/i/$token`, route group `(public)`, no auth) and day-J kiosk screens (`/screens/{accueil,borne,discours,operateur}`, route group `(kiosk)`: staff/kiosk session, no app chrome). `leif/` holds the client logic shared by all of them.

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Voice playback, lip-sync, subtitles | `leif/hooks/use-leif-voice.ts` | Web Audio + AnalyserNode; without audio (no TTS key, muted, autoplay locked) lines are revealed at reading pace. |
| Push-to-talk | `leif/hooks/use-push-to-talk.ts` | MediaRecorder (webm/opus, mp4 on Safari), 30 s max; settles on `disabled` when the mic or STT is unavailable. |
| Avatar state machine | `leif/hooks/use-leif-state.ts` | speaking > listening > thinking (optional delay) > idle. |
| TTS/STT calls, file URLs | `leif/utils/api.ts` | Guests pass their invitation token; kiosks rely on the session cookie. |
| Signup conversation | `invitation/hooks/use-signup-conversation.ts` | Server state machine is the source of truth; the turn's `invitation` refreshes the cache. |
| Reception / borne / speech | `kiosk/{reception,challenge,speech}/**` | Scanner input: `kiosk/hooks/use-scanner-input.ts` (USB keyboard wedge) + `kiosk/components/camera-scanner.tsx`. |

## CONVENTIONS

- Surfaces are always dark: `useDarkDocument()` themes the body (portals included); `KioskShell` adds wake lock, idle cursor and no scrollbars.
- Never show raw errors to guests: Leif apologises in his own words, kiosks fall back to a generic welcome or the resting screen and recover on their own (`KioskRecover` is the kiosk route error component).
- Avatar name: the public page uses `invitation.event.avatarName`; kiosk endpoints do not expose it, so screens use `KIOSK_AVATAR_NAME` (`VITE_AVATAR_NAME`, default "Leif").
- Locally written Leif lines (apologies, returning guest) are voiced on kiosks (staff TTS accepts any text) but shown text-only to guests (public TTS only voices lines the server said).
- Per-request Tuyau `headers` replace the superjson plugin's: keep `x-superjson: true` when passing headers.

## ANTI-PATTERNS

- Do not render Leif outside `LeifAvatar`; do not add a second `AudioContext` (use `getAudioContext()`).
- Do not start the camera scanner on plain http: qr-scanner warns on every start and the TanStack devtools console piping echoes it endlessly in dev.
