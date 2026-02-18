// ============================================
// Génération du chèque cadeau PDF — Kalm Headspa
// ============================================
//
// Approche : suppression des annotations de formulaire (widgets AcroForm)
// + dessin du texte directement sur le flux de contenu de la page.
// Cela permet d'utiliser une couleur personnalisée (blanc) indépendamment
// de l'apparence définie dans le PDF original.
//
// Les positions sont lues dynamiquement depuis les rectangles des champs
// du PDF template — si le template change, les positions s'adaptent.

import { PDFDocument, PDFName, StandardFonts, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import fs from 'fs'
import path from 'path'

export interface GiftCardPDFData {
  personalMessage?: string | undefined
  expiryDate?: string | undefined   // ex: "18/02/2027"
}

export async function generateGiftCardPDF(data: GiftCardPDFData): Promise<Uint8Array> {
  // Charger le template PDF
  const templatePath = path.join(process.cwd(), 'public', 'templates', 'gift-card-template.pdf')
  const templateBytes = fs.readFileSync(templatePath)

  const pdfDoc = await PDFDocument.load(templateBytes)
  pdfDoc.registerFontkit(fontkit)

  // Lire les rectangles des champs depuis le PDF (positions exactes)
  const form = pdfDoc.getForm()
  const fieldRects: Record<string, { x: number; y: number; w: number; h: number }> = {}

  for (const field of form.getFields()) {
    const widgets = field.acroField.getWidgets()
    const widget = widgets[0]
    if (widget) {
      const r = widget.getRectangle()
      fieldRects[field.getName()] = { x: r.x, y: r.y, w: r.width, h: r.height }
    }
  }

  console.log('[generateGiftCardPDF] Champs détectés:', Object.keys(fieldRects))

  // Charger les fonts
  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'GreatVibes-Regular.ttf')
  const fontBytes = fs.readFileSync(fontPath)
  const greatVibes = await pdfDoc.embedFont(fontBytes)
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)

  // Récupérer la première page
  const pages = pdfDoc.getPages()
  const page = pages[0]
  if (!page) throw new Error('[generateGiftCardPDF] Le template PDF ne contient aucune page')

  // Supprimer les widgets AcroForm de la page (annotations interactives)
  // Nécessaire pour dessiner par-dessus avec la couleur souhaitée
  page.node.delete(PDFName.of('Annots'))

  // Calculer la baseline Y : centre du champ - demi-hauteur de la capitale
  function baselineY(rect: { y: number; h: number }, fontSize: number): number {
    return rect.y + (rect.h - fontSize * 0.65) / 2
  }

  // --- Champ message (GreatVibes, blanc) ---
  if (data.personalMessage) {
    const r = fieldRects['message']
    if (r) {
      const fontSize = 18
      page.drawText(data.personalMessage, {
        x: r.x + 4,
        y: baselineY(r, fontSize),
        size: fontSize,
        font: greatVibes,
        color: rgb(1, 1, 1),
        maxWidth: r.w - 8,
      })
    } else {
      console.warn('[generateGiftCardPDF] Champ "message" introuvable dans le template')
    }
  }

  // --- Champs date de validité (Helvetica, blanc) ---
  if (data.expiryDate) {
    const fontSize = 13
    for (const fieldName of ['date-validite', 'date-validite 2']) {
      const r = fieldRects[fieldName]
      if (r) {
        page.drawText(data.expiryDate, {
          x: r.x + 4,
          y: baselineY(r, fontSize),
          size: fontSize,
          font: helvetica,
          color: rgb(1, 1, 1),
        })
      } else {
        console.warn(`[generateGiftCardPDF] Champ "${fieldName}" introuvable dans le template`)
      }
    }
  }

  return pdfDoc.save()
}
