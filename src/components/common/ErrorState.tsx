import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  message: string
  icon?: LucideIcon
  className?: string
  variant?: 'simple' | 'bordered'
}

export function ErrorState({
  message,
  icon: Icon,
  className,
  variant = 'simple',
}: ErrorStateProps): React.JSX.Element {
  const baseClasses = 'text-destructive py-8 text-center'
  const borderedClasses = 'rounded-lg border p-8'

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
    </div>
  )
}
