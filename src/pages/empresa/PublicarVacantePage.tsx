import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { catalogosApi, vacantesApi } from '@/services/api';
import {
  OPCIONES_MODALIDAD,
  aPayloadVacante,
  esquemaVacante,
  type ValoresVacante,
} from '@/schemas/vacantes';
import type { AlertaLenguaje, AjusteSugeridoIA, TipoAjusteCatalogo } from '@/types/vacantes';
import { ApiError } from '@/types/api';
import { ErrorGeneral, Field, MensajeExito } from '@/components/ui/form/Field';
import { Select, TextArea, TextInput } from '@/components/ui/form/Controles';
import { Boton, Checkbox } from '@/components/ui/form/Boton';
import { Spinner } from '@/components/ui/Spinner';
import { aplicarErroresDeApi, mensajeDe } from '@/lib/erroresFormulario';
import { paths } from '@/routes/paths';
import estilosForm from '@/components/ui/form/form.module.css';
import estilos from '../perfiles.module.css';
import estilosVacante from '../vacantes/vacantes.module.css';

function cargarCatalogo(): Promise<TipoAjusteCatalogo[]> {
  return catalogosApi.tiposAjuste();
}

function mensajeSugerenciasDe(evaluacion: unknown): string {
  if (evaluacion instanceof ApiError) {
    switch (evaluacion.code) {
      case 'IA_NO_CONFIGURADA':
      case 'IA_FALLIDA':
        return 'La sugerencia de ajustes no está disponible por ahora. Inténtalo de nuevo en unos minutos.';
      default:
        return evaluacion.message;
    }
  }
  return mensajeDe(evaluacion, 'No pudimos generar sugerencias de ajustes.');
}

