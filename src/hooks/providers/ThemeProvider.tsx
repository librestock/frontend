import * as React from 'react'
import { Theme } from '@/lib/enums/theme.enum'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: Theme
  setTheme: (theme: Theme) => void
}

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: 'class' | 'data-theme'
  defaultTheme?: Theme
  storageKey?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

function getStoredTheme(storageKey: string): Theme | null {
  if (typeof window === 'undefined') {
    return null
  }
  const stored = window.localStorage.getItem(storageKey)
  if (stored === Theme.LIGHT || stored === Theme.DARK || stored === Theme.SYSTEM) {
    return stored
  }
  return null
}

export function ThemeProvider({
  children,
  attribute = 'class',
  defaultTheme = Theme.SYSTEM,
  storageKey = 'theme',
  enableSystem = true,
}: ThemeProviderProps): React.JSX.Element {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    const stored = getStoredTheme(storageKey)
    return stored ?? defaultTheme
  })
  const [systemTheme, setSystemTheme] = React.useState<Theme>(Theme.LIGHT)

  React.useEffect(() => {
    if (!enableSystem || typeof window === 'undefined') {
      return undefined
    }
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const updateSystemTheme = (): void => {
      setSystemTheme(media.matches ? Theme.DARK : Theme.LIGHT)
    }
    updateSystemTheme()
    if (media.addEventListener) {
      media.addEventListener('change', updateSystemTheme)
      return () => media.removeEventListener('change', updateSystemTheme)
    }
    media.addListener(updateSystemTheme)
    return () => media.removeListener(updateSystemTheme)
  }, [enableSystem])

  const resolvedTheme = theme === Theme.SYSTEM ? systemTheme : theme

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const root = document.documentElement
    if (attribute === 'class') {
      root.classList.remove(Theme.LIGHT, Theme.DARK)
      root.classList.add(resolvedTheme)
    } else {
      root.setAttribute(attribute, resolvedTheme)
    }
    root.style.colorScheme = resolvedTheme
  }, [attribute, resolvedTheme])

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      const finalTheme =
        enableSystem || nextTheme !== Theme.SYSTEM ? nextTheme : Theme.LIGHT
      setThemeState(finalTheme)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, finalTheme)
      }
    },
    [enableSystem, storageKey],
  )

  const value = React.useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [resolvedTheme, setTheme, theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
