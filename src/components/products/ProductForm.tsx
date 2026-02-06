import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { CategoryPathSelector } from '@/components/category/CategoryPathSelector'
import { BooleanSelect } from '@/components/common/BooleanSelect'
import { FormErrorBanner } from '@/components/common/FormErrorBanner'
import { QrCodeScannerDialog } from '@/components/common/QrCodeScannerDialog'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Input } from '@/components/ui/input'
import { ImagePlaceholder } from '@/components/items/ImagePlaceholder'
import { type CategoryWithChildrenResponseDto } from '@/lib/data/categories'
import { useProductForm } from '@/hooks/forms/use-product-form'

interface ProductFormProps {
  categories?: CategoryWithChildrenResponseDto[]
  defaultCategoryId?: string
  onSuccess?: () => void
}

export function ProductForm({
  categories,
  defaultCategoryId,
  onSuccess,
}: ProductFormProps): React.JSX.Element {
  const { t } = useTranslation()
  const form = useProductForm(categories, defaultCategoryId, onSuccess)
  const [scanOpen, setScanOpen] = React.useState(false)
  const [imageUrl, setImageUrl] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  React.useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl)
      }
    }
  }, [imageUrl])

  return (
    <form
      id="create-product-form"
      onSubmit={async (e) => {
        e.preventDefault()
        await form.handleSubmit()
      }}
    >
      <FormErrorBanner errors={form.state.errors} />

      <div className="grid gap-6 md:grid-cols-2">
        <FieldGroup>
          <form.Field name="sku">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  {t('form.productSku')}
                </FieldLabel>
                <FieldContent>
                  <InputGroup>
                    <InputGroupInput
                      aria-invalid={field.state.meta.errors.length > 0}
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        type="button"
                        variant="ghost"
                        onClick={() => setScanOpen(true)}
                      >
                        {t('form.scanQrCode') || 'Scan QR code'}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                  <QrCodeScannerDialog
                    open={scanOpen}
                    onOpenChange={setScanOpen}
                    onScanned={(value) => {
                      field.handleChange(value)
                    }}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </FieldContent>
              </Field>
            )}
          </form.Field>

          <form.Field name="name">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  {t('form.productName')}
                </FieldLabel>
                <FieldContent>
                  <Input
                    aria-invalid={field.state.meta.errors.length > 0}
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </FieldContent>
              </Field>
            )}
          </form.Field>

          <form.Field name="category_id">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>{t('category')}</FieldLabel>
                <FieldContent>
                  {!!categories && (
                    <CategoryPathSelector
                      categories={categories}
                      value={field.state.value}
                      emptyOptionLabel={
                        t('form.selectCategoryPlaceholder') ||
                        'Select a category'
                      }
                      onValueChange={field.handleChange}
                    />
                  )}
                  <FieldError errors={field.state.meta.errors} />
                </FieldContent>
              </Field>
            )}
          </form.Field>

          <form.Field name="reorder_point">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  {t('form.reorderPoint')}
                </FieldLabel>
                <FieldContent>
                  <Input
                    aria-invalid={field.state.meta.errors.length > 0}
                    id={field.name}
                    min={0}
                    name={field.name}
                    type="number"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </FieldContent>
              </Field>
            )}
          </form.Field>

          <form.Field name="is_active">
            {(field) => (
              <Field>
                <FieldLabel>{t('form.isActive')}</FieldLabel>
                <FieldContent>
                  <BooleanSelect
                    falseLabel={t('form.inactive')}
                    trueLabel={t('form.active')}
                    value={field.state.value}
                    onValueChange={field.handleChange}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </FieldContent>
              </Field>
            )}
          </form.Field>

          <form.Field name="is_perishable">
            {(field) => (
              <Field>
                <FieldLabel>{t('form.isPerishable')}</FieldLabel>
                <FieldContent>
                  <BooleanSelect
                    falseLabel={t('form.nonPerishable')}
                    trueLabel={t('form.perishable')}
                    value={field.state.value}
                    onValueChange={field.handleChange}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </FieldContent>
              </Field>
            )}
          </form.Field>
        </FieldGroup>

        <div className="space-y-3">
          <div className="text-sm font-medium">
            {t('form.productImage') || 'Product image'}
          </div>
          <div className="bg-muted relative aspect-square overflow-hidden rounded-lg border">
            {imageUrl ? (
              <img
                alt={t('form.productImage') || 'Product image'}
                className="h-full w-full object-cover"
                src={imageUrl}
              />
            ) : (
              <ImagePlaceholder />
            )}
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                if (imageUrl) URL.revokeObjectURL(imageUrl)
                setImageUrl(URL.createObjectURL(file))
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              {t('form.uploadImage') || 'Upload image'}
            </Button>
            <Button
              disabled={!imageUrl}
              type="button"
              variant="ghost"
              onClick={() => {
                if (imageUrl) URL.revokeObjectURL(imageUrl)
                setImageUrl(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
            >
              {t('form.removeImage') || 'Remove'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
