import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  useUpdateBranding,
  getBrandingQueryKey,
} from '@/lib/data/branding'

export function useBrandingMutation() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const mutation = useUpdateBranding()

  const submitBranding = async (
    data: Parameters<typeof mutation.mutateAsync>[0],
  ): Promise<void> => {
    try {
      await mutation.mutateAsync(data)
      await queryClient.invalidateQueries({
        queryKey: getBrandingQueryKey(),
      })
      toast.success(
        t('settings.brandingSaved', { defaultValue: 'Branding settings saved' }),
      )
    } catch {
      toast.error(
        t('settings.brandingError', { defaultValue: 'Failed to save branding settings' }),
      )
    }
  }

  return { mutation, submitBranding }
}
