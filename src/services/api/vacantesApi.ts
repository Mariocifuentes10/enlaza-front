import { api } from './client';
import type {
  AlertaLenguaje,
  AjusteSugeridoIA,
  FiltrosBusqueda,
  ListadoVacantes,
  Vacante,
  VacanteCrear,
} from '@/types/vacantes';

function construirQuery(filtros: FiltrosBusqueda): string {
  const params = new URLSearchParams();
  if (filtros.texto?.trim()) params.set('texto', filtros.texto.trim());
  if (filtros.ubicacion?.trim()) params.set('ubicacion', filtros.ubicacion.trim());
  if (filtros.modalidad) params.set('modalidad', filtros.modalidad);
  params.set('page', String(filtros.page ?? 1));
  params.set('limit', String(filtros.limit ?? 10));
  return params.toString();
}

export const vacantesApi = {
  buscar: (filtros: FiltrosBusqueda) =>
    api.get<ListadoVacantes>(`/api/vacantes/buscar?${construirQuery(filtros)}`),
  obtener: (id: number) => api.get<Vacante>(`/api/vacantes/${id}`),
  crear: (datos: VacanteCrear) => api.post<Vacante>('/api/vacantes', datos),
  actualizar: (id: number, datos: Partial<VacanteCrear>) =>
    api.put<Vacante>(`/api/vacantes/${id}`, datos),
  sugerirAjustes: (id: number) =>
    api.post<AjusteSugeridoIA[]>(`/api/vacantes/${id}/sugerir-ajustes`),
  alertaLenguaje: (id: number) => api.get<AlertaLenguaje>(`/api/vacantes/${id}/alerta-lenguaje`),
};
