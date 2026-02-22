import { OrderStatus } from '@librestock/types'

/**
 * Valid state transitions for orders, mirroring the backend state machine.
 * Maps each status to the list of statuses it can transition to.
 */
export const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  [OrderStatus.DRAFT]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [
    OrderStatus.SOURCING,
    OrderStatus.ON_HOLD,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.SOURCING]: [
    OrderStatus.PICKING,
    OrderStatus.ON_HOLD,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.PICKING]: [
    OrderStatus.PACKED,
    OrderStatus.ON_HOLD,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.PACKED]: [
    OrderStatus.SHIPPED,
    OrderStatus.ON_HOLD,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.ON_HOLD]: [
    OrderStatus.CONFIRMED,
    OrderStatus.SOURCING,
    OrderStatus.PICKING,
    OrderStatus.PACKED,
    OrderStatus.CANCELLED,
  ],
}

export function getValidTransitions(status: OrderStatus): readonly OrderStatus[] {
  return ORDER_TRANSITIONS[status] ?? []
}
