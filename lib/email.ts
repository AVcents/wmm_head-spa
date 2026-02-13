// ============================================
// Resend — Emails de confirmation Kalm Headspa
// ============================================

import { Resend } from 'resend'

const resend = new Resend(process.env['RESEND_API_KEY'])

const FROM = process.env['RESEND_FROM_EMAIL'] ?? 'onboarding@resend.dev'
const SALON_EMAIL = process.env['SALON_EMAIL'] ?? 'contact@kalm-headspa.fr'
const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://kalm-headspa.fr'

// Palette site (terracotta)
const C = {
  primary: '#b36d52',
  primaryLight: '#f4e8e1',
  primaryDark: '#7a483d',
  bg: '#faf8f6',
  surface: '#ffffff',
  text: '#2d1f1a',
  textMuted: '#5a4a42',
  border: '#e8dfd8',
  success: '#8b9e6f',
}

export interface BookingEmailData {
  clientName: string
  clientEmail: string
  clientPhone: string
  serviceName: string
  variantLabel?: string
  date: string        // ISO string (starts_at)
  duration: number    // minutes
  price: number
  message?: string
  giftCardCode?: string
  bookingId: string
}

// -----------------------------------------------
// Helpers
// -----------------------------------------------
function formatDateFr(isoString: string): string {
  return new Date(isoString).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTimeFr(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  })
}

