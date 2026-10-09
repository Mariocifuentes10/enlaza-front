interface SpinnerProps {
  label?: string;
  tamano?: string;
}

export function Spinner({ label = 'Cargando…', tamano = '1.25rem' }: SpinnerProps) {
  return (
    <span
      role="status"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        color: 'var(--color-text-muted)',
        fontSize: 'var(--font-size-sm)',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: tamano,
          height: tamano,
          borderRadius: 'var(--radius-full)',
          border: '2px solid var(--color-neutral-300)',
          borderTopColor: 'var(--color-primary-500)',
          animation: 'enlaza-girar 0.8s linear infinite',
          display: 'inline-block',
        }}
      />
      {label}
      <style>{`@keyframes enlaza-girar { to { transform: rotate(360deg); } }`}</style>
    </span>
  );
}
