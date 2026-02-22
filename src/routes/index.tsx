import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  ArrowRight,
  Box,
  MapPin,
  Package,
  Plus,
  WarehouseIcon,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ErrorState } from '@/components/common/ErrorState'
import { useListProducts } from '@/lib/data/products'
import { useListAllLocations } from '@/lib/data/locations'
import { useListInventory } from '@/lib/data/inventory'

import type { InventoryResponseDto } from '@/lib/data/inventory'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LOW_STOCK_THRESHOLD = 10
const LOW_STOCK_PAGE_SIZE = 100
const SKELETON_BAR_HEIGHTS = ['60%', '80%', '45%', '70%', '55%', '75%']
const CHART_COLORS = [
  'var(--color-primary)',
  'var(--color-chart-2, oklch(0.6 0.18 250))',
  'var(--color-chart-3, oklch(0.6 0.18 150))',
  'var(--color-chart-4, oklch(0.6 0.18 50))',
  'var(--color-chart-5, oklch(0.6 0.18 310))',
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getReorderPoint(item: InventoryResponseDto): number {
  if (
    item.product &&
    typeof item.product === 'object' &&
    'reorder_point' in item.product
  ) {
    return (item.product as { reorder_point: number }).reorder_point
  }
  return LOW_STOCK_THRESHOLD
}

function isLowStock(item: InventoryResponseDto): boolean {
  return item.quantity <= getReorderPoint(item)
}

// ---------------------------------------------------------------------------
// Dashboard page
// ---------------------------------------------------------------------------

interface DashboardData {
  totalProducts: number
  totalLocations: number
  totalInventory: number
  inventoryItems: InventoryResponseDto[]
  isLoading: boolean
  chartLoading: boolean
  inventoryLoading: boolean
  productsError: Error | null
  locationsError: Error | null
  inventoryError: Error | null
}

function useDashboardData(): DashboardData {
  const productsQuery = useListProducts({ page: 1, limit: 1 })
  const locationsQuery = useListAllLocations()
  const inventoryQuery = useListInventory({ page: 1, limit: LOW_STOCK_PAGE_SIZE })

  const totalProducts = productsQuery.data?.meta.total ?? 0
  const totalLocations = locationsQuery.data?.length ?? 0
  const totalInventory = inventoryQuery.data?.meta.total ?? 0
  const inventoryItems = React.useMemo(
    () => inventoryQuery.data?.data ?? [],
    [inventoryQuery.data?.data],
  )

  return {
    totalProducts,
    totalLocations,
    totalInventory,
    inventoryItems,
    isLoading: productsQuery.isLoading || locationsQuery.isLoading || inventoryQuery.isLoading,
    chartLoading: inventoryQuery.isLoading || locationsQuery.isLoading,
    inventoryLoading: inventoryQuery.isLoading,
    productsError: productsQuery.error,
    locationsError: locationsQuery.error,
    inventoryError: inventoryQuery.error,
  }
}

function DashboardPage(): React.JSX.Element {
  const { t } = useTranslation()
  const {
    totalProducts, totalLocations, totalInventory, inventoryItems,
    isLoading, chartLoading, inventoryLoading,
    productsError, locationsError, inventoryError,
  } = useDashboardData()

  const lowStockItems = React.useMemo(
    () => inventoryItems.filter(isLowStock),
    [inventoryItems],
  )

  const locationChartData = React.useMemo(() => {
    if (inventoryItems.length === 0) return []
    const locationMap = new Map<string, { name: string; quantity: number }>()
    for (const item of inventoryItems) {
      const locationName = item.location?.name ?? t('dashboard.location')
      const existing = locationMap.get(item.location_id)
      if (existing) {
        existing.quantity += item.quantity
      } else {
        locationMap.set(item.location_id, { name: locationName, quantity: item.quantity })
      }
    }
    return Array.from(locationMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8)
  }, [inventoryItems, t])

  const hasError = productsError != null || locationsError != null || inventoryError != null

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="text-xl font-semibold">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground text-sm">{t('dashboard.subtitle')}</p>
      </div>
      <div className="content-section">
        <div className="mx-auto max-w-7xl space-y-6">
          <SummaryCardsRow
            isLoading={isLoading}
            lowStockCount={lowStockItems.length}
            t={t}
            totalInventory={totalInventory}
            totalLocations={totalLocations}
            totalProducts={totalProducts}
          />
          {hasError && (
            <div className="space-y-2">
              {productsError && <ErrorState message={t('dashboard.errorLoadingProducts')} variant="simple" />}
              {locationsError && <ErrorState message={t('dashboard.errorLoadingLocations')} variant="simple" />}
              {inventoryError && <ErrorState message={t('dashboard.errorLoadingInventory')} variant="simple" />}
            </div>
          )}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <LowStockCard isLoading={inventoryLoading} items={lowStockItems} t={t} />
            <div className="space-y-6">
              <QuickActionsCard t={t} />
              <StockByLocationChart data={locationChartData} isLoading={chartLoading} t={t} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Summary cards row
// ---------------------------------------------------------------------------

interface SummaryCardsRowProps {
  isLoading: boolean
  totalProducts: number
  totalLocations: number
  totalInventory: number
  lowStockCount: number
  t: (key: string) => string
}

function SummaryCardsRow({
  isLoading,
  totalProducts,
  totalLocations,
  totalInventory,
  lowStockCount,
  t,
}: SummaryCardsRowProps): React.JSX.Element {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        icon={<Package className="size-5" />}
        title={t('dashboard.totalProducts')}
        value={totalProducts}
      />
      <SummaryCard
        icon={<MapPin className="size-5" />}
        title={t('dashboard.totalLocations')}
        value={totalLocations}
      />
      <SummaryCard
        icon={<Box className="size-5" />}
        title={t('dashboard.totalInventory')}
        value={totalInventory}
      />
      <SummaryCard
        icon={<AlertTriangle className="size-5" />}
        title={t('dashboard.lowStockCount')}
        value={lowStockCount}
        variant={lowStockCount > 0 ? 'warning' : 'default'}
      />
    </div>
  )
}

function SummaryCardSkeleton(): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="size-5 rounded" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  )
}