export function PublicarVacantePage() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ValoresVacante>({
    resolver: zodResolver(esquemaVacante),
    defaultValues: {
      titulo: '',
      descripcion: '',
      modalidad: 'presencial',
      ubicacion: '',
      salario_min: '',
      salario_max: '',
      fecha_cierre: '',
      ajustes: [],
    },
  });

  const [catalogo, setCatalogo] = useState<TipoAjusteCatalogo[] | null>(null);
  const [errorCatalogo, setErrorCatalogo] = useState<string | null>(null);
  const [intentoCatalogo, setIntentoCatalogo] = useState(0);

  const [creada, setCreada] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [alerta, setAlerta] = useState<AlertaLenguaje | null>(null);
  const [alertaReportada, setAlertaReportada] = useState(false);
  const [alertaDescartada, setAlertaDescartada] = useState(false);
  const [alertaAplicada, setAlertaAplicada] = useState(false);
  const [aplicandoAlerta, setAplicandoAlerta] = useState(false);
  const [errorAlerta, setErrorAlerta] = useState<string | null>(null);
  const [sugerencias, setSugerencias] = useState<AjusteSugeridoIA[] | null>(null);
  const [cargandoSugerencias, setCargandoSugerencias] = useState(false);
  const [aplicandoSugerencias, setAplicandoSugerencias] = useState(false);
  const [sugerenciasAplicadas, setSugerenciasAplicadas] = useState(false);
  const [errorSugerencias, setErrorSugerencias] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    setErrorCatalogo(null);

    cargarCatalogo()
      .then((resultado) => {
        if (!cancelado) setCatalogo(resultado);
      })
      .catch((evaluacion: unknown) => {
        if (!cancelado)
          setErrorCatalogo(mensajeDe(evaluacion, 'No pudimos cargar el catálogo de ajustes.'));
      });

    return () => {
      cancelado = true;
    };
  }, [intentoCatalogo]);

  const cargarAnalisisIA = async (
    idVacante: number,
    avisar = false,
    reportada = false,
  ) => {
    setCargandoSugerencias(true);
    setErrorSugerencias(null);

    const [resultadoAlerta, resultadoAjustes] = await Promise.allSettled([
      vacantesApi.alertaLenguaje(idVacante),
      vacantesApi.sugerirAjustes(idVacante),
    ]);

    const alertaObtenida = resultadoAlerta.status === 'fulfilled' ? resultadoAlerta.value : null;
    setAlerta(
      alertaObtenida ??
        (reportada ? { alerta_lenguaje: true, sugerencia_redaccion: null } : null),
    );
    setAlertaDescartada(false);
    setAlertaAplicada(false);
    setErrorAlerta(null);

    if (resultadoAjustes.status === 'fulfilled') {
      const sugerenciasObtenidas = resultadoAjustes.value;
      setSugerencias(sugerenciasObtenidas);
      setSugerenciasAplicadas(false);
      if (sugerenciasObtenidas.length > 0) {
        const ids = new Set(watch('ajustes'));
        for (const sugerencia of sugerenciasObtenidas) ids.add(sugerencia.id_ajuste);
        setValue('ajustes', [...ids], { shouldValidate: true });
        if (avisar) setMensaje('Sugerencias precargadas: desmarca lo que no aplique y guarda.');
      } else if (avisar) {
        setMensaje('No se encontraron ajustes adicionales para sugerir.');
      }
    } else {
      setSugerencias(null);
      setErrorSugerencias(mensajeSugerenciasDe(resultadoAjustes.reason));
    }

    setCargandoSugerencias(false);
  };

  const onSubmit = handleSubmit(async (valores: ValoresVacante) => {
    setMensaje(null);
    setCreada(null);
    setAlerta(null);
    setAlertaReportada(false);
    setAlertaDescartada(false);
    setAlertaAplicada(false);
    setErrorAlerta(null);
    setSugerencias(null);
    setSugerenciasAplicadas(false);
    setErrorSugerencias(null);

    try {
      const vacante = await vacantesApi.crear(aPayloadVacante(valores));
      setCreada(vacante.id_vacante);
      setMensaje('Vacante publicada correctamente.');
      setAlertaReportada(vacante.alerta_lenguaje);
      void cargarAnalisisIA(vacante.id_vacante, false, vacante.alerta_lenguaje);
    } catch (evaluacion) {
      aplicarErroresDeApi(
        evaluacion,
        setError,
        'No se pudo publicar la vacante. Inténtalo de nuevo.',
      );
    }
  });

  const aplicarSugerencia = async () => {
    if (!alerta?.sugerencia_redaccion) return;
    const texto = alerta.sugerencia_redaccion.slice(0, 8000);
    setAplicandoAlerta(true);
    setErrorAlerta(null);
    setValue('descripcion', texto, { shouldValidate: true, shouldDirty: true });

    if (creada !== null) {
      try {
        await vacantesApi.actualizar(creada, { descripcion: texto });
      } catch (evaluacion) {
        setErrorAlerta(
          mensajeDe(evaluacion, 'No se pudo guardar la descripción con la sugerencia aplicada.'),
        );
        setAplicandoAlerta(false);
        return;
      }
    }

    setAlertaAplicada(true);
    setMensaje('Sugerencia de redacción aplicada y guardada en la vacante.');
    setAplicandoAlerta(false);
  };

  const guardarSugerencias = async () => {
    if (creada === null) return;
    setAplicandoSugerencias(true);
    setMensaje(null);
    try {
      const ids = Array.from(new Set(watch('ajustes')));
      await vacantesApi.actualizar(creada, { ajustes: ids });
      setSugerenciasAplicadas(true);
      setMensaje('Los ajustes seleccionados se guardaron en la vacante.');
    } catch (evaluacion) {
      aplicarErroresDeApi(evaluacion, setError, 'No se pudieron guardar los ajustes.');
    } finally {
      setAplicandoSugerencias(false);
    }
  };

  const publicarOtra = () => {
    reset();
    setCreada(null);
    setMensaje(null);
    setAlerta(null);
    setAlertaReportada(false);
    setAlertaDescartada(false);
    setAlertaAplicada(false);
    setErrorAlerta(null);
    setSugerencias(null);
    setSugerenciasAplicadas(false);
    setErrorSugerencias(null);
  };

  return (
    <div className={estilos.pagina}>
      <h1 className={estilos.titulo}>Publicar vacante</h1>
      <p className={estilos.subtitulo}>
        Publica una oferta de empleo y los ajustes razonables que tu empresa ofrece.
      </p>

      <MensajeExito mensaje={mensaje ?? undefined} />
      <ErrorGeneral mensaje={errors.root?.serverError?.message} />

      {creada !== null && (
        <div className={`${estilosVacante.panelIA} ${estilosVacante.sugerencias}`} role="status">
          <p className={estilosVacante.panelIAEnlace}>
            <Link to={`${paths.vacantes}/${creada}`}>Ver la vacante publicada en el listado</Link>
          </p>
          <div className={estilos.acciones}>
            <Boton type="button" variante="secundario" onClick={publicarOtra}>
              Publicar otra vacante
            </Boton>
          </div>
        </div>
      )}

      {sugerencias && (
        <div
          className={`${estilosVacante.panelIA} ${estilosVacante.sugerencias}`}
          aria-live="polite"
        >
          <p className={estilosVacante.panelTitulo}>
            Ajustes razonables sugeridos para esta vacante
          </p>
          <p className={estilosVacante.sugerenciaJustificacion}>
            Las sugerencias ya están marcadas en el formulario: desmarca lo que no aplique y guarda.
          </p>
          {sugerencias.length === 0 ? (
            <p>No hay sugerencias por el momento.</p>
          ) : (
            <>
              {sugerencias.map((sugerencia) => (
                <div key={sugerencia.id_ajuste} className={estilosVacante.sugerencia}>
                  <div className={estilosVacante.sugerenciaNombre}>{sugerencia.nombre_ajuste}</div>
                  <div className={estilosVacante.sugerenciaJustificacion}>
                    {sugerencia.justificacion}
                  </div>
                </div>
              ))}
              <div className={estilos.acciones}>
                <Boton
                  type="button"
                  variante="secundario"
                  cargando={aplicandoSugerencias}
                  disabled={sugerenciasAplicadas || cargandoSugerencias}
                  onClick={() => void guardarSugerencias()}
                >
                  {sugerenciasAplicadas ? 'Ajustes guardados' : 'Guardar ajustes sugeridos'}
                </Boton>
              </div>
            </>
          )}
        </div>
      )}

      <form onSubmit={(event) => void onSubmit(event)} noValidate>
        <Field id="titulo" label="Título del puesto" error={errors.titulo?.message} requerido>
          <TextInput
            {...register('titulo')}
            placeholder="Ej. Desarrollador/a Full Stack"
            maxLength={150}
          />
        </Field>

        <Field id="modalidad" label="Modalidad" error={errors.modalidad?.message} requerido>
          <Select {...register('modalidad')}>
            {OPCIONES_MODALIDAD.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.etiqueta}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          id="ubicacion"
          label="Ubicación"
          error={errors.ubicacion?.message}
          pista="Opcional. Ej. Ciudad de México."
        >
          <TextInput {...register('ubicacion')} placeholder="Ciudad, país" maxLength={150} />
        </Field>

        <div className={estilos.fila}>
          <Field
            id="salario_min"
            label="Salario mínimo"
            error={errors.salario_min?.message}
            pista="Opcional."
          >
            <TextInput
              {...register('salario_min')}
              inputMode="numeric"
              placeholder="25000"
              maxLength={12}
            />
          </Field>
          <Field
            id="salario_max"
            label="Salario máximo"
            error={errors.salario_max?.message}
            pista="Opcional."
          >
            <TextInput
              {...register('salario_max')}
              inputMode="numeric"
              placeholder="40000"
              maxLength={12}
            />
          </Field>
        </div>

        <div className={estilos.fila}>
          <Field
            id="fecha_cierre"
            label="Fecha de cierre de la convocatoria"
            error={errors.fecha_cierre?.message}
            pista="Opcional. Debe ser una fecha futura."
          >
            <input type="date" className={estilosForm.control} {...register('fecha_cierre')} />
          </Field>
        </div>

        <Field
          id="descripcion"
          label="Descripción de la vacante"
          error={errors.descripcion?.message}
          pista="Describe las responsabilidades, requisitos y cultura de la empresa. Máximo 8000 caracteres."
          requerido
        >
          <TextArea {...register('descripcion')} rows={8} maxLength={8000} />
        </Field>

        {alerta?.alerta_lenguaje && !alertaDescartada && !alertaAplicada && (
          <div className={`${estilosVacante.panelIA} ${estilosVacante.avisoOcre}`} role="alert">
            <p className={`${estilosVacante.panelTitulo} ${estilosVacante.avisoOcreTitulo}`}>
              Posible lenguaje excluyente
            </p>
            <p className={estilosVacante.avisoOcreTexto}>
              {alerta.sugerencia_redaccion ??
                'La descripción contiene términos que pueden excluir a ciertos postulantes. Revisa la redacción antes de publicar.'}
            </p>
            <div className={estilos.acciones}>
              {alerta.sugerencia_redaccion && (
                <Boton
                  type="button"
                  cargando={aplicandoAlerta}
                  onClick={() => void aplicarSugerencia()}
                >
                  Aplicar sugerencia
                </Boton>
              )}
              <Boton
                type="button"
                variante="secundario"
                disabled={aplicandoAlerta}
                onClick={() => setAlertaDescartada(true)}
              >
                Descartar aviso
              </Boton>
            </div>
          </div>
        )}
        <ErrorGeneral mensaje={errorAlerta ?? undefined} />

        <fieldset className={estilosVacante.grupoAjustes}>
          <legend className={estilosVacante.grupoAjustesLeyenda}>
            Ajustes razonables ofrecidos
          </legend>
          <p className={estilosForm.pista}>
            Selecciona los ajustes que tu empresa ofrece en este puesto. Tras publicar la vacante,
            la IA puede sugerir ajustes y precargarlos para que los revises antes de guardar.
          </p>

          {errorCatalogo && (
            <>
              <p className={estilosForm.error} role="alert">
                {errorCatalogo}
              </p>
              <Boton
                type="button"
                variante="secundario"
                onClick={() => setIntentoCatalogo((n) => n + 1)}
              >
                Reintentar
              </Boton>
            </>
          )}

          {!errorCatalogo && catalogo === null && <Spinner label="Cargando catálogo de ajustes…" />}

          {catalogo && (
            <div className={estilosVacante.ajustesGrid}>
              {catalogo.map((ajuste) => (
                <Checkbox
                  key={ajuste.id_ajuste}
                  id={`ajuste_${ajuste.id_ajuste}`}
                  etiqueta={ajuste.nombre_ajuste}
                  value={ajuste.id_ajuste}
                  {...register('ajustes', { valueAsNumber: true })}
                />
              ))}
            </div>
          )}

          {errors.ajustes?.message && (
            <p className={estilosForm.error} role="alert">
              {errors.ajustes.message}
            </p>
          )}

          {(catalogo || errorCatalogo) && (
            <div className={estilos.acciones}>
              <Boton
                type="button"
                variante="secundario"
                cargando={cargandoSugerencias}
                disabled={creada === null}
                onClick={() => {
                  if (creada !== null) void cargarAnalisisIA(creada, true, alertaReportada);
                }}
              >
                Sugerir ajustes razonables
              </Boton>
              {creada === null && (
                <span className={estilosForm.pista}>
                  Disponible después de publicar la vacante.
                </span>
              )}
            </div>
          )}
          <ErrorGeneral mensaje={errorSugerencias ?? undefined} />
        </fieldset>

        <div className={estilos.acciones}>
          <Boton type="submit" cargando={isSubmitting}>
            Publicar vacante
          </Boton>
        </div>
      </form>
    </div>
  );
}
