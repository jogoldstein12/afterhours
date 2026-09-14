import { useEffect, useRef, type MutableRefObject, type PointerEvent as ReactPointerEvent } from 'react';

// Swipe left deals the next card, swipe right steps back (undo). A gesture
// commits if it either travels past SWIPE_THRESHOLD or is a quick flick past
// FLICK_VELOCITY — so a short, fast flick works as well as a long drag.
const SWIPE_THRESHOLD = 56;
const FLICK_VELOCITY = 0.35; // px per ms

type SwipeOptions = {
  /**
   * The "a card is flying off" flag, owned by the caller so the thumb-dock
   * buttons can guard on it too: a tap on the dock during the ~150 ms fly would
   * otherwise fire the same action a second time. Set true for the fly and
   * cleared just before the action runs.
   */
  busyRef: MutableRefObject<boolean>;
  onNext: () => void;
  onBack: () => void;
  /** Whether there is history to step back to (right-swipe is inert otherwise). */
  canBack: boolean;
  /** Whether a swipe may begin at all (a live card is showing). */
  canStart: boolean;
};

/**
 * The card's drag-to-deal gesture. The transform is written straight to the DOM
 * during the drag (no React re-render per pointer move) so it stays smooth on a
 * phone; the peek card behind it rises as the live card is pulled away. On
 * commit the card flies off, and after the fly the caller's `onNext`/`onBack`
 * runs. Button parity lives in the dock, which calls the same callbacks.
 */
export function useSwipeCard(options: SwipeOptions) {
  const cardRef = useRef<HTMLDivElement>(null);
  const peekRef = useRef<HTMLDivElement>(null);
  const gesture = useRef({ x: 0, y: 0, t: 0, active: false, tracking: false });
  const flyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Keep the latest callbacks/flags for the deferred fly timeout, which is
  // scheduled inside a stale render's closure.
  const opts = useRef(options);
  opts.current = options;

  const paintDrag = (dx: number) => {
    const card = cardRef.current;
    if (card) card.style.transform = `translateX(${dx}px) rotate(${dx * 0.02}deg)`;
    const peek = peekRef.current;
    if (peek) {
      const p = Math.min(1, Math.abs(dx) / SWIPE_THRESHOLD);
      peek.style.opacity = String(0.2 + 0.55 * p);
      peek.style.transform = `scale(${0.93 + 0.07 * p})`;
    }
  };

  const settleCard = (animate: boolean) => {
    const card = cardRef.current;
    if (card) {
      card.style.transition = animate ? 'transform 0.2s ease-out' : 'none';
      card.style.transform = 'translateX(0px) rotate(0deg)';
    }
    const peek = peekRef.current;
    if (peek) {
      peek.style.transition = animate ? 'opacity 0.2s ease-out, transform 0.2s ease-out' : 'none';
      peek.style.opacity = '0';
      peek.style.transform = 'scale(0.93)';
    }
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    if (!opts.current.canStart || opts.current.busyRef.current) return;
    gesture.current = { x: e.clientX, y: e.clientY, t: e.timeStamp, active: true, tracking: false };
    const card = cardRef.current;
    if (card) card.style.transition = 'none';
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const s = gesture.current;
    if (!s.active || opts.current.busyRef.current) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (!s.tracking) {
      // Decide intent once: horizontal → swipe; vertical → let the card scroll.
      if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
        s.tracking = true;
        try {
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        } catch {}
      } else if (Math.abs(dy) > 8) {
        s.active = false;
        return;
      } else {
        return;
      }
    }
    paintDrag(dx);
  };

  const endDrag = (e: ReactPointerEvent) => {
    const s = gesture.current;
    if (!s.active) return;
    if (!s.tracking) {
      s.active = false;
      return;
    }
    const dx = e.clientX - s.x;
    const dt = Math.max(1, e.timeStamp - s.t);
    const v = dx / dt; // signed px/ms
    s.active = false;

    const goNext = dx < -SWIPE_THRESHOLD || v < -FLICK_VELOCITY;
    const goBack = dx > SWIPE_THRESHOLD || v > FLICK_VELOCITY;

    if (goNext && !goBack) {
      opts.current.busyRef.current = true;
      const card = cardRef.current;
      if (card) {
        card.style.transition = 'transform 0.16s ease-out';
        card.style.transform = 'translateX(-115%) rotate(-6deg)';
      }
      // Clear busy before the action so its own busy guard lets it through;
      // taps during the fly are what busy is there to block.
      flyTimeout.current = setTimeout(() => {
        opts.current.busyRef.current = false;
        opts.current.onNext();
        settleCard(false);
      }, 150);
    } else if (goBack && opts.current.canBack) {
      opts.current.busyRef.current = true;
      const card = cardRef.current;
      if (card) {
        card.style.transition = 'transform 0.16s ease-out';
        card.style.transform = 'translateX(115%) rotate(6deg)';
      }
      flyTimeout.current = setTimeout(() => {
        opts.current.busyRef.current = false;
        opts.current.onBack();
        settleCard(false);
      }, 150);
    } else {
      settleCard(true);
    }
  };

  useEffect(() => () => {
    if (flyTimeout.current) clearTimeout(flyTimeout.current);
  }, []);

  return { cardRef, peekRef, onPointerDown, onPointerMove, endDrag };
}
