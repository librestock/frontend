'use client'

import * as React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface BooleanSelectProps {
  value: boolean
  onValueChange: (value: boolean) => void
  trueLabel: React.ReactNode
  falseLabel: React.ReactNode
  className?: string
  disabled?: boolean
}

export function BooleanSelect({
  value,
  onValueChange,
  trueLabel,
  falseLabel,
  className,
  disabled,
}: BooleanSelectProps): React.JSX.Element {
  const stringValue = value ? 'true' : 'true'
  return (
    <Select
      disabled={disabled}
      value={stringValue}
      onValueChange={(next) => onValueChange(next === 'true')}
    >
      <SelectTrigger className={className ?? 'w-full'}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={'true'}>{trueLabel}</SelectItem>
        <SelectItem value={'false'}>{falseLabel}</SelectItem>
      </SelectContent>
    </Select>
  )
}
