import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes } from 'react';
import estilos from './form.module.css';

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario';
  cargando?: boolean;
}

export function Boton({
  variante = 'primario',
  cargando = false,
  disabled,
  children,
  className,
  type = 'button',
  ...resto
}: BotonProps) {
  return (
    <button
      type={type}
      className={[estilos.boton, estilos[variante], className].filter(Boolean).join(' ')}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      {...resto}
    >
      {cargando && <span className={estilos.hilo} aria-hidden="true" />}
      {children}
    </button>
  );
}

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string;
  etiqueta: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { id, etiqueta, error, ...resto },
  ref,
) {
  const descritoPor = error ? `${id}-error` : undefined;
  return (
    <div>
      <label className={estilos.checkbox} htmlFor={id}>
        <input
          ref={ref}
          id={id}
          type="checkbox"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={descritoPor}
          {...resto}
        />
        <span>{etiqueta}</span>
      </label>
      {error && (
        <span className={estilos.error} id={`${id}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
});
