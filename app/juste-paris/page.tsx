import { Header } from '@/components/shared/header'
import { Footer } from '@/components/shared/footer'
import { JusteParisCatalog } from '@/components/juste-paris/juste-paris-catalog'

export const metadata = {
  title: 'Juste Paris — Soins capillaires sur-mesure | Kalm Headspa',
  description:
    'Découvrez la gamme Juste Paris, des soins capillaires personnalisés aux ingrédients naturels, disponibles directement au salon Kalm Headspa.',
}

export default function JusteParisPage() {
  return (
    <>
      <Header />
      <main>
        <JusteParisCatalog />
      </main>
      <Footer />
    </>
  )
}
