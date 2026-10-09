import { useEffect, useRef, type ReactNode } from 'react';
import estilos from './modal.module.css';

interface ModalProps {
  abierto: boolean;
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
}

export function Modal({ abierto, titulo, onCerrar, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previo = document.activeElement as HTMLElement | null;

    if (!abierto) return;

    panelRef.current?.focus();
    const bodyPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const alTeclado = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') onCerrar();
    };
    window.addEventListener('keydown', alTeclado);

    return () => {
      document.body.style.overflow = bodyPrevio;
      window.removeEventListener('keydown', alTeclado);
      previo?.focus?.();
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div className={estilos.overlay} onClick={onCerrar}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        className={estilos.panel}
        onClick={(evento) => evento.stopPropagation()}
      >
        <header className={estilos.encabezado}>
          <h2 className={estilos.titulo}>{titulo}</h2>
          <button type="button" className={estilos.cerrar} onClick={onCerrar} aria-label="Cerrar">
            ×
          </button>
        </header>
        <div className={estilos.contenido}>{children}</div>
      </div>
    </div>
  );
}
