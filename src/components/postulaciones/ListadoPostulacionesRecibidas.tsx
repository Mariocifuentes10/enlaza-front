import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { postulacionesApi } from '@/services/api';
import type {
  EstadoPostulacion,
  ListadoPostulacionesRecibidas,
  EstadoDecisionEmpresa,
  PostulacionRecibida,
} from '@/types/postulaciones';
import {
  ESTADOS_DECISION_EMPRESA,
  ESTADOS_POSTULACION,
  ETIQUETAS_ESTADO_POSTULACION,
} from '@/types/postulaciones';
import { ETIQUETAS_MODALIDAD, formatoFecha, rangoSalarial } from '@/lib/formato';
import { BadgeEstadoPostulacion } from '@/components/ui/BadgeEstadoPostulacion';
import { ErrorGeneral, MensajeExito } from '@/components/ui/form/Field';
import { Select } from '@/components/ui/form/Controles';
import { Boton } from '@/components/ui/form/Boton';
import { Spinner } from '@/components/ui/Spinner';
import { paths } from '@/routes/paths';
import { mensajeDe } from '@/lib/erroresFormulario';
import estilos from '@/pages/postulaciones/postulaciones.module.css';

const RESULTADOS_POR_PAGINA = 50;

const PUNTO_CLASE: Record<EstadoPostulacion, string> = {
  enviada: 'puntoInfo',
  en_revision: 'puntoAviso',
  entrevista: 'puntoPrimario',
  rechazada: 'puntoError',
  contratada: 'puntoExito',
};

function estadoValido(valor: string | null): EstadoPostulacion | undefined {
  return valor && (ESTADOS_POSTULACION as readonly string[]).includes(valor)
    ? (valor as EstadoPostulacion)
    : undefined;
}

