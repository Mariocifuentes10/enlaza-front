import { api } from './client';
import type { ListadoRecomendaciones } from '@/types/recomendaciones';

export interface FiltrosRecomendaciones {
  page?: number;
  limit?: number;
}

function construirQuery(filtros: FiltrosRecomendaciones): string {
  const params = new URLSearchParams();
  params.set('page', String(filtros.page ?? 1));
  params.set('limit', String(filtros.limit ?? 20));
  return params.toString();
}

export const recomendacionesApi = {
  listarRecomendadas: (idCandidato: number, filtros: FiltrosRecomendaciones = {}) =>
    api.get<ListadoRecomendaciones>(
      `/api/candidatos/${idCandidato}/recomendaciones?${construirQuery(filtros)}`,
    ),
};
