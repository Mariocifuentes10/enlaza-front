import { API_BASE_URL } from '@/services/api';
import { useHealthCheck } from '@/hooks/useHealthCheck';

const etiquetas = {
  idle: 'Comprobando…',
  checking: 'Comprobando…',
  online: 'API conectada',
  offline: 'API sin conexión',
} as const;

export function HealthBadge() {
  const { state, error, retry } = useHealthCheck();

  const color =
    state === 'online'
      ? 'var(--color-success)'
      : state === 'offline'
        ? 'var(--color-error)'
        : 'var(--color-text-muted)';

  return (
    <button
      type="button"
      onClick={() => void retry()}
      title={error ? `${error} — ${API_BASE_URL}` : API_BASE_URL}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: 'var(--space-1) var(--space-3)',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        color,
        fontSize: 'var(--font-size-sm)',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: '0.5rem',
          height: '0.5rem',
          borderRadius: 'var(--radius-full)',
          backgroundColor: color,
        }}
      />
      {etiquetas[state]}
    </button>
  );
}
