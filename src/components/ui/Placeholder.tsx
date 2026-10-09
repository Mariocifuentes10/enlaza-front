interface PlaceholderProps {
  titulo: string;
  descripcion?: string;
}

export function Placeholder({
  titulo,
  descripcion = 'Pantalla placeholder — Sprint 0.',
}: PlaceholderProps) {
  return (
    <div>
      <h1 style={{ fontSize: 'var(--font-size-3xl)' }}>{titulo}</h1>
      <p style={{ marginTop: 'var(--space-2)', color: 'var(--color-text-muted)' }}>{descripcion}</p>
    </div>
  );
}
