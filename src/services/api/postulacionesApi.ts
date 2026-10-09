import { api } from './client';
import type {
  FiltrosPostulaciones,
  ListadoPostulaciones,
  ListadoPostulacionesRecibidas,
  EstadoDecisionEmpresa,
  Postulacion,
} from '@/types/postulaciones';

function construirQuery(filtros: FiltrosPostulaciones): string {
  const params = new URLSearchParams();
  if (filtros.estado) params.set('estado', filtros.estado);
  params.set('page', String(filtros.page ?? 1));
  params.set('limit', String(filtros.limit ?? 20));
  return params.toString();
}

export const postulacionesApi = {
  crear: (idVacante: number) =>
    api.post<Postulacion>('/api/postulaciones', { id_vacante: idVacante }),
  listarDeCandidato: (idCandidato: number, filtros: FiltrosPostulaciones = {}) =>
    api.get<ListadoPostulaciones>(
      `/api/candidatos/${idCandidato}/postulaciones?${construirQuery(filtros)}`,
    ),
  listarRecibidas: (idEmpresa: number, filtros: FiltrosPostulaciones = {}) =>
    api.get<ListadoPostulacionesRecibidas>(
      `/api/empresas/${idEmpresa}/postulaciones-recibidas?${construirQuery(filtros)}`,
    ),
  cambiarEstado: (idPostulacion: number, estado: EstadoDecisionEmpresa) =>
    api.patch<Postulacion>(`/api/postulaciones/${idPostulacion}/estado`, { estado }),
};
