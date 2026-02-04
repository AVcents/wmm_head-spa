import { Header } from '@/components/shared/header'
import { Footer } from '@/components/shared/footer'
import { GiftCardWizard } from '@/components/gift-card/gift-card-wizard'

export default function CommanderBonCadeauPage() {
  return (
    <>
      <Header />
      <main>
        <GiftCardWizard />
      </main>
      <Footer />
    </>
  )
}
