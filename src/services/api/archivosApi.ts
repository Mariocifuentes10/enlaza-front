import { api } from './client';
import type { ArchivoSubido } from '@/types/perfil';

export type TipoArchivo = 'cv' | 'logo';

export const archivosApi = {
  subir: (archivo: File, tipo: TipoArchivo) => {
    const datos = new FormData();
    datos.append('archivo', archivo);
    return api.post<ArchivoSubido>(`/api/archivos/${tipo}`, datos);
  },
};
