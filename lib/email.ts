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
  sendToClient?: boolean  // Si false, n'envoie que le email salon (défaut: true)
}

// -----------------------------------------------
// Helpers
// -----------------------------------------------

/** Échappe les entrées utilisateur avant insertion dans un template HTML email */
function esc(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

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
  const serviceDisplay = esc(
    d.variantLabel ? `${d.serviceName} — ${d.variantLabel}` : d.serviceName
  )

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
                Bonjour <strong>${esc(d.clientName)}</strong>,
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

                    ${(() => {
                      // d.price = total reçu du wizard (déjà inclut les extras).
                      // On déduit les extras pour afficher correctement la prestation seule.
                      const extrasSum = (d.extras ?? []).reduce((s, e) => s + Number(e.price), 0)
                      const baseService = Math.max(0, d.price - extrasSum)
                      const total = d.price
                      const extrasRows = (d.extras ?? []).map(e => `
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;">
                      <tr>
                        <td style="font-family:Arial,sans-serif;font-size:13px;color:${C.textMuted};">+ ${e.name}</td>
                        <td style="font-family:Arial,sans-serif;font-size:13px;color:${C.textMuted};text-align:right;">+${Number(e.price).toFixed(2)}&nbsp;€</td>
                      </tr>
                    </table>`).join('')
                      return `
                    <!-- Prestation -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-family:Arial,sans-serif;font-size:13px;color:${C.textMuted};">Prestation</td>
                        <td style="font-family:Arial,sans-serif;font-size:14px;font-weight:600;color:${C.text};text-align:right;">${baseService}&nbsp;€</td>
                      </tr>
                    </table>
                    ${extrasRows}
                    <div style="height:1px;background-color:${C.border};margin:10px 0;"></div>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:${C.text};">Total</td>
                        <td style="font-family:Georgia,serif;font-size:22px;font-weight:bold;color:${C.primary};text-align:right;">${total}&nbsp;€</td>
                      </tr>
                    </table>`
                    })()}

                    ${d.giftCardCode ? `
                    <div style="height:1px;background-color:${C.border};margin:14px 0;"></div>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-family:Arial,sans-serif;font-size:13px;color:${C.textMuted};">Bon cadeau</td>
                        <td style="font-family:Arial,sans-serif;font-size:13px;font-weight:600;color:${C.success};text-align:right;">${esc(d.giftCardCode)}</td>
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
                    <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:${C.text};font-style:italic;">"${esc(d.message)}"</p>
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
  const serviceDisplay = esc(
    d.variantLabel ? `${d.serviceName} — ${d.variantLabel}` : d.serviceName
  )

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
                      <td style="font-size:14px;font-weight:600;color:${C.text};padding:3px 0;">${esc(d.clientName)}</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:${C.textMuted};padding:3px 0;">Email</td>
                      <td style="font-size:14px;color:${C.text};padding:3px 0;"><a href="mailto:${esc(d.clientEmail)}" style="color:${C.primary};text-decoration:none;">${esc(d.clientEmail)}</a></td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:${C.textMuted};padding:3px 0;">Téléphone</td>
                      <td style="font-size:14px;color:${C.text};padding:3px 0;"><a href="tel:${esc(d.clientPhone)}" style="color:${C.primary};text-decoration:none;">${esc(d.clientPhone)}</a></td>
                    </tr>
                    ${d.message ? `<tr>
                      <td style="font-size:13px;color:${C.textMuted};padding:3px 0;vertical-align:top;">Message</td>
                      <td style="font-size:13px;color:${C.text};font-style:italic;padding:3px 0;">"${esc(d.message)}"</td>
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
                    ${(() => {
                      // d.price = total (déjà inclut extras). On déduit pour afficher la presta seule.
                      const extrasSum = (d.extras ?? []).reduce((s, e) => s + Number(e.price), 0)
                      const baseService = Math.max(0, d.price - extrasSum)
                      const extrasRows = (d.extras ?? []).map(e => `<tr>
                      <td style="font-size:13px;color:${C.textMuted};padding:3px 0;">+ ${e.name}</td>
                      <td style="font-size:13px;color:${C.textMuted};padding:3px 0;">+${Number(e.price).toFixed(2)} €</td>
                    </tr>`).join('')
                      return `<tr>
                      <td style="font-size:13px;color:${C.textMuted};padding:3px 0;">Prestation</td>
                      <td style="font-size:14px;font-weight:600;color:${C.text};padding:3px 0;">${baseService} €</td>
                    </tr>
                    ${extrasRows}
                    <tr>
                      <td style="font-size:13px;font-weight:700;color:${C.text};padding:3px 0;border-top:1px solid ${C.border};">Total</td>
                      <td style="font-size:16px;font-weight:700;color:${C.primary};padding:3px 0;border-top:1px solid ${C.border};">${d.price} €</td>
                    </tr>`
                    })()}
                    ${d.giftCardCode ? `<tr>
                      <td style="font-size:13px;color:${C.textMuted};padding:3px 0;">Bon cadeau</td>
                      <td style="font-size:13px;color:${C.success};font-weight:600;padding:3px 0;">${esc(d.giftCardCode)}</td>
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
  recipientPhone?: string
  // Service
  serviceName: string
  hairLengthLabel?: string
  // Extras (options ajoutées au bon)
  extras?: Array<{ name: string; price: number }>
  // Montants
  giftAmount: number      // montant du bon (prestation + extras, hors livraison)
  deliveryFee: number
  totalAmount: number
  deliveryMethod: 'digital' | 'physical'
  // Livraison papier
  shippingTo?: 'recipient' | 'buyer'
  shippingAddress?: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  // Message
  senderName?: string
  personalMessage?: string
}

function buildGiftCardBuyerHtml(d: GiftCardEmailData): string {
  const serviceDisplay = esc(
    d.hairLengthLabel ? `${d.serviceName} — ${d.hairLengthLabel}` : d.serviceName
  )

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
              Bonjour <strong>${esc(d.buyerFirstName)}</strong>,
            </p>
            <p style="margin:0 0 32px;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:${C.textMuted};">
              Merci pour votre achat ! Votre bon cadeau a bien été créé
              ${d.deliveryMethod === 'digital'
                ? `et envoyé à <strong>${esc(d.recipientFirstName)} ${esc(d.recipientLastName)}</strong> à l'adresse <strong>${esc(d.recipientEmail)}</strong>`
                : `pour <strong>${esc(d.recipientFirstName)} ${esc(d.recipientLastName)}</strong> et sera expédié par courrier sous 2-3 jours ouvrés`}.
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
                    <td style="font-family:Arial,sans-serif;font-size:14px;color:${C.text};text-align:right;padding:4px 0;">${esc(d.recipientFirstName)} ${esc(d.recipientLastName)}</td>
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
                    <td style="font-family:Arial,sans-serif;font-size:16px;font-weight:700;color:${C.primaryDark};text-align:right;letter-spacing:2px;padding:4px 0;">${esc(d.giftCardCode)}</td>
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
  const serviceDisplay = esc(
    d.hairLengthLabel ? `${d.serviceName} — ${d.hairLengthLabel}` : d.serviceName
  )
  const fromName = esc(d.senderName || `${d.buyerFirstName} ${d.buyerLastName}`)

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
              Bonjour <strong>${esc(d.recipientFirstName)}</strong>,
            </p>
            <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:${C.textMuted};">
              <strong>${fromName}</strong> vous a offert un bon cadeau chez Kalm Headspa !
            </p>

            ${d.personalMessage ? `
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.border};border-radius:12px;margin-bottom:28px;">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.textMuted};">Message</p>
                <p style="margin:0;font-family:Georgia,serif;font-size:16px;line-height:1.7;color:${C.text};font-style:italic;">&ldquo;${esc(d.personalMessage)}&rdquo;</p>
              </td></tr>
            </table>
            ` : ''}

            <!-- Bon cadeau visuel -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,${C.primaryLight} 0%,#f9f0ea 100%);border:2px solid ${C.primary};border-radius:16px;margin-bottom:32px;">
              <tr><td style="padding:32px;text-align:center;">
                <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${C.primary};">Bon cadeau</p>
                <p style="margin:0 0 ${(d.extras ?? []).length ? '8' : '16'}px;font-family:Georgia,serif;font-size:22px;color:${C.text};font-weight:bold;">${serviceDisplay}</p>
                ${(d.extras ?? []).length ? `<p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:13px;color:${C.textMuted};">+ ${(d.extras ?? []).map(e => esc(e.name)).join(' · ')}</p>` : ''}
                <p style="margin:0 0 20px;font-family:Georgia,serif;font-size:40px;font-weight:bold;color:${C.primary};">${d.giftAmount}&nbsp;€</p>
                <div style="display:inline-block;background-color:${C.primaryDark};color:#ffffff;font-family:Arial,sans-serif;font-size:20px;font-weight:700;letter-spacing:4px;padding:12px 28px;border-radius:8px;">
                  ${esc(d.giftCardCode)}
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
  const serviceDisplay = esc(
    d.hairLengthLabel ? `${d.serviceName} — ${d.hairLengthLabel}` : d.serviceName
  )

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
                  <tr><td style="font-size:13px;color:${C.textMuted};width:35%;padding:3px 0;">Nom</td><td style="font-size:14px;font-weight:600;color:${C.text};">${esc(d.buyerFirstName)} ${esc(d.buyerLastName)}</td></tr>
                  <tr><td style="font-size:13px;color:${C.textMuted};padding:3px 0;">Email</td><td style="font-size:14px;color:${C.text};"><a href="mailto:${esc(d.buyerEmail)}" style="color:${C.primary};text-decoration:none;">${esc(d.buyerEmail)}</a></td></tr>
                  ${d.buyerPhone ? `<tr><td style="font-size:13px;color:${C.textMuted};padding:3px 0;">Tél.</td><td style="font-size:14px;color:${C.text};">${esc(d.buyerPhone)}</td></tr>` : ''}
                </table>
              </td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.bg};border-radius:10px;margin-bottom:20px;">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 14px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.textMuted};">Destinataire</p>
                <table width="100%" cellpadding="0" cellspacing="6">
                  <tr><td style="font-size:13px;color:${C.textMuted};width:35%;padding:3px 0;">Nom</td><td style="font-size:14px;font-weight:600;color:${C.text};">${esc(d.recipientFirstName)} ${esc(d.recipientLastName)}</td></tr>
                  <tr><td style="font-size:13px;color:${C.textMuted};padding:3px 0;">Email</td><td style="font-size:14px;color:${C.text};"><a href="mailto:${esc(d.recipientEmail)}" style="color:${C.primary};text-decoration:none;">${esc(d.recipientEmail)}</a></td></tr>
                </table>
              </td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.primaryLight};border-radius:10px;margin-bottom:20px;">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 14px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.primary};">Bon cadeau</p>
                <table width="100%" cellpadding="0" cellspacing="6">
                  <tr><td style="font-size:13px;color:${C.textMuted};width:35%;padding:3px 0;">Prestation</td><td style="font-size:14px;font-weight:700;color:${C.text};">${serviceDisplay}</td></tr>
                  ${(d.extras ?? []).map(e => `<tr><td style="font-size:13px;color:${C.textMuted};padding:3px 0;">+ ${esc(e.name)}</td><td style="font-size:13px;color:${C.textMuted};">+${Number(e.price).toFixed(2)} €</td></tr>`).join('')}
                  <tr><td style="font-size:13px;color:${C.textMuted};padding:3px 0;">Montant du bon</td><td style="font-size:16px;font-weight:700;color:${C.primary};">${d.giftAmount} €</td></tr>
                  ${d.deliveryFee > 0 ? `<tr><td style="font-size:13px;color:${C.textMuted};padding:3px 0;">Frais de livraison</td><td style="font-size:14px;color:${C.text};">${d.deliveryFee} €</td></tr>` : ''}
                  <tr><td style="font-size:13px;color:${C.textMuted};padding:3px 0;">Total encaissé</td><td style="font-size:16px;font-weight:700;color:${C.primaryDark};">${d.totalAmount} €</td></tr>
                  <tr><td style="font-size:13px;color:${C.textMuted};padding:3px 0;">Code</td><td style="font-size:16px;font-weight:700;color:${C.primaryDark};letter-spacing:2px;">${esc(d.giftCardCode)}</td></tr>
                  <tr><td style="font-size:13px;color:${C.textMuted};padding:3px 0;">Livraison</td><td style="font-size:14px;color:${C.text};">${d.deliveryMethod === 'digital' ? 'Numérique (email)' : 'Courrier postal'}</td></tr>
                </table>
              </td></tr>
            </table>
            ${d.deliveryMethod === 'physical' && d.shippingAddress ? `
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fff8f3;border:2px solid ${C.primary};border-radius:10px;margin-bottom:20px;">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 14px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.primary};">📮 Adresse d'expédition</p>
                <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:${C.text};">${esc(d.shippingTo === 'buyer' ? `${d.buyerFirstName} ${d.buyerLastName}` : `${d.recipientFirstName} ${d.recipientLastName}`)}</p>
                <p style="margin:0;font-size:14px;color:${C.text};line-height:1.6;">
                  ${esc(d.shippingAddress.street)}<br/>
                  ${esc(d.shippingAddress.postalCode)} ${esc(d.shippingAddress.city)}<br/>
                  ${esc(d.shippingAddress.country)}
                </p>
                <p style="margin:12px 0 0;font-size:12px;color:${C.textMuted};font-style:italic;">${d.shippingTo === 'buyer' ? "À remettre en main propre par l'acheteur." : 'À expédier directement au destinataire.'} Le chèque cadeau à imprimer est joint en PDF.</p>
              </td></tr>
            </table>
            ` : ''}
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

  const isPhysical = data.deliveryMethod === 'physical'

  // Envoi des emails de façon indépendante — chaque envoi est isolé
  // pour qu'une erreur sur l'un ne bloque pas les autres.

  // 1. Email acheteur (toujours)
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

  // 2. Email destinataire — UNIQUEMENT en livraison numérique.
  //    En livraison papier, le destinataire reçoit la carte par courrier :
  //    on n'envoie pas le bon par email pour ne pas gâcher la surprise.
  if (!isPhysical && data.recipientEmail) {
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
  } else {
    console.log('[sendGiftCardEmails] recipient SKIPPED (livraison papier ou email absent)')
  }

  // 3. Email salon (toujours) — en livraison papier, on joint le PDF à imprimer.
  try {
    const res = await client.emails.send({
      from: FROM_LABEL,
      to: SALON_EMAIL,
      subject: isPhysical
        ? `[Bon cadeau À EXPÉDIER] ${data.buyerFirstName} ${data.buyerLastName} — ${data.giftAmount}€ · ${data.giftCardCode}`
        : `[Bon cadeau] ${data.buyerFirstName} ${data.buyerLastName} — ${data.giftAmount}€ · ${data.giftCardCode}`,
      html: buildGiftCardSalonHtml(data),
      ...(isPhysical && pdfAttachment ? { attachments: [pdfAttachment] } : {}),
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
    sendToClient: data.sendToClient !== false,
  })

  const sends: Array<{ label: string; to: string; subject: string; html: string }> = []

  // Email client (optionnel si sendToClient = false)
  if (data.sendToClient !== false) {
    sends.push({
      label: 'client',
      to: data.clientEmail,
      subject: `Réservation confirmée — ${serviceDisplay} · ${dateStr}`,
      html: buildClientHtml(data)
    })
  }

  // Email salon (toujours envoyé)
  sends.push({
    label: 'salon',
    to: SALON_EMAIL,
    subject: `[Nouvelle résa] ${data.clientName} — ${serviceDisplay} · ${dateStr}`,
    html: buildSalonHtml(data)
  })

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
