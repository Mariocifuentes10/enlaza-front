import { Placeholder } from '@/components/ui/Placeholder';

export function NotFoundPage() {
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
      <Placeholder titulo="404" descripcion="La página que buscas no existe." />
    </main>
  );
}
