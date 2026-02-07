# LibreStock Web

TanStack Start frontend for LibreStock inventory management, built with React 19, TanStack Router, and Tailwind CSS 4.

## Prerequisites

- Node.js >= 20
- pnpm >= 10

This repo is part of the [LibreStock workspace](https://github.com/librestock/meta). Dependencies must be installed from the workspace root.

## Getting Started

```bash
# From the workspace root (libre/):
pnpm install

# Create env file
echo "VITE_API_BASE_URL=http://localhost:8080/api/v1" > frontend/.env

# Start dev server
pnpm --filter @librestock/web dev
```

The app will be at http://localhost:3000. Requires the backend API to be running at http://localhost:8080.

### Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

## Project Structure

```
src/
├── routes/                  # TanStack Router file-based routes
│   ├── __root.tsx           # Root layout + providers
│   ├── index.tsx            # Home (/)
│   ├── products.tsx         # Products (/products)
│   ├── locations.tsx        # Locations (/locations)
│   ├── locations.$id.tsx    # Location detail (/locations/:id)
│   ├── inventory.tsx        # Inventory (/inventory)
│   ├── stock.tsx            # Stock (/stock)
│   ├── settings.tsx         # Settings (/settings)
│   ├── audit-logs.tsx       # Audit logs (/audit-logs, admin)
│   ├── users.tsx            # Users (/users, admin)
│   ├── login.tsx            # Login
│   └── signup.tsx           # Signup
├── components/
│   ├── ui/                  # Base components (Radix/shadcn)
│   ├── common/              # Header, PaginationControls, EmptyState
│   └── <feature>/           # Feature-specific components
├── lib/
│   ├── data/                # API hooks (React Query)
│   ├── utils.ts             # cn(), sanitizeUrl()
│   └── env.ts               # Environment validation
├── router.tsx               # Router config
├── routeTree.gen.ts         # Auto-generated route tree
└── locales/                 # i18n (en, de, fr)
```

## Commands

```bash
pnpm dev            # Dev server (port 3000)
pnpm build          # Production build
pnpm start          # Run production build
pnpm lint           # ESLint
pnpm type-check     # TypeScript check
pnpm test:e2e       # Playwright E2E tests (needs full stack running)
```

## License

AGPL-3.0
