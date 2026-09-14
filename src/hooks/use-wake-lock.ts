import { useEffect } from 'react';

/**
 * Keep the screen awake during play. Pass-the-phone games have long gaps
 * between touches, and the phone sleeping mid-card kills the momentum. The lock
 * is re-requested when the tab becomes visible again (the browser drops it when
 * the page is hidden), and released on unmount. A browser without the API, or
 * one that refuses the request, is a no-op.
 */
export function useWakeLock() {
  useEffect(() => {
    if (!('wakeLock' in navigator)) return;
    let sentinel: WakeLockSentinel | null = null;
    const request = async () => {
      try {
        sentinel = await navigator.wakeLock.request('screen');
      } catch {
        sentinel = null;
      }
    };
    request();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') request();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      sentinel?.release().catch(() => {});
    };
  }, []);
}
