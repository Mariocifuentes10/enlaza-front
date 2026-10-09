import { Placeholder } from '@/components/ui/Placeholder';

interface ErrorFallbackProps {
  error?: unknown;
}

export function ErrorFallback({ error }: ErrorFallbackProps) {
  const mensaje =
    error instanceof Error && error.message ? error.message : 'Ocurrió un error inesperado.';

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-2)',
        padding: 'var(--space-6)',
      }}
    >
      <Placeholder
        titulo="Error inesperado"
        descripcion="Algo salió mal. Recargá la página o intentá de nuevo en unos minutos."
      />
      <p
        aria-live="polite"
        style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}
      >
        {mensaje}
      </p>
    </main>
  );
}
