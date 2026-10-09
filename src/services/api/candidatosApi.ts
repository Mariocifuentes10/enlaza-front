import { api } from './client';
import type { CandidatoActualizar, CandidatoPerfil } from '@/types/perfil';

export const candidatosApi = {
  obtener: (id: number) => api.get<CandidatoPerfil>(`/api/candidatos/${id}`),
  actualizar: (id: number, datos: CandidatoActualizar) =>
    api.put<CandidatoPerfil>(`/api/candidatos/${id}`, datos),
};
