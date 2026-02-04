'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './theme-toggle'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 dark:bg-background-secondary/95 dark:supports-[backdrop-filter]:bg-background-secondary/80">
      <div className="container mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold font-serif text-foreground">
            Kalm Headspa
          </span>
        </Link>

        {/* Navigation Desktop */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/"
            className="text-sm font-medium text-foreground hover:text-primary-600 transition-colors"
          >
            Accueil
          </Link>
          <Link
            href="/prestations"
            className="text-sm font-medium text-foreground hover:text-primary-600 transition-colors"
          >
            Prestations
          </Link>
          <Link
            href="/bon-cadeau"
            className="text-sm font-medium text-foreground hover:text-primary-600 transition-colors"
          >
            Bon d&apos;achat
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button size="sm" className="hidden sm:inline-flex">
            Me contacter
          </Button>
        </div>
      </div>
    </header>
  )
}
