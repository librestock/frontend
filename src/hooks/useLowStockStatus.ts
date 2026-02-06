export function useLowStockStatus(
  product: unknown,
  quantity: number
): boolean {
  if (!product || typeof product !== 'object') return false
  if (!('reorder_point' in product)) return false
  const reorderPoint = (product as { reorder_point: unknown }).reorder_point
  if (typeof reorderPoint !== 'number') return false
  return quantity <= reorderPoint
}
