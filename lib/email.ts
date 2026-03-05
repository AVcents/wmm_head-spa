// ============================================
// Resend — Emails de confirmation Kalm Headspa
// ============================================

import { Resend } from 'resend'
import { generateGiftCardPDF } from './pdf'

let resend: Resend | null = null

function getResend(): Resend {
  if (!resend) {
    const apiKey = process.env['RESEND_API_KEY']
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not set')
    }
    resend = new Resend(apiKey)
  }
  return resend
}

const FROM = process.env['RESEND_FROM_EMAIL'] ?? 'onboarding@resend.dev'
const SALON_EMAIL = process.env['SALON_EMAIL'] ?? 'contact@kalm-headspa.fr'

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
  extras?: Array<{ name: string; price: number }>
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
    timeZone: 'Europe/Paris',
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
                        <td style="font-family:Arial,sans-serif;font-size:13px;color:${C.textMuted};">Prestation</td>
                        <td style="font-family:Arial,sans-serif;font-size:14px;font-weight:600;color:${C.text};text-align:right;">${d.price}&nbsp;€</td>
                      </tr>
                    </table>

                    ${d.extras && d.extras.length > 0 ? d.extras.map(e => `
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;">
                      <tr>
                        <td style="font-family:Arial,sans-serif;font-size:13px;color:${C.textMuted};">+ ${e.name}</td>
                        <td style="font-family:Arial,sans-serif;font-size:13px;color:${C.textMuted};text-align:right;">+${Number(e.price).toFixed(2)}&nbsp;€</td>
                      </tr>
                    </table>`).join('') + `
                    <div style="height:1px;background-color:${C.border};margin:10px 0;"></div>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:${C.text};">Total</td>
                        <td style="font-family:Georgia,serif;font-size:22px;font-weight:bold;color:${C.primary};text-align:right;">${d.price + (d.extras ?? []).reduce((s, e) => s + Number(e.price), 0)}&nbsp;€</td>
                      </tr>
                    </table>` : `
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;">
                      <tr>
                        <td style="font-family:Arial,sans-serif;font-size:13px;color:${C.textMuted};">Total</td>
                        <td style="font-family:Georgia,serif;font-size:22px;font-weight:bold;color:${C.primary};text-align:right;">${d.price}&nbsp;€</td>
                      </tr>
                    </table>`}

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
                      <td style="font-size:13px;color:${C.textMuted};padding:3px 0;">Prestation</td>
                      <td style="font-size:14px;font-weight:600;color:${C.text};padding:3px 0;">${d.price} €</td>
                    </tr>
                    ${d.extras && d.extras.length > 0 ? d.extras.map(e => `<tr>
                      <td style="font-size:13px;color:${C.textMuted};padding:3px 0;">+ ${e.name}</td>
                      <td style="font-size:13px;color:${C.textMuted};padding:3px 0;">+${Number(e.price).toFixed(2)} €</td>
                    </tr>`).join('') + `<tr>
                      <td style="font-size:13px;font-weight:700;color:${C.text};padding:3px 0;border-top:1px solid ${C.border};">Total</td>
                      <td style="font-size:16px;font-weight:700;color:${C.primary};padding:3px 0;border-top:1px solid ${C.border};">${d.price + (d.extras ?? []).reduce((s, e) => s + Number(e.price), 0)} €</td>
                    </tr>` : `<tr>
                      <td style="font-size:13px;font-weight:700;color:${C.text};padding:3px 0;">Total</td>
                      <td style="font-size:16px;font-weight:700;color:${C.primary};padding:3px 0;">${d.price} €</td>
                    </tr>`}
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

// ============================================
// Bon Cadeau — Types & emails
// ============================================

export interface GiftCardEmailData {
  giftCardCode: string
  paymentIntentId: string
  // Acheteur
  buyerEmail: string
  buyerFirstName: string
  buyerLastName: string
  buyerPhone?: string
  // Destinataire
  recipientEmail: string
  recipientFirstName: string
  recipientLastName: string
  // Service
  serviceName: string
  hairLengthLabel?: string
  // Montants
  giftAmount: number      // montant du bon (hors livraison)
  deliveryFee: number
  totalAmount: number
  deliveryMethod: 'digital' | 'physical'
  // Message
  senderName?: string
  personalMessage?: string
}

