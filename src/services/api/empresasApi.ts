import { api } from './client';
import type { EmpresaActualizar, EmpresaPerfil } from '@/types/perfil';
import type { EmpresaResumen } from '@/types/empresas';

export const empresasApi = {
  obtener: (id: number) => api.get<EmpresaPerfil>(`/api/empresas/${id}`),
  resumen: (id: number) => api.get<EmpresaResumen>(`/api/empresas/${id}/resumen`),
  actualizar: (id: number, datos: EmpresaActualizar) =>
    api.put<EmpresaPerfil>(`/api/empresas/${id}`, datos),
};
