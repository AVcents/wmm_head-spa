// ============================================
// Génération du chèque cadeau PDF — Kalm Headspa
// ============================================
//
// Template sans champs AcroForm — dessin direct sur la page.
// Page 1 : recto (1077 x 530 pt)
// Page 2 : verso Terms & Conditions
//
// Positions calibrées sur le template Illustrator :
//   Nom destinataire : x=600, y=200  (GreatVibes, blanc)
//   Service          : x=550, y=80   (Helvetica, blanc)
//   Code bon cadeau  : x=850, y=80   (Helvetica Bold, blanc)

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import fs from 'fs'
import path from 'path'

export interface GiftCardPDFData {
  recipientName?: string | undefined    // "Prénom Nom"
  serviceName?: string | undefined      // ex: "Headspa Japonais"
  giftCardCode?: string | undefined     // ex: "KH-RXQ156"
}

export async function generateGiftCardPDF(data: GiftCardPDFData): Promise<Uint8Array> {
  const templatePath = path.join(process.cwd(), 'public', 'templates', 'gift-card-template.pdf')
  const templateBytes = fs.readFileSync(templatePath)

  const pdfDoc = await PDFDocument.load(templateBytes)

  // Fonts standard — GreatVibes abandonnée (kerning fontkit défaillant sur script OpenType)
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const pages = pdfDoc.getPages()
  const page = pages[0]
  if (!page) throw new Error('[generateGiftCardPDF] Template PDF sans page')

  // --- Nom destinataire (Helvetica Bold, blanc, dans le bandeau) ---
  if (data.recipientName) {
    page.drawText(data.recipientName, {
      x: 600,
      y: 175,
      size: 22,
      font: helveticaBold,
      color: rgb(1, 1, 1),
    })
  }

  // --- Service sélectionné (Helvetica, blanc) ---
  if (data.serviceName) {
    page.drawText(data.serviceName, {
      x: 550,
      y: 80,
      size: 12,
      font: helvetica,
      color: rgb(1, 1, 1),
      maxWidth: 270,
    })
  }

  // --- Code du bon (Helvetica Bold, blanc, espacé) ---
  if (data.giftCardCode) {
    page.drawText(data.giftCardCode, {
      x: 850,
      y: 80,
      size: 14,
      font: helveticaBold,
      color: rgb(1, 1, 1),
      wordBreaks: [],
    })
  }

  return pdfDoc.save()
}
