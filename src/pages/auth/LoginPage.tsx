import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { esquemaLogin, type ValoresLogin } from '@/schemas/formularios';
import { ErrorGeneral, Field } from '@/components/ui/form/Field';
import { TextInput } from '@/components/ui/form/Controles';
import { Boton } from '@/components/ui/form/Boton';
import { aplicarErroresDeApi } from '@/lib/erroresFormulario';
import type { Rol } from '@/types/auth';
import { paths, rutaPorRol } from '@/routes/paths';
import estilos from './auth.module.css';

interface EstadoLocation {
  from?: string;
  correo?: string;
  mensaje?: string;
}

function IconoOjo() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconoOjoCerrado() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c6.5 0 10 7 10 7a17.4 17.4 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A17.4 17.4 0 0 0 2 12s3.5 7 10 7a10.43 10.43 0 0 0 5.39-1.39" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

export function LoginPage() {
  const { estado, usuario, ingresar } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [verContrasena, setVerContrasena] = useState(false);

  const estadoLocation = (location.state ?? {}) as EstadoLocation;
  const [searchParams] = useSearchParams();
  const redirUrl = searchParams.get('redir');
  const redir =
    redirUrl && redirUrl.startsWith('/') && !redirUrl.startsWith('//') ? redirUrl : null;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ValoresLogin>({
    resolver: zodResolver(esquemaLogin),
    defaultValues: { correo: estadoLocation.correo ?? '', contrasena: '' },
  });

  const destinoPorDefecto = (tipo: Rol) => estadoLocation.from ?? rutaPorRol(tipo);

  if (estado === 'autenticado' && usuario) {
    return <Navigate to={redir ?? destinoPorDefecto(usuario.tipo_usuario)} replace />;
  }

  const onSubmit = handleSubmit(async (valores) => {
    try {
      const yo = await ingresar(valores);
      navigate(redir ?? estadoLocation.from ?? rutaPorRol(yo.tipo_usuario), { replace: true });
    } catch (error) {
      aplicarErroresDeApi(error, setError, 'No se pudo iniciar sesión. Inténtalo de nuevo.');
    }
  });

  return (
    <form onSubmit={(event) => void onSubmit(event)} noValidate>
      <h1 className={estilos.titulo}>Iniciar sesión</h1>
      <p className={estilos.subtitulo}>Bienvenido de vuelta a Enlaza.</p>

      {estadoLocation.mensaje && (
        <span className={estilos.avisoExito} role="status">
          {estadoLocation.mensaje}
        </span>
      )}

      <ErrorGeneral mensaje={errors.root?.serverError?.message} />

      <Field id="correo" label="Correo electrónico" error={errors.correo?.message} requerido>
        <TextInput
          {...register('correo')}
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
        />
      </Field>

      <Field
        id="contrasena"
        label="Contraseña"
        error={errors.contrasena?.message}
        requerido
        accion={
          <button
            type="button"
            className={estilos.toggle}
            aria-pressed={verContrasena}
            aria-controls="contrasena"
            aria-label={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            title={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onClick={() => setVerContrasena((valor) => !valor)}
          >
            {verContrasena ? <IconoOjoCerrado /> : <IconoOjo />}
          </button>
        }
      >
        <TextInput
          {...register('contrasena')}
          type={verContrasena ? 'text' : 'password'}
          autoComplete="current-password"
        />
      </Field>

      <Link className={estilos.olvide} to={paths.olvidePassword}>
        ¿Olvidaste tu contraseña?
      </Link>

      <Boton type="submit" cargando={isSubmitting} className={estilos.botonPrincipal}>
        Entrar
      </Boton>

      <p className={estilos.separador}>¿No tienes cuenta?</p>

      <Link className={estilos.botonSecundario} to={paths.registro}>
        Crear cuenta
      </Link>
    </form>
  );
}
