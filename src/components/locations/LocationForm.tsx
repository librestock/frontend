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
import { BooleanSelect } from '@/components/common/BooleanSelect'
import type { LocationResponseDto } from '@/lib/data/locations'
import { LocationType } from '@/lib/enums/location-type.enum'
import { useLocationForm } from '@/hooks/forms/use-location-form'

interface LocationFormProps {
  location?: LocationResponseDto
  formId: string
  onSuccess?: () => void
}

const LOCATION_TYPES = [
  { value: LocationType.WAREHOUSE, label: 'Warehouse' },
  { value: LocationType.SUPPLIER, label: 'Supplier' },
  { value: LocationType.IN_TRANSIT, label: 'In Transit' },
  { value: LocationType.CLIENT, label: 'Client' },
]

export function LocationForm({
  location,
  formId,
  onSuccess,
}: LocationFormProps): React.JSX.Element {
  const { t } = useTranslation()
  const form = useLocationForm({ location, onSuccess })

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
        <form.Field name="name">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('locations.name') || 'Name'}
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

        <form.Field name="type">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('locations.type') || 'Type'}
              </FieldLabel>
              <FieldContent>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value as typeof field.state.value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('locations.selectType') || 'Select type'} />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {t(`locations.types.${type.value}`) || type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors} />
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Field name="address">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('locations.address') || 'Address'}
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

        <form.Field name="contact_person">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('locations.contactPerson') || 'Contact Person'}
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
                {t('locations.phone') || 'Phone'}
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

        <form.Field name="is_active">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('locations.status') || 'Status'}
              </FieldLabel>
              <FieldContent>
                <BooleanSelect
                  falseLabel={t('form.inactive') || 'Inactive'}
                  trueLabel={t('form.active') || 'Active'}
                  value={field.state.value}
                  onValueChange={field.handleChange}
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
