// Script de test pour vérifier getActiveScheduleForHapio
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  // 1. Get active template ID
  const { data: config } = await supabase
    .from('schedule_config')
    .select('active_template')
    .eq('id', 1)
    .single()

  console.log('Config:', config)

  if (!config) {
    console.log('❌ No schedule config found')
    return
  }

  // 2. Get template with hours
  const { data: template } = await supabase
    .from('schedule_templates')
    .select('*, schedule_hours(*)')
    .eq('id', config.active_template)
    .single()

  console.log('Template:', template)

  if (!template) {
    console.log('❌ No template found')
    return
  }

  // 3. Parse schedule
  const dayMapping = {
    'Dimanche': 0,
    'Lundi': 1,
    'Mardi': 2,
    'Mercredi': 3,
    'Jeudi': 4,
    'Vendredi': 5,
    'Samedi': 6,
  }

  const blocks = []

  for (const hour of template.schedule_hours) {
    if (hour.hours === 'Fermé' || !hour.hours) continue

    // Handle day ranges like "Lundi - Vendredi" or single days like "Lundi"
    const daysToProcess = []

    if (hour.day_label.includes(' - ')) {
      // It's a range like "Lundi - Vendredi"
      const [startDay, endDay] = hour.day_label.split(' - ').map(d => d.trim())
      const startNum = dayMapping[startDay]
      const endNum = dayMapping[endDay]

      if (startNum !== undefined && endNum !== undefined) {
        // Add all days in range (inclusive)
        for (let i = startNum; i <= endNum; i++) {
          daysToProcess.push(i)
        }
      }
    } else {
      // Single day like "Lundi"
      const dayNum = dayMapping[hour.day_label]
      if (dayNum !== undefined) {
        daysToProcess.push(dayNum)
      }
    }

    // Parse "09h-12h / 13h-19h" → plusieurs blocks
    const segments = hour.hours.split('/')
    for (const segment of segments) {
      const match = segment.trim().match(/(\d{1,2})h(\d{2})?[\s-]+(\d{1,2})h(\d{2})?/)
      if (!match) continue

      const startH = match[1].padStart(2, '0')
      const startM = (match[2] ?? '00').padStart(2, '0')
      const endH = match[3].padStart(2, '0')
      const endM = (match[4] ?? '00').padStart(2, '0')

      // Create a block for each day in the range
      for (const dayNum of daysToProcess) {
        blocks.push({
          day_of_week: dayNum,
          start_time: `${startH}:${startM}`,
          end_time: `${endH}:${endM}`,
        })
      }
    }
  }

  console.log('✅ Parsed blocks:', JSON.stringify(blocks, null, 2))
}

test()
