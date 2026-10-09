import { useEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { postulacionesApi } from '@/services/api';
import type { EstadoPostulacion, ListadoPostulaciones } from '@/types/postulaciones';
import { ESTADOS_POSTULACION, ETIQUETAS_ESTADO_POSTULACION } from '@/types/postulaciones';
import { ETIQUETAS_MODALIDAD, formatoFecha, rangoSalarial } from '@/lib/formato';
import { BadgeEstadoPostulacion } from '@/components/ui/BadgeEstadoPostulacion';
import { SelloInclusivo } from '@/components/ui/SelloInclusivo';
import { ErrorGeneral, Field } from '@/components/ui/form/Field';
import { Select } from '@/components/ui/form/Controles';
import { Boton } from '@/components/ui/form/Boton';
import { Spinner } from '@/components/ui/Spinner';
import { paths } from '@/routes/paths';
import { mensajeDe } from '@/lib/erroresFormulario';
import estilos from '@/pages/postulaciones/postulaciones.module.css';

const RESULTADOS_POR_PAGINA = 10;

function estadoValido(valor: string | null): EstadoPostulacion | undefined {
  return valor && (ESTADOS_POSTULACION as readonly string[]).includes(valor)
    ? (valor as EstadoPostulacion)
    : undefined;
}

interface PropiedadesListadoPostulacionesCandidato {
  titulo?: string;
  nivelTitulo?: 'h1' | 'h2';
}

export function ListadoPostulacionesCandidato({
  titulo = 'Mis postulaciones',
  nivelTitulo = 'h1',
}: PropiedadesListadoPostulacionesCandidato) {
  const { usuario } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const idCandidato = usuario?.id_candidato ?? null;

  const Titulo = nivelTitulo === 'h1' ? 'h1' : 'h2';
  const claseTitulo =
    nivelTitulo === 'h1' ? estilos.titulo : `${estilos.titulo} ${estilos.tituloSeccion}`;

  const estadoUrl = estadoValido(searchParams.get('estado'));
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);

  const [campoEstado, setCampoEstado] = useState<EstadoPostulacion | ''>(estadoUrl ?? '');
  const [listado, setListado] = useState<ListadoPostulaciones | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    setCampoEstado(estadoUrl ?? '');
  }, [estadoUrl]);

  useEffect(() => {
    if (idCandidato === null) return;
    let cancelado = false;
    setCargando(true);
    setError(null);

    postulacionesApi
      .listarDeCandidato(idCandidato, {
        estado: estadoUrl,
        page,
        limit: RESULTADOS_POR_PAGINA,
      })
      .then((resultado) => {
        if (!cancelado) setListado(resultado);
      })
      .catch((evaluacion: unknown) => {
        if (!cancelado) setError(mensajeDe(evaluacion, 'No pudimos cargar tus postulaciones.'));
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [idCandidato, estadoUrl, page, intento]);

  const aplicarFiltro = (evento: FormEvent) => {
    evento.preventDefault();
    const params = new URLSearchParams();
    if (campoEstado) params.set('estado', campoEstado);
    params.set('page', '1');
    setSearchParams(params, { replace: true });
  };

  const limpiarFiltro = () => {
    setCampoEstado('');
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const irAPagina = (pagina: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(pagina));
    setSearchParams(params, { replace: true });
  };

  const totalPaginas = listado ? Math.max(1, Math.ceil(listado.total / RESULTADOS_POR_PAGINA)) : 1;

  if (idCandidato === null) {
    return (
      <div className={estilos.pagina}>
        <Titulo className={claseTitulo}>{titulo}</Titulo>
        <ErrorGeneral mensaje="No encontramos tu perfil de candidato." />
        <Link className={estilos.vacioEnlace} to={paths.candidato.perfil}>
          Completar mi perfil
        </Link>
      </div>
    );
  }

  return (
    <div className={estilos.pagina}>
      <Titulo className={claseTitulo}>{titulo}</Titulo>
      <p className={estilos.subtitulo}>Sigue el estado de las vacantes a las que te postulaste.</p>

      <form onSubmit={aplicarFiltro} noValidate>
        <div className={estilos.filtros} role="group" aria-label="Filtro de postulaciones">
          <div className={estilos.filtro}>
            <Field id="filtro-estado" label="Estado">
              <Select
                value={campoEstado}
                onChange={(evento) => setCampoEstado(evento.target.value as EstadoPostulacion | '')}
              >
                <option value="">Todos</option>
                {ESTADOS_POSTULACION.map((estado) => (
                  <option key={estado} value={estado}>
                    {ETIQUETAS_ESTADO_POSTULACION[estado]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className={estilos.filtro}>
            <Boton type="submit">Filtrar</Boton>
          </div>
          {estadoUrl && (
            <div className={estilos.filtro}>
              <Boton type="button" variante="secundario" onClick={limpiarFiltro}>
                Limpiar filtro
              </Boton>
            </div>
          )}
        </div>
      </form>

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
            ? 'Cargando tus postulaciones…'
            : listado
              ? `Tienes ${listado.total} postulacion${listado.total === 1 ? '' : 'es'}.`
              : ''}
        </p>
      )}

      {cargando && listado === null && (
        <div className={estilos.cargando}>
          <Spinner label="Cargando tus postulaciones…" />
        </div>
      )}

      {!cargando && listado && listado.data.length === 0 && (
        <p className={estilos.vacio}>
          {estadoUrl
            ? 'No tienes postulaciones en ese estado.'
            : 'Aún no te has postulado a ninguna vacante.'}
          {!estadoUrl && (
            <Link className={estilos.vacioEnlace} to={paths.vacantes}>
              Explorar vacantes
            </Link>
          )}
        </p>
      )}

      {listado && listado.data.length > 0 && (
        <section aria-label="Tus postulaciones" aria-busy={cargando || undefined}>
          {listado.data.map((postulacion) => (
            <article key={postulacion.id_postulacion} className={estilos.tarjeta}>
              <div className={estilos.filaEncabezado}>
                <Link
                  className={estilos.tituloEnlace}
                  to={`${paths.vacantes}/${postulacion.id_vacante}`}
                >
                  {postulacion.vacante.titulo}
                </Link>
                <BadgeEstadoPostulacion estado={postulacion.estado} />
              </div>
              <div className={estilos.filaMeta}>
                {postulacion.vacante.empresa.logo_url ? (
                  <img
                    className={estilos.logo}
                    src={postulacion.vacante.empresa.logo_url}
                    alt=""
                    aria-hidden="true"
                  />
                ) : null}
                <Link
                  className={estilos.empresaEnlace}
                  to={paths.empresaDetalle.replace(
                    ':id',
                    String(postulacion.vacante.empresa.id_empresa),
                  )}
                >
                  {postulacion.vacante.empresa.nombre_empresa}
                </Link>
                <SelloInclusivo sello={postulacion.vacante.empresa.sello} />
              </div>
              <span className={estilos.etiquetas}>
                <span className={estilos.etiqueta}>
                  {ETIQUETAS_MODALIDAD[postulacion.vacante.modalidad]}
                </span>
                {postulacion.vacante.ubicacion && (
                  <span className={estilos.etiqueta}>{postulacion.vacante.ubicacion}</span>
                )}
                {rangoSalarial(
                  postulacion.vacante.salario_min,
                  postulacion.vacante.salario_max,
                ) && (
                  <span className={estilos.etiqueta}>
                    {rangoSalarial(
                      postulacion.vacante.salario_min,
                      postulacion.vacante.salario_max,
                    )}
                  </span>
                )}
              </span>
              <div className={estilos.filaPie}>
                <span>Postulada el {formatoFecha(postulacion.fecha_postulacion)}</span>
                {postulacion.puntaje_match !== null && postulacion.puntaje_match !== undefined && (
                  <span className={estilos.puntaje}>
                    Compatibilidad {Math.round(postulacion.puntaje_match)}%
                  </span>
                )}
              </div>
            </article>
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