function buildGiftCardBuyerHtml(d: GiftCardEmailData): string {
  const serviceDisplay = d.hairLengthLabel
    ? `${d.serviceName} — ${d.hairLengthLabel}`
    : d.serviceName

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bon cadeau envoyé — Kalm Headspa</title>
</head>
<body style="margin:0;padding:0;background-color:${C.bg};font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.bg};padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,${C.primary} 0%,${C.primaryDark} 100%);border-radius:16px 16px 0 0;padding:48px 40px 40px;text-align:center;">
            <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.7);">Kalm Headspa · Vecoux</p>
            <h1 style="margin:0;font-family:Georgia,serif;font-size:32px;font-weight:400;color:#ffffff;">Bon cadeau envoyé ✦</h1>
            <p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:14px;color:rgba(255,255,255,0.85);">Votre paiement a bien été reçu</p>
          </td>
        </tr>
        <tr>
          <td style="background-color:${C.surface};padding:40px;">
            <p style="margin:0 0 24px;font-family:Georgia,serif;font-size:18px;color:${C.text};">
              Bonjour <strong>${d.buyerFirstName}</strong>,
            </p>
            <p style="margin:0 0 32px;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:${C.textMuted};">
              Merci pour votre achat ! Votre bon cadeau a bien été créé et envoyé à
              <strong>${d.recipientFirstName} ${d.recipientLastName}</strong>
              ${d.deliveryMethod === 'digital' ? `à l'adresse <strong>${d.recipientEmail}</strong>` : 'par courrier'}.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.primaryLight};border-radius:12px;margin-bottom:32px;">
              <tr><td style="padding:24px 28px;">
                <p style="margin:0 0 20px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:${C.primary};">Votre bon cadeau</p>
                <table width="100%" cellpadding="0" cellspacing="6">
                  <tr>
                    <td style="font-family:Arial,sans-serif;font-size:13px;color:${C.textMuted};padding:4px 0;">Prestation</td>
                    <td style="font-family:Georgia,serif;font-size:15px;font-weight:bold;color:${C.text};text-align:right;padding:4px 0;">${serviceDisplay}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="height:1px;background-color:${C.border};padding:0;"></td>
                  </tr>
                  <tr>
                    <td style="font-family:Arial,sans-serif;font-size:13px;color:${C.textMuted};padding:4px 0;">Destinataire</td>
                    <td style="font-family:Arial,sans-serif;font-size:14px;color:${C.text};text-align:right;padding:4px 0;">${d.recipientFirstName} ${d.recipientLastName}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="height:1px;background-color:${C.border};padding:0;"></td>
                  </tr>
                  <tr>
                    <td style="font-family:Arial,sans-serif;font-size:13px;color:${C.textMuted};padding:4px 0;">Montant</td>
                    <td style="font-family:Georgia,serif;font-size:22px;font-weight:bold;color:${C.primary};text-align:right;padding:4px 0;">${d.giftAmount}&nbsp;€</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="height:1px;background-color:${C.border};padding:0;"></td>
                  </tr>
                  <tr>
                    <td style="font-family:Arial,sans-serif;font-size:13px;color:${C.textMuted};padding:4px 0;">Code</td>
                    <td style="font-family:Arial,sans-serif;font-size:16px;font-weight:700;color:${C.primaryDark};text-align:right;letter-spacing:2px;padding:4px 0;">${d.giftCardCode}</td>
                  </tr>
                </table>
              </td></tr>
            </table>

            <p style="margin:0;font-family:Georgia,serif;font-size:15px;line-height:1.7;color:${C.textMuted};text-align:center;padding-top:24px;border-top:1px solid ${C.border};">
              Merci de votre confiance.<br/>
              <em>L'équipe Kalm Headspa</em>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background-color:${C.primaryLight};border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:${C.textMuted};line-height:1.6;">
              Kalm Headspa · Vecoux 88200 · <a href="mailto:${SALON_EMAIL}" style="color:${C.primary};text-decoration:none;">${SALON_EMAIL}</a>
            </p>
            <p style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:10px;color:${C.textMuted};">Réf. : ${d.paymentIntentId}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function buildGiftCardRecipientHtml(d: GiftCardEmailData): string {
  const serviceDisplay = d.hairLengthLabel
    ? `${d.serviceName} — ${d.hairLengthLabel}`
    : d.serviceName
  const fromName = d.senderName || `${d.buyerFirstName} ${d.buyerLastName}`

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vous avez reçu un bon cadeau — Kalm Headspa</title>
</head>
<body style="margin:0;padding:0;background-color:${C.bg};font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.bg};padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,${C.primary} 0%,${C.primaryDark} 100%);border-radius:16px 16px 0 0;padding:48px 40px 40px;text-align:center;">
            <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.7);">Kalm Headspa · Vecoux</p>
            <h1 style="margin:0;font-family:Georgia,serif;font-size:32px;font-weight:400;color:#ffffff;">Un cadeau pour vous ✦</h1>
            <p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:14px;color:rgba(255,255,255,0.85);">Votre moment de sérénité vous attend</p>
          </td>
        </tr>
        <tr>
          <td style="background-color:${C.surface};padding:40px;">
            <p style="margin:0 0 24px;font-family:Georgia,serif;font-size:18px;color:${C.text};">
              Bonjour <strong>${d.recipientFirstName}</strong>,
            </p>
            <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:${C.textMuted};">
              <strong>${fromName}</strong> vous a offert un bon cadeau chez Kalm Headspa !
            </p>

            ${d.personalMessage ? `
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.border};border-radius:12px;margin-bottom:28px;">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.textMuted};">Message</p>
                <p style="margin:0;font-family:Georgia,serif;font-size:16px;line-height:1.7;color:${C.text};font-style:italic;">&ldquo;${d.personalMessage}&rdquo;</p>
              </td></tr>
            </table>
            ` : ''}

            <!-- Bon cadeau visuel -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,${C.primaryLight} 0%,#f9f0ea 100%);border:2px solid ${C.primary};border-radius:16px;margin-bottom:32px;">
              <tr><td style="padding:32px;text-align:center;">
                <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${C.primary};">Bon cadeau</p>
                <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:22px;color:${C.text};font-weight:bold;">${serviceDisplay}</p>
                <p style="margin:0 0 20px;font-family:Georgia,serif;font-size:40px;font-weight:bold;color:${C.primary};">${d.giftAmount}&nbsp;€</p>
                <div style="display:inline-block;background-color:${C.primaryDark};color:#ffffff;font-family:Arial,sans-serif;font-size:20px;font-weight:700;letter-spacing:4px;padding:12px 28px;border-radius:8px;">
                  ${d.giftCardCode}
                </div>
                <p style="margin:16px 0 0;font-family:Arial,sans-serif;font-size:12px;color:${C.textMuted};">Présentez ce code lors de votre réservation</p>
              </td></tr>
            </table>

            <div style="text-align:center;margin-bottom:32px;">
              <a href="mailto:${SALON_EMAIL}"
                 style="display:inline-block;background-color:${C.primary};color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:50px;">
                Réserver ma séance
              </a>
            </div>

            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.border};border-radius:12px;margin-bottom:32px;">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.textMuted};">Contact</p>
                <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:14px;color:${C.text};">Kalm Headspa · Vecoux, 88200</p>
                <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:${C.text};">
                  <a href="tel:0621571222" style="color:${C.primary};text-decoration:none;">06 21 57 12 22</a>
                </p>
              </td></tr>
            </table>

            <p style="margin:0;font-family:Georgia,serif;font-size:15px;line-height:1.7;color:${C.textMuted};text-align:center;padding-top:24px;border-top:1px solid ${C.border};">
              Nous vous souhaitons un merveilleux moment.<br/>
              <em>L'équipe Kalm Headspa</em>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background-color:${C.primaryLight};border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:${C.textMuted};line-height:1.6;">
              Kalm Headspa · Vecoux 88200 · <a href="mailto:${SALON_EMAIL}" style="color:${C.primary};text-decoration:none;">${SALON_EMAIL}</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function buildGiftCardSalonHtml(d: GiftCardEmailData): string {
  const serviceDisplay = d.hairLengthLabel
    ? `${d.serviceName} — ${d.hairLengthLabel}`
    : d.serviceName

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /><title>Nouveau bon cadeau</title></head>
<body style="margin:0;padding:0;background-color:${C.bg};font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.bg};padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background-color:${C.primaryDark};border-radius:12px 12px 0 0;padding:28px 36px;text-align:center;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.6);">Kalm Headspa</p>
            <h1 style="margin:0;font-family:Georgia,serif;font-size:24px;font-weight:400;color:#ffffff;">Nouveau bon cadeau vendu</h1>
          </td>
        </tr>
        <tr>
          <td style="background-color:${C.surface};padding:32px 36px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.bg};border-radius:10px;margin-bottom:20px;">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 14px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.textMuted};">Acheteur</p>
                <table width="100%" cellpadding="0" cellspacing="6">
                  <tr><td style="font-size:13px;color:${C.textMuted};width:35%;padding:3px 0;">Nom</td><td style="font-size:14px;font-weight:600;color:${C.text};">${d.buyerFirstName} ${d.buyerLastName}</td></tr>
                  <tr><td style="font-size:13px;color:${C.textMuted};padding:3px 0;">Email</td><td style="font-size:14px;color:${C.text};"><a href="mailto:${d.buyerEmail}" style="color:${C.primary};text-decoration:none;">${d.buyerEmail}</a></td></tr>
                  ${d.buyerPhone ? `<tr><td style="font-size:13px;color:${C.textMuted};padding:3px 0;">Tél.</td><td style="font-size:14px;color:${C.text};">${d.buyerPhone}</td></tr>` : ''}
                </table>
              </td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.bg};border-radius:10px;margin-bottom:20px;">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 14px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.textMuted};">Destinataire</p>
                <table width="100%" cellpadding="0" cellspacing="6">
                  <tr><td style="font-size:13px;color:${C.textMuted};width:35%;padding:3px 0;">Nom</td><td style="font-size:14px;font-weight:600;color:${C.text};">${d.recipientFirstName} ${d.recipientLastName}</td></tr>
                  <tr><td style="font-size:13px;color:${C.textMuted};padding:3px 0;">Email</td><td style="font-size:14px;color:${C.text};"><a href="mailto:${d.recipientEmail}" style="color:${C.primary};text-decoration:none;">${d.recipientEmail}</a></td></tr>
                </table>
              </td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.primaryLight};border-radius:10px;margin-bottom:20px;">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 14px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.primary};">Bon cadeau</p>
                <table width="100%" cellpadding="0" cellspacing="6">
                  <tr><td style="font-size:13px;color:${C.textMuted};width:35%;padding:3px 0;">Prestation</td><td style="font-size:14px;font-weight:700;color:${C.text};">${serviceDisplay}</td></tr>
                  <tr><td style="font-size:13px;color:${C.textMuted};padding:3px 0;">Montant</td><td style="font-size:16px;font-weight:700;color:${C.primary};">${d.giftAmount} €</td></tr>
                  <tr><td style="font-size:13px;color:${C.textMuted};padding:3px 0;">Total encaissé</td><td style="font-size:16px;font-weight:700;color:${C.primaryDark};">${d.totalAmount} €</td></tr>
                  <tr><td style="font-size:13px;color:${C.textMuted};padding:3px 0;">Code</td><td style="font-size:16px;font-weight:700;color:${C.primaryDark};letter-spacing:2px;">${d.giftCardCode}</td></tr>
                  <tr><td style="font-size:13px;color:${C.textMuted};padding:3px 0;">Livraison</td><td style="font-size:14px;color:${C.text};">${d.deliveryMethod === 'digital' ? 'Numérique' : 'Courrier'}</td></tr>
                </table>
              </td></tr>
            </table>
            <p style="margin:0;font-size:11px;color:${C.textMuted};text-align:center;">Réf. : ${d.paymentIntentId}</p>
          </td>
        </tr>
        <tr>
          <td style="background-color:${C.bg};border-radius:0 0 12px 12px;padding:16px 36px;text-align:center;">
            <p style="margin:0;font-size:11px;color:${C.border};">Kalm Headspa · Notification automatique</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendGiftCardEmails(data: GiftCardEmailData): Promise<void> {
  const client = getResend()

  console.log('[sendGiftCardEmails] Sending emails for', data.giftCardCode, {
    from: FROM,
    buyerEmail: data.buyerEmail,
    recipientEmail: data.recipientEmail,
    salonEmail: SALON_EMAIL,
  })

  const FROM_LABEL = `Kalm Headspa <${FROM}>`

  // Générer le PDF chèque cadeau (base64 pour compatibilité Resend v6)
  let pdfAttachment: { filename: string; content: string } | undefined
  try {
    const pdfBytes = await generateGiftCardPDF({
      recipientName: `${data.recipientFirstName} ${data.recipientLastName}`,
      serviceName: data.serviceName,
      giftCardCode: data.giftCardCode,
    })
    pdfAttachment = {
      filename: `bon-cadeau-kalm-${data.giftCardCode}.pdf`,
      content: Buffer.from(pdfBytes).toString('base64'),
    }
    console.log('[sendGiftCardEmails] PDF généré, taille:', pdfBytes.length, 'octets')
  } catch (err) {
    console.error('[sendGiftCardEmails] Erreur génération PDF:', err)
    // On continue sans le PDF plutôt que de bloquer l'envoi
  }

  // Envoi des 3 emails de façon indépendante — chaque envoi est isolé
  // pour qu'une erreur sur l'un ne bloque pas les autres.

  // 1. Email acheteur
  try {
    const res = await client.emails.send({
      from: FROM_LABEL,
      to: data.buyerEmail,
      subject: `Votre bon cadeau Kalm Headspa — ${data.giftCardCode}`,
      html: buildGiftCardBuyerHtml(data),
    })
    if (res.error) console.error('[sendGiftCardEmails] buyer ERROR:', JSON.stringify(res.error))
    else console.log('[sendGiftCardEmails] buyer OK — id:', res.data?.id)
  } catch (err) {
    console.error('[sendGiftCardEmails] buyer FAILED:', err)
  }

  // 2. Email destinataire (avec PDF si disponible)
  try {
    const res = await client.emails.send({
      from: FROM_LABEL,
      to: data.recipientEmail,
      subject: `Vous avez reçu un bon cadeau Kalm Headspa ✦`,
      html: buildGiftCardRecipientHtml(data),
      ...(pdfAttachment ? { attachments: [pdfAttachment] } : {}),
    })
    if (res.error) console.error('[sendGiftCardEmails] recipient ERROR:', JSON.stringify(res.error))
    else console.log('[sendGiftCardEmails] recipient OK — id:', res.data?.id)
  } catch (err) {
    console.error('[sendGiftCardEmails] recipient FAILED:', err)
  }

  // 3. Email salon
  try {
    const res = await client.emails.send({
      from: FROM_LABEL,
      to: SALON_EMAIL,
      subject: `[Bon cadeau] ${data.buyerFirstName} ${data.buyerLastName} — ${data.giftAmount}€ · ${data.giftCardCode}`,
      html: buildGiftCardSalonHtml(data),
    })
    if (res.error) console.error('[sendGiftCardEmails] salon ERROR:', JSON.stringify(res.error))
    else console.log('[sendGiftCardEmails] salon OK — id:', res.data?.id)
  } catch (err) {
    console.error('[sendGiftCardEmails] salon FAILED:', err)
  }
}

