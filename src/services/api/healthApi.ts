import { api } from './client';
import type { HealthResponse } from '@/types/health';

export const healthApi = {
  check: () => api.get<HealthResponse>('/api/health'),
};
