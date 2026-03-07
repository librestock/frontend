import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import type { OrderStatus } from '@librestock/types'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useOrderStatusTransition } from '@/hooks/orders'
import { getValidTransitions } from '@/lib/order-state-machine'

interface StatusTransitionDropdownProps {
  orderId: string
  currentStatus: OrderStatus
}

export function StatusTransitionDropdown({
  orderId,
  currentStatus,
}: StatusTransitionDropdownProps): React.JSX.Element | null {
  const { t } = useTranslation()

  const validTransitions = getValidTransitions(currentStatus)

  const mutation = useOrderStatusTransition(orderId)

  if (validTransitions.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={mutation.isPending}
          size="sm"
          variant="outline"
        >
          {t('orders.changeStatus', { defaultValue: 'Change Status' })}
          <ChevronDown className="ml-1 size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {validTransitions.map((targetStatus) => (
          <DropdownMenuItem
            key={targetStatus}
            onClick={() => {
              mutation.mutate({
                id: orderId,
                data: { status: targetStatus },
              })
            }}
          >
            {t(`orders.statuses.${targetStatus}`) || targetStatus}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
