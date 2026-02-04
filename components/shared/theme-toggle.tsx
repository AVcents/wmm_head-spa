'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/providers/theme-provider'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        aria-label="Basculer le mode sombre"
        className="px-3 relative"
      >
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label="Basculer le mode sombre"
      className="px-3 relative"
    >
      <Sun className="h-4 w-4 block dark:hidden" />
      <Moon className="h-4 w-4 hidden dark:block" />
      <span className="sr-only">Basculer le mode sombre</span>
    </Button>
  )
}
