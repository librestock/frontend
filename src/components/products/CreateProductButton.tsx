'use client'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { ProductForm } from './ProductForm'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { FormDialog } from '@/components/common/FormDialog'
import { useListCategories } from '@/lib/data/categories'

interface CreateProductButtonProps {
  defaultCategoryId?: string | null
}

export function CreateProductButton({
  defaultCategoryId,
}: CreateProductButtonProps): React.JSX.Element {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)

  const {
    data: categories,
    isLoading,
    error,
  } = useListCategories({
    query: { enabled: open },
  })

  return (
    <FormDialog
      cancelLabel={t('form.cancel')}
      contentClassName="sm:max-w-[900px]"
      description={t('form.createProductDescription')}
      formId="create-product-form"
      open={open}
      submitLabel={t('form.create')}
      title={t('form.createProductTitle')}
      trigger={
        <Button variant="outline">{t('form.createProductTitle')}</Button>
      }
      onOpenChange={setOpen}
    >
      {isLoading === true && (
        <div className="flex justify-center py-6">
          <Spinner className="size-6" />
        </div>
      )}

      {error != null && (
        <p className="text-destructive text-sm">
          {t('form.loadCategoriesError') || 'Failed to load categories'}
        </p>
      )}

      {isLoading !== true && error == null && (
        <ProductForm
          categories={categories}
          defaultCategoryId={defaultCategoryId ?? undefined}
          onSuccess={() => setOpen(false)}
        />
      )}
    </FormDialog>
  )
}
