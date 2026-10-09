import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import estilos from './form.module.css';

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  pista?: ReactNode;
  requerido?: boolean;
  accion?: ReactNode;
  children: ReactNode;
}

export function Field({ id, label, error, pista, requerido, accion, children }: FieldProps) {
  const ids = [error ? `${id}-error` : null, pista ? `${id}-pista` : null]
    .filter(Boolean)
    .join(' ');

  const control =
    isValidElement(children) && typeof children === 'object'
      ? cloneElement(children as ReactElement<Record<string, unknown>>, {
          id,
          'aria-invalid': error ? 'true' : undefined,
          'aria-describedby': ids || undefined,
        })
      : children;

  return (
    <div className={estilos.campo}>
      <label className={estilos.etiqueta} htmlFor={id}>
        {label}
        {requerido && (
          <span className={estilos.requerido} aria-hidden="true">
            {' *'}
          </span>
        )}
      </label>
      {accion ? (
        <div className={estilos.controlConAccion}>
          {control}
          <div className={estilos.accion}>{accion}</div>
        </div>
      ) : (
        control
      )}
      {pista && (
        <span className={estilos.pista} id={`${id}-pista`}>
          {pista}
        </span>
      )}
      {error && (
        <span className={estilos.error} id={`${id}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export function ErrorGeneral({ mensaje }: { mensaje?: string }) {
  if (!mensaje) return null;
  return (
    <span className={estilos.errorGeneral} role="alert">
      {mensaje}
    </span>
  );
}

export function MensajeExito({ mensaje }: { mensaje?: string }) {
  if (!mensaje) return null;
  return (
    <span className={estilos.exito} role="status">
      {mensaje}
    </span>
  );
}
