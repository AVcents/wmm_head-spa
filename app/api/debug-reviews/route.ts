// Route de debug temporaire — à supprimer après diagnostic
import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env['GOOGLE_PLACES_API_KEY']
  const placeId = process.env['GOOGLE_PLACE_ID']

  if (!apiKey || !placeId) {
    return NextResponse.json({
      error: 'Variables manquantes',
      GOOGLE_PLACES_API_KEY: apiKey ? '✅ présente' : '❌ MANQUANTE',
      GOOGLE_PLACE_ID: placeId ? '✅ présente' : '❌ MANQUANTE',
    })
  }

  const url = `https://places.googleapis.com/v1/places/${placeId}?languageCode=fr`
  const res = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'rating,userRatingCount,reviews',
    },
    cache: 'no-store',
  })

  const data = await res.json()

  return NextResponse.json({
    status: res.status,
    ok: res.ok,
    GOOGLE_PLACES_API_KEY: '✅ présente (masquée)',
    GOOGLE_PLACE_ID: placeId,
    response: data,
  })
}