export function ListadoPostulacionesRecibidas() {
  const { usuario } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const idEmpresa = usuario?.id_empresa ?? null;

  const estadoUrl = estadoValido(searchParams.get('estado'));
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);

  const [listado, setListado] = useState<ListadoPostulacionesRecibidas | null>(null);
  const [resumen, setResumen] = useState<Record<EstadoPostulacion, number> | null>(null);
  const [totalGlobal, setTotalGlobal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  const [cambiandoId, setCambiandoId] = useState<number | null>(null);
  const [mensajeLinea, setMensajeLinea] = useState<string | null>(null);
  const [errorLinea, setErrorLinea] = useState<string | null>(null);
  const temporizadores = useRef<number[]>([]);

  useEffect(() => {
    const limpiar = temporizadores.current;
    return () => {
      for (const id of limpiar) window.clearTimeout(id);
    };
  }, []);

  useEffect(() => {
    if (idEmpresa === null) return;
    let cancelado = false;
    setCargando(true);
    setError(null);

    Promise.all([
      postulacionesApi.listarRecibidas(idEmpresa, {
        estado: estadoUrl,
        page,
        limit: RESULTADOS_POR_PAGINA,
      }),
      postulacionesApi.listarRecibidas(idEmpresa, { limit: 1 }),
    ])
      .then(([principal, resumenGlobal]) => {
        if (cancelado) return;
        setListado(principal);
        setResumen(resumenGlobal.resumen.por_estado);
        setTotalGlobal(resumenGlobal.total);
      })
      .catch((evaluacion: unknown) => {
        if (!cancelado) setError(mensajeDe(evaluacion, 'No pudimos cargar las postulaciones.'));
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [idEmpresa, estadoUrl, page, intento]);

  const grupos = useMemo(() => {
    if (!listado) return [];
    const orden: number[] = [];
    const mapa = new Map<number, PostulacionRecibida[]>();
    for (const postulacion of listado.data) {
      if (!mapa.has(postulacion.id_vacante)) {
        mapa.set(postulacion.id_vacante, []);
        orden.push(postulacion.id_vacante);
      }
      mapa.get(postulacion.id_vacante)?.push(postulacion);
    }
    return orden.map((idVacante) => {
      const filas = mapa.get(idVacante) ?? [];
      return { id_vacante: idVacante, vacante: filas[0].vacante, postulaciones: filas };
    });
  }, [listado]);

  const seleccionarEstado = (estado: EstadoPostulacion | null) => {
    const params = new URLSearchParams(searchParams);
    if (estado) {
      params.set('estado', estado);
    } else {
      params.delete('estado');
    }
    params.set('page', '1');
    setSearchParams(params, { replace: true });
  };

  const irAPagina = (pagina: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(pagina));
    setSearchParams(params, { replace: true });
  };

  const cambiarEstado = (postulacion: PostulacionRecibida, estado: EstadoDecisionEmpresa) => {
    if (cambiandoId !== null) return;
    setCambiandoId(postulacion.id_postulacion);
    setMensajeLinea(null);
    setErrorLinea(null);

    postulacionesApi
      .cambiarEstado(postulacion.id_postulacion, estado)
      .then((actualizada) => {
        setListado((previo) =>
          previo
            ? {
                ...previo,
                data: previo.data.map((item) =>
                  item.id_postulacion === actualizada.id_postulacion
                    ? { ...item, estado: actualizada.estado }
                    : item,
                ),
              }
            : previo,
        );
        const mensaje = `Estado actualizado a ${ETIQUETAS_ESTADO_POSTULACION[actualizada.estado]}.`;
        setMensajeLinea(mensaje);
        temporizadores.current.push(window.setTimeout(() => setMensajeLinea(null), 5000));
      })
      .catch((evaluacion: unknown) => {
        setErrorLinea(mensajeDe(evaluacion, 'No se pudo actualizar el estado de la postulación.'));
      })
      .finally(() => setCambiandoId(null));
  };

  const totalPaginas = listado ? Math.max(1, Math.ceil(listado.total / RESULTADOS_POR_PAGINA)) : 1;

  if (idEmpresa === null) {
    return (
      <div className={estilos.pagina}>
        <h1 className={estilos.titulo}>Postulaciones recibidas</h1>
        <ErrorGeneral mensaje="No encontramos tu perfil de empresa." />
        <Link className={estilos.vacioEnlace} to={paths.empresa.perfil}>
          Completar mi perfil
        </Link>
      </div>
    );
  }

  return (
    <div className={estilos.pagina}>
      <h1 className={estilos.titulo}>Postulaciones recibidas</h1>
      <p className={estilos.subtitulo}>
        Postulaciones a tus vacantes. Avanza el proceso o decide el resultado de cada candidatura.
      </p>

      {resumen && (
        <div className={estilos.contadores} role="group" aria-label="Postulaciones por estado">
          <button
            type="button"
            className={[estilos.contador, estadoUrl === undefined ? estilos.contadorActivo : '']
              .filter(Boolean)
              .join(' ')}
            aria-pressed={estadoUrl === undefined}
            onClick={() => seleccionarEstado(null)}
          >
            Todas
            <span className={estilos.contadorCantidad}>{totalGlobal}</span>
          </button>
          {ESTADOS_POSTULACION.map((estado) => (
            <button
              key={estado}
              type="button"
              className={[estilos.contador, estadoUrl === estado ? estilos.contadorActivo : '']
                .filter(Boolean)
                .join(' ')}
              aria-pressed={estadoUrl === estado}
              onClick={() => seleccionarEstado(estadoUrl === estado ? null : estado)}
            >
              <span
                className={`${estilos.punto} ${estilos[PUNTO_CLASE[estado]]}`}
                aria-hidden="true"
              />
              {ETIQUETAS_ESTADO_POSTULACION[estado]}
              <span className={estilos.contadorCantidad}>{resumen[estado] ?? 0}</span>
            </button>
          ))}
        </div>
      )}

      {error && (
        <>
          <ErrorGeneral mensaje={error} />
          <Boton type="button" variante="secundario" onClick={() => setIntento((n) => n + 1)}>
            Reintentar
          </Boton>
        </>
      )}

      {!error && (
        <p className={estilos.resultados} aria-live="polite">
          {cargando && listado === null
            ? 'Cargando postulaciones…'
            : listado
              ? `Se encontraron ${listado.total} postulacion${listado.total === 1 ? '' : 'es'}.`
              : ''}
        </p>
      )}

      {cargando && listado === null && (
        <div className={estilos.cargando}>
          <Spinner label="Cargando postulaciones…" />
        </div>
      )}

      {!cargando && listado && listado.data.length === 0 && (
        <p className={estilos.vacio}>
          {estadoUrl
            ? 'No hay postulaciones en ese estado.'
            : 'Aún no has recibido postulaciones a tus vacantes.'}
        </p>
      )}

      {listado && listado.data.length > 0 && (
        <section aria-label="Postulaciones recibidas" aria-busy={cargando || undefined}>
          {grupos.map((grupo) => (
            <div key={grupo.id_vacante} className={estilos.grupo}>
              <div className={estilos.grupoEncabezado}>
                <Link className={estilos.tituloEnlace} to={`${paths.vacantes}/${grupo.id_vacante}`}>
                  {grupo.vacante.titulo}
                </Link>
                <div className={estilos.grupoMeta}>
                  <span className={estilos.etiqueta}>
                    {ETIQUETAS_MODALIDAD[grupo.vacante.modalidad]}
                  </span>
                  {rangoSalarial(grupo.vacante.salario_min, grupo.vacante.salario_max) && (
                    <span className={estilos.etiqueta}>
                      {rangoSalarial(grupo.vacante.salario_min, grupo.vacante.salario_max)}
                    </span>
                  )}
                  <span>
                    {grupo.postulaciones.length}{' '}
                    {grupo.postulaciones.length === 1 ? 'postulación' : 'postulaciones'}
                  </span>
                </div>
              </div>

              <div className={estilos.grupoCuerpo}>
                {grupo.postulaciones.map((postulacion) => {
                  const terminal =
                    postulacion.estado === 'rechazada' || postulacion.estado === 'contratada';
                  const deshabilitado = terminal || cambiandoId === postulacion.id_postulacion;
                  return (
                    <article
                      key={postulacion.id_postulacion}
                      className={estilos.postulante}
                      aria-busy={cambiandoId === postulacion.id_postulacion || undefined}
                    >
                      <div className={estilos.filaEncabezado}>
                        <span className={estilos.postulanteNombre}>
                          {postulacion.candidato.nombre_completo}
                        </span>
                        <BadgeEstadoPostulacion estado={postulacion.estado} />
                      </div>
                      <div className={estilos.filaMeta}>
                        {postulacion.candidato.ubicacion && (
                          <span>{postulacion.candidato.ubicacion}</span>
                        )}
                        {postulacion.candidato.telefono && (
                          <span>{postulacion.candidato.telefono}</span>
                        )}
                        {postulacion.puntaje_match !== null &&
                          postulacion.puntaje_match !== undefined && (
                            <span className={estilos.puntaje}>
                              Compatibilidad {Math.round(postulacion.puntaje_match)}%
                            </span>
                          )}
                      </div>

                      {postulacion.candidato.resumen_perfil && (
                        <p className={estilos.postulanteResumen}>
                          {postulacion.candidato.resumen_perfil}
                        </p>
                      )}

                      {(postulacion.candidato.habilidades.length > 0 ||
                        postulacion.candidato.ajustes.length > 0 ||
                        (postulacion.candidato.visible_discapacidad &&
                          postulacion.candidato.tipo_discapacidad)) && (
                        <div className={estilos.chips}>
                          {postulacion.candidato.visible_discapacidad &&
                            postulacion.candidato.tipo_discapacidad && (
                              <span className={estilos.chipDiscapacidad}>
                                Discapacidad: {postulacion.candidato.tipo_discapacidad}
                              </span>
                            )}
                          {postulacion.candidato.habilidades.map((habilidad) => (
                            <span
                              key={`${postulacion.id_postulacion}-h-${habilidad.id_habilidad}`}
                              className={estilos.chip}
                            >
                              {habilidad.nombre_habilidad}
                            </span>
                          ))}
                          {postulacion.candidato.ajustes.map((ajuste) => (
                            <span
                              key={`${postulacion.id_postulacion}-a-${ajuste.id_ajuste}`}
                              className={estilos.chipAjuste}
                            >
                              {ajuste.nombre_ajuste}
                            </span>
                          ))}
                        </div>
                      )}

                      {postulacion.candidato.cv_url && (
                        <div className={estilos.filaPie}>
                          <a
                            className={estilos.enlaceCv}
                            href={postulacion.candidato.cv_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Ver CV
                          </a>
                          <span>Postulada el {formatoFecha(postulacion.fecha_postulacion)}</span>
                        </div>
                      )}

                      <div className={estilos.filaSelector}>
                        <Select
                          className={estilos.selector}
                          aria-label={`Cambiar estado de ${postulacion.candidato.nombre_completo}`}
                          value={postulacion.estado}
                          disabled={deshabilitado}
                          onChange={(evento) =>
                            cambiarEstado(postulacion, evento.target.value as EstadoDecisionEmpresa)
                          }
                        >
                          <option value={postulacion.estado} disabled>
                            {ETIQUETAS_ESTADO_POSTULACION[postulacion.estado]}
                          </option>
                          {ESTADOS_DECISION_EMPRESA.filter(
                            (estado) => estado !== postulacion.estado,
                          ).map((estado) => (
                            <option key={estado} value={estado}>
                              {ETIQUETAS_ESTADO_POSTULACION[estado]}
                            </option>
                          ))}
                        </Select>
                        {cambiandoId === postulacion.id_postulacion && (
                          <span className={estilos.selectorNota} role="status">
                            Guardando…
                          </span>
                        )}
                        {terminal && (
                          <span className={estilos.selectorNota}>
                            Proceso cerrado; no se admiten más cambios.
                          </span>
                        )}
                      </div>

                      {errorLinea && (
                        <div className={estilos.mensajeFila}>
                          <ErrorGeneral mensaje={errorLinea} />
                        </div>
                      )}
                      {mensajeLinea && (
                        <div className={estilos.mensajeFila}>
                          <MensajeExito mensaje={mensajeLinea} />
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      )}

      {listado && listado.total > 0 && (
        <nav className={estilos.paginacion} aria-label="Paginación">
          <Boton
            type="button"
            variante="secundario"
            onClick={() => irAPagina(page - 1)}
            disabled={page <= 1}
          >
            Anterior
          </Boton>
          <span className={estilos.paginacionInfo}>
            Página {page} de {totalPaginas}
          </span>
          <Boton
            type="button"
            variante="secundario"
            onClick={() => irAPagina(page + 1)}
            disabled={page >= totalPaginas}
          >
            Siguiente
          </Boton>
        </nav>
      )}
    </div>
  );
}
