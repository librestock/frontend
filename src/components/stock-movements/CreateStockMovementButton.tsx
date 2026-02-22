'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { StockMovementForm } from './StockMovementForm'
import { Button } from '@/components/ui/button'
import { FormDialog } from '@/components/common/FormDialog'

interface CreateStockMovementButtonProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateStockMovementButton({
  trigger,
  open: controlledOpen,
  onOpenChange,
}: CreateStockMovementButtonProps): React.JSX.Element {
  const { t } = useTranslation()
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)

  const open = controlledOpen ?? uncontrolledOpen

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(nextOpen)
      }
      onOpenChange?.(nextOpen)
    },
    [controlledOpen, onOpenChange],
  )

  const defaultTrigger = (
    <Button>
      <Plus className="size-4" />
      {t('stockMovements.create') || 'Record Movement'}
    </Button>
  )

  return (
    <FormDialog
      cancelLabel={t('form.cancel') || 'Cancel'}
      contentClassName="sm:max-w-[500px]"
      description={t('stockMovements.createDescription') || 'Record a new stock movement.'}
      formId="create-stock-movement-form"
      open={open}
      submitLabel={t('form.create') || 'Create'}
      title={t('stockMovements.createTitle') || 'Record Stock Movement'}
      trigger={trigger ?? defaultTrigger}
      onOpenChange={handleOpenChange}
    >
      <StockMovementForm
        formId="create-stock-movement-form"
        onSuccess={() => handleOpenChange(false)}
      />
    </FormDialog>
  )
}
