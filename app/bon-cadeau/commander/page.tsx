import { Header } from '@/components/shared/header'
import { Footer } from '@/components/shared/footer'
import { GiftCardWizard } from '@/components/gift-card/gift-card-wizard'
import { fetchServices } from '@/lib/get-data'

export const revalidate = 60

export default async function CommanderBonCadeauPage() {
  const services = await fetchServices()

  return (
    <>
      <Header />
      <main>
        <GiftCardWizard services={services} />
      </main>
      <Footer />
    </>
  )
}
