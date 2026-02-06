'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface FormDialogProps {
  trigger?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  formId: string
  submitLabel: React.ReactNode
  cancelLabel: React.ReactNode
  children: React.ReactNode
  contentClassName?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  submitDisabled?: boolean
  submitVariant?: React.ComponentProps<typeof Button>['variant']
  cancelVariant?: React.ComponentProps<typeof Button>['variant']
}

export function FormDialog({
  trigger,
  title,
  description,
  formId,
  submitLabel,
  cancelLabel,
  children,
  contentClassName = 'sm:max-w-[425px]',
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  submitDisabled,
  submitVariant,
  cancelVariant = 'outline',
}: FormDialogProps): React.JSX.Element {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)

  const open = controlledOpen ?? uncontrolledOpen

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(nextOpen)
      }
      onOpenChange?.(nextOpen)
    },
    [controlledOpen, onOpenChange],
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className={contentClassName}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {!!description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {children}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant={cancelVariant}>{cancelLabel}</Button>
          </DialogClose>
          <Button
            disabled={submitDisabled}
            form={formId}
            type="submit"
            variant={submitVariant}
          >
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
