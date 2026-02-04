import type { Metadata } from 'next'
import { Geist, Geist_Mono, Cormorant } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const cormorant = Cormorant({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'Kalm Headspa - Restaurez votre équilibre',
    template: '%s | Kalm Headspa',
  },
  description:
    'Découvrez le Head Spa, une tradition asiatique de bien-être. Soins capillaires et relaxation profonde à Vecoux (88).',
  keywords: [
    'head spa',
    'spa capillaire',
    'massage crânien',
    'bien-être',
    'relaxation',
    'Vosges',
    'Vecoux',
  ],
  authors: [{ name: 'Kalm Headspa' }],
  creator: 'Kalm Headspa',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://kalm-headspa.fr',
    siteName: 'Kalm Headspa',
    title: 'Kalm Headspa - Restaurez votre équilibre',
    description:
      'Découvrez le Head Spa, une tradition asiatique de bien-être. Soins capillaires et relaxation profonde.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} font-sans antialiased`}
      >
        <ThemeProvider defaultTheme="light" storageKey="kalm-headspa-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
