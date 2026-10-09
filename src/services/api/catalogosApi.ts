import { api } from './client';
import type { TipoAjusteCatalogo } from '@/types/vacantes';

export const catalogosApi = {
  tiposAjuste: () => api.get<TipoAjusteCatalogo[]>('/api/tipos-ajuste'),
};
