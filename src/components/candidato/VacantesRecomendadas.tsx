import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { recomendacionesApi } from '@/services/api';
import { ApiError } from '@/types/api';
import type { ListadoRecomendaciones } from '@/types/recomendaciones';
import { ETIQUETAS_MODALIDAD, rangoSalarial } from '@/lib/formato';
import { SelloInclusivo } from '@/components/ui/SelloInclusivo';
import { BarraCompatibilidad } from '@/components/ui/BarraCompatibilidad';
import { ErrorGeneral } from '@/components/ui/form/Field';
import { Boton } from '@/components/ui/form/Boton';
import { Spinner } from '@/components/ui/Spinner';
import { paths } from '@/routes/paths';
import { mensajeDe } from '@/lib/erroresFormulario';
import estilos from './vacantesRecomendadas.module.css';

const TOP_RECOMENDADAS = 5;

const CODIGOS_DISPONIBILIDAD = new Set(['EMBEDDINGS_NO_CONFIGURADOS', 'EMBEDDINGS_FALLIDOS']);

export function VacantesRecomendadas() {
  const { usuario } = useAuth();
  const idCandidato = usuario?.id_candidato ?? null;

  const [listado, setListado] = useState<ListadoRecomendaciones | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (idCandidato === null) return;
    let cancelado = false;
    setCargando(true);
    setError(null);

    recomendacionesApi
      .listarRecomendadas(idCandidato, { page: 1, limit: TOP_RECOMENDADAS })
      .then((resultado) => {
        if (!cancelado) setListado(resultado);
      })
      .catch((evaluacion: unknown) => {
        if (cancelado) return;
        const codigo = evaluacion instanceof ApiError ? evaluacion.code : '';
        setError(
          CODIGOS_DISPONIBILIDAD.has(codigo)
            ? 'Las recomendaciones aún no están disponibles. Inténtalo de nuevo en unos minutos.'
            : mensajeDe(evaluacion, 'No pudimos cargar las vacantes recomendadas.'),
        );
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [idCandidato, intento]);

  if (idCandidato === null) return null;

  return (
    <section
      className={estilos.pagina}
      aria-label="Recomendado para ti"
      aria-busy={cargando || undefined}
    >
      <h2 className={estilos.titulo}>Recomendado para ti</h2>
      <p className={estilos.subtitulo}>
        Vacantes activas alineadas con tu perfil, con su nivel de compatibilidad.
      </p>

      {cargando && listado === null && (
        <div className={estilos.cargando}>
          <Spinner label="Buscando vacantes para ti…" />
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

      {!cargando && !error && listado && listado.data.length === 0 && (
        <p className={estilos.vacio}>
          Todavía no hay vacantes recomendadas para ti.
          <Link className={estilos.vacioEnlace} to={paths.vacantes}>
            Explorar todas las vacantes
          </Link>
        </p>
      )}

      {listado && listado.data.length > 0 && (
        <ul className={estilos.lista}>
          {listado.data.map(({ puntaje_match, vacante }) => (
            <li key={vacante.id_vacante}>
              <Link className={estilos.tarjeta} to={`${paths.vacantes}/${vacante.id_vacante}`}>
                <span className={estilos.filaEncabezado}>
                  <span className={estilos.tarjetaTitulo}>{vacante.titulo}</span>
                  <BarraCompatibilidad puntaje={puntaje_match} />
                </span>
                <span className={estilos.filaMeta}>
                  {vacante.empresa.logo_url ? (
                    <img
                      className={estilos.logo}
                      src={vacante.empresa.logo_url}
                      alt=""
                      aria-hidden="true"
                    />
                  ) : null}
                  {vacante.empresa.nombre_empresa}
                  <SelloInclusivo sello={vacante.empresa.sello} />
                </span>
                <span className={estilos.etiquetas}>
                  <span className={estilos.etiqueta}>{ETIQUETAS_MODALIDAD[vacante.modalidad]}</span>
                  {vacante.ubicacion && (
                    <span className={estilos.etiqueta}>{vacante.ubicacion}</span>
                  )}
                  {rangoSalarial(vacante.salario_min, vacante.salario_max) && (
                    <span className={estilos.etiqueta}>
                      {rangoSalarial(vacante.salario_min, vacante.salario_max)}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
