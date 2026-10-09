import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { postulacionesApi, vacantesApi } from '@/services/api';
import type { Postulacion } from '@/types/postulaciones';
import type { Vacante } from '@/types/vacantes';
import { ApiError } from '@/types/api';
import { ETIQUETAS_MODALIDAD, formatoFecha, rangoSalarial } from '@/lib/formato';
import { SelloInclusivo } from '@/components/ui/SelloInclusivo';
import { BadgeEstadoPostulacion } from '@/components/ui/BadgeEstadoPostulacion';
import { ErrorGeneral, MensajeExito } from '@/components/ui/form/Field';
import { Boton } from '@/components/ui/form/Boton';
import { Spinner } from '@/components/ui/Spinner';
import { paths } from '@/routes/paths';
import { mensajeDe } from '@/lib/erroresFormulario';
import estilosDetalle from './vacantes.module.css';

export function VacanteDetallePage() {
  const { id } = useParams();
  const idVacante = Number(id);
  const { estado, usuario } = useAuth();
  const navigate = useNavigate();

  const esCandidato = usuario?.tipo_usuario === 'candidato';
  const esAnonimo = estado === 'anonimo';

  const [vacante, setVacante] = useState<Vacante | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [miPostulacion, setMiPostulacion] = useState<Postulacion | null>(null);
  const [revisandoPostulacion, setRevisandoPostulacion] = useState(false);
  const [postulando, setPostulando] = useState(false);
  const [mensajePostulacion, setMensajePostulacion] = useState<string | null>(null);
  const [errorPostulacion, setErrorPostulacion] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isInteger(idVacante) || idVacante <= 0) {
      setError('Vacante no encontrada.');
      setCargando(false);
      return;
    }

    let cancelado = false;
    setCargando(true);
    setError(null);

    vacantesApi
      .obtener(idVacante)
      .then((resultado) => {
        if (!cancelado) setVacante(resultado);
      })
      .catch((evaluacion: unknown) => {
        if (!cancelado) setError(mensajeDe(evaluacion, 'No pudimos cargar la vacante.'));
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [idVacante]);

  const verificarPostulacion = useCallback(
    async (idVacanteActiva: number): Promise<Postulacion | null> => {
      if (!usuario?.id_candidato) return null;
      const resultado = await postulacionesApi
        .listarDeCandidato(usuario.id_candidato, { limit: 50, page: 1 })
        .catch(() => null);
      const encontrada =
        resultado?.data.find((postulacion) => postulacion.id_vacante === idVacanteActiva) ?? null;
      setMiPostulacion(encontrada);
      return encontrada;
    },
    [usuario?.id_candidato],
  );

  useEffect(() => {
    if (!esCandidato || !usuario?.id_candidato || !vacante) return;
    let cancelado = false;
    setRevisandoPostulacion(true);
    postulacionesApi
      .listarDeCandidato(usuario.id_candidato, { limit: 50, page: 1 })
      .then((resultado) => {
        if (cancelado) return;
        setMiPostulacion(
          resultado.data.find((postulacion) => postulacion.id_vacante === vacante.id_vacante) ??
            null,
        );
      })
      .catch(() => {
        if (!cancelado) setMiPostulacion(null);
      })
      .finally(() => {
        if (!cancelado) setRevisandoPostulacion(false);
      });

    return () => {
      cancelado = true;
    };
  }, [esCandidato, usuario?.id_candidato, vacante]);

  const postularme = async () => {
    if (!vacante || postulando) return;
    setPostulando(true);
    setMensajePostulacion(null);
    setErrorPostulacion(null);

    try {
      const creada = await postulacionesApi.crear(vacante.id_vacante);
      setMiPostulacion(creada);
      setMensajePostulacion('Postulación enviada. La empresa recibió tu candidatura.');
    } catch (evaluacion) {
      if (evaluacion instanceof ApiError && evaluacion.code === 'YA_POSTULADO') {
        const encontrada = await verificarPostulacion(vacante.id_vacante);
        if (!encontrada) {
          setMensajePostulacion('Ya te habías postulado a esta vacante.');
        }
      } else {
        setErrorPostulacion(
          mensajeDe(evaluacion, 'No se pudo enviar la postulación. Inténtalo de nuevo.'),
        );
      }
    } finally {
      setPostulando(false);
    }
  };

  if (cargando) {
    return (
      <div className={estilosDetalle.cargando}>
        <Spinner label="Cargando la vacante…" />
      </div>
    );
  }

  if (error || !vacante) {
    return (
      <div className={estilosDetalle.pagina}>
        <Link className={estilosDetalle.volver} to={paths.vacantes}>
          ← Volver a vacantes
        </Link>
        <ErrorGeneral mensaje={error ?? 'No encontramos la vacante solicitada.'} />
      </div>
    );
  }

  return (
    <article className={estilosDetalle.pagina}>
      <Link className={estilosDetalle.volver} to={paths.vacantes}>
        ← Volver a vacantes
      </Link>

      <header>
        <h1 className={estilosDetalle.detalleTitulo}>{vacante.titulo}</h1>
        <div className={estilosDetalle.detalleEmpresa}>
          {vacante.empresa.logo_url ? (
            <img
              className={`${estilosDetalle.logo} ${estilosDetalle.logoGrande}`}
              src={vacante.empresa.logo_url}
              alt=""
              aria-hidden="true"
            />
          ) : null}
          <Link
            to={paths.empresaDetalle.replace(':id', String(vacante.empresa.id_empresa))}
            className={estilosDetalle.empresaPerfil}
          >
            {vacante.empresa.nombre_empresa}
          </Link>
          <SelloInclusivo sello={vacante.empresa.sello} />
        </div>
        <div className={estilosDetalle.detalleMeta}>
          <span className={`${estilosDetalle.etiqueta} ${estilosDetalle.etiquetaModalidad}`}>
            {ETIQUETAS_MODALIDAD[vacante.modalidad]}
          </span>
          {vacante.ubicacion && (
            <span className={estilosDetalle.etiqueta}>{vacante.ubicacion}</span>
          )}
          {rangoSalarial(vacante.salario_min, vacante.salario_max) && (
            <span className={estilosDetalle.etiqueta}>
              {rangoSalarial(vacante.salario_min, vacante.salario_max)}
            </span>
          )}
          <span className={estilosDetalle.etiqueta}>
            Publicada el {formatoFecha(vacante.fecha_publicacion)}
          </span>
          {vacante.fecha_cierre && (
            <span className={estilosDetalle.etiqueta}>
              Cierra el {formatoFecha(vacante.fecha_cierre)}
            </span>
          )}
        </div>
      </header>

      <section className={estilosDetalle.seccion} aria-label="Descripción del puesto">
        <h2 className={estilosDetalle.seccionTitulo}>Descripción</h2>
        <p className={estilosDetalle.descripcion}>{vacante.descripcion}</p>
      </section>

      {vacante.ajustes.length > 0 && (
        <fieldset className={estilosDetalle.seccion}>
          <legend className={estilosDetalle.seccionTitulo}>Ajustes razonables ofrecidos</legend>
          {vacante.ajustes.map((ajuste) => (
            <div key={ajuste.id_ajuste} className={estilosDetalle.ajuste}>
              <div className={estilosDetalle.ajusteNombre}>{ajuste.nombre_ajuste}</div>
              {ajuste.descripcion && (
                <div className={estilosDetalle.ajusteDesc}>{ajuste.descripcion}</div>
              )}
            </div>
          ))}
        </fieldset>
      )}

      {esCandidato && (
        <section className={estilosDetalle.seccion} aria-label="Postulación">
          <h2 className={estilosDetalle.seccionTitulo}>¿Te interesa esta vacante?</h2>

          {revisandoPostulacion && (
            <p className={estilosDetalle.textoMuted} role="status">
              Verificando tu postulación…
            </p>
          )}

          {miPostulacion && (
            <>
              <div className={estilosDetalle.filaPostulacion}>
                <BadgeEstadoPostulacion estado={miPostulacion.estado} />
                <span className={estilosDetalle.textoMuted}>
                  Te postulaste el {formatoFecha(miPostulacion.fecha_postulacion)}.
                </span>
                {miPostulacion.puntaje_match !== null &&
                  miPostulacion.puntaje_match !== undefined && (
                    <span className={estilosDetalle.puntaje}>
                      Compatibilidad {Math.round(miPostulacion.puntaje_match)}%
                    </span>
                  )}
              </div>
              <Link className={estilosDetalle.volver} to={paths.candidato.postulaciones}>
                Ver en mis postulaciones
              </Link>
            </>
          )}

          {!miPostulacion && !revisandoPostulacion && (
            <>
              <MensajeExito mensaje={mensajePostulacion ?? undefined} />
              <ErrorGeneral mensaje={errorPostulacion ?? undefined} />
              {vacante.estado === 'activa' ? (
                <Boton type="button" cargando={postulando} onClick={() => void postularme()}>
                  Postularme
                </Boton>
              ) : (
                <p className={estilosDetalle.textoMuted}>
                  Esta vacante ya no está activa y no acepta postulaciones.
                </p>
              )}
            </>
          )}
        </section>
      )}

      {esAnonimo && (
        <section className={estilosDetalle.seccion} aria-label="Postulación">
          <h2 className={estilosDetalle.seccionTitulo}>¿Te interesa esta vacante?</h2>
          <Boton
            type="button"
            variante="secundario"
            onClick={() =>
              navigate(
                `${paths.login}?redir=${encodeURIComponent(`${paths.vacantes}/${vacante.id_vacante}`)}`,
              )
            }
          >
            Inicia sesión para postularte
          </Boton>
        </section>
      )}
    </article>
  );
}
