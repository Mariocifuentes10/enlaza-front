import { Link } from 'react-router-dom';
import { paths } from '@/routes/paths';
import { PaginaError } from './PaginaError';
import estilos from './errores.module.css';

export function UnauthorizedPage() {
  return (
    <PaginaError
      codigo="403"
      titulo="Acceso denegado"
      descripcion="No tienes permisos para ver esta sección con tu rol actual."
      acciones={
        <Link to={paths.home} className={estilos.boton}>
          Ir a mi panel
        </Link>
      }
    />
  );
}
