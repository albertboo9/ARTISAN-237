import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Artisan237 | Marketplace',
    template: '%s | Artisan237',
  },
  description:
    'Artisan237 - Trouvez les meilleurs artisans à Douala. Services qualifiés, notation vérifiée, réservation en ligne.',
  keywords: [
    'artisans Douala',
    'marketplace artisanale Cameroun',
    'services à domicile Douala',
    'électricien Douala',
    'plombier Douala',
    'menuisier Douala',
  ],
  openGraph: {
    title: 'Artisan237',
    description: 'La marketplace intelligente des artisans à Douala, Cameroun',
    url: 'https://artisan237.com',
    siteName: 'Artisan237',
    locale: 'fr_CM',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};