// -----------------------------------------------
// Template client : confirmation de réservation
// -----------------------------------------------
function buildClientHtml(d: BookingEmailData): string {
  const serviceDisplay = d.variantLabel
    ? `${d.serviceName} — ${d.variantLabel}`
    : d.serviceName

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Réservation confirmée — Kalm Headspa</title>
</head>
<body style="margin:0;padding:0;background-color:${C.bg};font-family:Georgia,'Times New Roman',serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.bg};padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${C.primary} 0%,${C.primaryDark} 100%);border-radius:16px 16px 0 0;padding:48px 40px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.7);">Kalm Headspa · Vecoux</p>
              <h1 style="margin:0;font-family:Georgia,serif;font-size:32px;font-weight:400;color:#ffffff;letter-spacing:1px;">Réservation confirmée</h1>
              <p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:14px;color:rgba(255,255,255,0.85);">Votre moment de sérénité vous attend ✦</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:${C.surface};padding:40px;">

              <!-- Salutation -->
              <p style="margin:0 0 24px;font-family:Georgia,serif;font-size:18px;color:${C.text};">
                Bonjour <strong>${d.clientName}</strong>,
              </p>
              <p style="margin:0 0 32px;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:${C.textMuted};">
                Votre réservation a bien été enregistrée. Nous avons hâte de vous accueillir dans notre espace de bien-être.
              </p>

              <!-- Récapitulatif -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.primaryLight};border-radius:12px;margin-bottom:32px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 20px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:${C.primary};">Votre rendez-vous</p>

                    <!-- Prestation -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
                      <tr>
                        <td style="font-family:Arial,sans-serif;font-size:13px;color:${C.textMuted};width:40%;">Prestation</td>
                        <td style="font-family:Georgia,serif;font-size:15px;font-weight:bold;color:${C.text};text-align:right;">${serviceDisplay}</td>
                      </tr>
                    </table>

                    <div style="height:1px;background-color:${C.border};margin:14px 0;"></div>

                    <!-- Date -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
                      <tr>
                        <td style="font-family:Arial,sans-serif;font-size:13px;color:${C.textMuted};">Date</td>
                        <td style="font-family:Arial,sans-serif;font-size:14px;font-weight:600;color:${C.text};text-align:right;text-transform:capitalize;">${formatDateFr(d.date)}</td>
                      </tr>
                    </table>

                    <!-- Heure -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
                      <tr>
                        <td style="font-family:Arial,sans-serif;font-size:13px;color:${C.textMuted};">Heure</td>
                        <td style="font-family:Arial,sans-serif;font-size:14px;font-weight:600;color:${C.text};text-align:right;">${formatTimeFr(d.date)}</td>
                      </tr>
                    </table>

                    <!-- Durée -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
                      <tr>
                        <td style="font-family:Arial,sans-serif;font-size:13px;color:${C.textMuted};">Durée</td>
                        <td style="font-family:Arial,sans-serif;font-size:14px;color:${C.textMuted};text-align:right;">${d.duration} min</td>
                      </tr>
                    </table>

                    <div style="height:1px;background-color:${C.border};margin:14px 0;"></div>

                    <!-- Prix -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-family:Arial,sans-serif;font-size:13px;color:${C.textMuted};">Tarif</td>
                        <td style="font-family:Georgia,serif;font-size:22px;font-weight:bold;color:${C.primary};text-align:right;">${d.price}&nbsp;€</td>
                      </tr>
                    </table>

                    ${d.giftCardCode ? `
                    <div style="height:1px;background-color:${C.border};margin:14px 0;"></div>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-family:Arial,sans-serif;font-size:13px;color:${C.textMuted};">Bon cadeau</td>
                        <td style="font-family:Arial,sans-serif;font-size:13px;font-weight:600;color:${C.success};text-align:right;">${d.giftCardCode}</td>
                      </tr>
                    </table>
                    ` : ''}

                  </td>
                </tr>
              </table>

              <!-- Contact -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.border};border-radius:12px;margin-bottom:32px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.textMuted};">Adresse</p>
                    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:${C.text};">
                      Kalm Headspa<br/>
                      Vecoux, 88200<br/>
                      France
                    </p>
                    <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.textMuted};">Téléphone</p>
                    <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:${C.text};">
                      <a href="tel:0621571222" style="color:${C.primary};text-decoration:none;">06 21 57 12 22</a>
                    </p>
                  </td>
                </tr>
              </table>

              ${d.message ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.border};border-radius:12px;margin-bottom:32px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.textMuted};">Votre message</p>
                    <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:${C.text};font-style:italic;">"${d.message}"</p>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- CTA -->
              <div style="text-align:center;margin-bottom:32px;">
                <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:14px;color:${C.textMuted};">
                  Besoin de modifier ou annuler votre rendez-vous ?
                </p>
                <a href="mailto:${SALON_EMAIL}"
                   style="display:inline-block;background-color:${C.primary};color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:50px;">
                  Contacter le salon
                </a>
              </div>

              <!-- Closing -->
              <p style="margin:0;font-family:Georgia,serif;font-size:15px;line-height:1.7;color:${C.textMuted};text-align:center;padding-top:24px;border-top:1px solid ${C.border};">
                Nous vous souhaitons un merveilleux moment.<br/>
                <em>L'équipe Kalm Headspa</em>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:${C.primaryLight};border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:${C.textMuted};line-height:1.6;">
                Kalm Headspa · Vecoux 88200 · <a href="mailto:${SALON_EMAIL}" style="color:${C.primary};text-decoration:none;">${SALON_EMAIL}</a>
              </p>
              <p style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:10px;color:${C.textMuted};">
                Réf. : ${d.bookingId}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// -----------------------------------------------
