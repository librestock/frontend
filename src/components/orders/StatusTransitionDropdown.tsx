'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ChevronDown } from 'lucide-react'
import { OrderStatus } from '@librestock/types'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  useUpdateOrderStatus,
  getListOrdersQueryKey,
  getGetOrderQueryKey,
} from '@/lib/data/orders'
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
  const queryClient = useQueryClient()

  const validTransitions = getValidTransitions(currentStatus)

  const mutation = useUpdateOrderStatus({
    mutation: {
      onSuccess: async () => {
        toast.success(
          t('orders.statusUpdated') || 'Order status updated',
        )
        await queryClient.invalidateQueries({
          queryKey: getListOrdersQueryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: getGetOrderQueryKey(orderId),
        })
      },
      onError: (error) => {
        toast.error(
          t('orders.statusUpdateError') || 'Failed to update order status',
        )
        console.error('Order status update error:', error)
      },
    },
  })

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
          {t('orders.changeStatus') || 'Change Status'}
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
