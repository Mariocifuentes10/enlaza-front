export interface EstadisticasAdmin {
  usuarios: {
    total: number;
    candidatos: number;
    empresas: number;
    mentores: number;
    admins: number;
    activos: number;
    inactivos: number;
  };
  vacantes: {
    total: number;
    activas: number;
  };
  postulaciones: {
    total: number;
  };
  sellos: {
    pendientes: number;
    aprobados: number;
    rechazados: number;
  };
}

export type TipoUsuarioAdmin = 'candidato' | 'empresa' | 'mentor' | 'admin';

export interface UsuarioAdmin {
  id_usuario: number;
  correo: string;
  tipo_usuario: TipoUsuarioAdmin;
  activo: boolean;
  fecha_registro: string;
  nombre: string | null;
}

export interface ListadoUsuariosAdmin {
  total: number;
  page: number;
  limit: number;
  data: UsuarioAdmin[];
}

export interface EmpresaAdmin {
  id_empresa: number;
  nombre_empresa: string;
  correo: string;
  ubicacion: string | null;
  logo_url: string | null;
  fecha_creacion: string;
  sello_estado: string | null;
  sello_nivel: string | null;
  total_vacantes: number;
}

export interface ListadoEmpresasAdmin {
  total: number;
  page: number;
  limit: number;
  data: EmpresaAdmin[];
}

export interface FiltrosUsuariosAdmin {
  page?: number;
  limit?: number;
  tipo?: TipoUsuarioAdmin;
  activo?: 'true' | 'false';
  busqueda?: string;
}

export type EstadoSelloFiltroAdmin = 'pendiente' | 'aprobado' | 'rechazado' | 'sin_sello';

export interface FiltrosEmpresasAdmin {
  page?: number;
  limit?: number;
  busqueda?: string;
  sello?: EstadoSelloFiltroAdmin;
}
