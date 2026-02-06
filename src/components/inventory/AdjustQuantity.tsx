'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  type InventoryResponseDto,
  useAdjustInventoryQuantity,
  getListInventoryQueryKey,
} from '@/lib/data/inventory'

interface AdjustQuantityProps {
  inventory: InventoryResponseDto
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AdjustQuantity({
  inventory,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: AdjustQuantityProps): React.JSX.Element {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const [adjustment, setAdjustment] = React.useState(0)

  const open = controlledOpen ?? uncontrolledOpen

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setAdjustment(0)
      }
      if (controlledOpen === undefined) {
        setUncontrolledOpen(nextOpen)
      }
      onOpenChange?.(nextOpen)
    },
    [controlledOpen, onOpenChange],
  )

  const adjustMutation = useAdjustInventoryQuantity({
    mutation: {
      onSuccess: async () => {
        toast.success(t('inventory.adjusted') || 'Quantity adjusted successfully')
        await queryClient.invalidateQueries({
          queryKey: getListInventoryQueryKey(),
        })
        handleOpenChange(false)
      },
      onError: (error) => {
        toast.error(t('inventory.adjustError') || 'Failed to adjust quantity')
        console.error('Quantity adjustment error:', error)
      },
    },
  })

  const handleSubmit = async (): Promise<void> => {
    if (adjustment === 0) {
      handleOpenChange(false)
      return
    }

    await adjustMutation.mutateAsync({
      id: inventory.id,
      data: { adjustment },
    })
  }

  const newQuantity = inventory.quantity + adjustment
  const isValid = newQuantity >= 0

  const defaultTrigger = (
    <Button size="sm" variant="outline">
      {t('inventory.adjust') || 'Adjust'}
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {t('inventory.adjustTitle') || 'Adjust Quantity'}
          </DialogTitle>
          <DialogDescription>
            {t('inventory.adjustDescription') || 'Increase or decrease the quantity.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Label>{t('inventory.quantity') || 'Current Quantity'}</Label>
            <span className="text-lg font-semibold">{inventory.quantity}</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjustment">
              {t('inventory.adjustment') || 'Adjustment'}
            </Label>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                type="button"
                variant="outline"
                onClick={() => setAdjustment((a) => a - 1)}
              >
                <Minus className="size-4" />
              </Button>
              <Input
                className="text-center"
                id="adjustment"
                type="number"
                value={adjustment}
                onChange={(e) => setAdjustment(Number(e.target.value))}
              />
              <Button
                size="icon"
                type="button"
                variant="outline"
                onClick={() => setAdjustment((a) => a + 1)}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <Label>{t('inventory.quantity') || 'New Quantity'}</Label>
            <span
              className={`text-lg font-semibold ${!isValid ? 'text-destructive' : ''}`}
            >
              {newQuantity}
            </span>
          </div>

          {!isValid && (
            <p className="text-destructive text-sm">
              Quantity cannot be negative
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {t('form.cancel') || 'Cancel'}
          </Button>
          <Button
            disabled={!isValid || adjustMutation.isPending}
            onClick={handleSubmit}
          >
            {adjustMutation.isPending
              ? 'Saving...'
              : t('actions.save') || 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
