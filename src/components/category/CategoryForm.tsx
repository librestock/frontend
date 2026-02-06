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
import { CategoryPathSelector } from './CategoryPathSelector'
import { FormErrorBanner } from '@/components/common/FormErrorBanner'
import type { CategoryWithChildrenResponseDto } from '@/lib/data/categories'
import { useCategoryForm } from '@/hooks/forms/use-category-form'

interface CategoryFormProps {
  categories?: CategoryWithChildrenResponseDto[]
  defaultParentId?: string | null
  onSuccess?: () => void
}

export function CategoryForm({
  categories,
  defaultParentId,
  onSuccess,
}: CategoryFormProps): React.JSX.Element {
  const { t } = useTranslation()
  const form = useCategoryForm(categories, defaultParentId, onSuccess)

  return (
    <form
      id="create-category-form"
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
                {t('form.categoryName')}
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

        <form.Field name="parent_id">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('form.parentCategory')}
              </FieldLabel>
              <FieldContent>
                {!!categories && (
                  <CategoryPathSelector
                    categories={categories}
                    emptyOptionLabel={t('form.noParent')}
                    value={field.state.value}
                    onValueChange={field.handleChange}
                  />
                )}
                <FieldError errors={field.state.meta.errors} />
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('form.description')}
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
