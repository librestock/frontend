import { Search, X } from 'lucide-react'

import { Input } from '../ui/input'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  onClear?: () => void
}

export function SearchBar({
  value,
  onChange,
  placeholder,
  className = '',
  onClear,
}: SearchBarProps): React.JSX.Element {
  const handleClear = (): void => {
    if (onClear) {
      onClear()
    } else {
      onChange('')
    }
  }

  return (
    <div className={`relative flex-1 ${className}`}>
      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input
        className="pl-10 pr-9"
        placeholder={placeholder}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && value) {
            event.preventDefault()
            handleClear()
          }
        }}
      />
      {value ? (
        <button
          aria-label="Clear search"
          className="text-muted-foreground hover:text-foreground absolute right-2 top-1/2 -translate-y-1/2 rounded p-1"
          type="button"
          onClick={handleClear}
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  )
}
