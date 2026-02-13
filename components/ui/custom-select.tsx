'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: Option[]
  label?: string
  placeholder?: string
  size?: 'sm' | 'md'
}

export function CustomSelect({
  value,
  onChange,
  options,
  label,
  placeholder = 'Sélectionner...',
  size = 'md',
}: CustomSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false)
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen(!open)
    }
  }

  const sizeClasses = size === 'sm'
    ? 'px-3 py-2 text-sm rounded-lg'
    : 'px-4 py-2.5 text-base rounded-xl'

  const optionSizeClasses = size === 'sm'
    ? 'px-3 py-2 text-sm'
    : 'px-4 py-2.5 text-sm'

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen(!open)}
        onKeyDown={handleKeyDown}
        className={`
          w-full flex items-center justify-between gap-2
          border bg-surface text-foreground
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-primary-500
          ${sizeClasses}
          ${open
            ? 'border-primary-500 ring-2 ring-primary-500/20'
            : 'border-border hover:border-primary-300'
          }
        `}
      >
        <span className={selected ? 'text-foreground' : 'text-foreground-muted'}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-foreground-muted transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          className="
            absolute z-50 mt-1.5 w-full
            bg-surface border border-border
            rounded-xl shadow-lg shadow-black/8
            overflow-hidden
            animate-in fade-in slide-in-from-top-1 duration-150
          "
        >
          <div className="py-1 max-h-60 overflow-y-auto">
            {options.map((option) => {
              const isSelected = option.value === value
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className={`
                    w-full flex items-center justify-between gap-2 text-left
                    transition-colors duration-100
                    ${optionSizeClasses}
                    ${isSelected
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium'
                      : 'text-foreground hover:bg-primary-50/50 dark:hover:bg-primary-900/10'
                    }
                  `}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
