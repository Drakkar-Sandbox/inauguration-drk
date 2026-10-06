# packages/ui/react/src/components KNOWLEDGE BASE

## OVERVIEW

Folder-per-component React UI surfaces; most wrap Base UI primitives and expose public subpaths through `@workspace/ui-react/components/<name>`.

## STRUCTURE

```text
components/<name>/
├── <name>.tsx
├── <name>.stories.tsx
└── index.ts
```

Current components: alert-dialog, avatar, button, card, dialog, field, input, link, menu, password-input, scroll-area, sidebar, skeleton, spinner, switch, tabs, toast — plus the inauguration set: choice-chips, drakkar-logo, leif-avatar, leif-subtitles, push-to-talk-button (stories under `Leif/`, dark backgrounds).

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Public API | `<component>/index.ts` | Export component props/types and primitive aliases here. |
| Implementation | `<component>/<component>.tsx` | Keep styling and composition local to the component. |
| Stories | `<component>/<component>.stories.tsx` | Storybook is the manual QA/docs surface. |
| Base UI wrappers | `alert-dialog`, `avatar`, `button`, `dialog`, `field`, `input`, `menu`, `scroll-area`, `switch`, `tabs` | Re-export primitives as `*Primitive` when exposed. |
| Composite/custom surfaces | `card`, `link`, `password-input`, `sidebar`, `toast` | No direct Base UI one-to-one wrapper. |
| Simple visual components | `skeleton`, `spinner` | Presentation-only components with local styling. |

## CONVENTIONS

- Export consumers through `index.ts`; do not import implementation files from apps.
- Use `tv` for variant-heavy components and `cn`/`cx` for composition.
- Type variants with `VariantProps<typeof variants>` when using `tv`.
- Prefer `Object.assign(Root, { Sub })` for compound component APIs.
- Keep stories colocated and typed with `Meta` / `StoryObj` from `@storybook/react-vite`.

## ANTI-PATTERNS

- Do not add a component folder without an `index.ts` public barrel.
- Do not bypass theme tokens with ad hoc CSS variables in component code.
- Do not import `@base-ui/react/*` from consumers; expose intended primitives from the component barrel.
- Do not move Storybook examples outside the component folder.
- Do not use `var(--color-*)` in arbitrary values: the theme is `@theme inline`, so those resolve at `:root` and ignore nested `data-theme="dark"`. Use utilities (e.g. `text-primary-9` + `currentColor`).
- Do not render Leif visuals outside `LeifAvatar`; plug new pipelines in through its `renderer` prop.