// -----------------------------------------------
// Envoi des emails
// -----------------------------------------------
export async function sendBookingEmails(data: BookingEmailData): Promise<void> {
  const serviceDisplay = data.variantLabel
    ? `${data.serviceName} — ${data.variantLabel}`
    : data.serviceName

  const dateStr = `${formatDateFr(data.date)} à ${formatTimeFr(data.date)}`
  const client = getResend()

  console.log('[sendBookingEmails] Sending emails for booking', data.bookingId, {
    from: FROM,
    clientEmail: data.clientEmail,
    salonEmail: SALON_EMAIL,
  })

  const sends = [
    { label: 'client', to: data.clientEmail, subject: `Réservation confirmée — ${serviceDisplay} · ${dateStr}`, html: buildClientHtml(data) },
    { label: 'salon', to: SALON_EMAIL, subject: `[Nouvelle résa] ${data.clientName} — ${serviceDisplay} · ${dateStr}`, html: buildSalonHtml(data) },
  ]

  const results = await Promise.allSettled(
    sends.map(({ to, subject, html }) =>
      client.emails.send({ from: `Kalm Headspa <${FROM}>`, to, subject, html })
    )
  )

  const failures: string[] = []

  results.forEach((result, i) => {
    const label = sends[i]!.label
    if (result.status === 'rejected') {
      console.error(`[sendBookingEmails] ${label} REJECTED:`, result.reason)
      failures.push(`${label}: ${String(result.reason)}`)
    } else {
      const { data: emailData, error } = result.value
      if (error) {
        console.error(`[sendBookingEmails] ${label} ERROR:`, JSON.stringify(error))
        failures.push(`${label}: ${JSON.stringify(error)}`)
      } else {
        console.log(`[sendBookingEmails] ${label} OK — id:`, emailData?.id)
      }
    }
  })

  if (failures.length > 0) {
    throw new Error(`Email booking failures: ${failures.join(' | ')}`)
  }
}
