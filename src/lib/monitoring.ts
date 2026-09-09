/**
 * Client-side error reporting, off by default.
 *
 * Set `NEXT_PUBLIC_SENTRY_DSN` in the environment to turn it on. With no DSN
 * the SDK is never imported, never initialised, and never contacts anything —
 * the dynamic import below means it does not even reach the main bundle — so
 * this is safe to ship before an account exists.
 *
 * Player names travel in the game URL, so every payload is scrubbed of query
 * strings before it leaves the browser (see `scrubUrl`). That keeps crash
 * reports free of the roster, which is what the privacy policy promises.
 */
const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

type SentryModule = typeof import('@sentry/nextjs');

let sentry: SentryModule | null = null;
let loading: Promise<SentryModule | null> | null = null;

/** Drop everything after `?` or `#` — that is where the player names live. */
const scrubUrl = (url: string): string => url.split(/[?#]/)[0];

const load = (): Promise<SentryModule | null> => {
  if (!DSN) return Promise.resolve(null);
  if (loading) return loading;

  loading = import('@sentry/nextjs')
    .then((mod) => {
      mod.init({
        dsn: DSN,
        environment: process.env.NODE_ENV,
        // Crash reporting only: no performance traces, no session replay, and
        // no automatic PII collection.
        tracesSampleRate: 0,
        sendDefaultPii: false,
        beforeSend(event) {
          if (event.request?.url) event.request.url = scrubUrl(event.request.url);
          if (event.request?.query_string) delete event.request.query_string;
          if (event.breadcrumbs) {
            event.breadcrumbs = event.breadcrumbs.map((crumb) =>
              typeof crumb.data?.url === 'string'
                ? { ...crumb, data: { ...crumb.data, url: scrubUrl(crumb.data.url) } }
                : crumb,
            );
          }
          return event;
        },
      });
      sentry = mod;
      return mod;
    })
    .catch(() => null);

  return loading;
};

/** Call once on the client. No-op without a DSN. */
export function initMonitoring(): void {
  void load();
}

/** Report a caught error. Safe to call whether or not monitoring is enabled. */
export function reportError(error: unknown): void {
  if (!DSN) {
    if (process.env.NODE_ENV === 'development') console.error('[monitoring]', error);
    return;
  }
  if (sentry) {
    sentry.captureException(error);
    return;
  }
  void load().then((mod) => mod?.captureException(error));
}
