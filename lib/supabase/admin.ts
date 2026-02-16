import { createClient } from '@supabase/supabase-js'

/** Admin client — service_role key, bypasses RLS. Server-side only. */
export function createAdminClient() {
  return createClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['SUPABASE_SERVICE_ROLE_KEY']!
  )
}
