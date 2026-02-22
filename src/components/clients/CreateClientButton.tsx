'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { ClientForm } from './ClientForm'
import { Button } from '@/components/ui/button'
import { FormDialog } from '@/components/common/FormDialog'

interface CreateClientButtonProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateClientButton({
  trigger,
  open: controlledOpen,
  onOpenChange,
}: CreateClientButtonProps): React.JSX.Element {
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
      {t('clients.create') || 'Create Client'}
    </Button>
  )

  return (
    <FormDialog
      cancelLabel={t('form.cancel') || 'Cancel'}
      contentClassName="sm:max-w-[550px]"
      description={t('clients.createDescription') || 'Add a new client to your system.'}
      formId="create-client-form"
      open={open}
      submitLabel={t('form.create') || 'Create'}
      title={t('clients.createTitle') || 'Create Client'}
      trigger={trigger ?? defaultTrigger}
      onOpenChange={handleOpenChange}
    >
      <ClientForm
        formId="create-client-form"
        onSuccess={() => handleOpenChange(false)}
      />
    </FormDialog>
  )
}
