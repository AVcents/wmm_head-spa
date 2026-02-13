import { fetchSchedule } from '@/lib/get-data'
import { Clock } from 'lucide-react'

export async function ScheduleHours() {
  const schedule = await fetchSchedule()

  return (
    <div>
      <h3 className="text-lg font-serif font-semibold text-foreground mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary-600 dark:text-primary-400" />
        Horaires
      </h3>
      <p className="text-xs text-foreground-muted mb-3 italic">{schedule.label}</p>
      <ul className="space-y-3">
        {schedule.hours.map((item) => (
          <li key={item.day} className="text-sm">
            <div className="flex justify-between items-center">
              <span className="text-foreground-secondary">{item.day}</span>
              <span className="font-medium text-foreground">{item.hours}</span>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 p-3 rounded-lg bg-primary-600 dark:bg-primary-900/40 border border-primary-700 dark:border-primary-800">
        <p className="text-xs font-medium text-white dark:text-primary-300 text-center">
          Sur rendez-vous uniquement
        </p>
      </div>
    </div>
  )
}
