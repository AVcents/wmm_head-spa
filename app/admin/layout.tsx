'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Sparkles,
  Clock,
  Scissors,
  Calendar,
  LogOut,
  Menu,
  X,
  ArrowLeft,
} from 'lucide-react'

const navItems = [
  { href: '/admin/horaires', label: 'Horaires', icon: Clock },
  { href: '/admin/prestations', label: 'Prestations', icon: Scissors },
  { href: '/admin/reservations', label: 'Réservations', icon: Calendar },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Don't wrap login page with admin layout
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-surface">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-background transition-colors"
        >
          <Menu className="h-6 w-6 text-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary-600" />
          <span className="font-serif font-semibold text-foreground">Admin</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="w-72 h-full bg-surface border-r border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent
              pathname={pathname}
              onLogout={handleLogout}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar - Fixed */}
      <aside className="hidden lg:block fixed left-0 top-0 w-72 h-screen border-r border-border bg-surface overflow-y-auto">
        <SidebarContent pathname={pathname} onLogout={handleLogout} />
      </aside>

      {/* Main content - With left margin for sidebar */}
      <main className="lg:ml-72 p-6 lg:p-10">{children}</main>
    </div>
  )
}

function SidebarContent({
  pathname,
  onLogout,
  onClose,
}: {
  pathname: string
  onLogout: () => void
  onClose?: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-foreground">Kalm</h2>
              <p className="text-xs text-foreground-muted">Administration</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-background transition-colors lg:hidden"
            >
              <X className="h-5 w-5 text-foreground-muted" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              {...(onClose ? { onClick: onClose } : {})}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-foreground-secondary hover:bg-background hover:text-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground-secondary hover:bg-background hover:text-foreground transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
          Retour au site
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-error hover:bg-error/10 transition-all"
        >
          <LogOut className="h-5 w-5" />
          Déconnexion
        </button>
      </div>
    </div>
  )
}
