import { Header } from '@/components/shared/header'
import { Footer } from '@/components/shared/footer'
import { Hero } from '@/components/marketing/hero'
import { Benefits } from '@/components/marketing/benefits'
import { ServicesPreview } from '@/components/marketing/services-preview'
import { GoogleReviews } from '@/components/marketing/google-reviews'
import { CTASection } from '@/components/marketing/cta-section'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Benefits />
        <ServicesPreview />
        <GoogleReviews />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
