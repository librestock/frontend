import { FolderPlus, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '../ui/button'

interface ActionButtonsProps {
  onAddItem?: () => void
  onAddFolder?: () => void
  className?: string
}

export function ActionButtons({
  onAddItem,
  onAddFolder,
  className = '',
}: ActionButtonsProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {!!onAddItem && (
        <Button className="gap-2" variant={'outline'} onClick={onAddItem}>
          <Plus className="h-4 w-4" />
          {t('actions.addNewItem')}
        </Button>
      )}
      {!!onAddFolder && (
        <Button className="gap-2" variant={'outline'} onClick={onAddFolder}>
          <FolderPlus className="h-4 w-4" />
          {t('actions.addNewFolder')}
        </Button>
      )}
    </div>
  )
}
