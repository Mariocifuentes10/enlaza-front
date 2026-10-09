import { api } from './client';
import type {
  EstadisticasAdmin,
  FiltrosEmpresasAdmin,
  FiltrosUsuariosAdmin,
  ListadoEmpresasAdmin,
  ListadoUsuariosAdmin,
  UsuarioAdmin,
} from '@/types/admin';

function construirQuery(filtros: Record<string, string | number | undefined>): string {
  const parametros = new URLSearchParams();
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor !== undefined && valor !== '') {
      parametros.set(clave, String(valor));
    }
  }
  const cadena = parametros.toString();
  return cadena ? `?${cadena}` : '';
}

export const adminApi = {
  estadisticas: () => api.get<EstadisticasAdmin>('/api/admin/estadisticas'),
  usuarios: (filtros: FiltrosUsuariosAdmin = {}) =>
    api.get<ListadoUsuariosAdmin>(`/api/admin/usuarios${construirQuery({ ...filtros })}`),
  actualizarUsuario: (id: number, datos: { activo?: boolean }) =>
    api.patch<UsuarioAdmin>(`/api/admin/usuarios/${id}`, datos),
  empresas: (filtros: FiltrosEmpresasAdmin = {}) =>
    api.get<ListadoEmpresasAdmin>(`/api/admin/empresas${construirQuery({ ...filtros })}`),
};
