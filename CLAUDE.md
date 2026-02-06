# LibreStock Web Module - Agent Context

> TanStack Start frontend for LibreStock - open source inventory management.

## Tech Stack

TanStack Start · TanStack Router · React 19 · TypeScript · Tailwind CSS 4 · Radix UI · TanStack
Query + Form · Better Auth · i18next · @librestock/types

## Directory Structure

```
modules/web/src/
├── routes/                  # TanStack Router file-based routes
│   ├── __root.tsx           # Root layout + providers
│   ├── index.tsx            # Home (/)
│   ├── products.tsx         # Products page (/products)
│   ├── locations.tsx        # Locations list (/locations)
│   ├── locations.$id.tsx    # Location detail (/locations/:id)
│   ├── stock.tsx            # Stock page (/stock)
│   ├── inventory.tsx        # Inventory page (/inventory)
│   ├── settings.tsx         # Settings page (/settings)
│   ├── audit-logs.tsx       # Audit logs (/audit-logs)
│   ├── users.tsx            # User management (/users, admin)
│   └── globals.css          # Global styles
├── components/
│   ├── ui/                  # Base components (Radix/shadcn)
│   ├── category/            # Category features
│   ├── products/            # Product features
│   ├── items/               # Shared item display (includes SearchBar)
│   ├── users/               # User management (UsersTable, RoleBadges, UpdateRolesDialog)
│   └── common/              # Header, LanguageSwitcher
├── hooks/providers/         # React context providers
├── lib/
│   ├── data/
│   │   ├── axios-client.ts  # Axios instance + auth
│   │   ├── products.ts      # Handwritten API hooks
│   │   └── locations.ts     # Handwritten API hooks
│   ├── utils.ts             # cn(), sanitizeUrl()
│   └── env.ts               # Environment validation
├── router.tsx               # Router configuration
└── locales/                 # i18n (en, de, fr)
```

## Routing (TanStack Router)

### Route Definition Pattern

```typescript
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/products')({
  component: ProductPage,
})

function ProductPage(): React.JSX.Element {
  return <div>...</div>
}
```

### Route Guards (Admin Pages)

Admin-only routes use `beforeLoad` to check auth session and redirect unauthenticated users:

```typescript
export const Route = createFileRoute('/users')({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session) throw redirect({ to: '/login' })
  },
  component: UsersPage,
})
```

Currently guarded routes: `/users`, `/audit-logs`, `/settings`. Admin-only nav links in `Header.tsx` are hidden when the user has no session (via `adminOnly: true` flag).

### Dynamic Routes

```typescript
// locations.$id.tsx
export const Route = createFileRoute('/locations/$id')({
  component: LocationDetailPage,
})

function LocationDetailPage(): React.JSX.Element {
  const { id } = Route.useParams()
  // ...
}
```

## Provider Hierarchy

Order matters in `__root.tsx`:

```
BrandingProvider → I18nProvider → ThemeProvider → SidebarProvider
```

- **BrandingProvider**: App branding/theming
- **I18nProvider**: Translations
- **ThemeProvider**: Light/dark mode

Authentication is handled by Better Auth's `useSession()` hook from `@/lib/auth-client` - no provider needed. The auth client includes the `adminClient()` plugin for admin user management types and exports `getSession` for use in route guards.

## API Integration

### Shared Types + Handwritten Client

**Source of truth:**

- Interfaces/enums: `packages/types/src/*`
- API hooks: `src/lib/data/*.ts`

### Usage Patterns

```typescript
// Query
const { data, isLoading, error } = useListProducts({ category_id: id })

// Mutation with cache invalidation
const queryClient = useQueryClient()
const mutation = useCreateProduct({
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() })
    toast.success('Created')
  },
})
await mutation.mutateAsync(formData)
```

### Auth Token Flow

1. `AuthProvider` registers `getToken` with axios-client on mount
2. `getAxiosInstance` calls `getToken()` before each request
3. Token added as `Authorization: Bearer {token}` header
4. **401 interceptor**: Axios response interceptor automatically redirects to `/login` on 401 responses (session expiry)

## State Management

| Type         | Technology          | Example                                         |
| ------------ | ------------------- | ----------------------------------------------- |
| Server state | React Query         | `useListProducts()`                             |
| Form state   | TanStack Form + Zod | `useForm({ validators: { onSubmit: schema } })` |
| UI state     | useState            | `selectedCategoryId`, `expandedIds`             |
| Global UI    | Context             | Sidebar state                                   |
| Auth         | Better Auth         | `useAuthSession()`                             |

## Forms (TanStack Form + Zod)

```typescript
const schema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

const form = useForm({
  defaultValues: { name: '', description: '' },
  validators: { onSubmit: schema },
  onSubmit: async ({ value }) => {
    await mutation.mutateAsync(value);
  },
});

// Field binding
<form.Field name="name">
  {(field) => (
    <Field>
      <FieldLabel>Name</FieldLabel>
      <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
      <FieldError errors={field.state.meta.errors} />
    </Field>
  )}
</form.Field>
```

