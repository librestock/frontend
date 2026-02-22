'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'

import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { FormErrorBanner } from '@/components/common/FormErrorBanner'
import { useOrderForm } from '@/hooks/forms/use-order-form'
import { useListClients } from '@/lib/data/clients'
import { useListAllProducts } from '@/lib/data/products'
import type { OrderResponseDto } from '@/lib/data/orders'

interface OrderFormProps {
  order?: OrderResponseDto
  formId: string
  onSuccess?: () => void
}

export function OrderForm({
  order,
  formId,
  onSuccess,
}: OrderFormProps): React.JSX.Element {
  const { t } = useTranslation()
  const form = useOrderForm({ order, onSuccess })
  const isEditing = !!order

  const { data: clientsData } = useListClients({ limit: 100 })
  const { data: products } = useListAllProducts()

  const clients = clientsData?.data ?? []

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
        {!isEditing && (
          <form.Field name="client_id">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  {t('orders.client') || 'Client'}
                </FieldLabel>
                <FieldContent>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          t('orders.selectClient') || 'Select client'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={field.state.meta.errors} />
                </FieldContent>
              </Field>
            )}
          </form.Field>
        )}

        <form.Field name="delivery_address">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('orders.deliveryAddress') || 'Delivery Address'}
              </FieldLabel>
              <FieldContent>
                <Textarea
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

        <form.Field name="delivery_deadline">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('orders.deliveryDeadline') || 'Delivery Deadline'}
              </FieldLabel>
              <FieldContent>
                <Input
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

        <form.Field name="yacht_name">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('orders.yachtName') || 'Yacht Name'}
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

        <form.Field name="special_instructions">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('orders.specialInstructions') || 'Special Instructions'}
              </FieldLabel>
              <FieldContent>
                <Textarea
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

        {!isEditing && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <FieldLabel>
                {t('orders.items') || 'Order Items'}
              </FieldLabel>
              <Button
                size="sm"
                type="button"
                variant="outline"
                onClick={() => {
                  form.pushFieldValue('items', {
                    product_id: '',
                    quantity: 1,
                    unit_price: 0,
                    notes: '',
                  })
                }}
              >
                <Plus className="mr-1 size-3" />
                {t('orders.addItem') || 'Add Item'}
              </Button>
            </div>

            <form.Field mode="array" name="items">
              {(field) => (
                <div className="space-y-4">
                  {field.state.value.map((_, index) => (
                    <OrderItemFields
                      key={index}
                      form={form}
                      index={index}
                      products={products ?? []}
                      onRemove={
                        field.state.value.length > 1
                          ? () => form.removeFieldValue('items', index)
                          : undefined
                      }
                    />
                  ))}
                  <FieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>
          </div>
        )}
      </FieldGroup>
    </form>
  )
}

interface OrderItemFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
  index: number
  products: Array<{ id: string; name: string; sku: string | null; standard_price?: number | null }>
  onRemove?: () => void
}

function OrderItemFields({
  form,
  index,
  products,
  onRemove,
}: OrderItemFieldsProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="border-border rounded-lg border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm font-medium">
          {t('orders.itemNumber', { number: index + 1 }) ||
            `Item ${index + 1}`}
        </span>
        {onRemove && (
          <Button
            size="icon"
            type="button"
            variant="ghost"
            className="size-7"
            onClick={onRemove}
          >
            <Trash2 className="size-3.5" />
          </Button>
        )}
      </div>

      <form.Field name={`items[${index}].product_id`}>
        {(field: { state: { value: string; meta: { errors: Array<{ message?: string }> } }; handleChange: (value: string) => void }) => (
          <Field>
            <FieldLabel htmlFor={`item-product-${index}`}>
              {t('orders.product') || 'Product'}
            </FieldLabel>
            <FieldContent>
              <Select
                value={field.state.value}
                onValueChange={(value) => {
                  field.handleChange(value)
                  const product = products.find((p) => p.id === value)
                  if (product?.standard_price != null) {
                    form.setFieldValue(
                      `items[${index}].unit_price`,
                      product.standard_price,
                    )
                  }
                }}
              >
                <SelectTrigger id={`item-product-${index}`}>
                  <SelectValue
                    placeholder={
                      t('orders.selectProduct') || 'Select product'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.sku ? `${product.sku} - ` : ''}
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={field.state.meta.errors} />
            </FieldContent>
          </Field>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-3">
        <form.Field name={`items[${index}].quantity`}>
          {(field: { state: { value: number; meta: { errors: Array<{ message?: string }> } }; handleBlur: () => void; handleChange: (value: number) => void }) => (
            <Field>
              <FieldLabel htmlFor={`item-qty-${index}`}>
                {t('orders.quantity') || 'Quantity'}
              </FieldLabel>
              <FieldContent>
                <Input
                  id={`item-qty-${index}`}
                  min={1}
                  type="number"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(
                      Number.parseInt(e.target.value, 10) || 0,
                    )
                  }
                />
                <FieldError errors={field.state.meta.errors} />
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Field name={`items[${index}].unit_price`}>
          {(field: { state: { value: number; meta: { errors: Array<{ message?: string }> } }; handleBlur: () => void; handleChange: (value: number) => void }) => (
            <Field>
              <FieldLabel htmlFor={`item-price-${index}`}>
                {t('orders.unitPrice') || 'Unit Price'}
              </FieldLabel>
              <FieldContent>
                <Input
                  id={`item-price-${index}`}
                  min={0}
                  step="0.01"
                  type="number"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(
                      Number.parseFloat(e.target.value) || 0,
                    )
                  }
                />
                <FieldError errors={field.state.meta.errors} />
              </FieldContent>
            </Field>
          )}
        </form.Field>
      </div>

      <form.Field name={`items[${index}].notes`}>
        {(field: { state: { value: string; meta: { errors: Array<{ message?: string }> } }; handleBlur: () => void; handleChange: (value: string) => void }) => (
          <Field>
            <FieldLabel htmlFor={`item-notes-${index}`}>
              {t('orders.itemNotes') || 'Notes'}
            </FieldLabel>
            <FieldContent>
              <Input
                id={`item-notes-${index}`}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldError errors={field.state.meta.errors} />
            </FieldContent>
          </Field>
        )}
      </form.Field>
    </div>
  )
}
