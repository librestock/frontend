'use client'

import { useTranslation } from 'react-i18next'
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
import { ClientStatus, type ClientResponseDto } from '@/lib/data/clients'
import { useClientForm } from '@/hooks/forms/use-client-form'

interface ClientFormProps {
  client?: ClientResponseDto
  formId: string
  onSuccess?: () => void
}

const CLIENT_STATUSES = [
  { value: ClientStatus.ACTIVE, labelKey: 'clients.statuses.ACTIVE', fallback: 'Active' },
  { value: ClientStatus.SUSPENDED, labelKey: 'clients.statuses.SUSPENDED', fallback: 'Suspended' },
  { value: ClientStatus.INACTIVE, labelKey: 'clients.statuses.INACTIVE', fallback: 'Inactive' },
]

export function ClientForm({
  client,
  formId,
  onSuccess,
}: ClientFormProps): React.JSX.Element {
  const { t } = useTranslation()
  const form = useClientForm({ client, onSuccess })

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
        <form.Field name="company_name">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('clients.companyName') || 'Company Name'}
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

        <form.Field name="contact_person">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('clients.contactPerson') || 'Contact Person'}
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

        <form.Field name="email">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('clients.email') || 'Email'}
              </FieldLabel>
              <FieldContent>
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  id={field.name}
                  name={field.name}
                  type="email"
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
                {t('clients.yachtName') || 'Yacht Name'}
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

        <form.Field name="phone">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('clients.phone') || 'Phone'}
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

        <form.Field name="billing_address">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('clients.billingAddress') || 'Billing Address'}
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

        <form.Field name="default_delivery_address">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('clients.deliveryAddress') || 'Delivery Address'}
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

        <form.Field name="account_status">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('clients.status') || 'Status'}
              </FieldLabel>
              <FieldContent>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value as ClientStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('clients.selectStatus') || 'Select status'} />
                  </SelectTrigger>
                  <SelectContent>
                    {CLIENT_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {t(status.labelKey) || status.fallback}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors} />
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Field name="payment_terms">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('clients.paymentTerms') || 'Payment Terms'}
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

        <form.Field name="credit_limit">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('clients.creditLimit') || 'Credit Limit'}
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
                  onChange={(e) => {
                    const val = e.target.value
                    field.handleChange(val === '' ? undefined : Number(val))
                  }}
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
                {t('clients.notes') || 'Notes'}
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
      </FieldGroup>
    </form>
  )
}