interface SummaryCardProps {
  title: string
  value: number
  icon: React.ReactNode
  variant?: 'default' | 'warning'
}

function SummaryCard({
  title,
  value,
  icon,
  variant = 'default',
}: SummaryCardProps): React.JSX.Element {
  const isWarning = variant === 'warning'
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            {title}
          </CardTitle>
          <span className={isWarning ? 'text-destructive' : 'text-muted-foreground'}>
            {icon}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-bold ${isWarning ? 'text-destructive' : ''}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Low stock card
// ---------------------------------------------------------------------------

interface LowStockCardProps {
  isLoading: boolean
  items: InventoryResponseDto[]
  t: (key: string) => string
}

function LowStockCard({ isLoading, items, t }: LowStockCardProps): React.JSX.Element {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>{t('dashboard.lowStockAlerts')}</CardTitle>
        <CardDescription>{t('dashboard.lowStockDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <LowStockTableSkeleton />}
        {!isLoading && items.length === 0 && <LowStockEmptyState t={t} />}
        {!isLoading && items.length > 0 && <LowStockTable items={items} t={t} />}
        {items.length > 10 && (
          <div className="mt-3 flex justify-center">
            <Button asChild size="sm" variant="ghost">
              <Link search={{ low: true }} to="/inventory">
                {t('dashboard.viewInventory')}
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function LowStockEmptyState({ t }: { t: (key: string) => string }): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Box className="text-muted-foreground mb-3 size-10" />
      <p className="text-muted-foreground text-sm font-medium">
        {t('dashboard.noLowStock')}
      </p>
      <p className="text-muted-foreground text-xs">
        {t('dashboard.noLowStockDescription')}
      </p>
    </div>
  )
}

function LowStockTableSkeleton(): React.JSX.Element {
  return (
    <div className="space-y-3">
      {SKELETON_BAR_HEIGHTS.slice(0, 5).map((height) => (
        <div key={`skel-${height}`} className="flex items-center gap-4">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}

function LowStockTable({
  items,
  t,
}: {
  items: InventoryResponseDto[]
  t: (key: string) => string
}): React.JSX.Element {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('dashboard.product')}</TableHead>
          <TableHead>{t('dashboard.location')}</TableHead>
          <TableHead className="text-right">{t('dashboard.quantity')}</TableHead>
          <TableHead className="text-right">{t('dashboard.reorderPoint')}</TableHead>
          <TableHead>{t('dashboard.status')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.slice(0, 10).map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">
              {item.product?.name ?? '-'}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {item.location?.name ?? '-'}
            </TableCell>
            <TableCell className="text-right">{item.quantity}</TableCell>
            <TableCell className="text-muted-foreground text-right">
              {getReorderPoint(item)}
            </TableCell>
            <TableCell>
              <Badge variant={item.quantity === 0 ? 'destructive' : 'outline'}>
                <AlertTriangle className="mr-1 size-3" />
                {t('inventory.lowStock')}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// ---------------------------------------------------------------------------
// Quick actions card
// ---------------------------------------------------------------------------

function QuickActionsCard({ t }: { t: (key: string) => string }): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.quickActions')}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        <Button asChild className="justify-start gap-2" variant="outline">
          <Link to="/stock">
            <Plus className="size-4" />
            {t('dashboard.addProduct')}
          </Link>
        </Button>
        <Button asChild className="justify-start gap-2" variant="outline">
          <Link to="/inventory">
            <WarehouseIcon className="size-4" />
            {t('dashboard.addInventory')}
          </Link>
        </Button>
        <Button asChild className="justify-start gap-2" variant="outline">
          <Link to="/stock">
            <Package className="size-4" />
            {t('dashboard.viewStock')}
          </Link>
        </Button>
        <Button asChild className="justify-start gap-2" variant="outline">
          <Link search={{ low: true }} to="/inventory">
            <AlertTriangle className="size-4" />
            {t('dashboard.viewInventory')}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Stock by location chart
// ---------------------------------------------------------------------------

interface StockByLocationChartProps {
  isLoading: boolean
  data: { name: string; quantity: number }[]
  t: (key: string) => string
}

function StockByLocationChart({
  isLoading,
  data,
  t,
}: StockByLocationChartProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.stockByLocation')}</CardTitle>
        <CardDescription>{t('dashboard.stockByLocationDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <ChartSkeleton />}
        {!isLoading && data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MapPin className="text-muted-foreground mb-3 size-10" />
            <p className="text-muted-foreground text-sm">
              {t('dashboard.noLowStockDescription')}
            </p>
          </div>
        )}
        {!isLoading && data.length > 0 && (
          <ResponsiveContainer height={300} width="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                type="category"
                width={100}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-card)',
                }}
                formatter={(value: number) => [
                  `${String(value)} ${t('dashboard.units')}`,
                  t('dashboard.quantity'),
                ]}
              />
              <Bar dataKey="quantity" radius={[0, 4, 4, 0]}>
                {data.map((entry) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={CHART_COLORS[data.indexOf(entry) % CHART_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

function ChartSkeleton(): React.JSX.Element {
  return (
    <div className="flex h-[300px] items-end gap-2 px-8 pb-8">
      {SKELETON_BAR_HEIGHTS.map((height) => (
        <Skeleton
          key={`chart-skel-${height}`}
          className="flex-1"
          style={{ height }}
        />
      ))}
    </div>
  )
}
