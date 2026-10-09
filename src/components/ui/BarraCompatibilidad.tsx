import { ETIQUETAS_NIVEL_COMPATIBILIDAD, nivelCompatibilidad } from '@/lib/compatibilidad';
import estilos from './barraCompatibilidad.module.css';

interface BarraCompatibilidadProps {
  puntaje: number;
}

export function BarraCompatibilidad({ puntaje }: BarraCompatibilidadProps) {
  const valor = Math.min(100, Math.max(0, puntaje));
  const nivel = nivelCompatibilidad(valor);
  const etiqueta = ETIQUETAS_NIVEL_COMPATIBILIDAD[nivel];

  return (
    <div className={`${estilos.barra} ${estilos[nivel]}`}>
      <span className={estilos.etiqueta}>{etiqueta}</span>
      <span className={estilos.pista} aria-hidden="true">
        <span className={estilos.relleno} style={{ width: `${valor}%` }} />
      </span>
    </div>
  );
}
