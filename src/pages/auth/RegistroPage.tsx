import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '@/services/api';
import { esquemaRegistro, type ValoresRegistro } from '@/schemas/formularios';
import { ErrorGeneral, Field } from '@/components/ui/form/Field';
import { TextInput } from '@/components/ui/form/Controles';
import { Boton } from '@/components/ui/form/Boton';
import { aplicarErroresDeApi } from '@/lib/erroresFormulario';
import { paths } from '@/routes/paths';
import type { RegistroRequest, RolRegistro } from '@/types/auth';
import estilos from './auth.module.css';

const OPCIONES_ROL: Array<{ valor: RolRegistro; titulo: string; descripcion: string }> = [
  {
    valor: 'candidato',
    titulo: 'Candidato',
    descripcion: 'Busco oportunidades laborales.',
  },
  {
    valor: 'empresa',
    titulo: 'Empresa',
    descripcion: 'Quiero publicar vacantes.',
  },
  {
    valor: 'mentor',
    titulo: 'Mentor',
    descripcion: 'Acompaño a candidatos en su proceso.',
  },
];

export function RegistroPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ValoresRegistro>({
    resolver: zodResolver(esquemaRegistro),
    defaultValues: {
      tipo_usuario: 'candidato',
      nombre_completo: '',
      nombre_empresa: '',
      correo: '',
      contrasena: '',
      confirmacion: '',
    },
  });

  const rol = watch('tipo_usuario');

  const onSubmit = handleSubmit(async (valores) => {
    try {
      const datos: RegistroRequest = {
        correo: valores.correo.trim(),
        contrasena: valores.contrasena,
        tipo_usuario: valores.tipo_usuario,
        ...(valores.tipo_usuario === 'empresa'
          ? { nombre_empresa: valores.nombre_empresa.trim() }
          : { nombre_completo: valores.nombre_completo.trim() }),
      };
      await authApi.registro(datos);
      navigate(paths.login, {
        state: {
          correo: datos.correo,
          mensaje: 'Cuenta creada. Inicia sesión para continuar.',
        },
      });
    } catch (error) {
      aplicarErroresDeApi(error, setError, 'No se pudo crear la cuenta. Inténtalo de nuevo.');
    }
  });

  return (
    <form onSubmit={(event) => void onSubmit(event)} noValidate>
      <h1 className={estilos.titulo}>Crear cuenta</h1>
      <p className={estilos.subtitulo}>Elige cómo vas a usar Enlaza.</p>

      <ErrorGeneral mensaje={errors.root?.serverError?.message} />

      <fieldset className={estilos.roles}>
        <legend className={estilos.leyenda}>Tipo de cuenta</legend>
        <div className={estilos.tarjetas}>
          {OPCIONES_ROL.map((opcion) => (
            <label key={opcion.valor} className={estilos.tarjeta}>
              <input type="radio" value={opcion.valor} {...register('tipo_usuario')} />
              <span className={estilos.tarjetaTitulo}>{opcion.titulo}</span>
              <span className={estilos.tarjetaDesc}>{opcion.descripcion}</span>
            </label>
          ))}
        </div>
        {errors.tipo_usuario && (
          <span className={estilos.tarjetaDesc} role="alert">
            {errors.tipo_usuario.message}
          </span>
        )}
      </fieldset>

      {rol !== 'empresa' && (
        <Field
          id="nombre_completo"
          label="Nombre completo"
          error={errors.nombre_completo?.message}
          requerido
        >
          <TextInput {...register('nombre_completo')} autoComplete="name" />
        </Field>
      )}

      {rol === 'empresa' && (
        <Field
          id="nombre_empresa"
          label="Nombre de la empresa"
          error={errors.nombre_empresa?.message}
          requerido
        >
          <TextInput {...register('nombre_empresa')} autoComplete="organization" />
        </Field>
      )}

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
        pista="Mínimo 8 caracteres."
        requerido
      >
        <TextInput {...register('contrasena')} type="password" autoComplete="new-password" />
      </Field>

      <Field
        id="confirmacion"
        label="Repite la contraseña"
        error={errors.confirmacion?.message}
        requerido
      >
        <TextInput {...register('confirmacion')} type="password" autoComplete="new-password" />
      </Field>

      <div className={estilos.acciones}>
        <Boton type="submit" cargando={isSubmitting}>
          Crear cuenta
        </Boton>
        <Link className={estilos.enlace} to={paths.login}>
          ¿Ya tienes cuenta? Inicia sesión
        </Link>
      </div>
    </form>
  );
}
