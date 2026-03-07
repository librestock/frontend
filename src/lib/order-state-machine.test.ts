import { describe, expect, it } from 'vitest'
import { OrderStatus } from '@librestock/types'
import { getValidTransitions, ORDER_TRANSITIONS } from './order-state-machine'

describe('order state machine', () => {
  it('exposes transition entries for every order status', () => {
    for (const status of Object.values(OrderStatus)) {
      expect(ORDER_TRANSITIONS[status]).toBeDefined()
    }
  })

  it('allows draft to transition to confirmed and cancelled', () => {
    expect(getValidTransitions(OrderStatus.DRAFT)).toEqual([
      OrderStatus.CONFIRMED,
      OrderStatus.CANCELLED,
    ])
  })

  it('does not allow transitions from delivered', () => {
    expect(getValidTransitions(OrderStatus.DELIVERED)).toEqual([])
  })

  it('allows on-hold to resume active workflow states', () => {
    const transitions = getValidTransitions(OrderStatus.ON_HOLD)

    expect(transitions).toContain(OrderStatus.CONFIRMED)
    expect(transitions).toContain(OrderStatus.PICKING)
    expect(transitions).toContain(OrderStatus.CANCELLED)
  })
})
