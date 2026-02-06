'use client'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { CategoryForm } from './CategoryForm'
import { Button } from '@/components/ui/button'
import type { CategoryWithChildrenResponseDto } from '@/lib/data/categories'
import { FormDialog } from '@/components/common/FormDialog'

interface CreateCategoryProps {
  categories?: CategoryWithChildrenResponseDto[]
  defaultParentId?: string | null
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateCategory({
  categories,
  defaultParentId,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: CreateCategoryProps): React.JSX.Element {
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
    <Button className="rounded-t-none" variant="outline">
      {t('form.createCategoryTitle')}
    </Button>
  )

  return (
    <FormDialog
      cancelLabel={t('form.cancel')}
      description={t('form.createCategoryDescription')}
      formId="create-category-form"
      open={open}
      submitLabel={t('form.create')}
      title={t('form.createCategoryTitle')}
      trigger={trigger ?? defaultTrigger}
      onOpenChange={handleOpenChange}
    >
      <CategoryForm
        key={defaultParentId ?? ''}
        categories={categories}
        defaultParentId={defaultParentId}
        onSuccess={() => handleOpenChange(false)}
      />
    </FormDialog>
  )
}
