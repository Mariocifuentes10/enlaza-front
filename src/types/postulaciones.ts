import type { AjustePerfil, HabilidadPerfil } from './perfil';
import type { EmpresaVacante, EstadoVacante, ModalidadVacante } from './vacantes';

export type EstadoPostulacion =
  'enviada' | 'en_revision' | 'entrevista' | 'rechazada' | 'contratada';

export const ESTADOS_POSTULACION: readonly EstadoPostulacion[] = [
  'enviada',
  'en_revision',
  'entrevista',
  'rechazada',
  'contratada',
];

export const ESTADOS_DECISION_EMPRESA: readonly EstadoPostulacion[] = [
  'en_revision',
  'entrevista',
  'rechazada',
  'contratada',
];

export const ETIQUETAS_ESTADO_POSTULACION: Record<EstadoPostulacion, string> = {
  enviada: 'Enviada',
  en_revision: 'En revisión',
  entrevista: 'Entrevista',
  rechazada: 'Rechazada',
  contratada: 'Contratada',
};

export const DESCRIPCION_ESTADO_POSTULACION: Record<EstadoPostulacion, string> = {
  enviada: 'Postulación enviada',
  en_revision: 'Postulación en revisión',
  entrevista: 'Empresa agendó entrevista',
  rechazada: 'Postulación rechazada',
  contratada: 'Candidatura contratada',
};

export interface VacantePostulacion {
  id_vacante: number;
  titulo: string;
  modalidad: ModalidadVacante;
  ubicacion: string | null;
  salario_min: number | null;
  salario_max: number | null;
  estado: EstadoVacante;
  empresa: EmpresaVacante;
}

export interface CandidatoPostulacion {
  id_candidato: number;
  nombre_completo: string;
  telefono: string | null;
  ubicacion: string | null;
  resumen_perfil: string | null;
  cv_url: string | null;
  visible_discapacidad: boolean;
  tipo_discapacidad: string | null;
  habilidades: HabilidadPerfil[];
  ajustes: AjustePerfil[];
}

export interface Postulacion {
  id_postulacion: number;
  id_candidato: number;
  id_vacante: number;
  estado: EstadoPostulacion;
  fecha_postulacion: string;
  puntaje_match: number | null;
  vacante: VacantePostulacion;
}

export interface PostulacionRecibida extends Postulacion {
  candidato: CandidatoPostulacion;
}

export interface ListadoPostulaciones {
  total: number;
  page: number;
  limit: number;
  data: Postulacion[];
}

export interface ListadoPostulacionesRecibidas {
  total: number;
  page: number;
  limit: number;
  data: PostulacionRecibida[];
  resumen: {
    por_estado: Record<EstadoPostulacion, number>;
  };
}

export interface FiltrosPostulaciones {
  estado?: EstadoPostulacion;
  page?: number;
  limit?: number;
}

export type EstadoDecisionEmpresa = (typeof ESTADOS_DECISION_EMPRESA)[number];
