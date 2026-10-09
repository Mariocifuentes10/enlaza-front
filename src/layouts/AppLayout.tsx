import { lazy, Suspense } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { paths } from '@/routes/paths';
import type { Rol } from '@/types/auth';
import { Spinner } from '@/components/ui/Spinner';

const ChatbotFlotante = lazy(() =>
  import('@/components/chat/ChatbotFlotante').then((modulo) => ({
    default: modulo.ChatbotFlotante,
  })),
);

interface LinkItem {
  to: string;
  label: string;
}

const linksCandidato: LinkItem[] = [
  { to: paths.candidato.dashboard, label: 'Dashboard' },
  { to: paths.vacantes, label: 'Vacantes' },
  { to: paths.candidato.postulaciones, label: 'Postulaciones' },
  { to: paths.candidato.mentores, label: 'Mentores' },
  { to: paths.candidato.perfil, label: 'Perfil' },
];

const linksPorRol: Record<Rol, LinkItem[]> = {
  candidato: linksCandidato,
  mentor: linksCandidato,
  empresa: [
    { to: paths.empresa.dashboard, label: 'Dashboard' },
    { to: paths.empresa.publicarVacante, label: 'Publicar vacante' },
    { to: paths.vacantes, label: 'Vacantes' },
    { to: paths.empresa.postulaciones, label: 'Postulaciones' },
    { to: paths.empresa.perfil, label: 'Perfil' },
  ],
  admin: [
    { to: paths.admin.dashboard, label: 'Dashboard' },
    { to: paths.admin.sello, label: 'Sello' },
    { to: paths.admin.usuarios, label: 'Usuarios' },
    { to: paths.admin.empresas, label: 'Empresas' },
  ],
};

export function AppLayout() {
  const { usuario, salir } = useAuth();
  const navigate = useNavigate();

  const links = usuario ? linksPorRol[usuario.tipo_usuario] : [];

  const handleLogout = async () => {
    await salir();
    navigate(paths.login, { replace: true });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          padding: 'var(--space-3) var(--space-6)',
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <NavLink
          to={paths.home}
          style={{
            fontFamily: 'var(--font-family-display)',
            fontWeight: 'var(--font-weight-bold)',
            fontSize: 'var(--font-size-xl)',
            color: 'var(--color-primary-500)',
          }}
        >
          Enlaza
        </NavLink>

        <nav
          aria-label="Secciones"
          style={{ display: 'flex', gap: 'var(--space-3)', flex: 1, flexWrap: 'wrap' }}
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                padding: 'var(--space-1) var(--space-2)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
                color: isActive ? 'var(--color-primary-500)' : 'var(--color-text-muted)',
                backgroundColor: isActive ? 'var(--color-primary-50)' : 'transparent',
              })}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <span
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)',
            minWidth: 0,
            overflowWrap: 'anywhere',
          }}
        >
          {usuario?.correo}
          {usuario ? ` · ${usuario.tipo_usuario}` : ''}
        </span>

        <button
          type="button"
          onClick={() => void handleLogout()}
          style={{
            padding: 'var(--space-1) var(--space-3)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text)',
          }}
        >
          Salir
        </button>
      </header>

      <main style={{ flex: 1, padding: 'var(--space-6)' }}>
        <Suspense
          fallback={
            <div style={{ display: 'grid', placeItems: 'center', padding: 'var(--space-10)' }}>
              <Spinner label="Cargando…" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <ChatbotFlotante />
      </Suspense>
    </div>
  );
}
