import type { Vacante } from './vacantes';

export interface Recomendacion {
  puntaje_match: number;
  vacante: Vacante;
}

export interface ListadoRecomendaciones {
  total: number;
  page: number;
  limit: number;
  data: Recomendacion[];
}
