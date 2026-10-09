import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form';
import { ApiError, erroresPorCampo } from '@/types/api';

export function mensajeDe(error: unknown, reserva: string): string {
  return error instanceof ApiError ? error.message : reserva;
}

export function aplicarErroresDeApi<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  mensajeReserva: string,
): void {
  if (!(error instanceof ApiError)) {
    setError('root.serverError', { type: 'server', message: mensajeReserva });
    return;
  }

  const porCampo = Object.entries(erroresPorCampo(error));
  if (porCampo.length === 0) {
    setError('root.serverError', { type: 'server', message: error.message });
    return;
  }

  for (const [campo, mensaje] of porCampo) {
    setError(campo as FieldPath<T>, { type: 'server', message: mensaje });
  }
}
