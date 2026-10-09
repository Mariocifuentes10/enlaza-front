export interface HabilidadPerfil {
  id_habilidad: number;
  nombre_habilidad: string;
  categoria: string | null;
  nivel: 'basico' | 'intermedio' | 'avanzado';
}

export interface AjustePerfil {
  id_ajuste: number;
  nombre_ajuste: string;
}

export interface CandidatoPerfil {
  id_candidato: number;
  id_usuario: number;
  correo: string;
  nombre_completo: string;
  telefono: string | null;
  ubicacion: string | null;
  resumen_perfil: string | null;
  tipo_discapacidad: string | null;
  visible_discapacidad: boolean;
  cv_url: string | null;
  fecha_creacion: string;
  habilidades: HabilidadPerfil[];
  ajustes: AjustePerfil[];
}

export interface CandidatoActualizar {
  nombre_completo?: string;
  telefono?: string | null;
  ubicacion?: string | null;
  resumen_perfil?: string | null;
  tipo_discapacidad?: string | null;
  visible_discapacidad?: boolean;
  cv_url?: string | null;
}

export interface SelloEmpresa {
  id_sello: number;
  nivel: 'basico' | 'intermedio' | 'avanzado';
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  fecha_verificacion: string | null;
  evidencia_url: string | null;
  motivo_rechazo: string | null;
}

export interface EmpresaPerfil {
  id_empresa: number;
  id_usuario: number;
  correo: string;
  nombre_empresa: string;
  descripcion: string | null;
  sitio_web: string | null;
  ubicacion: string | null;
  logo_url: string | null;
  fecha_creacion: string;
  sello: SelloEmpresa | null;
}

export interface EmpresaActualizar {
  nombre_empresa?: string;
  descripcion?: string | null;
  sitio_web?: string | null;
  ubicacion?: string | null;
  logo_url?: string | null;
}

export interface ArchivoSubido {
  url: string;
  nombre: string;
  tamano: number;
}
