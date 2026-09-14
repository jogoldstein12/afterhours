import { useEffect, useState } from 'react';
import { extractDurationSeconds } from '@/lib/game';
import type { Prompt } from '@/lib/prompts';

const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern);
};

/**
 * The optional per-card countdown. A timed dare's text carries its duration
 * ("30 seconds", "2 minutes"); a fresh card resets the timer to that duration,
 * stopped, and `start` runs it down to zero with a buzz at the end. Cards with
 * no duration report `total === null` and show no timer.
 */
export function useCountdownTimer(prompt: Prompt | null) {
  const total = prompt ? extractDurationSeconds(prompt.text) : null;
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [running, setRunning] = useState(false);

  // A fresh prompt resets the timer to its full duration, stopped.
  useEffect(() => {
    setRunning(false);
    setTimeLeft(prompt ? extractDurationSeconds(prompt.text) : null);
  }, [prompt]);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          setRunning(false);
          vibrate([100, 50, 100]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  const start = () => {
    setTimeLeft(total);
    setRunning(true);
  };

  return { total, timeLeft, running, start };
}
