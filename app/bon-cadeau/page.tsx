import { Header } from '@/components/shared/header'
import { Footer } from '@/components/shared/footer'
import { BonCadeauPageContent } from '@/components/bon-cadeau/bon-cadeau-page'
import { fetchServices } from '@/lib/get-data'

export const revalidate = 60

export default async function BonCadeauPage() {
  const services = await fetchServices()

  return (
    <>
      <Header />
      <BonCadeauPageContent services={services} />
      <Footer />
    </>
  )
}
