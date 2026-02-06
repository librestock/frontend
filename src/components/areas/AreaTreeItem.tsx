'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ChevronRight,
  ChevronDown,
  Plus,
  FolderOpen,
  Folder,
} from 'lucide-react'

import { AreaForm } from './AreaForm'
import { CreateArea } from './CreateArea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FormDialog } from '@/components/common/FormDialog'
import { CrudDropdownMenu } from '@/components/common/CrudDropdownMenu'
import { DeleteConfirmationDialog } from '@/components/common/DeleteConfirmationDialog'
import {
  type AreaResponseDto,
  useAreasControllerDelete,
  getAreasControllerFindAllQueryKey,
} from '@/lib/data/areas'
import {
  removeItemFromArray,
  restoreQueryData,
  snapshotQueryData,
} from '@/lib/data/query-cache'
import { cn } from '@/lib/utils'

interface AreaTreeItemProps {
  area: AreaResponseDto
  locationId: string
  allAreas: AreaResponseDto[]
  depth?: number
}

export function AreaTreeItem({
  area,
  locationId,
  allAreas,
  depth = 0,
}: AreaTreeItemProps): React.JSX.Element {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isExpanded, setIsExpanded] = React.useState(true)
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [createChildOpen, setCreateChildOpen] = React.useState(false)

  // Find child areas - parent_id is nullable so need typeof check
  const children = allAreas.filter((a) => {
    const parentId = a.parent_id
    return typeof parentId === 'string' && parentId === area.id
  })
  const hasChildren = children.length > 0

  const deleteMutation = useAreasControllerDelete({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getAreasControllerFindAllQueryKey({ location_id: locationId }),
        })
      },
      onError: (error) => {
        toast.error(t('areas.deleteError') || 'Failed to delete area')
        console.error('Area deletion error:', error)
      },
    },
  })

  const handleDelete = (): void => {
    const queryKey = getAreasControllerFindAllQueryKey({ location_id: locationId })
    const snapshot = snapshotQueryData<AreaResponseDto[]>(queryClient, queryKey)
    queryClient.setQueriesData<AreaResponseDto[]>({ queryKey }, (old) =>
      removeItemFromArray(old, area.id),
    )
    setDeleteOpen(false)

    let didUndo = false
    const timeoutId = window.setTimeout(() => {
      if (didUndo) {
        return
      }
      deleteMutation.mutateAsync({ id: area.id }).catch(() => {
        restoreQueryData(queryClient, snapshot)
      })
    }, 5000)

    toast(t('areas.deleted') || 'Area deleted successfully', {
      action: {
        label: t('actions.undo') || 'Undo',
        onClick: () => {
          didUndo = true
          window.clearTimeout(timeoutId)
          restoreQueryData(queryClient, snapshot)
        },
      },
    })
  }

  return (
    <div className="select-none">
      <div
        className={cn(
          'group flex items-center gap-1 rounded-md py-1.5 px-2 hover:bg-muted/50',
          depth > 0 && 'ml-6'
        )}
      >
        {/* Expand/collapse button */}
        <Button
          className={cn('size-6', !hasChildren && 'invisible')}
          size="icon"
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </Button>

        {/* Folder icon */}
        {hasChildren && isExpanded ? (
          <FolderOpen className="size-4 text-muted-foreground" />
        ) : (
          <Folder className="size-4 text-muted-foreground" />
        )}

        {/* Area name and code */}
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <span className="font-medium truncate">{area.name}</span>
          {area.code ? (
            <span className="text-xs text-muted-foreground">
              ({area.code})
            </span>
          ) : null}
          {!area.is_active && (
            <Badge className="text-xs" variant="secondary">
              {t('form.inactive') || 'Inactive'}
            </Badge>
          )}
        </div>

        {/* Actions (visible on hover) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            className="size-7"
            size="icon"
            title={t('areas.create') || 'Add child area'}
            variant="ghost"
            onClick={() => setCreateChildOpen(true)}
          >
            <Plus className="size-4" />
          </Button>

          <CrudDropdownMenu
            onDelete={() => setDeleteOpen(true)}
            onEdit={() => setEditOpen(true)}
          />
        </div>
      </div>

      {/* Children */}
      {!!hasChildren && !!isExpanded && (
        <div>
          {children.map((child) => (
            <AreaTreeItem
              key={child.id}
              allAreas={allAreas}
              area={child}
              depth={depth + 1}
              locationId={locationId}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <FormDialog
        cancelLabel={t('form.cancel') || 'Cancel'}
        description={t('areas.editDescription') || 'Update area details.'}
        formId={`edit-area-form-${area.id}`}
        open={editOpen}
        submitLabel={t('actions.save') || 'Save'}
        title={t('areas.editTitle') || 'Edit Area'}
        onOpenChange={setEditOpen}
      >
        <AreaForm
          area={area}
          formId={`edit-area-form-${area.id}`}
          locationId={locationId}
          onSuccess={() => setEditOpen(false)}
        />
      </FormDialog>

      {/* Create Child Dialog */}
      <CreateArea
        locationId={locationId}
        open={createChildOpen}
        parentId={area.id}
        onOpenChange={setCreateChildOpen}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmationDialog
        description={t('areas.deleteDescription') || 'Are you sure you want to delete this area? All child areas will also be deleted.'}
        isLoading={deleteMutation.isPending}
        open={deleteOpen}
        title={t('areas.deleteTitle') || 'Delete Area'}
        onConfirm={handleDelete}
        onOpenChange={setDeleteOpen}
      />
    </div>
  )
}
