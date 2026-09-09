import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';

// Sentry's browser SDK beacons to an ingest subdomain derived from the DSN.
// Allowed unconditionally so the CSP does not have to change when a DSN is
// added to the environment; with no DSN the SDK never initialises and the
// origin is simply never contacted.
const SENTRY_INGEST = 'https://*.ingest.sentry.io https://*.ingest.us.sentry.io';

/**
 * The app loads no third-party scripts, styles, fonts, or images — everything
 * is self-hosted (fonts via next/font, icons as inline SVG) — so the policy can
 * be tight almost everywhere.
 *
 * `script-src` is the exception: the App Router injects inline bootstrap and
 * flight-data scripts on every page. Nonces would require rendering every route
 * dynamically, which would give up the static prerendering the whole app relies
 * on, so `'unsafe-inline'` stays until there is a server that needs to be
 * dynamic anyway. It still pins scripts to this origin, which is the property
 * that matters most here.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${SENTRY_INGEST}`,
  "manifest-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  // Two years, subdomains included, preload-eligible.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // frame-ancestors above is the modern control; this covers older browsers.
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: [
      'accelerometer=()',
      'camera=()',
      'geolocation=()',
      'gyroscope=()',
      'magnetometer=()',
      'microphone=()',
      'payment=()',
      'usb=()',
      // The game screen genuinely uses these two.
      'screen-wake-lock=(self)',
      'fullscreen=(self)',
    ].join(', '),
  },
];

const nextConfig: NextConfig = {
  // Don't advertise the framework version to scanners.
  poweredByHeader: false,
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        // The play URL carries every player's name in its query string. Sending
        // that to any other origin as a Referer would leak the roster, so this
        // route sends no referrer at all.
        source: '/game',
        headers: [{ key: 'Referrer-Policy', value: 'no-referrer' }],
      },
    ];
  },
};

export default nextConfig;
