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

export interface ExtraRow {
  id: string
  name: string
  description: string | null
  price: number
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
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

export interface ServiceExtraRow {
  service_id: string
  extra_id: string
  sort_order: number
}

export interface SlotsCacheRow {
  id: string
  service_id: string
  date: string // YYYY-MM-DD
  slots: unknown[]
  cached_at: string
}

export interface PlanningOverrideRow {
  id: string
  week_start: string  // YYYY-MM-DD (lundi de la semaine)
  type: 'closed' | 'template' | 'custom'
  template_id: string | null
  custom_hours: Array<{ day_label: string; hours: string; sort_order: number }> | null
  label: string | null
  created_at: string
  updated_at: string
}

export interface BookingRow {
  id: string
  service_id: string
  variant_id: string | null
  starts_at: string       // ISO UTC
  ends_at: string         // ISO UTC
  duration: number        // minutes
  status: 'confirmed' | 'cancelled' | 'no_show'
  cancelled_at: string | null
  client_name: string
  client_email: string
  client_phone: string
  client_message: string | null
  payment_mode: 'hold' | 'direct' | 'gift_card' | 'in_person'
  payment_intent_id: string | null
  gift_card_code: string | null
  price: number | null
  extras_json: Array<{ name: string; price: number }> | null
  extras_total: number | null
  booked_by: 'client' | 'admin'
  note: string | null
  service_name: string
  variant_name: string | null
  created_at: string
  updated_at: string
}
