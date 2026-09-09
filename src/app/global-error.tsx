"use client";

import { useEffect } from 'react';
import { reportError } from '@/lib/monitoring';

/**
 * Last-resort boundary: this replaces the root layout, so it cannot use any of
 * the app's fonts, tokens, or components and has to carry its own styles.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '2rem 1.25rem',
          textAlign: 'center',
          background: '#0A040F',
          color: '#FAFAFA',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
          After Hours hit a snag
        </h1>
        <p style={{ maxWidth: '24rem', fontSize: '0.875rem', color: '#A3A3A3', margin: 0 }}>
          Something went wrong loading the app. Reloading usually fixes it.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: '0.5rem',
            minHeight: 56,
            padding: '0 2rem',
            borderRadius: 16,
            border: 'none',
            background: '#BE52F2',
            color: '#fff',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
