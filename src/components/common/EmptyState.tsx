import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  message: string
  description?: string
  icon?: LucideIcon
  className?: string
  variant?: 'simple' | 'bordered'
}

export function EmptyState({
  message,
  description,
  icon: Icon,
  className,
  variant = 'simple',
}: EmptyStateProps): React.JSX.Element {
  const baseClasses = 'text-muted-foreground py-8 text-center'
  const borderedClasses = 'border rounded-lg bg-muted/20'

  return (
    <div
      className={cn(
        baseClasses,
        variant === 'bordered' && borderedClasses,
        className
      )}
    >
      {Icon && <Icon className="mx-auto size-12 opacity-40 mb-3" />}
      <p>{message}</p>
      {description && <p className="text-sm mt-1">{description}</p>}
    </div>
  )
}
