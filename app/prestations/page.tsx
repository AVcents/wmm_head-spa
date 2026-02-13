import { fetchServices } from '@/lib/get-data'
import { PrestationsContent } from '@/components/prestations/prestations-content'

export const revalidate = 60 // Revalidate every 60 seconds

export default async function PrestationsPage() {
  const services = await fetchServices()

  return <PrestationsContent services={services} />
}
