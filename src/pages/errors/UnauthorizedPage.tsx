import { Placeholder } from '@/components/ui/Placeholder';

export function UnauthorizedPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-2)',
      }}
    >
      <Placeholder titulo="403" descripcion="No tienes permisos para acceder a esta sección." />
    </main>
  );
}
