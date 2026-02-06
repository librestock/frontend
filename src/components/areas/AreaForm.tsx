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
import {
  type AreaResponseDto,
  useAreasControllerFindAll,
} from '@/lib/data/areas'
import { useAreaForm } from '@/hooks/forms/use-area-form'

// Get all descendant IDs of an area (for filtering out invalid parent options)
const getDescendantIds = (areaId: string, allAreas: AreaResponseDto[]): string[] => {
  const descendants: string[] = [areaId]
  const findDescendants = (parentIdToFind: string): void => {
    for (const a of allAreas) {
      const areaParentId = a.parent_id
      if (typeof areaParentId === 'string' && areaParentId === parentIdToFind) {
        descendants.push(a.id)
        findDescendants(a.id)
      }
    }
  }
  findDescendants(areaId)
  return descendants
}

interface AreaFormProps {
  locationId: string
  area?: AreaResponseDto
  parentId?: string
  formId: string
  onSuccess?: () => void
}

export function AreaForm({
  locationId,
  area,
  parentId,
  formId,
  onSuccess,
}: AreaFormProps): React.JSX.Element {
  const { t } = useTranslation()
  const form = useAreaForm({ locationId, area, parentId, onSuccess })

  const { data: areas } = useAreasControllerFindAll({
    location_id: locationId,
  })

  // Filter out the current area and its descendants from parent options
  const excludedIds = area ? getDescendantIds(area.id, areas ?? []) : []
  const availableParents = (areas ?? []).filter(
    (a) => !excludedIds.includes(a.id)
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
        <form.Field name="name">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('areas.name') || 'Name'}
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

        <form.Field name="code">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('areas.code') || 'Code'}
              </FieldLabel>
              <FieldContent>
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  id={field.name}
                  name={field.name}
                  placeholder="e.g., A1, SHELF-01"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldError errors={field.state.meta.errors} />
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('areas.description') || 'Description'}
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

        <form.Field name="parent_id">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('areas.parentArea') || 'Parent Area'}
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
                      placeholder={t('areas.noParent') || 'No Parent (Root)'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      {t('areas.noParent') || 'No Parent (Root)'}
                    </SelectItem>
                    {availableParents.map((parentArea) => (
                      <SelectItem key={parentArea.id} value={parentArea.id}>
                        {parentArea.name}
                        {parentArea.code ? ` (${parentArea.code})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors} />
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Field name="is_active">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('areas.status') || 'Status'}
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
