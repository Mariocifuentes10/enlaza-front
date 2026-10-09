import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { paths } from '@/routes/paths';
import type { Rol } from '@/types/auth';
import { Spinner } from '@/components/ui/Spinner';
import estilos from './AppLayout.module.css';

const ChatbotFlotante = lazy(() =>
  import('@/components/chat/ChatbotFlotante').then((modulo) => ({
    default: modulo.ChatbotFlotante,
  })),
);

type ClaveIcono =
  | 'dashboard'
  | 'vacantes'
  | 'postulaciones'
  | 'mentores'
  | 'perfil'
  | 'publicar'
  | 'sello'
  | 'usuarios'
  | 'empresas'
  | 'salir'
  | 'menu';

const TRAZOS: Record<ClaveIcono, string> = {
  dashboard: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  vacantes:
    'M20 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2',
  postulaciones: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  mentores:
    'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  perfil: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  publicar: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 8v8 M8 12h8',
  sello: 'M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M8.21 13.89 7 23l5-3 5 3-1.21-9.12',
  usuarios:
    'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  empresas:
    'M3 21h18 M5 21V7l8-4v18 M19 21V11l-6-4 M9 9h0 M9 12h0 M9 15h0 M9 18h0 M15 12h0 M15 15h0 M15 18h0',
  salir: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
  menu: 'M3 12h18 M3 6h18 M3 18h18',
};

function Icono({ nombre }: { nombre: ClaveIcono }) {
  return (
    <svg
      className={estilos.icono}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={TRAZOS[nombre]} />
    </svg>
  );
}

interface LinkItem {
  to: string;
  label: string;
  icono: ClaveIcono;
}

const linksCandidato: LinkItem[] = [
  { to: paths.candidato.dashboard, label: 'Dashboard', icono: 'dashboard' },
  { to: paths.vacantes, label: 'Vacantes', icono: 'vacantes' },
  { to: paths.candidato.postulaciones, label: 'Postulaciones', icono: 'postulaciones' },
  { to: paths.candidato.mentores, label: 'Mentores', icono: 'mentores' },
  { to: paths.candidato.perfil, label: 'Perfil', icono: 'perfil' },
];

const linksPorRol: Record<Rol, LinkItem[]> = {
  candidato: linksCandidato,
  mentor: linksCandidato,
  empresa: [
    { to: paths.empresa.dashboard, label: 'Dashboard', icono: 'dashboard' },
    { to: paths.empresa.publicarVacante, label: 'Publicar vacante', icono: 'publicar' },
    { to: paths.vacantes, label: 'Vacantes', icono: 'vacantes' },
    { to: paths.empresa.postulaciones, label: 'Postulaciones', icono: 'postulaciones' },
    { to: paths.empresa.perfil, label: 'Perfil', icono: 'perfil' },
  ],
  admin: [
    { to: paths.admin.dashboard, label: 'Dashboard', icono: 'dashboard' },
    { to: paths.admin.usuarios, label: 'Usuarios', icono: 'usuarios' },
    { to: paths.admin.empresas, label: 'Empresas', icono: 'empresas' },
    { to: paths.admin.sello, label: 'Sello', icono: 'sello' },
  ],
};

const NOMBRE_ROL: Record<Rol, string> = {
  candidato: 'Candidato',
  mentor: 'Mentor',
  empresa: 'Empresa',
  admin: 'Administrador',
};

export function AppLayout() {
  const { usuario, salir } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const links = usuario ? linksPorRol[usuario.tipo_usuario] : [];

  useEffect(() => {
    setMenuAbierto(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await salir();
    navigate(paths.login, { replace: true });
  };

  let pieRol: ReactNode = null;
  if (usuario) {
    pieRol = `Sesión iniciada como ${NOMBRE_ROL[usuario.tipo_usuario]}`;
  }

  return (
    <div className={estilos.layout}>
      <aside className={`${estilos.sidebar} ${menuAbierto ? estilos.sidebarAbierta : ''}`}>
        <NavLink to={paths.home} className={estilos.marca}>
          <span className={estilos.marcaPunto} aria-hidden="true" />
          Enlaza
        </NavLink>

        <nav className={estilos.nav} aria-label="Secciones">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive ? `${estilos.link} ${estilos.linkActivo}` : estilos.link
              }
            >
              <Icono nombre={link.icono} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className={estilos.pie}>{pieRol}</div>
      </aside>

      {menuAbierto ? (
        <button
          type="button"
          className={estilos.overlay}
          aria-label="Cerrar menú"
          onClick={() => setMenuAbierto(false)}
        />
      ) : null}

      <div className={estilos.principal}>
        <header className={estilos.barraSuperior}>
          <button
            type="button"
            className={estilos.menuToggle}
            aria-label="Abrir menú"
            aria-expanded={menuAbierto}
            onClick={() => setMenuAbierto((abierto) => !abierto)}
          >
            <Icono nombre="menu" />
          </button>

          <div className={estilos.espaciador} />

          <div className={estilos.usuario}>
            <span className={estilos.correo}>{usuario?.correo}</span>
            <span className={estilos.rol}>
              {usuario ? NOMBRE_ROL[usuario.tipo_usuario] : ''}
            </span>
          </div>

          <button type="button" className={estilos.salir} onClick={() => void handleLogout()}>
            <Icono nombre="salir" />
            Salir
          </button>
        </header>

        <main className={estilos.contenido}>
          <Suspense
            fallback={
              <div className={estilos.cargando}>
                <Spinner label="Cargando…" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>

      <Suspense fallback={null}>
        <ChatbotFlotante />
      </Suspense>
    </div>
  );
}
