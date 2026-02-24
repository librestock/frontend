import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Package,
  Pencil,
  Trash2,
  type LucideIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ProductThumbnail } from '@/components/products/ProductThumbnail'
import {
  useListProductPhotos,
  getPhotoFileUrl,
} from '@/lib/data/photos'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FormDialog } from '@/components/common/FormDialog'
import { DeleteConfirmationDialog } from '@/components/common/DeleteConfirmationDialog'
import { ProductForm } from '@/components/products/ProductForm'
import { Spinner } from '@/components/ui/spinner'
import {
  useGetProduct,
  useDeleteProduct,
  getListProductsQueryKey,
  getGetProductsByCategoryQueryKey,
  getGetProductQueryOptions,
  type PaginatedProductsResponseDto,
  type ProductResponseDto,
} from '@/lib/data/products'
import { useListCategories } from '@/lib/data/categories'
import {
  removeItemFromPaginated,
  removeItemFromArray,
  restoreQueryData,
  snapshotQueryData,
} from '@/lib/data/query-cache'

export const Route = createFileRoute('/products/$id')({
  loader: async ({ context: { queryClient }, params }) => {
    try {
      await queryClient.ensureQueryData(getGetProductQueryOptions(params.id))
    } catch {
      // Allow client-side to retry if SSR prefetch fails
    }
  },
  component: ProductDetailPage,
})

const PRODUCTS_ROUTE = '/products'

interface DetailFieldProps {
  icon: LucideIcon
  label: string
  value: string
}

function DetailField({ icon: Icon, label, value }: DetailFieldProps): React.JSX.Element {
  return (
    <div className="flex items-start gap-2">
      <Icon className="text-muted-foreground mt-0.5 size-4" />
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-muted-foreground text-sm">{value}</p>
      </div>
    </div>
  )
}

interface ProductDetailsCardProps {
  product: ProductResponseDto
}

function useProductDetailFields(product: ProductResponseDto): { label: string; value: string; fullWidth?: boolean }[] {
  const { t } = useTranslation()

  return React.useMemo(() => {
    const fields: { label: string; value: string; fullWidth?: boolean }[] = [
      { label: t('form.productSku') || 'SKU', value: product.sku },
    ]

    if (product.category?.name) {
      fields.push({ label: t('category') || 'Category', value: product.category.name })
    }

    fields.push({
      label: t('form.reorderPoint') || 'Reorder Point',
      value: String(product.reorder_point),
    })

    const optionalFields: [string | null | undefined | number, string][] = [
      [product.barcode, t('products.barcode') || 'Barcode'],
      [product.unit, t('products.unit') || 'Unit'],
      [product.standard_cost, t('products.standardCost') || 'Standard Cost'],
      [product.standard_price, t('products.standardPrice') || 'Standard Price'],
      [product.weight_kg, t('products.weight') || 'Weight (kg)'],
      [product.volume_ml, t('products.volume') || 'Volume (ml)'],
      [product.dimensions_cm, t('products.dimensions') || 'Dimensions (cm)'],
    ]

    for (const [val, label] of optionalFields) {
      if (val != null && val !== '') {
        fields.push({ label, value: String(val) })
      }
    }

    if (product.description) {
      fields.push({ label: t('form.description') || 'Description', value: product.description, fullWidth: true })
    }
    if (product.notes) {
      fields.push({ label: t('products.notes') || 'Notes', value: product.notes, fullWidth: true })
    }

    return fields
  }, [product, t])
}

function ProductDetailsCard({ product }: ProductDetailsCardProps): React.JSX.Element {
  const { t } = useTranslation()
  const fields = useProductDetailFields(product)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {t('products.details') || 'Product Details'}
        </CardTitle>
        <CardDescription>
          {t('products.detailsSubtitle') || 'Product specifications and attributes'}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((field) =>
          field.fullWidth ? (
            <div key={field.label} className="col-span-full">
              <p className="text-sm font-medium">{field.label}</p>
              <p className="text-muted-foreground text-sm">{field.value}</p>
            </div>
          ) : (
            <DetailField
              key={field.label}
              icon={Package}
              label={field.label}
              value={field.value}
            />
          ),
        )}
      </CardContent>
    </Card>
  )
}

interface ProductPhotosCardProps {
  productId: string
}

