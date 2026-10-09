export type NivelCompatibilidad = 'alta' | 'media' | 'baja';

export const UMBRAL_ALTA = 70;
export const UMBRAL_MEDIA = 40;

export const ETIQUETAS_NIVEL_COMPATIBILIDAD: Record<NivelCompatibilidad, string> = {
  alta: 'Compatibilidad alta',
  media: 'Compatibilidad media',
  baja: 'Compatibilidad baja',
};

export function nivelCompatibilidad(puntaje: number): NivelCompatibilidad {
  if (puntaje >= UMBRAL_ALTA) return 'alta';
  if (puntaje >= UMBRAL_MEDIA) return 'media';
  return 'baja';
}
