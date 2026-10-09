import { useEffect, useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { archivosApi, empresasApi, selloApi } from '@/services/api';
import { esquemaPerfilEmpresa, type ValoresPerfilEmpresa } from '@/schemas/formularios';
import { ErrorGeneral, Field, MensajeExito } from '@/components/ui/form/Field';
import { Select, TextArea, TextInput } from '@/components/ui/form/Controles';
import { Boton } from '@/components/ui/form/Boton';
import { Spinner } from '@/components/ui/Spinner';
import { SelloInclusivo } from '@/components/ui/SelloInclusivo';
import { ConfiguracionAccesibilidad } from '@/components/ui/ConfiguracionAccesibilidad';
import { aplicarErroresDeApi, mensajeDe } from '@/lib/erroresFormulario';
import type { EmpresaActualizar, EmpresaPerfil, SelloEmpresa } from '@/types/perfil';
import type { NivelSello } from '@/types/sello';
import { ApiError } from '@/types/api';
import estilosForm from '@/components/ui/form/form.module.css';
import estilos from '../perfiles.module.css';

const LOGO_FORMATOS_ACEPTADOS = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
const TAMANO_MAXIMO = 5 * 1024 * 1024;

const ETIQUETAS_SELLO: Record<SelloEmpresa['estado'], string> = {
  pendiente: 'Sello: pendiente de revisión',
  aprobado: 'Sello de inclusión verificado',
  rechazado: 'Sello rechazado',
};

const OPCIONES_NIVEL_SELLO: Array<{ valor: NivelSello; etiqueta: string }> = [
  { valor: 'basico', etiqueta: 'Básico' },
  { valor: 'intermedio', etiqueta: 'Intermedio' },
  { valor: 'avanzado', etiqueta: 'Avanzado' },
];

const aValores = (perfil: EmpresaPerfil): ValoresPerfilEmpresa => ({
  nombre_empresa: perfil.nombre_empresa,
  descripcion: perfil.descripcion ?? '',
  sitio_web: perfil.sitio_web ?? '',
  ubicacion: perfil.ubicacion ?? '',
});

export function PerfilPage() {
  const { usuario } = useAuth();
  const idEmpresa = usuario?.id_empresa ?? null;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<ValoresPerfilEmpresa>({
    resolver: zodResolver(esquemaPerfilEmpresa),
    defaultValues: {
      nombre_empresa: '',
      descripcion: '',
      sitio_web: '',
      ubicacion: '',
    },
  });

  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [sello, setSello] = useState<SelloEmpresa | null>(null);
  const [logoActual, setLogoActual] = useState<string | null>(null);
  const [logoElegido, setLogoElegido] = useState<File | null>(null);
  const [errorLogo, setErrorLogo] = useState<string | null>(null);

  const [mostrarSolicitud, setMostrarSolicitud] = useState(false);
  const [evidenciaUrl, setEvidenciaUrl] = useState('');
  const [nivelSello, setNivelSello] = useState<NivelSello>('basico');
  const [enviandoSello, setEnviandoSello] = useState(false);
  const [errorSello, setErrorSello] = useState<string | null>(null);

  useEffect(() => {
    if (!idEmpresa) {
      setCargando(false);
      return;
    }
    let cancelado = false;
    empresasApi
      .obtener(idEmpresa)
      .then((perfil) => {
        if (cancelado) return;
        reset(aValores(perfil));
        setSello(perfil.sello);
        setLogoActual(perfil.logo_url);
      })
      .catch((error: unknown) => {
        if (cancelado) return;
        setMensaje(mensajeDe(error, 'No pudimos cargar el perfil de la empresa.'));
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [idEmpresa, reset]);

  const alElegirLogo = (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0] ?? null;
    setErrorLogo(null);
    setLogoElegido(null);

    if (!archivo) return;
    if (!LOGO_FORMATOS_ACEPTADOS.includes(archivo.type)) {
      setErrorLogo('Formato no permitido: usa .png, .jpg, .webp o .svg.');
      evento.target.value = '';
      return;
    }
    if (archivo.size > TAMANO_MAXIMO) {
      setErrorLogo('El archivo supera el máximo de 5 MB.');
      evento.target.value = '';
      return;
    }
    setLogoElegido(archivo);
  };

  const onSubmit = handleSubmit(async (valores) => {
    setMensaje(null);
    setErrorLogo(null);
    if (!idEmpresa) return;

    try {
      let logoUrl: string | null | undefined;

      if (logoElegido) {
        const subido = await archivosApi.subir(logoElegido, 'logo');
        logoUrl = subido.url;
      }

      const cambios: EmpresaActualizar = {};
      if (dirtyFields.nombre_empresa) cambios.nombre_empresa = valores.nombre_empresa.trim();
      if (dirtyFields.descripcion) cambios.descripcion = valores.descripcion.trim() || null;
      if (dirtyFields.sitio_web) cambios.sitio_web = valores.sitio_web || null;
      if (dirtyFields.ubicacion) cambios.ubicacion = valores.ubicacion.trim() || null;
      if (logoUrl !== undefined) cambios.logo_url = logoUrl;

      if (Object.keys(cambios).length === 0) {
        setMensaje('No hay cambios por guardar.');
        return;
      }

      const perfil = await empresasApi.actualizar(idEmpresa, cambios);
      reset(aValores(perfil));
      setLogoActual(perfil.logo_url);
      setLogoElegido(null);
      setMensaje('Cambios guardados.');
    } catch (error) {
      aplicarErroresDeApi(error, setError, 'No se pudieron guardar los cambios.');
    }
  });

  const solicitarSello = async () => {
    if (!idEmpresa) return;
    setErrorSello(null);
    setEnviandoSello(true);
    try {
      const actualizado = await selloApi.solicitar(idEmpresa, {
        nivel: nivelSello,
        evidencia_url: evidenciaUrl.trim(),
      });
      setSello(actualizado);
      setMostrarSolicitud(false);
      setMensaje('Solicitud de sello enviada. Quedará en revisión por el administrador.');
    } catch (evaluacion) {
      if (evaluacion instanceof ApiError) {
        if (evaluacion.code === 'SELLO_EN_REVISION') {
          setErrorSello('Ya existe una solicitud de sello en revisión.');
          return;
        }
        if (evaluacion.code === 'SELLO_YA_APROBADO') {
          setErrorSello('La empresa ya cuenta con el sello de inclusión aprobado.');
          return;
        }
      }
      setErrorSello(mensajeDe(evaluacion, 'No se pudo enviar la solicitud de sello.'));
    } finally {
      setEnviandoSello(false);
    }
  };

  if (cargando) {
    return (
      <div className={estilos.cargando}>
        <Spinner label="Cargando el perfil…" />
      </div>
    );
  }

  if (!idEmpresa) {
    return (
      <div className={estilos.pagina}>
        <h1 className={estilos.titulo}>Perfil de la empresa</h1>
        <ErrorGeneral mensaje="No encontramos tu perfil de empresa. Contacta al administrador." />
      </div>
    );
  }

  const logoVista = logoElegido ? URL.createObjectURL(logoElegido) : logoActual;

  return (
    <div className={estilos.pagina}>
      <h1 className={estilos.titulo}>Perfil de la empresa</h1>
      <p className={estilos.subtitulo}>
        Esta información se muestra en tus vacantes y en tu página pública.
      </p>

      {sello && (
        <p className={estilos.privadoNota} role="status">
          {ETIQUETAS_SELLO[sello.estado]}
        </p>
      )}

      <section className={estilos.seccionSello} aria-label="Sello de inclusión">
        <h2 className={estilos.seccionSelloTitulo}>Sello de inclusión</h2>

        {sello && (
          <div className={estilos.selloEstado}>
            <SelloInclusivo sello={sello} />
            <p role="status">
              {ETIQUETAS_SELLO[sello.estado]}
              {sello.estado === 'rechazado' && sello.motivo_rechazo
                ? ` · Motivo: ${sello.motivo_rechazo}`
                : ''}
            </p>
          </div>
        )}

        {sello === null && (
          <p className={estilosForm.pista}>
            Aún no has solicitado el sello. Comparte una evidencia de tus políticas de inclusión
            para solicitarlo.
          </p>
        )}

        {!mostrarSolicitud && (sello === null || sello.estado === 'rechazado') && (
          <div className={estilos.acciones}>
            <Boton variante="secundario" onClick={() => setMostrarSolicitud(true)}>
              Solicitar sello de inclusión
            </Boton>
          </div>
        )}

        {mostrarSolicitud && (
          <div className={estilos.solicitudSello}>
            <ErrorGeneral mensaje={errorSello ?? undefined} />
            <Field
              id="evidencia_url"
              label="URL de la evidencia"
              error={undefined}
              requerido
              pista="Vincula un documento público que respalde tus políticas y prácticas de inclusión."
            >
              <TextInput
                type="url"
                inputMode="url"
                value={evidenciaUrl}
                onChange={(evento) => setEvidenciaUrl(evento.target.value)}
                placeholder="https://…"
                maxLength={255}
              />
            </Field>
            <Field id="nivel_sello" label="Nivel" error={undefined}>
              <Select
                value={nivelSello}
                onChange={(evento) => setNivelSello(evento.target.value as NivelSello)}
              >
                {OPCIONES_NIVEL_SELLO.map((opcion) => (
                  <option key={opcion.valor} value={opcion.valor}>
                    {opcion.etiqueta}
                  </option>
                ))}
              </Select>
            </Field>
            <div className={estilos.acciones}>
              <Boton
                cargando={enviandoSello}
                disabled={!evidenciaUrl.trim()}
                onClick={() => void solicitarSello()}
              >
                Enviar solicitud
              </Boton>
              <Boton
                variante="secundario"
                disabled={enviandoSello}
                onClick={() => {
                  setMostrarSolicitud(false);
                  setErrorSello(null);
                }}
              >
                Cancelar
              </Boton>
            </div>
          </div>
        )}
      </section>

      <MensajeExito mensaje={mensaje ?? undefined} />
      <ErrorGeneral mensaje={errors.root?.serverError?.message} />

      <form onSubmit={(event) => void onSubmit(event)} noValidate>
        <Field
          id="nombre_empresa"
          label="Nombre de la empresa"
          error={errors.nombre_empresa?.message}
          requerido
        >
          <TextInput {...register('nombre_empresa')} autoComplete="organization" maxLength={150} />
        </Field>

        <Field
          id="descripcion"
          label="Descripción"
          error={errors.descripcion?.message}
          pista="Qué hace tu empresa, su misión y cultura. Máximo 4000 caracteres."
        >
          <TextArea {...register('descripcion')} rows={6} maxLength={4000} />
        </Field>

        <div className={estilos.fila}>
          <Field
            id="sitio_web"
            label="Sitio web"
            error={errors.sitio_web?.message}
            pista="Por ejemplo https://ejemplo.com"
          >
            <TextInput {...register('sitio_web')} type="url" inputMode="url" maxLength={255} />
          </Field>

          <Field id="ubicacion" label="Ubicación" error={errors.ubicacion?.message}>
            <TextInput
              {...register('ubicacion')}
              placeholder="Ciudad, país"
              autoComplete="address-level2"
              maxLength={150}
            />
          </Field>
        </div>

        <Field
          id="logo_archivo"
          label="Logo"
          error={errorLogo ?? undefined}
          pista={
            <>
              {'PNG, JPG, WebP o SVG, máximo 5 MB. '}
              {logoElegido && `Archivo elegido: ${logoElegido.name}`}
            </>
          }
        >
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.svg"
            onChange={alElegirLogo}
            className={estilosForm.control}
          />
        </Field>

        {logoVista && (
          <img
            className={estilos.previsualizacion}
            src={logoVista}
            alt={logoElegido ? 'Previsualización del nuevo logo' : 'Logo de la empresa'}
          />
        )}

        <div className={estilos.acciones}>
          <Boton type="submit" cargando={isSubmitting}>
            Guardar cambios
          </Boton>
        </div>
      </form>

      <ConfiguracionAccesibilidad />
    </div>
  );
}