function ProductPhotosCard({ productId }: ProductPhotosCardProps): React.JSX.Element | null {
  const { t } = useTranslation()
  const { data: photos, isLoading } = useListProductPhotos(productId)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-6">
          <Spinner className="size-6" />
        </CardContent>
      </Card>
    )
  }

  if (!photos || photos.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {t('products.photos') || 'Photos'}
        </CardTitle>
        <CardDescription>
          {t('products.photosSubtitle') || 'Product images'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="bg-muted aspect-square overflow-hidden rounded-lg border"
            >
              <img
                alt={photo.filename}
                className="h-full w-full object-cover"
                src={getPhotoFileUrl(photo.id)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface ProductHeaderProps {
  product: ProductResponseDto
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
}

function ProductHeader({
  product,
  onBack,
  onEdit,
  onDelete,
}: ProductHeaderProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="border-b px-6 py-4">
      <Button className="mb-4" size="sm" variant="ghost" onClick={onBack}>
        <ArrowLeft className="mr-2 size-4" />
        {t('navigation.products') || 'Back to Products'}
      </Button>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-muted size-12 overflow-hidden rounded-lg border">
            <ProductThumbnail alt={product.name} productId={product.id} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{product.name}</h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={product.is_active ? 'default' : 'secondary'}>
                {product.is_active
                  ? (t('form.active') || 'Active')
                  : (t('form.inactive') || 'Inactive')}
              </Badge>
              <span className="text-muted-foreground text-sm">
                {product.sku}
              </span>
              {product.is_perishable && (
                <Badge variant="outline">
                  {t('form.perishable') || 'Perishable'}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Pencil className="mr-2 size-4" />
            {t('actions.edit') || 'Edit'}
          </Button>
          <Button
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            variant="outline"
            onClick={onDelete}
          >
            <Trash2 className="mr-2 size-4" />
            {t('actions.delete') || 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function ProductDetailPage(): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id: productId } = Route.useParams()
  const queryClient = useQueryClient()

  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const { data: product, isLoading, error } = useGetProduct(productId, {
    query: { enabled: !!productId },
  })

  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useListCategories({
    query: { enabled: editOpen },
  })

  const deleteMutation = useDeleteProduct({
    mutation: {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: getListProductsQueryKey(),
          }),
          ...(product
            ? [
                queryClient.invalidateQueries({
                  queryKey: getGetProductsByCategoryQueryKey(
                    product.category_id,
                  ),
                }),
              ]
            : []),
        ])
      },
      onError: (err) => {
        toast.error(t('products.deleteError') || 'Failed to delete product')
        console.error('Product deletion error:', err)
      },
    },
  })

  const handleDelete = (): void => {
    if (!product) return

    const listQueryKey = getListProductsQueryKey()
    const categoryQueryKey = getGetProductsByCategoryQueryKey(
      product.category_id,
    )

    const listSnapshot = snapshotQueryData<PaginatedProductsResponseDto>(
      queryClient,
      listQueryKey,
    )
    const categorySnapshot = snapshotQueryData<ProductResponseDto[]>(
      queryClient,
      categoryQueryKey,
    )

    queryClient.setQueriesData<PaginatedProductsResponseDto>(
      { queryKey: listQueryKey },
      (old) => removeItemFromPaginated(old, productId),
    )
    queryClient.setQueriesData<ProductResponseDto[]>(
      { queryKey: categoryQueryKey },
      (old) => removeItemFromArray(old, productId),
    )

    setDeleteOpen(false)

    let didUndo = false
    const timeoutId = window.setTimeout(() => {
      if (didUndo) {
        return
      }
      deleteMutation.mutateAsync({ id: productId }).catch(() => {
        restoreQueryData(queryClient, listSnapshot)
        restoreQueryData(queryClient, categorySnapshot)
      })
    }, 5000)

    toast(t('products.deleted') || 'Product deleted successfully', {
      action: {
        label: t('actions.undo') || 'Undo',
        onClick: () => {
          didUndo = true
          window.clearTimeout(timeoutId)
          restoreQueryData(queryClient, listSnapshot)
          restoreQueryData(queryClient, categorySnapshot)
        },
      },
    })

    void navigate({ to: PRODUCTS_ROUTE })
  }

  const handleBack = (): void => {
    void navigate({ to: PRODUCTS_ROUTE })
  }

  const editFormId = `edit-product-form-${productId}`

  return (
    <Dialog open onOpenChange={(open) => { if (!open) handleBack() }}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-hidden flex flex-col p-0" showCloseButton={false}>
        <DialogTitle className="sr-only">
          {product?.name ?? (t('products.details') || 'Product Details')}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {t('products.detailsSubtitle') || 'Product specifications and attributes'}
        </DialogDescription>
        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Spinner />
          </div>
        ) : error || !product ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-4">
            <p className="text-destructive">
              {t('products.errorLoadingDetail') || 'Error loading product'}
            </p>
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 size-4" />
              {t('navigation.products') || 'Back to Products'}
            </Button>
          </div>
        ) : (
          <>
            <ProductHeader
              product={product}
              onBack={handleBack}
              onDelete={() => setDeleteOpen(true)}
              onEdit={() => setEditOpen(true)}
            />

            <div className="flex-1 overflow-auto px-6 pb-6 space-y-6">
              <ProductPhotosCard productId={productId} />
              <ProductDetailsCard product={product} />
            </div>

            <FormDialog
              cancelLabel={t('form.cancel') || 'Cancel'}
              contentClassName="sm:max-w-[900px]"
              description={t('products.editDescription') || 'Update product details.'}
              formId={editFormId}
              open={editOpen}
              submitLabel={t('actions.save') || 'Save'}
              title={t('products.editTitle') || 'Edit Product'}
              onOpenChange={setEditOpen}
            >
              {categoriesLoading === true && (
                <div className="flex justify-center py-6">
                  <Spinner className="size-6" />
                </div>
              )}

              {categoriesError != null && (
                <p className="text-destructive text-sm">
                  {t('form.loadCategoriesError') || 'Failed to load categories'}
                </p>
              )}

              {categoriesLoading !== true && categoriesError == null && (
                <ProductForm
                  categories={categories}
                  formId={editFormId}
                  product={product}
                  onSuccess={() => setEditOpen(false)}
                />
              )}
            </FormDialog>

            <DeleteConfirmationDialog
              isLoading={deleteMutation.isPending}
              open={deleteOpen}
              title={t('products.deleteTitle') || 'Delete Product'}
              description={
                t('products.deleteDescription') ||
                'Are you sure you want to delete this product? This action cannot be undone.'
              }
              onConfirm={handleDelete}
              onOpenChange={setDeleteOpen}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
