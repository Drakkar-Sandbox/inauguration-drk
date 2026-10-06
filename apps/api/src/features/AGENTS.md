# apps/api/src/features KNOWLEDGE BASE

## OVERVIEW

Feature-first HTTP modules for the API. Domains: `web` (account management) and `inauguration` (event invitations, back-office, kiosk — see `inauguration/AGENTS.md`); keep this file as domain-boundary guidance only.

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Domain routes | `user_management/*/routes.ts` | Imported by `apps/api/start/routes.ts`. |
| Generated route targets | `#generated/controllers` | Do not hand-edit generated registry files. |
| Cross-feature validators | `../validators/user.validator.ts` | Shared by profile/password controllers. |
| Auth middleware registry | `apps/api/start/kernel.ts` | Named `auth` / `guest` middleware comes from this tree. |
| Feature docs | `user_management/*/AGENTS.md` | Concrete feature rules live below the domain. |
| Inauguration domain | `inauguration/routes.ts`, `inauguration/AGENTS.md` | Public invitations, back-office, kiosk. |

## CONVENTIONS

- Keep domain folders under `src/features/<domain>/<feature>`.
- Put route declarations inside each feature folder, then import them from `start/routes.ts`.
- Prefer feature-local controllers, services, exceptions, middleware, and mails over flat app folders.
- Route handlers should use generated controller imports, not direct controller imports.

## ANTI-PATTERNS

- Do not add code directly at `src/features` root except domain-level guidance.
- Do not bypass `start/routes.ts`; feature route files must be explicitly imported there.
- Do not edit `.adonisjs/server/controllers.ts` to fix missing generated routes; fix source names and regenerate.

## NOTES

- Current generated controller names are derived from files below `user_management`.
- Add new domains beside `user_management`, not inside it, when they are not account-related.
- Keep feature-local AGENTS files only where routes, jobs, mail, or cache behavior differ from this root.
