import { useCallback, useEffect, useState } from 'react';
import { healthApi } from '@/services/api';

export type HealthState = 'idle' | 'checking' | 'online' | 'offline';

export function useHealthCheck() {
  const [state, setState] = useState<HealthState>('idle');
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(async () => {
    setState('checking');
    try {
      await healthApi.check();
      setState('online');
      setError(null);
    } catch (caught) {
      setState('offline');
      setError(caught instanceof Error ? caught.message : 'Error desconocido');
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  return { state, error, retry: check };
}
