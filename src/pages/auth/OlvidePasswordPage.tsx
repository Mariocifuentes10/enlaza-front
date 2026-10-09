import { Link } from 'react-router-dom';
import { paths } from '@/routes/paths';
import estilos from './auth.module.css';

export function OlvidePasswordPage() {
  return (
    <div>
      <h1 className={estilos.titulo}>Recuperar contraseña</h1>
      <p className={estilos.subtitulo}>
        Para restablecer tu contraseña, contacta al equipo de soporte de Enlaza.
      </p>
      <Link className={estilos.enlace} to={paths.login}>
        Volver a iniciar sesión
      </Link>
    </div>
  );
}
