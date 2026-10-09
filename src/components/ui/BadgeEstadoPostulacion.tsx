import type { EstadoPostulacion } from '@/types/postulaciones';
import { ETIQUETAS_ESTADO_POSTULACION } from '@/types/postulaciones';
import estilos from './badgeEstado.module.css';

const TONO: Record<EstadoPostulacion, string> = {
  enviada: 'info',
  en_revision: 'aviso',
  entrevista: 'primario',
  rechazada: 'error',
  contratada: 'exito',
};

export function BadgeEstadoPostulacion({ estado }: { estado: EstadoPostulacion }) {
  return <span className={`${estilos.badge} ${estilos[TONO[estado]]}`}>{ETIQUETAS_ESTADO_POSTULACION[estado]}</span>;
}
