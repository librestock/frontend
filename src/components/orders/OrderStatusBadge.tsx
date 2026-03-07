import { useTranslation } from 'react-i18next'
import { OrderStatus } from '@librestock/types/orders'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const BLUE_STATUS_STYLE = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'

const STATUS_STYLES: Record<OrderStatus, string> = {
  [OrderStatus.DRAFT]:
    'bg-muted text-muted-foreground border-border',
  [OrderStatus.CONFIRMED]: BLUE_STATUS_STYLE,
  [OrderStatus.SOURCING]: BLUE_STATUS_STYLE,
  [OrderStatus.PICKING]: BLUE_STATUS_STYLE,
  [OrderStatus.PACKED]: BLUE_STATUS_STYLE,
  [OrderStatus.SHIPPED]:
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  [OrderStatus.DELIVERED]:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  [OrderStatus.CANCELLED]:
    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  [OrderStatus.ON_HOLD]:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
}

interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
}

export function OrderStatusBadge({
  status,
  className,
}: OrderStatusBadgeProps): React.JSX.Element {
  const { t } = useTranslation()
  const label = t(`orders.statuses.${status}`) || status

  return (
    <Badge
      className={cn(STATUS_STYLES[status], className)}
      variant="outline"
    >
      {label}
    </Badge>
  )
}
