'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { StockMovementReason } from '@librestock/types'
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '../ui/field'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { FormErrorBanner } from '@/components/common/FormErrorBanner'
import { useListAllLocations } from '@/lib/data/locations'
import { useListAllProducts } from '@/lib/data/products'
import { useStockMovementForm } from '@/hooks/forms/use-stock-movement-form'

const STOCK_MOVEMENT_REASONS = Object.values(StockMovementReason)

interface StockMovementFormProps {
  formId: string
  onSuccess?: () => void
}

export function StockMovementForm({
  formId,
  onSuccess,
}: StockMovementFormProps): React.JSX.Element {
  const { t } = useTranslation()
  const form = useStockMovementForm({ onSuccess })

  const { data: products } = useListAllProducts()
  const { data: locations } = useListAllLocations()

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
                {t('stockMovements.product') || 'Product'}
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
                      placeholder={t('stockMovements.selectProduct') || 'Select product'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      {t('stockMovements.selectProduct') || 'Select product'}
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

        <form.Field name="reason">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('stockMovements.reason') || 'Reason'}
              </FieldLabel>
              <FieldContent>
                <Select
                  value={field.state.value || 'none'}
                  onValueChange={(value) =>
                    field.handleChange(value === 'none' ? ('' as StockMovementReason) : (value as StockMovementReason))
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('stockMovements.selectReason') || 'Select reason'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      {t('stockMovements.selectReason') || 'Select reason'}
                    </SelectItem>
                    {STOCK_MOVEMENT_REASONS.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {t(`stockMovements.reasons.${reason}`) || reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors} />
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Field name="from_location_id">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('stockMovements.fromLocation') || 'From Location'}
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
                      placeholder={t('stockMovements.selectLocation') || 'Select location'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      {t('stockMovements.noLocation') || 'None'}
                    </SelectItem>
                    {(locations ?? []).map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors} />
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Field name="to_location_id">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('stockMovements.toLocation') || 'To Location'}
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
                      placeholder={t('stockMovements.selectLocation') || 'Select location'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      {t('stockMovements.noLocation') || 'None'}
                    </SelectItem>
                    {(locations ?? []).map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
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
                {t('stockMovements.quantity') || 'Quantity'}
              </FieldLabel>
              <FieldContent>
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  id={field.name}
                  min={1}
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

        <form.Field name="reference_number">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('stockMovements.referenceNumber') || 'Reference Number'}
              </FieldLabel>
              <FieldContent>
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  id={field.name}
                  name={field.name}
                  placeholder="e.g., PO-2024-001"
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
                {t('stockMovements.costPerUnit') || 'Cost per Unit'}
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

        <form.Field name="notes">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('stockMovements.notes') || 'Notes'}
              </FieldLabel>
              <FieldContent>
                <Textarea
                  aria-invalid={field.state.meta.errors.length > 0}
                  id={field.name}
                  name={field.name}
                  placeholder={t('stockMovements.notesPlaceholder') || 'Optional notes...'}
                  rows={3}
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
