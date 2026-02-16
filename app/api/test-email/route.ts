import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function GET() {
  const apiKey = process.env['RESEND_API_KEY']
  const from = process.env['RESEND_FROM_EMAIL'] ?? 'onboarding@resend.dev'
  const to = process.env['SALON_EMAIL'] ?? 'contact@kalm-headspa.fr'

  if (!apiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY manquante' }, { status: 500 })
  }

  const resend = new Resend(apiKey)

  const result = await resend.emails.send({
    from: `Kalm Headspa <${from}>`,
    to,
    subject: '[TEST] Email Kalm Headspa — diagnostic',
    html: '<p>Test email depuis le serveur Kalm Headspa. Si tu vois ça, Resend fonctionne ✅</p>',
  })

  return NextResponse.json({
    env: { apiKey: apiKey.slice(0, 8) + '...', from, to },
    resend: result,
  })
}
