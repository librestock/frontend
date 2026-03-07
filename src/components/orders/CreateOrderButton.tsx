import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'

import { OrderForm } from './OrderForm'
import { Button } from '@/components/ui/button'
import { FormDialog } from '@/components/common/FormDialog'

interface CreateOrderButtonProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateOrderButton({
  trigger,
  open: controlledOpen,
  onOpenChange,
}: CreateOrderButtonProps): React.JSX.Element {
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
      {t('orders.create', { defaultValue: 'Create Order' })}
    </Button>
  )

  return (
    <FormDialog
      cancelLabel={t('form.cancel', { defaultValue: 'Cancel' })}
      contentClassName="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
      formId="create-order-form"
      open={open}
      submitLabel={t('form.create', { defaultValue: 'Create' })}
      title={t('orders.createTitle', { defaultValue: 'Create Order' })}
      trigger={trigger ?? defaultTrigger}
      description={
        t('orders.createDescription', { defaultValue: 'Create a new order with items.' })
      }
      onOpenChange={handleOpenChange}
    >
      <OrderForm
        formId="create-order-form"
        onSuccess={() => handleOpenChange(false)}
      />
    </FormDialog>
  )
}
