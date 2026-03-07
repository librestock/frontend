import * as React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '../ui/field'
import { Input } from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { FormErrorBanner } from '@/components/common/FormErrorBanner'
import type { InventoryResponseDto } from '@/lib/data/inventory'
import { useListAllLocations } from '@/lib/data/locations'
import { useListAllProducts } from '@/lib/data/products'
import { useListAreas } from '@/lib/data/areas'
import { useInventoryForm } from '@/hooks/forms/use-inventory-form'

interface InventoryFormProps {
  inventory?: InventoryResponseDto
  formId: string
  onSuccess?: () => void
  defaultLocationId?: string
  defaultAreaId?: string
}

export function InventoryForm({
  inventory,
  formId,
  onSuccess,
  defaultLocationId,
  defaultAreaId,
}: InventoryFormProps): React.JSX.Element {
  const { t } = useTranslation()
  const form = useInventoryForm({
    inventory,
    onSuccess,
    defaultLocationId,
    defaultAreaId,
  })

  const { data: products } = useListAllProducts()
  const { data: locations } = useListAllLocations()

  // Track selected location for area filtering
  const [selectedLocationId, setSelectedLocationId] = React.useState(
    inventory?.location?.id ?? defaultLocationId ?? ''
  )

  const { data: areas } = useListAreas(
    { location_id: selectedLocationId },
    { query: { enabled: !!selectedLocationId } }
  )

  return (
    <form
      id={formId}
      onSubmit={async (e) => {
        e.preventDefault()
        await form.handleSubmit()
      }}
    >
      <FormErrorBanner errors={form.state.errors} />
      <FieldGroup>
        <form.Field name="product_id">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('inventory.product', { defaultValue: 'Product' })}
              </FieldLabel>
              <FieldContent>
                <Select
                  value={field.state.value || 'none'}
                  onValueChange={(value) =>
                    field.handleChange(value === 'none' ? '' : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('inventory.selectProduct', { defaultValue: 'Select product' })}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      {t('inventory.selectProduct', { defaultValue: 'Select product' })}
                    </SelectItem>
                    {(products ?? []).map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors} />
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Field name="location_id">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('inventory.location', { defaultValue: 'Location' })}
              </FieldLabel>
              <FieldContent>
                <Select
                  value={field.state.value || 'none'}
                  onValueChange={(value) => {
                    const newLocationId = value === 'none' ? '' : value
                    field.handleChange(newLocationId)
                    setSelectedLocationId(newLocationId)
                    // Clear area when location changes
                    form.setFieldValue('area_id', '')
                  }}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('inventory.selectLocation', { defaultValue: 'Select location' })}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      {t('inventory.selectLocation', { defaultValue: 'Select location' })}
                    </SelectItem>
                    {(locations ?? []).map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name} ({t(`locations.types.${location.type}`) || location.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors} />
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Field name="area_id">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('inventory.area', { defaultValue: 'Area' })}
              </FieldLabel>
              <FieldContent>
                <Select
                  disabled={!selectedLocationId}
                  value={field.state.value || 'none'}
                  onValueChange={(value) =>
                    field.handleChange(value === 'none' ? '' : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('inventory.selectArea', { defaultValue: 'Select area' })}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      {t('inventory.noArea', { defaultValue: 'No specific area' })}
                    </SelectItem>
                    {(areas ?? []).map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.name}
                        {typeof area.code === 'string' && area.code ? ` (${area.code})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors} />
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Field name="quantity">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('inventory.quantity', { defaultValue: 'Quantity' })}
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
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                />
                <FieldError errors={field.state.meta.errors} />
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Field name="batchNumber">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('inventory.batchNumber', { defaultValue: 'Batch Number' })}
              </FieldLabel>
              <FieldContent>
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  id={field.name}
                  name={field.name}
                  placeholder="e.g., LOT-2024-001"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldError errors={field.state.meta.errors} />
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Field name="expiry_date">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('inventory.expiryDate', { defaultValue: 'Expiry Date' })}
              </FieldLabel>
              <FieldContent>
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  id={field.name}
                  name={field.name}
                  type="date"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldError errors={field.state.meta.errors} />
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Field name="cost_per_unit">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('inventory.costPerUnit', { defaultValue: 'Cost per Unit' })}
              </FieldLabel>
              <FieldContent>
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  id={field.name}
                  min={0}
                  name={field.name}
                  step="0.01"
                  type="number"
                  value={field.state.value ?? ''}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
                <FieldError errors={field.state.meta.errors} />
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Field name="received_date">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('inventory.receivedDate', { defaultValue: 'Received Date' })}
              </FieldLabel>
              <FieldContent>
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  id={field.name}
                  name={field.name}
                  type="date"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldError errors={field.state.meta.errors} />
              </FieldContent>
            </Field>
          )}
        </form.Field>
      </FieldGroup>
    </form>
  )
}
