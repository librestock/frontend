import clsx from 'clsx'
import { Package } from 'lucide-react'

import type { LucideIcon } from 'lucide-react'
import { IconSize } from '@/lib/enums/icon-size.enum'

interface ImagePlaceholderProps {
  icon?: LucideIcon
  iconSize?: IconSize
  className?: string
}

const iconSizes: Record<IconSize, string> = {
  [IconSize.SM]: 'h-8 w-8',
  [IconSize.MD]: 'h-12 w-12',
  [IconSize.LG]: 'h-16 w-16',
}

export function ImagePlaceholder({
  icon: Icon = Package,
  iconSize = IconSize.MD,
  className = '',
}: ImagePlaceholderProps): React.JSX.Element {
  return (
    <div
      className={clsx(
        'text-muted-foreground flex h-full w-full items-center justify-center',
        className,
      )}
    >
      <Icon className={iconSizes[iconSize]} />
    </div>
  )
}