## i18n

**Files:** `src/locales/{en,de,fr}/common.json`

```typescript
const { t, i18n } = useTranslation();
<span>{t('navigation.products')}</span>
<button onClick={() => i18n.changeLanguage('de')}>Deutsch</button>
```

## Security Patterns

- **`sanitizeUrl(url)`** in `lib/utils.ts` — strips dangerous protocols (`javascript:`, `data:`, `vbscript:`, etc.). Always use when rendering URLs from API data (branding logo, favicon, external links). Returns empty string for unsafe URLs.
- **Zod URL validation** — use the `safeUrlSchema` pattern in `BrandingForm.tsx` to validate user-submitted URLs only allow `http:`, `https:`, or relative paths.
- **No `BETTER_AUTH_SECRET`** in frontend `.env` — this secret belongs only in the API module.
- **`better-auth`** is pinned to a specific version (not `"latest"`).

## Styling

- **CSS variables** in `globals.css` for theming (light/dark via `.dark` class)
- **CVA** for component variants
- **cn()** utility for class merging: `cn('p-4', isActive && 'bg-primary')`
- **Custom utilities:** `.page-container`, `.page-header`, `.items-grid`,
  `.items-list`, `.empty-state`

## Adding a New Page

1. Create `src/routes/<route>.tsx` with `createFileRoute` + `component`
2. `routeTree.gen.ts` auto-updates when `pnpm dev` runs (manual update needed otherwise)
3. Add to `Header.tsx` sidebar nav (use `adminOnly: true` for admin routes)
4. Add translations to `locales/{lang}/common.json` (en, de, fr)
5. New components go in `src/components/<feature>/` using hooks from `lib/data/`

## Reusable Components

### Common Components (`src/components/common/`)

| Component | Props | Purpose |
| --------- | ----- | ------- |
| `PaginationControls` | `page`, `totalPages`, `totalItems?`, `isLoading?`, `onPageChange` | Prev/next pagination with result count |
| `EmptyState` | `message`, `description?`, `icon?`, `variant?` | Empty data placeholder (`simple` or `bordered`) |
| `ErrorState` | `message`, `icon?`, `variant?` | Error display (`simple` or `bordered`) |
| `FormDialog` | `title`, `description`, `formId`, `open`, `onOpenChange`, ... | Modal dialog wrapping a form |
| `DeleteConfirmationDialog` | `title`, `description`, `open`, `isLoading`, `onConfirm`, `onOpenChange` | Confirm before delete |
| `CrudDropdownMenu` | `onEdit`, `onDelete` | Three-dot menu with edit/delete actions |

### Shared Components (`src/components/items/`)

| Component | Props | Purpose |
| --------- | ----- | ------- |
| `SearchBar` | `value`, `onChange`, `onClear`, `placeholder?` | Search input with clear button |

### Search Param Helpers (`src/lib/router/search.ts`)

Used with Zod schemas for `validateSearch` in route definitions:

```typescript
import { parseStringParam, parseNumberParam, parseBooleanParam } from '@/lib/router/search'

const searchSchema = z.object({
  page: z.preprocess(parseNumberParam, z.number().int().min(1).optional()),
  q: z.preprocess(parseStringParam, z.string().optional()),
  active: z.preprocess(parseBooleanParam, z.boolean().optional()),
})

export const Route = createFileRoute('/example')({
  validateSearch: (search) => searchSchema.parse(search),
  component: ExamplePage,
})
```

## Testing (Playwright)

Config: `playwright.config.ts`. Test files: `e2e/tests/*.spec.ts`

```bash
pnpm test:e2e                  # Run all (needs devenv up)
pnpm test:e2e:ui               # Interactive UI mode
pnpm test:e2e:headed           # Visible browser
```

**Setup:**
- `e2e/global-setup.ts` — creates test user via API (`e2e-test@librestock.local`)
- `e2e/auth.setup.ts` — logs in and saves auth state to `e2e/.auth/user.json`

**Playwright projects:**
- `setup` — runs auth setup
- `chromium` — authenticated tests (depends on `setup`, uses stored auth)
- `unauthenticated` — tests that run without auth (e.g., login flow)

**Patterns:**
- Use `page.locator('[data-sidebar="menu-button"]', { hasText: /text/i })` for sidebar nav
- Use `{ timeout: 15000 }` for navigation assertions
- New authenticated test files must be added to the `chromium` project's `testMatch` regex in `playwright.config.ts`

## Environment Variables

```bash
VITE_API_BASE_URL=http://localhost:8080/api/v1   # Required
```

## Commands

```bash
pnpm dev        # Dev server (port 3000)
pnpm build      # Production build
pnpm lint       # ESLint
pnpm type-check # TypeScript check
```

