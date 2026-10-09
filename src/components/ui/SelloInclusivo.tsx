import type { SelloVacante } from '@/types/vacantes';
import estilos from './sello.module.css';

const ETIQUETAS_NIVEL: Record<SelloVacante['nivel'], string> = {
  basico: 'Básico',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};

export function SelloInclusivo({ sello }: { sello: SelloVacante | null }) {
  if (!sello || sello.estado !== 'aprobado') return null;

  return (
    <span className={estilos.sello} role="img" aria-label="Empresa con sello de inclusión">
      Sello de inclusión · Nivel {ETIQUETAS_NIVEL[sello.nivel]}
    </span>
  );
}
