export type EstadoSello = 'pendiente' | 'aprobado' | 'rechazado';

export type NivelSello = 'basico' | 'intermedio' | 'avanzado';

export interface EmpresaSello {
  id_empresa: number;
  nombre_empresa: string;
  ubicacion: string | null;
  logo_url: string | null;
}

export interface SolicitudSello {
  id_sello: number;
  id_empresa: number;
  nivel: NivelSello;
  estado: EstadoSello;
  fecha_verificacion: string | null;
  verificado_por: number | null;
  evidencia_url: string | null;
  motivo_rechazo: string | null;
  empresa: EmpresaSello;
}

export interface ListadoSolicitudes {
  total: number;
  data: SolicitudSello[];
}

export interface SolicitarSello {
  nivel?: NivelSello;
  evidencia_url: string;
}

export interface RevisarSello {
  estado: 'aprobado' | 'rechazado';
  motivo_rechazo?: string;
}

export const ETIQUETAS_NIVEL_SELLO: Record<NivelSello, string> = {
  basico: 'Básico',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};
