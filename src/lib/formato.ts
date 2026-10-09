import type { ModalidadVacante } from '@/types/vacantes';

export const ETIQUETAS_MODALIDAD: Record<ModalidadVacante, string> = {
  presencial: 'Presencial',
  remoto: 'Remoto',
  hibrido: 'Híbrido',
};

const formatoNumero = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 });

export function formatoMoneda(valor: number | null | undefined): string {
  if (valor == null) return '';
  return `$${formatoNumero.format(valor)}`;
}

export function rangoSalarial(min: number | null, max: number | null): string | null {
  if (min == null && max == null) return null;
  if (min == null) return `Hasta ${formatoMoneda(max)}`;
  if (max == null) return `Desde ${formatoMoneda(min)}`;
  return `${formatoMoneda(min)} – ${formatoMoneda(max)}`;
}

const formatoFechaLarga = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export function formatoFecha(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    return formatoFechaLarga.format(new Date(iso));
  } catch {
    return '';
  }
}
