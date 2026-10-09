import { Link } from 'react-router-dom';
import { paths } from '@/routes/paths';

export function OlvidePasswordPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>Recuperar contraseña</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
        Flujo de recuperación placeholder — Sprint 1.
      </p>
      <Link to={paths.login} style={{ fontSize: 'var(--font-size-sm)' }}>
        Volver a iniciar sesión
      </Link>
    </div>
  );
}
