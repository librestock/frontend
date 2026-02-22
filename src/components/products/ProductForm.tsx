import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
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
import { Spinner } from '@/components/ui/spinner'
import { ImagePlaceholder } from '@/components/items/ImagePlaceholder'
import { type CategoryWithChildrenResponseDto } from '@/lib/data/categories'
import type { ProductResponseDto } from '@/lib/data/products'
import {
  useListProductPhotos,
  useUploadProductPhoto,
  useDeleteProductPhoto,
  getListProductPhotosQueryKey,
  getPhotoFileUrl,
  type PhotoResponseDto,
} from '@/lib/data/photos'
import { useProductForm } from '@/hooks/forms/use-product-form'

interface ProductFormProps {
  product?: ProductResponseDto
  categories?: CategoryWithChildrenResponseDto[]
  defaultCategoryId?: string
  formId?: string
  onSuccess?: () => void
}

export function ProductForm({
  product,
  categories,
  defaultCategoryId,
  formId = 'create-product-form',
  onSuccess,
}: ProductFormProps): React.JSX.Element {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [scanOpen, setScanOpen] = React.useState(false)

  // Local file staging (for new photos not yet uploaded)
  const [pendingFile, setPendingFile] = React.useState<File | null>(null)
  const [pendingPreview, setPendingPreview] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  // The form hook handles product creation/update + photo upload on create
  const form = useProductForm({ product, categories, defaultCategoryId, pendingFile, onSuccess })

  const isEditMode = !!product

  // Existing photos (edit mode)
  const {
    data: existingPhotos,
    isLoading: photosLoading,
  } = useListProductPhotos(product?.id ?? '', {
    query: { enabled: isEditMode },
  })

  // Direct upload mutation for edit mode (immediate upload on file pick)
  const editUploadMutation = useUploadProductPhoto({
    mutation: {
      onSuccess: async () => {
        if (product) {
          await queryClient.invalidateQueries({
            queryKey: getListProductPhotosQueryKey(product.id),
          })
        }
        toast.success(t('form.photoUploaded') || 'Photo uploaded')
      },
      onError: () => {
        toast.error(t('form.uploadError') || 'Failed to upload image')
      },
    },
  })

  const deleteMutation = useDeleteProductPhoto({
    mutation: {
      onSuccess: async () => {
        if (product) {
          await queryClient.invalidateQueries({
            queryKey: getListProductPhotosQueryKey(product.id),
          })
        }
        toast.success(t('form.photoDeleted') || 'Photo deleted')
      },
      onError: () => {
        toast.error(t('form.photoDeleteError') || 'Failed to delete photo')
      },
    },
  })

  // Cleanup preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (pendingPreview) {
        URL.revokeObjectURL(pendingPreview)
      }
    }
  }, [pendingPreview])

  const clearPendingFile = React.useCallback((): void => {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview)
    setPendingFile(null)
    setPendingPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [pendingPreview])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (!file) return
    if (pendingPreview) URL.revokeObjectURL(pendingPreview)

    if (isEditMode && product) {
      // In edit mode, upload immediately
      setPendingFile(null)
      setPendingPreview(null)
      editUploadMutation.mutate({ productId: product.id, file })
    } else {
      // In create mode, stage the file for upload after product creation
      setPendingFile(file)
      setPendingPreview(URL.createObjectURL(file))
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDeleteExistingPhoto = (photo: PhotoResponseDto): void => {
    deleteMutation.mutate({ id: photo.id })
  }

  // Determine what to display in the image area
  const firstExistingPhoto = existingPhotos?.[0]
  const displayUrl = pendingPreview
    ?? (firstExistingPhoto ? getPhotoFileUrl(firstExistingPhoto.id) : null)

  return (
    <form
      id={formId}
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

          {/* Main image preview */}
          <div className="bg-muted relative aspect-square overflow-hidden rounded-lg border">
            {editUploadMutation.isPending && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
                <Spinner className="size-6" />
              </div>
            )}
            {displayUrl ? (
              <img
                alt={t('form.productImage') || 'Product image'}
                className="h-full w-full object-cover"
                src={displayUrl}
              />
            ) : (
              <ImagePlaceholder />
            )}
          </div>

          {/* Upload / remove buttons */}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              type="file"
              onChange={handleFileChange}
            />
            <Button
              disabled={editUploadMutation.isPending}
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              {t('form.uploadImage') || 'Upload image'}
            </Button>
            {!isEditMode && pendingPreview && (
              <Button
                type="button"
                variant="ghost"
                onClick={clearPendingFile}
              >
                {t('form.removeImage') || 'Remove'}
              </Button>
            )}
          </div>

          {/* Existing photos grid (edit mode) */}
          {isEditMode && (
            <div className="space-y-2">
              {photosLoading && (
                <div className="flex justify-center py-2">
                  <Spinner className="size-4" />
                </div>
              )}
              {existingPhotos && existingPhotos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {existingPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="group relative aspect-square overflow-hidden rounded-md border"
                    >
                      <img
                        alt={photo.filename}
                        className="h-full w-full object-cover"
                        src={getPhotoFileUrl(photo.id)}
                      />
                      <button
                        className="absolute top-1 right-1 rounded-full bg-destructive/80 p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                        disabled={deleteMutation.isPending}
                        type="button"
                        onClick={() => handleDeleteExistingPhoto(photo)}
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </form>
  )
}