// Template salon : notification nouvelle réservation
// -----------------------------------------------
function buildSalonHtml(d: BookingEmailData): string {
  const serviceDisplay = d.variantLabel
    ? `${d.serviceName} — ${d.variantLabel}`
    : d.serviceName

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /><title>Nouvelle réservation</title></head>
<body style="margin:0;padding:0;background-color:${C.bg};font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.bg};padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:${C.primaryDark};border-radius:12px 12px 0 0;padding:28px 36px;text-align:center;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.6);">Kalm Headspa</p>
              <h1 style="margin:0;font-family:Georgia,serif;font-size:24px;font-weight:400;color:#ffffff;">Nouvelle réservation</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:${C.surface};padding:32px 36px;">

              <!-- Badge -->
              <div style="text-align:center;margin-bottom:28px;">
                <span style="display:inline-block;background-color:${C.primaryLight};color:${C.primary};font-size:13px;font-weight:700;padding:8px 20px;border-radius:50px;letter-spacing:0.5px;">
                  ${formatDateFr(d.date)} à ${formatTimeFr(d.date)}
                </span>
              </div>

              <!-- Infos client -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.bg};border-radius:10px;margin-bottom:20px;">
                <tr><td style="padding:20px 24px;">
                  <p style="margin:0 0 14px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.textMuted};">Client</p>
                  <table width="100%" cellpadding="0" cellspacing="6">
                    <tr>
                      <td style="font-size:13px;color:${C.textMuted};width:35%;padding:3px 0;">Nom</td>
                      <td style="font-size:14px;font-weight:600;color:${C.text};padding:3px 0;">${d.clientName}</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:${C.textMuted};padding:3px 0;">Email</td>
                      <td style="font-size:14px;color:${C.text};padding:3px 0;"><a href="mailto:${d.clientEmail}" style="color:${C.primary};text-decoration:none;">${d.clientEmail}</a></td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:${C.textMuted};padding:3px 0;">Téléphone</td>
                      <td style="font-size:14px;color:${C.text};padding:3px 0;"><a href="tel:${d.clientPhone}" style="color:${C.primary};text-decoration:none;">${d.clientPhone}</a></td>
                    </tr>
                    ${d.message ? `<tr>
                      <td style="font-size:13px;color:${C.textMuted};padding:3px 0;vertical-align:top;">Message</td>
                      <td style="font-size:13px;color:${C.text};font-style:italic;padding:3px 0;">"${d.message}"</td>
                    </tr>` : ''}
                  </table>
                </td></tr>
              </table>

              <!-- Infos prestation -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.primaryLight};border-radius:10px;margin-bottom:20px;">
                <tr><td style="padding:20px 24px;">
                  <p style="margin:0 0 14px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.primary};">Prestation</p>
                  <table width="100%" cellpadding="0" cellspacing="6">
                    <tr>
                      <td style="font-size:13px;color:${C.textMuted};width:35%;padding:3px 0;">Soin</td>
                      <td style="font-size:14px;font-weight:700;color:${C.text};padding:3px 0;">${serviceDisplay}</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:${C.textMuted};padding:3px 0;">Durée</td>
                      <td style="font-size:14px;color:${C.text};padding:3px 0;">${d.duration} min</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:${C.textMuted};padding:3px 0;">Tarif</td>
                      <td style="font-size:16px;font-weight:700;color:${C.primary};padding:3px 0;">${d.price} €</td>
                    </tr>
                    ${d.giftCardCode ? `<tr>
                      <td style="font-size:13px;color:${C.textMuted};padding:3px 0;">Bon cadeau</td>
                      <td style="font-size:13px;color:${C.success};font-weight:600;padding:3px 0;">${d.giftCardCode}</td>
                    </tr>` : ''}
                  </table>
                </td></tr>
              </table>

              <p style="margin:0;font-size:11px;color:${C.textMuted};text-align:center;">
                Réf. : ${d.bookingId}
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color:${C.bg};border-radius:0 0 12px 12px;padding:16px 36px;text-align:center;">
              <p style="margin:0;font-size:11px;color:${C.border};">Kalm Headspa · Notification automatique</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// -----------------------------------------------
// Envoi des emails
// -----------------------------------------------
export async function sendBookingEmails(data: BookingEmailData): Promise<void> {
  const serviceDisplay = data.variantLabel
    ? `${data.serviceName} — ${data.variantLabel}`
    : data.serviceName

  const dateStr = `${formatDateFr(data.date)} à ${formatTimeFr(data.date)}`

  await Promise.allSettled([
    // Email au client
    resend.emails.send({
      from: `Kalm Headspa <${FROM}>`,
      to: data.clientEmail,
      subject: `Réservation confirmée — ${serviceDisplay} · ${dateStr}`,
      html: buildClientHtml(data),
    }),

    // Notification au salon
    resend.emails.send({
      from: `Kalm Headspa <${FROM}>`,
      to: SALON_EMAIL,
      subject: `[Nouvelle résa] ${data.clientName} — ${serviceDisplay} · ${dateStr}`,
      html: buildSalonHtml(data),
    }),
  ])
}
