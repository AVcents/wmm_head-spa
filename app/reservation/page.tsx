import { fetchServices } from '@/lib/get-data'
import ReservationContent from '@/components/reservation/reservation-content'

export const revalidate = 60

export const metadata = {
  title: 'Réserver | Kalm Headspa',
  description:
    'Réservez votre soin Head Spa en ligne. Choisissez votre prestation, votre créneau et confirmez en quelques clics.',
}

interface Props {
  searchParams: Promise<{ service?: string; variant?: string }>
}

export default async function ReservationPage({ searchParams }: Props) {
  const services = await fetchServices()
  const params = await searchParams

  return (
    <ReservationContent
      services={services}
      {...(params.service !== undefined ? { preselectedServiceId: params.service } : {})}
      {...(params.variant !== undefined ? { preselectedVariantId: params.variant } : {})}
    />
  )
}
