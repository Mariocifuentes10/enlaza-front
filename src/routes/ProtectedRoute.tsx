import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';
import { paths } from './paths';
import type { Rol } from '@/types/auth';

interface ProtectedRouteProps {
  roles?: Rol[];
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { estado, usuario } = useAuth();
  const location = useLocation();

  if (estado === 'cargando') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spinner label="Verificando sesión…" />
      </div>
    );
  }

  if (estado === 'anonimo') {
    return (
      <Navigate
        to={paths.login}
        state={{ from: `${location.pathname}${location.search}` }}
        replace
      />
    );
  }

  if (roles && usuario && !roles.includes(usuario.tipo_usuario)) {
    return <Navigate to={paths.noAutorizado} replace />;
  }

  return <Outlet />;
}
