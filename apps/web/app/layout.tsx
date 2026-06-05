import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: {
    default: 'Artisan237 | Marketplace Artisanale Intelligente',
    template: '%s | Artisan237',
  },
  description:
    'La marketplace intelligente des artisans à Douala, Cameroun. Trouvez le meilleur artisan près de chez vous, en toute confiance.',
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#006c49',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}