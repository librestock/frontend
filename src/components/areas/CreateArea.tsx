'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { AreaForm } from './AreaForm'
import { Button } from '@/components/ui/button'
import { FormDialog } from '@/components/common/FormDialog'

interface CreateAreaProps {
  locationId: string
  parentId?: string
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateArea({
  locationId,
  parentId,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: CreateAreaProps): React.JSX.Element {
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

  const defaultTrigger =
    controlledOpen === undefined ? (
      <Button>
        <Plus className="size-4" />
        {t('areas.create') || 'Create Area'}
      </Button>
    ) : undefined

  return (
    <FormDialog
      cancelLabel={t('form.cancel') || 'Cancel'}
      description={t('areas.createDescription') || 'Add a new area within this location.'}
      formId="create-area-form"
      open={open}
      submitLabel={t('form.create') || 'Create'}
      title={t('areas.createTitle') || 'Create Area'}
      trigger={trigger ?? defaultTrigger}
      onOpenChange={handleOpenChange}
    >
      <AreaForm
        formId="create-area-form"
        locationId={locationId}
        parentId={parentId}
        onSuccess={() => handleOpenChange(false)}
      />
    </FormDialog>
  )
}
