import type { SelloEmpresa } from './perfil';

export interface EmpresaResumen {
  id_empresa: number;
  nombre_empresa: string;
  descripcion: string | null;
  sitio_web: string | null;
  ubicacion: string | null;
  logo_url: string | null;
  sello: SelloEmpresa | null;
}
