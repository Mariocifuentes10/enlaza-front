import { useEffect, useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { archivosApi, candidatosApi } from '@/services/api';
import {
  OPCIONES_DISCAPACIDAD,
  esquemaPerfilCandidato,
  type ValoresPerfilCandidato,
} from '@/schemas/formularios';
import { ErrorGeneral, Field, MensajeExito } from '@/components/ui/form/Field';
import { Select, TextArea, TextInput } from '@/components/ui/form/Controles';
import { Boton, Checkbox } from '@/components/ui/form/Boton';
import { Spinner } from '@/components/ui/Spinner';
import { ConfiguracionAccesibilidad } from '@/components/ui/ConfiguracionAccesibilidad';
import { aplicarErroresDeApi, mensajeDe } from '@/lib/erroresFormulario';
import type { CandidatoActualizar, CandidatoPerfil } from '@/types/perfil';
import estilosForm from '@/components/ui/form/form.module.css';
import estilos from '../perfiles.module.css';

const CV_FORMATOS_ACEPTADOS = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const TAMANO_MAXIMO = 5 * 1024 * 1024;

const aValores = (perfil: CandidatoPerfil): ValoresPerfilCandidato => ({
  nombre_completo: perfil.nombre_completo,
  telefono: perfil.telefono ?? '',
  ubicacion: perfil.ubicacion ?? '',
  resumen_perfil: perfil.resumen_perfil ?? '',
  tipo_discapacidad: perfil.tipo_discapacidad ?? '',
  visible_discapacidad: perfil.visible_discapacidad,
});

export function PerfilPage() {
  const { usuario } = useAuth();
  const idCandidato = usuario?.id_candidato ?? null;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<ValoresPerfilCandidato>({
    resolver: zodResolver(esquemaPerfilCandidato),
    defaultValues: {
      nombre_completo: '',
      telefono: '',
      ubicacion: '',
      resumen_perfil: '',
      tipo_discapacidad: '',
      visible_discapacidad: false,
    },
  });

  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [cvActual, setCvActual] = useState<string | null>(null);
  const [cvElegido, setCvElegido] = useState<File | null>(null);
  const [errorCv, setErrorCv] = useState<string | null>(null);

  useEffect(() => {
    if (!idCandidato) {
      setCargando(false);
      return;
    }
    let cancelado = false;
    candidatosApi
      .obtener(idCandidato)
      .then((perfil) => {
        if (cancelado) return;
        reset(aValores(perfil));
        setCvActual(perfil.cv_url);
      })
      .catch((error: unknown) => {
        if (cancelado) return;
        setMensaje(mensajeDe(error, 'No pudimos cargar tu perfil.'));
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [idCandidato, reset]);

  const alElegirCv = (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0] ?? null;
    setErrorCv(null);
    setCvElegido(null);

    if (!archivo) return;
    if (!CV_FORMATOS_ACEPTADOS.includes(archivo.type)) {
      setErrorCv('Formato no permitido: usa PDF o Word (.pdf, .doc, .docx).');
      evento.target.value = '';
      return;
    }
    if (archivo.size > TAMANO_MAXIMO) {
      setErrorCv('El archivo supera el máximo de 5 MB.');
      evento.target.value = '';
      return;
    }
    setCvElegido(archivo);
  };

  const onSubmit = handleSubmit(async (valores) => {
    setMensaje(null);
    setErrorCv(null);
    if (!idCandidato) return;

    try {
      let cvUrl: string | null | undefined;

      if (cvElegido) {
        const subido = await archivosApi.subir(cvElegido, 'cv');
        cvUrl = subido.url;
      }

      const cambios: CandidatoActualizar = {};
      if (dirtyFields.nombre_completo) cambios.nombre_completo = valores.nombre_completo.trim();
      if (dirtyFields.telefono) cambios.telefono = valores.telefono.trim() || null;
      if (dirtyFields.ubicacion) cambios.ubicacion = valores.ubicacion.trim() || null;
      if (dirtyFields.resumen_perfil)
        cambios.resumen_perfil = valores.resumen_perfil.trim() || null;
      if (dirtyFields.tipo_discapacidad)
        cambios.tipo_discapacidad = valores.tipo_discapacidad || null;
      if (dirtyFields.visible_discapacidad)
        cambios.visible_discapacidad = valores.visible_discapacidad;
      if (cvUrl !== undefined) cambios.cv_url = cvUrl;

      if (Object.keys(cambios).length === 0) {
        setMensaje('No hay cambios por guardar.');
        return;
      }

      const perfil = await candidatosApi.actualizar(idCandidato, cambios);
      reset(aValores(perfil));
      setCvActual(perfil.cv_url);
      setCvElegido(null);
      setMensaje('Cambios guardados.');
    } catch (error) {
      aplicarErroresDeApi(error, setError, 'No se pudieron guardar los cambios.');
    }
  });

  if (cargando) {
    return (
      <div className={estilos.cargando}>
        <Spinner label="Cargando tu perfil…" />
      </div>
    );
  }

  if (!idCandidato) {
    return (
      <div className={estilos.pagina}>
        <h1 className={estilos.titulo}>Mi perfil</h1>
        <ErrorGeneral mensaje="No encontramos tu perfil de candidato. Contacta al administrador." />
      </div>
    );
  }

  return (
    <div className={estilos.pagina}>
      <h1 className={estilos.titulo}>Mi perfil</h1>
      <p className={estilos.subtitulo}>
        Mantén tu perfil actualizado para recibir mejores recomendaciones de vacantes.
      </p>

      <MensajeExito mensaje={mensaje ?? undefined} />
      <ErrorGeneral mensaje={errors.root?.serverError?.message} />

      <form onSubmit={(event) => void onSubmit(event)} noValidate>
        <Field
          id="nombre_completo"
          label="Nombre completo"
          error={errors.nombre_completo?.message}
          requerido
        >
          <TextInput {...register('nombre_completo')} autoComplete="name" />
        </Field>

        <div className={estilos.fila}>
          <Field id="telefono" label="Teléfono" error={errors.telefono?.message}>
            <TextInput {...register('telefono')} type="tel" autoComplete="tel" maxLength={20} />
          </Field>

          <Field id="ubicacion" label="Ubicación" error={errors.ubicacion?.message}>
            <TextInput
              {...register('ubicacion')}
              autoComplete="address-level2"
              placeholder="Ciudad, país"
              maxLength={150}
            />
          </Field>
        </div>

        <Field
          id="resumen_perfil"
          label="Resumen profesional"
          error={errors.resumen_perfil?.message}
          pista="Cuéntanos sobre tu experiencia, habilidades y qué tipo de oportunidades buscas. Máximo 4000 caracteres."
        >
          <TextArea {...register('resumen_perfil')} rows={6} maxLength={4000} />
        </Field>

        <Field
          id="cv_archivo"
          label="CV (currículum)"
          error={errorCv ?? undefined}
          pista={
            <>
              {'PDF o Word (.pdf, .doc, .docx), máximo 5 MB. '}
              {cvActual && (
                <a
                  className={estilos.archivoActual}
                  href={cvActual}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver CV actual
                </a>
              )}
              {cvElegido && ` · Archivo elegido: ${cvElegido.name}`}
            </>
          }
        >
          <input
            type="file"
            accept=".pdf,.doc,.docx,application/pdf"
            onChange={alElegirCv}
            className={estilosForm.control}
          />
        </Field>

        <fieldset className={estilos.privado}>
          <legend className={estilos.privadoLeyenda}>Información privada</legend>
          <span className={estilos.privadoNota} id="nota-privacidad">
            Este dato solo lo ves tú y los administradores de Enlaza. No se muestra a las empresas a
            menos que actives la opción de compartirlo.
          </span>

          <Field
            id="tipo_discapacidad"
            label="Tipo de discapacidad (opcional)"
            error={errors.tipo_discapacidad?.message}
            pista="Puedes dejarlo en «Prefiero no decirlo»."
          >
            <Select {...register('tipo_discapacidad')}>
              {OPCIONES_DISCAPACIDAD.map((opcion) => (
                <option key={opcion.valor} value={opcion.valor}>
                  {opcion.etiqueta}
                </option>
              ))}
            </Select>
          </Field>

          <Checkbox
            id="visible_discapacidad"
            etiqueta="Compartir este dato con las empresas"
            {...register('visible_discapacidad')}
            error={errors.visible_discapacidad?.message}
          />
        </fieldset>

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
