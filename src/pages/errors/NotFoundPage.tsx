import { Link } from 'react-router-dom';
import { paths } from '@/routes/paths';
import { PaginaError } from './PaginaError';
import estilos from './errores.module.css';

export function NotFoundPage() {
  return (
    <PaginaError
      codigo="404"
      titulo="Página no encontrada"
      descripcion="La página que buscas no existe o fue movida a otra dirección."
      acciones={
        <Link to={paths.home} className={estilos.boton}>
          Volver al inicio
        </Link>
      }
    />
  );
}
