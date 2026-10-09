import { api } from './client';
import type {
  EstadoSello,
  ListadoSolicitudes,
  RevisarSello,
  SolicitarSello,
  SolicitudSello,
} from '@/types/sello';

export const selloApi = {
  listar: (estado: EstadoSello) => api.get<ListadoSolicitudes>(`/api/admin/sello?estado=${estado}`),
  revisar: (id: number, datos: RevisarSello) =>
    api.patch<SolicitudSello>(`/api/admin/sello/${id}`, datos),
  solicitar: (idEmpresa: number, datos: SolicitarSello) =>
    api.post<SolicitudSello>(`/api/empresas/${idEmpresa}/sello/solicitar`, datos),
};
