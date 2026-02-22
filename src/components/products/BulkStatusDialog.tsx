'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

interface BulkStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (isActive: boolean) => void
  count: number
  isLoading?: boolean
}

export function BulkStatusDialog({
  open,
  onOpenChange,
  onConfirm,
  count,
  isLoading,
}: BulkStatusDialogProps): React.JSX.Element {
  const { t } = useTranslation()
  const isBusy = isLoading === true

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('bulk.statusTitle') || 'Change Product Status'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('bulk.statusDescription', { count }) ||
              `Set the status for ${count} selected products.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-3 py-2">
          <Button
            className="flex-1"
            disabled={isBusy}
            variant="default"
            onClick={() => onConfirm(true)}
          >
            {isBusy ? (
              <Spinner className="size-3" />
            ) : (
              t('form.active') || 'Active'
            )}
          </Button>
          <Button
            className="flex-1"
            disabled={isBusy}
            variant="secondary"
            onClick={() => onConfirm(false)}
          >
            {isBusy ? (
              <Spinner className="size-3" />
            ) : (
              t('form.inactive') || 'Inactive'
            )}
          </Button>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isBusy}>
            {t('form.cancel') || 'Cancel'}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
