export interface ServiceVariantRow {
  id: string
  service_id: string
  name: string
  hair_length: 'courts' | 'mi-longs' | 'longs' | 'rases' | 'enfant' | 'body'
  hair_length_label: string
  duration: number
  price: number
  description: string | null
  sort_order: number
  created_at: string
}

export interface ServiceRow {
  id: string
  name: string
  category: 'headspa-japonais' | 'headspa-holistique' | 'massage'
  description: string
  has_variants: boolean
  duration: number | null
  price: number | null
  hair_length: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  service_variants?: ServiceVariantRow[]
}

export interface ScheduleConfigRow {
  id: number
  active_template: string
  updated_at: string
}

export interface ScheduleTemplateRow {
  id: string
  label: string
  sort_order: number
}

export interface ScheduleHourRow {
  id: number
  template_id: string
  day_label: string
  hours: string
  sort_order: number
}

export interface ScheduleTemplateWithHours extends ScheduleTemplateRow {
  schedule_hours: ScheduleHourRow[]
}
