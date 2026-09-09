"use client";

import { useEffect } from 'react';
import { initMonitoring } from '@/lib/monitoring';

/** Boots error reporting on the client. Renders nothing; no-op without a DSN. */
export function MonitoringInit() {
  useEffect(() => {
    initMonitoring();
  }, []);
  return null;
}
