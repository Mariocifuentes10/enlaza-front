import { Link } from 'react-router-dom';
import { paths } from '@/routes/paths';

export function LandingPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-4)',
        padding: 'var(--space-8)',
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-family-display)',
          fontSize: 'var(--font-size-5xl)',
          color: 'var(--color-primary-500)',
        }}
      >
        Enlaza
      </h1>
      <p style={{ color: 'var(--color-text-muted)', maxWidth: '32rem' }}>
        Conectamos talento con oportunidades. Pantalla pública placeholder — Sprint 0.
      </p>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 'var(--space-3)',
        }}
      >
        <Link
          to={paths.login}
          style={{
            padding: 'var(--space-2) var(--space-5)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary-500)',
            color: 'var(--color-on-primary)',
            fontWeight: 'var(--font-weight-semibold)',
          }}
        >
          Iniciar sesión
        </Link>
        <Link
          to={paths.registro}
          style={{
            padding: 'var(--space-2) var(--space-5)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-primary-500)',
            color: 'var(--color-primary-500)',
            fontWeight: 'var(--font-weight-semibold)',
          }}
        >
          Crear cuenta
        </Link>
      </div>
    </main>
  );
}
