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

export const metadata: Metadata = {
  title: 'After Hours Party Game',
  description: 'An explicit party game for adults. 18+ only.',
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
