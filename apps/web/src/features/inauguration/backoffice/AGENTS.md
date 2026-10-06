# apps/web/src/features/inauguration/backoffice KNOWLEDGE BASE

## OVERVIEW

Staff back-office for the office inauguration: dashboard, guests (+ angle sheet, QR, CSV import/export), handoffs, conversations, printable QR sheet. Routes live in `src/routes/(private)/backoffice/**`.

## CONVENTIONS

- API calls go through `inauguration.backoffice.*` from `#/libs/tuyau` (the `api` export is scoped to `web.*`).
- Response types come from `types.ts` (`ResponseOf<routes[...]>`); enum mirrors of API models live there too.
- Binary/text downloads (CSV export, QR PNG/SVG) are plain links built with `backofficeFileUrl()`.
- Mutations invalidate `inauguration.backoffice.pathKey()` and report errors with `toastifyBackofficeError()`.
- Shared status labels live in the `features.inauguration.backoffice.labels` namespace (`components/locales`).
- Polling: dashboard 10 s, handoffs 5 s. `usePendingHandoffsWatcher` is mounted once by the sidebar nav and drives the badge, toasts and browser notifications.
