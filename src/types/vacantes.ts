export type ModalidadVacante = 'presencial' | 'remoto' | 'hibrido';

export type EstadoVacante = 'activa' | 'cerrada' | 'en_revision';

export interface SelloVacante {
  nivel: 'basico' | 'intermedio' | 'avanzado';
  estado: 'pendiente' | 'aprobado' | 'rechazado';
}

export interface EmpresaVacante {
  id_empresa: number;
  nombre_empresa: string;
  logo_url: string | null;
  ubicacion: string | null;
  sello: SelloVacante | null;
}

export interface AjusteVacante {
  id_ajuste: number;
  nombre_ajuste: string;
  descripcion: string | null;
}

export interface Vacante {
  id_vacante: number;
  id_empresa: number;
  titulo: string;
  descripcion: string;
  modalidad: ModalidadVacante;
  ubicacion: string | null;
  salario_min: number | null;
  salario_max: number | null;
  fecha_publicacion: string;
  fecha_cierre: string | null;
  estado: EstadoVacante;
  alerta_lenguaje: boolean;
  ajustes: AjusteVacante[];
  empresa: EmpresaVacante;
}

export interface ListadoVacantes {
  total: number;
  page: number;
  limit: number;
  data: Vacante[];
}

export interface TipoAjusteCatalogo {
  id_ajuste: number;
  nombre_ajuste: string;
  descripcion: string | null;
}

export interface AjusteSugeridoIA extends TipoAjusteCatalogo {
  justificacion: string;
}

export interface AlertaLenguaje {
  alerta_lenguaje: boolean;
  sugerencia_redaccion: string | null;
}

export interface VacanteCrear {
  titulo: string;
  descripcion: string;
  modalidad: ModalidadVacante;
  ubicacion?: string | null;
  salario_min?: number | null;
  salario_max?: number | null;
  fecha_cierre?: string | null;
  ajustes?: number[];
}

export interface FiltrosBusqueda {
  texto?: string;
  ubicacion?: string;
  modalidad?: ModalidadVacante;
  page?: number;
  limit?: number;
}
