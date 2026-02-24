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
│   ├── products.$id.tsx     # Product detail (/products/:id)
│   ├── locations.tsx        # Locations (/locations)
│   ├── locations.$id.tsx    # Location detail (/locations/:id)
│   ├── inventory.tsx        # Inventory (/inventory)
│   ├── stock.tsx            # Stock (/stock)
│   ├── stock-movements.tsx  # Stock Movements (/stock-movements)
│   ├── orders.tsx           # Orders (/orders)
│   ├── clients.tsx          # Clients (/clients)
│   ├── suppliers.tsx        # Suppliers (/suppliers)
│   ├── audit-logs.tsx       # Audit logs (/audit-logs, admin)
│   ├── users.tsx            # Users (/users, admin)
│   ├── roles.tsx            # Roles (/roles, admin)
│   ├── settings.tsx         # Settings (/settings)
│   ├── login.tsx            # Login
│   └── signup.tsx           # Signup
├── components/
│   ├── ui/                  # Base components (Radix/shadcn)
│   ├── common/              # Header, PaginationControls, EmptyState
│   ├── areas/               # Area components
│   ├── audit-logs/          # Audit log components
│   ├── category/            # Category components
│   ├── clients/             # Client components
│   ├── inventory/           # Inventory components
│   ├── items/               # Item components
│   ├── locations/           # Location components
│   ├── orders/              # Order components
│   ├── products/            # Product components
│   ├── roles/               # Role components
│   ├── settings/            # Settings components
│   ├── stock-movements/     # Stock movement components
│   ├── suppliers/           # Supplier components
│   ├── users/               # User components
│   ├── DefaultCatchBoundary.tsx
│   └── NotFound.tsx
├── lib/
│   ├── data/                # API hooks (React Query)
│   │   ├── areas            # Area data hooks
│   │   ├── audit-logs       # Audit log data hooks
│   │   ├── auth             # Auth data hooks
│   │   ├── axios-client     # Axios client config
│   │   ├── branding         # Branding data hooks
│   │   ├── categories       # Category data hooks
│   │   ├── clients          # Client data hooks
│   │   ├── inventory        # Inventory data hooks
│   │   ├── locations        # Location data hooks
│   │   ├── make-crud-hooks  # Generic CRUD hook factory
│   │   ├── orders           # Order data hooks
│   │   ├── photos           # Photo data hooks
│   │   ├── products         # Product data hooks
│   │   ├── query-cache      # Query cache utilities
│   │   ├── roles            # Role data hooks
│   │   ├── stock-movements  # Stock movement data hooks
│   │   ├── suppliers        # Supplier data hooks
│   │   └── users            # User data hooks
│   ├── auth-client.ts       # Better Auth client
│   ├── enums/               # Shared enums
│   ├── env.ts               # Environment validation
│   ├── location-type.utils.ts # Location type helpers
│   ├── order-state-machine.ts # Order state machine
│   ├── permissions.ts       # Permission utilities
│   ├── url-config.ts        # URL configuration
│   └── utils.ts             # cn(), sanitizeUrl()
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
