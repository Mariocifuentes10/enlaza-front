export interface CandidatoResena {
  id_candidato: number;
  nombre_completo: string;
  visible_discapacidad: boolean;
}

export interface Resena {
  id_resena: number;
  id_candidato: number;
  id_empresa: number;
  calificacion: number;
  comentario: string | null;
  fecha_resena: string;
  moderada: boolean;
  candidato: CandidatoResena;
}

export interface ListadoResenas {
  total: number;
  promedio: number | null;
  data: Resena[];
}

export interface ResenaCrear {
  calificacion: number;
  comentario?: string | null;
}

export const OPCIONES_CALIFICACION = [1, 2, 3, 4, 5] as const;

export const ETIQUETAS_CALIFICACION: Record<number, string> = {
  1: 'Muy mala',
  2: 'Mala',
  3: 'Regular',
  4: 'Buena',
  5: 'Excelente',
};
