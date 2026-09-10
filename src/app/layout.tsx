import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { Atmosphere } from '@/components/shared/Atmosphere';
import { AgeGate } from '@/components/shared/AgeGate';
import { MonitoringInit } from '@/components/shared/MonitoringInit';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-grotesk',
});

// The canonical origin. Absolute URLs are required for OG and Twitter cards —
// a relative path renders as a broken image in every link preview — so this has
// to be right in production. Override it per environment if the domain moves.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://afterhoursgame.com';

const TITLE = 'After Hours Party Game';
const DESCRIPTION =
  'An explicit pass-the-phone party game for adults. Pick your crew, pick your intensity, and let the deck do the rest. 18+ only.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  // A party game spreads through group chats, so the link preview is the first
  // thing most people ever see of it.
  openGraph: {
    type: 'website',
    siteName: TITLE,
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: 'en_US',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'After Hours Party Game — a neon martini glass and wordmark glowing in violet and pink haze.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og.png'],
  },
  // Machine-readable adult labels. `rating` is what most parental-control
  // filters and crawlers look for; the RTA string is the long-standing
  // self-labelling standard those same filters recognise. Without them,
  // filtering software has nothing to match on but the page text.
  other: {
    rating: 'adult',
    'RATING': 'RTA-5042-1996-1400-1577-RTA',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'After Hours',
  },
};

// Paint the browser chrome (iOS/Android tabs, status bar) in the app's own
// near-black instead of the default light grey, and let the layout extend
// under the notch / home indicator so the play screen can pad its own safe areas.
export const viewport: Viewport = {
  themeColor: '#0A040F',
  viewportFit: 'cover',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Fonts are self-hosted via next/font; the manifest keeps the app installable as a home-screen bookmark. */}
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-body antialiased",
          inter.variable,
          spaceGrotesk.variable
        )}
        suppressHydrationWarning 
      >
        <MonitoringInit />
        <Atmosphere />
        <AgeGate>{children}</AgeGate>
        <Toaster />
      </body>
    </html>
  );
}
