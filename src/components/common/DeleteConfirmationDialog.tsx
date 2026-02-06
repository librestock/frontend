'use client'

import { useTranslation } from 'react-i18next'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Spinner } from '@/components/ui/spinner'

interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  title?: string
  description?: string
  cancelLabel?: string
  confirmLabel?: string
  isLoading?: boolean
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  cancelLabel,
  confirmLabel,
  isLoading,
}: DeleteConfirmationDialogProps): React.JSX.Element {
  const { t } = useTranslation()
  const isBusy = isLoading === true

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {title ?? (t('common.deleteTitle') || 'Delete')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description ?? (t('common.deleteDescription') || 'Are you sure you want to delete this item? This action cannot be undone.')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isBusy}>
            {cancelLabel ?? (t('form.cancel') || 'Cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isBusy}
            onClick={onConfirm}
          >
            {isBusy ? (
              <span className="flex items-center gap-2">
                <Spinner className="size-3" />
                {t('actions.deleting') || 'Deleting...'}
              </span>
            ) : (
              confirmLabel ?? (t('actions.delete') || 'Delete')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
