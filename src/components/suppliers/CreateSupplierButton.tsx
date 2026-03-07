import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { SupplierForm } from './SupplierForm'
import { Button } from '@/components/ui/button'
import { FormDialog } from '@/components/common/FormDialog'

interface CreateSupplierButtonProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateSupplierButton({
  trigger,
  open: controlledOpen,
  onOpenChange,
}: CreateSupplierButtonProps): React.JSX.Element {
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
      {t('suppliers.create', { defaultValue: 'Create Supplier' })}
    </Button>
  )

  return (
    <FormDialog
      cancelLabel={t('form.cancel', { defaultValue: 'Cancel' })}
      contentClassName="sm:max-w-[550px]"
      description={t('suppliers.createDescription', { defaultValue: 'Add a new supplier to your system.' })}
      formId="create-supplier-form"
      open={open}
      submitLabel={t('form.create', { defaultValue: 'Create' })}
      title={t('suppliers.createTitle', { defaultValue: 'Create Supplier' })}
      trigger={trigger ?? defaultTrigger}
      onOpenChange={handleOpenChange}
    >
      <SupplierForm
        formId="create-supplier-form"
        onSuccess={() => handleOpenChange(false)}
      />
    </FormDialog>
  )
}
