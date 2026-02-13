import { NextResponse } from 'next/server'
import { fetchSchedule } from '@/lib/get-data'

export const revalidate = 60

export async function GET() {
  try {
    const schedule = await fetchSchedule()
    return NextResponse.json(schedule)
  } catch {
    return NextResponse.json(
      {
        label: 'Semaine impaire',
        hours: [
          { day: 'Lundi - Vendredi', hours: '9h00 - 12h00 / 13h00 - 19h00' },
          { day: 'Samedi', hours: 'Fermé' },
          { day: 'Dimanche', hours: 'Fermé' },
        ],
      },
      { status: 200 }
    )
  }
}
