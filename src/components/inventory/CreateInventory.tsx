'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { InventoryForm } from './InventoryForm'
import { Button } from '@/components/ui/button'
import { FormDialog } from '@/components/common/FormDialog'

interface CreateInventoryProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultLocationId?: string
  defaultAreaId?: string
}

export function CreateInventory({
  trigger,
  open: controlledOpen,
  onOpenChange,
  defaultLocationId,
  defaultAreaId,
}: CreateInventoryProps): React.JSX.Element {
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
      {t('inventory.create') || 'Add Inventory'}
    </Button>
  )

  return (
    <FormDialog
      cancelLabel={t('form.cancel') || 'Cancel'}
      description={t('inventory.createDescription') || 'Add inventory for a product at a location.'}
      formId="create-inventory-form"
      open={open}
      submitLabel={t('form.create') || 'Create'}
      title={t('inventory.createTitle') || 'Add Inventory'}
      trigger={trigger ?? defaultTrigger}
      onOpenChange={handleOpenChange}
    >
      <InventoryForm
        defaultAreaId={defaultAreaId}
        defaultLocationId={defaultLocationId}
        formId="create-inventory-form"
        onSuccess={() => handleOpenChange(false)}
      />
    </FormDialog>
  )
}
