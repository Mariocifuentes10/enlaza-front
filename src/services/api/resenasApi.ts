import { api } from './client';
import type { ListadoResenas, Resena, ResenaCrear } from '@/types/resenas';

export const resenasApi = {
  listar: (idEmpresa: number) => api.get<ListadoResenas>(`/api/empresas/${idEmpresa}/resenas`),
  crear: (idEmpresa: number, datos: ResenaCrear) =>
    api.post<Resena>(`/api/empresas/${idEmpresa}/resenas`, datos),
};
