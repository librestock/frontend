import * as React from 'react'
import { useTranslation } from 'react-i18next'
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
import { type InventoryResponseDto } from '@/lib/data/inventory'
import { useAdjustInventoryMutation } from '@/hooks/inventory'

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

  const adjustMutation = useAdjustInventoryMutation(() => handleOpenChange(false))

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
      {t('inventory.adjust', { defaultValue: 'Adjust' })}
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {t('inventory.adjustTitle', { defaultValue: 'Adjust Quantity' })}
          </DialogTitle>
          <DialogDescription>
            {t('inventory.adjustDescription', { defaultValue: 'Increase or decrease the quantity.' })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Label>{t('inventory.quantity', { defaultValue: 'Current Quantity' })}</Label>
            <span className="text-lg font-semibold">{inventory.quantity}</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjustment">
              {t('inventory.adjustment', { defaultValue: 'Adjustment' })}
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
            <Label>{t('inventory.quantity', { defaultValue: 'New Quantity' })}</Label>
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
            {t('form.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            disabled={!isValid || adjustMutation.isPending}
            onClick={handleSubmit}
          >
            {adjustMutation.isPending
              ? 'Saving...'
              : t('actions.save', { defaultValue: 'Save' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
