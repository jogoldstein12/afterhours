import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs/config';

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
        // Rosters no longer travel in this URL, but legacy links still carry
        // them and are honoured for one read. Sending one to another origin as
        // a Referer would leak the roster, so this route sends no referrer.
        source: '/game',
        headers: [{ key: 'Referrer-Policy', value: 'no-referrer' }],
      },
    ];
  },
};

/**
 * Source map upload — and deliberately nothing else.
 *
 * Without this, a Sentry stack trace is minified gibberish: `a.b is not a
 * function` at `chunk-4bd1b696.js:1:48213`. The plugin uploads the maps at
 * build time and matches them to events by debug id, so traces resolve back to
 * real files and line numbers.
 *
 * What it is NOT allowed to do is change how the app is built or served. The
 * SDK stays behind the dynamic import in `src/lib/monitoring.ts` — eager
 * initialisation would put ~148 KB gzipped into a first load that is currently
 * 148 KB in total — and no server, middleware or tunnel instrumentation is
 * added, because there is no server here and a tunnel route would be the app's
 * only non-static route. Every option below is off for that reason.
 *
 * The wrap only happens when all three credentials are present, so a local
 * build, a CI build and a contributor's checkout produce exactly the output
 * they did before this existed. `SENTRY_AUTH_TOKEN` is a real secret, unlike
 * the DSN — it belongs in Secret Manager, never in `apphosting.yaml`.
 */
const sentryBuild = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
};

const canUploadSourceMaps = Boolean(sentryBuild.org && sentryBuild.project && sentryBuild.authToken);

if (canUploadSourceMaps) {
  // The plugin warns that no `instrumentation.ts` exists, which is true and
  // deliberate: the server is never instrumented here (see above). Suppressing
  // it keeps the build log honest — a warning that fires on every single build
  // is one nobody reads.
  process.env.SENTRY_SUPPRESS_INSTRUMENTATION_FILE_WARNING = '1';
}

export default canUploadSourceMaps
  ? withSentryConfig(nextConfig, {
      ...sentryBuild,
      silent: true,
      telemetry: false,
      // This app's code lives in shared chunks rather than per-page bundles, so
      // the narrower default upload would miss most of it.
      widenClientFileUpload: true,
      sourcemaps: {
        // Maps go to Sentry and are then removed from the build output. The
        // client build uses `hidden-source-map`, so nothing links to them and
        // nothing serves them.
        deleteSourcemapsAfterUpload: true,
      },
      webpack: {
        // Monitoring here is browser-only. Instrumenting the server, middleware
        // and app directory would inject code with nothing to report.
        autoInstrumentServerFunctions: false,
        autoInstrumentMiddleware: false,
        autoInstrumentAppDirectory: false,
        automaticVercelMonitors: false,
        treeshake: {
          // Both drop code this app never reaches: `monitoring.ts` initialises
          // with `tracesSampleRate: 0` and no debug flag, so tracing and the
          // SDK's own logging are dead weight in the chunk the browser fetches.
          removeDebugLogging: true,
          removeTracing: true,
        },
      },
      // A release must never be blocked because Sentry is unreachable or a
      // token has expired. Say so loudly in the build log and ship anyway,
      // with minified traces, rather than failing the deploy.
      errorHandler: (error) => {
        console.warn(
          '[sentry] source map upload failed; the build continues and traces will be minified.\n',
          error.message,
        );
      },
    })
  : nextConfig;
