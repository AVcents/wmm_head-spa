'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  selectedDate: string | null
  onSelect: (date: string) => void
}

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function DateStep({ selectedDate, onSelect }: Props) {
  const today = new Date()
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear, setViewYear] = useState(today.getFullYear())

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  // Empêcher de revenir dans le passé
  const canGoPrev =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth())

  // Limiter à 3 mois dans le futur
  const maxDate = new Date(today)
  maxDate.setMonth(maxDate.getMonth() + 3)
  const canGoNext =
    viewYear < maxDate.getFullYear() ||
    (viewYear === maxDate.getFullYear() && viewMonth < maxDate.getMonth())

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1)
    // Lundi = 0
    let startOffset = firstDay.getDay() - 1
    if (startOffset < 0) startOffset = 6

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const days: (Date | null)[] = []

    // Jours vides avant le 1er
    for (let i = 0; i < startOffset; i++) {
      days.push(null)
    }

    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(viewYear, viewMonth, d))
    }

    return days
  }, [viewMonth, viewYear])

  const isDisabled = (date: Date): boolean => {
    // Pas dans le passé
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    if (date < todayStart) return true
    // Pas le dimanche (0 = dimanche)
    if (date.getDay() === 0) return true
    // Pas au-delà de 3 mois
    if (date > maxDate) return true
    return false
  }

  return (
    <div>
      <h2 className="text-2xl font-serif font-semibold text-foreground mb-6">
        Choisissez une date
      </h2>

      <div className="bg-surface border border-border rounded-2xl p-6 max-w-md mx-auto">
        {/* Navigation mois */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            disabled={!canGoPrev}
            className="p-2 rounded-lg hover:bg-background transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <h3 className="text-lg font-serif font-semibold text-foreground">
            {MONTHS_FR[viewMonth]} {viewYear}
          </h3>
          <button
            onClick={nextMonth}
            disabled={!canGoNext}
            className="p-2 rounded-lg hover:bg-background transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>
        </div>

        {/* En-têtes jours */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS_FR.map((d) => (
            <div
              key={d}
              className="text-center text-xs font-semibold text-foreground-muted py-2"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Grille jours */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, i) => {
            if (!date) {
              return <div key={`empty-${i}`} />
            }

            const disabled = isDisabled(date)
            const dateStr = formatDate(date)
            const isSelected = selectedDate === dateStr
            const isToday = isSameDay(date, today)

            return (
              <button
                key={dateStr}
                onClick={() => !disabled && onSelect(dateStr)}
                disabled={disabled}
                className={`
                  relative h-11 rounded-xl text-sm font-medium transition-all
                  ${disabled
                    ? 'text-foreground-muted/40 cursor-not-allowed'
                    : isSelected
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-foreground hover:bg-primary-50 dark:hover:bg-primary-900/20'
                  }
                `}
              >
                {date.getDate()}
                {isToday && !isSelected && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary-600" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
