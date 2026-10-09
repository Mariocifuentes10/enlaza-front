import { PaginaError } from './PaginaError';
import estilos from './errores.module.css';

interface ErrorFallbackProps {
  error?: unknown;
}

export function ErrorFallback({ error }: ErrorFallbackProps) {
  const mensaje =
    error instanceof Error && error.message ? error.message : 'Ocurrió un error inesperado.';

  return (
    <PaginaError
      codigo="!"
      titulo="Algo salió mal"
      descripcion="Se produjo un error inesperado. Puedes recargar la página para intentarlo de nuevo."
      detalle={mensaje}
      acciones={
        <button type="button" className={estilos.boton} onClick={() => window.location.reload()}>
          Recargar página
        </button>
      }
    />
  );
}
