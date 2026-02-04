export type ServiceVariant = {
  id: string
  name: string
  hairLength: 'courts' | 'mi-longs' | 'longs' | 'rases' | 'enfant' | 'body'
  hairLengthLabel: string
  duration: number // in minutes
  price: number
  description?: string
}

export type Service = {
  id: string
  name: string
  category: 'headspa-japonais' | 'headspa-holistique' | 'massage'
  description: string
  hasVariants: boolean
  // If no variants, use these
  duration?: number
  price?: number
  hairLength?: string
  // If variants, use this
  variants?: ServiceVariant[]
}

export const services: Service[] = [
  {
    id: 'serenite',
    name: 'Sérénité',
    category: 'headspa-japonais',
    description: 'Un moment de détente spécialement conçu pour les enfants',
    hasVariants: false,
    duration: 30,
    price: 24,
    hairLength: 'Enfant',
  },
  {
    id: 'paisible',
    name: 'Paisible 45 minutes',
    category: 'headspa-japonais',
    description: 'Soin relaxant du cuir chevelu pour retrouver calme et sérénité',
    hasVariants: true,
    variants: [
      {
        id: 'paisible-courts',
        name: 'Paisible 45 minutes - Courts',
        hairLength: 'courts',
        hairLengthLabel: 'Cheveux courts (au dessus d\'épaule)',
        duration: 45,
        price: 63,
      },
      {
        id: 'paisible-mi-longs',
        name: 'Paisible - Mi-Longs',
        hairLength: 'mi-longs',
        hairLengthLabel: 'Cheveux mi-longs (en dessous d\'épaule)',
        duration: 60,
        price: 70,
      },
      {
        id: 'paisible-longs',
        name: 'Paisible 45 minutes - Longs',
        hairLength: 'longs',
        hairLengthLabel: 'Cheveux longs (milieu du dos)',
        duration: 45,
        price: 80,
      },
    ],
  },
  {
    id: 'relaxante',
    name: 'Relaxante 60 minutes',
    category: 'headspa-japonais',
    description: 'Soin profond pour une relaxation complète du cuir chevelu',
    hasVariants: true,
    variants: [
      {
        id: 'relaxante-courts',
        name: 'Relaxante 60 minutes - Courts',
        hairLength: 'courts',
        hairLengthLabel: 'Cheveux courts (au dessus d\'épaule)',
        duration: 60,
        price: 78,
      },
      {
        id: 'relaxante-mi-longs',
        name: 'Relaxante 60 minutes - Mi-Longs',
        hairLength: 'mi-longs',
        hairLengthLabel: 'Cheveux mi-longs (en dessous d\'épaule)',
        duration: 45,
        price: 85,
      },
      {
        id: 'relaxante-longs',
        name: 'Relaxante 60 minutes - Longs',
        hairLength: 'longs',
        hairLengthLabel: 'Cheveux longs (milieu du dos)',
        duration: 60,
        price: 95,
      },
    ],
  },
  {
    id: 'decontractante',
    name: 'Décontractante 75 minutes',
    category: 'headspa-japonais',
    description: 'Soin intensif pour dénouer les tensions et revitaliser le cuir chevelu',
    hasVariants: true,
    variants: [
      {
        id: 'decontractante-courts',
        name: 'Décontractante 75 minutes - Courts',
        hairLength: 'courts',
        hairLengthLabel: 'Cheveux courts (au dessus d\'épaule)',
        duration: 75,
        price: 93,
      },
      {
        id: 'decontractante-mi-longs',
        name: 'Décontractante 75 minutes - Mi-Longs',
        hairLength: 'mi-longs',
        hairLengthLabel: 'Cheveux mi-longs (en dessous d\'épaule)',
        duration: 75,
        price: 100,
      },
      {
        id: 'decontractante-longs',
        name: 'Décontractante 75 minutes - Longs',
        hairLength: 'longs',
        hairLengthLabel: 'Cheveux longs (milieu du dos)',
        duration: 75,
        price: 110,
      },
    ],
  },
  {
    id: 'eclat',
    name: 'Eclat 45 minutes',
    category: 'headspa-japonais',
    description: 'Soin spécifique pour cuir chevelu chauve, rasé ou très court',
    hasVariants: false,
    duration: 45,
    price: 40,
    hairLength: 'Chauve, rasés ou très courts',
  },
  {
    id: 'revitalisant',
    name: 'Revitalisant 105 minutes',
    category: 'headspa-holistique',
    description: 'Soin premium complet pour une régénération profonde',
    hasVariants: true,
    variants: [
      {
        id: 'revitalisant-courts',
        name: 'Revitalisant 105 minutes - Courts',
        hairLength: 'courts',
        hairLengthLabel: 'Cheveux courts (au dessus d\'épaule)',
        duration: 105,
        price: 150,
      },
      {
        id: 'revitalisant-mi-longs',
        name: 'Revitalisant 105 minutes - Mi-Longs',
        hairLength: 'mi-longs',
        hairLengthLabel: 'Cheveux mi-longs (en dessous d\'épaule)',
        duration: 105,
        price: 170,
      },
      {
        id: 'revitalisant-longs',
        name: 'Revitalisant 105 minutes - Longs',
        hairLength: 'longs',
        hairLengthLabel: 'Cheveux longs (milieu du dos)',
        duration: 105,
        price: 180,
      },
    ],
  },
  {
    id: 'liberateur',
    name: 'Libérateur 60 minutes (Body)',
    category: 'massage',
    description: 'Massage complet du corps pour libérer les tensions musculaires',
    hasVariants: false,
    duration: 60,
    price: 70,
    hairLength: 'Massage corps',
  },
]

export const categories = [
  { id: 'all', name: 'Toutes les prestations', value: 'all' },
  { id: 'headspa-japonais', name: 'Head Spa Japonais', value: 'headspa-japonais' },
  { id: 'headspa-holistique', name: 'Head Spa Holistique', value: 'headspa-holistique' },
  { id: 'massage', name: 'Massage corps', value: 'massage' },
]

export const durationFilters = [
  { id: 'all', name: 'Toutes durées', value: 'all' },
  { id: '30', name: '30 min', value: 30 },
  { id: '45', name: '45 min', value: 45 },
  { id: '60', name: '60 min', value: 60 },
  { id: '75', name: '75 min', value: 75 },
  { id: '105', name: '105 min', value: 105 },
]

export const priceFilters = [
  { id: 'all', name: 'Tous les prix', value: 'all' as const },
  { id: 'under-50', name: 'Moins de 50€', value: { min: 0, max: 50 } },
  { id: '50-80', name: '50€ - 80€', value: { min: 50, max: 80 } },
  { id: '80-110', name: '80€ - 110€', value: { min: 80, max: 110 } },
  { id: 'over-110', name: 'Plus de 110€', value: { min: 110, max: Infinity } },
]
