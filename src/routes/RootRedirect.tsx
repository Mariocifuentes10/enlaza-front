import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';
import { paths, rutaPorRol } from './paths';

export function RootRedirect() {
  const { estado, usuario } = useAuth();

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

  if (estado === 'anonimo' || !usuario) {
    return <Navigate to={paths.login} replace />;
  }

  return <Navigate to={rutaPorRol(usuario.tipo_usuario)} replace />;
}
