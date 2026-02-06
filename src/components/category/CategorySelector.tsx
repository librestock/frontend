'use client'

import * as React from 'react'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface SelectableCategory {
  value: string
  label: string
}

interface CategorySelectorProps {
  categories: SelectableCategory[]
  value?: string
  onValueChange?: (value: string) => void
}

export function CategorySelector({
  categories,
  value: controlledValue,
  onValueChange,
}: CategorySelectorProps): React.JSX.Element {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState('')

  const value = controlledValue ?? internalValue
  const setValue = React.useCallback(
    (newValue: string) => {
      if (onValueChange) {
        onValueChange(newValue)
      } else {
        setInternalValue(newValue)
      }
    },
    [onValueChange],
  )

  const selectedCategory = React.useMemo(
    () => categories.find((category) => category.value === value),
    [categories, value],
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          aria-haspopup="true"
          className="w-full justify-between"
          role="combobox"
          variant="outline"
        >
          <span className="truncate">
            {!!selectedCategory && selectedCategory.label}
          </span>
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <Command>
          <CommandInput placeholder="Search categories..." />
          <CommandList>
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              {categories.map((category) => (
                <CommandItem
                  key={category.value}
                  keywords={[category.value]}
                  value={category.label}
                  onSelect={() => {
                    setValue(category.value === value ? '' : category.value)
                    setOpen(false)
                  }}
                >
                  <CheckIcon
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === category.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <span className="truncate">{category.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
