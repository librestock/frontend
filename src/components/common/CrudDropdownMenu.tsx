'use client'

import { useTranslation } from 'react-i18next'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface CrudDropdownMenuProps {
  onEdit?: () => void
  onDelete?: () => void
  editLabel?: string
  deleteLabel?: string
  stopPropagation?: boolean
}

export function CrudDropdownMenu({
  onEdit,
  onDelete,
  editLabel,
  deleteLabel,
  stopPropagation = false,
}: CrudDropdownMenuProps): React.JSX.Element {
  const { t } = useTranslation()

  const handleTriggerClick = (e: React.MouseEvent): void => {
    if (stopPropagation) {
      e.stopPropagation()
    }
  }

  const handleEditClick = (e: React.MouseEvent): void => {
    if (stopPropagation) {
      e.stopPropagation()
    }
    onEdit?.()
  }

  const handleDeleteClick = (e: React.MouseEvent): void => {
    if (stopPropagation) {
      e.stopPropagation()
    }
    onDelete?.()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={handleTriggerClick}>
        <Button className="size-8" size="icon" variant="ghost">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onEdit && (
          <DropdownMenuItem onClick={handleEditClick}>
            <Pencil className="mr-2 size-4" />
            {editLabel ?? (t('actions.edit') || 'Edit')}
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem className="text-destructive" onClick={handleDeleteClick}>
            <Trash2 className="mr-2 size-4" />
            {deleteLabel ?? (t('actions.delete') || 'Delete')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
