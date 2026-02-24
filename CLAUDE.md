# LibreStock Web Module

## Conventions (not enforced by code)

- **`beforeLoad` can't use React hooks** — route guards must use the pure functions `resolvePermissions()` + `canAccess()` from `lib/permissions.ts`, not the `usePermissions()` hook.
- **Write-gating:** Components that create/edit/delete should check `can(Permission.WRITE, resource)` to hide/disable action buttons for read-only users.
- **URL sanitization:** Always use `sanitizeUrl()` from `lib/utils.ts` when rendering URLs from API data (branding logo, favicon, external links). Use `safeUrlSchema` for validating user-submitted URLs in forms.

## Gotchas

- **`routeTree.gen.ts`** auto-updates only when `pnpm dev` is running. If dev isn't running, update it manually.
- **Playwright `testMatch`:** New authenticated test files must be added to the `chromium` project's `testMatch` regex in `playwright.config.ts`, or they will silently not run.
- **`better-auth`** is pinned to a specific version (not `"latest"`).

## Adding a new page

Create the route file and components following existing patterns, but don't forget:

1. Add sidebar nav entry in `Header.tsx` (use `adminOnly: true` for admin routes)
2. Add translations to all 3 locales: `locales/{en,de,fr}/common.json`
3. For role-guarded routes, add `beforeLoad` with permission check (use pure functions, not hooks)
