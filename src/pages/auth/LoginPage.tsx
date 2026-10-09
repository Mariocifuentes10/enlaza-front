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

      <Field id="contrasena" label="Contraseña" error={errors.contrasena?.message} requerido>
        <TextInput
          {...register('contrasena')}
          type={verContrasena ? 'text' : 'password'}
          autoComplete="current-password"
        />
      </Field>

      <button
        type="button"
        className={estilos.toggle}
        aria-pressed={verContrasena}
        aria-controls="contrasena"
        onClick={() => setVerContrasena((valor) => !valor)}
      >
        {verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      </button>

      <div className={estilos.acciones}>
        <Boton type="submit" cargando={isSubmitting}>
          Entrar
        </Boton>
        <Link className={estilos.enlace} to={paths.olvidePassword}>
          ¿Olvidaste tu contraseña?
        </Link>
        <Link className={estilos.enlace} to={paths.registro}>
          ¿No tienes cuenta? Crear cuenta
        </Link>
      </div>
    </form>
  );
}
