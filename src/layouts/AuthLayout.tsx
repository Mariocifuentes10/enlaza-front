import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { paths } from '@/routes/paths';

export function AuthLayout() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-6)',
        padding: 'var(--space-6)',
      }}
    >
      <Link
        to={paths.home}
        style={{
          fontFamily: 'var(--font-family-display)',
          fontSize: 'var(--font-size-2xl)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-primary-500)',
        }}
      >
        Enlaza
      </Link>
      <div
        style={{
          width: '100%',
          maxWidth: '26rem',
          padding: 'var(--space-8)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <Outlet />
      </div>
    </main>
  );
}
