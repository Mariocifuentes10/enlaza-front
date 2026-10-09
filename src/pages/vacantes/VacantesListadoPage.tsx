import { useEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { vacantesApi } from '@/services/api';
import type { ListadoVacantes, ModalidadVacante } from '@/types/vacantes';
import { OPCIONES_MODALIDAD } from '@/schemas/vacantes';
import { ETIQUETAS_MODALIDAD, rangoSalarial } from '@/lib/formato';
import { SelloInclusivo } from '@/components/ui/SelloInclusivo';
import { ErrorGeneral, Field } from '@/components/ui/form/Field';
import { Select, TextInput } from '@/components/ui/form/Controles';
import { Boton } from '@/components/ui/form/Boton';
import { Spinner } from '@/components/ui/Spinner';
import { paths } from '@/routes/paths';
import { mensajeDe } from '@/lib/erroresFormulario';
import estilos from './vacantes.module.css';

const RESULTADOS_POR_PAGINA = 10;

export function VacantesListadoPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const textoUrl = searchParams.get('texto') ?? '';
  const ubicacionUrl = searchParams.get('ubicacion') ?? '';
  const modalidadUrl = (searchParams.get('modalidad') ?? '') as ModalidadVacante | '';
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);

  const [campoTexto, setCampoTexto] = useState(textoUrl);
  const [campoUbicacion, setCampoUbicacion] = useState(ubicacionUrl);
  const [campoModalidad, setCampoModalidad] = useState(modalidadUrl);

  const [listado, setListado] = useState<ListadoVacantes | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    setCampoTexto(textoUrl);
    setCampoUbicacion(ubicacionUrl);
    setCampoModalidad(modalidadUrl);
  }, [textoUrl, ubicacionUrl, modalidadUrl]);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    vacantesApi
      .buscar({
        texto: textoUrl || undefined,
        ubicacion: ubicacionUrl || undefined,
        modalidad: modalidadUrl || undefined,
        page,
        limit: RESULTADOS_POR_PAGINA,
      })
      .then((resultado) => {
        if (!cancelado) setListado(resultado);
      })
      .catch((evaluacion: unknown) => {
        if (!cancelado) setError(mensajeDe(evaluacion, 'No pudimos cargar las vacantes.'));
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [textoUrl, ubicacionUrl, modalidadUrl, page, intento]);

  const aplicarFiltros = (evento: FormEvent) => {
    evento.preventDefault();
    const params = new URLSearchParams();
    if (campoTexto.trim()) params.set('texto', campoTexto.trim());
    if (campoUbicacion.trim()) params.set('ubicacion', campoUbicacion.trim());
    if (campoModalidad) params.set('modalidad', campoModalidad);
    params.set('page', '1');
    setSearchParams(params, { replace: true });
  };

  const limpiarFiltros = () => {
    setCampoTexto('');
    setCampoUbicacion('');
    setCampoModalidad('');
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const irAPagina = (pagina: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(pagina));
    setSearchParams(params, { replace: true });
  };

  const totalPaginas = listado ? Math.max(1, Math.ceil(listado.total / RESULTADOS_POR_PAGINA)) : 1;
  const hayFiltros = textoUrl !== '' || ubicacionUrl !== '' || modalidadUrl !== '';

  return (
    <div className={estilos.pagina}>
      <form onSubmit={aplicarFiltros} noValidate>
        <div className={estilos.filtros} role="group" aria-label="Filtros de búsqueda">
          <div className={estilos.filtro}>
            <Field id="filtro-texto" label="Texto">
              <TextInput
                value={campoTexto}
                placeholder="Puesto, tecnología…"
                maxLength={200}
                onChange={(evento) => setCampoTexto(evento.target.value)}
              />
            </Field>
          </div>
          <div className={estilos.filtro}>
            <Field id="filtro-ubicacion" label="Ubicación">
              <TextInput
                value={campoUbicacion}
                placeholder="Ciudad, país…"
                maxLength={150}
                onChange={(evento) => setCampoUbicacion(evento.target.value)}
              />
            </Field>
          </div>
          <div className={estilos.filtro}>
            <Field id="filtro-modalidad" label="Modalidad">
              <Select
                value={campoModalidad}
                onChange={(evento) =>
                  setCampoModalidad(evento.target.value as ModalidadVacante | '')
                }
              >
                <option value="">Todas</option>
                {OPCIONES_MODALIDAD.map((opcion) => (
                  <option key={opcion.valor} value={opcion.valor}>
                    {opcion.etiqueta}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className={estilos.filtroAccion}>
            <Boton type="submit">Buscar</Boton>
          </div>
          {hayFiltros && (
            <div className={estilos.filtroAccion}>
              <Boton type="button" variante="secundario" onClick={limpiarFiltros}>
                Limpiar filtros
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
            ? 'Buscando vacantes…'
            : listado
              ? `Se encontraron ${listado.total} vacante${listado.total === 1 ? '' : 's'}.`
              : ''}
        </p>
      )}

      {cargando && listado === null && (
        <div className={estilos.cargando}>
          <Spinner label="Buscando vacantes…" />
        </div>
      )}

      {!cargando && listado && listado.data.length === 0 && (
        <p className={estilos.vacio}>
          No se encontraron vacantes con esos filtros. Prueba con otros términos.
        </p>
      )}

      {listado && listado.data.length > 0 && (
        <section aria-label="Resultados de la búsqueda" aria-busy={cargando || undefined}>
          {listado.data.map((vacante) => (
            <Link
              key={vacante.id_vacante}
              to={`${paths.vacantes}/${vacante.id_vacante}`}
              className={estilos.tarjeta}
            >
              <span className={estilos.tarjetaTitulo}>{vacante.titulo}</span>
              <span className={estilos.tarjetaEmpresa}>
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
                <span className={`${estilos.etiqueta} ${estilos.etiquetaModalidad}`}>
                  {ETIQUETAS_MODALIDAD[vacante.modalidad]}
                </span>
                {vacante.ubicacion && <span className={estilos.etiqueta}>{vacante.ubicacion}</span>}
              </span>
              <span className={estilos.tarjetaPie}>
                <span>
                  {rangoSalarial(vacante.salario_min, vacante.salario_max) ??
                    'Salario no especificado'}
                </span>
                {vacante.ajustes.length > 0 && (
                  <span
                    className={estilos.chips}
                    role="group"
                    aria-label="Ajustes razonables ofrecidos"
                  >
                    {vacante.ajustes.slice(0, 3).map((ajuste) => (
                      <span key={ajuste.id_ajuste} className={estilos.chipAjuste}>
                        {ajuste.nombre_ajuste}
                      </span>
                    ))}
                    {vacante.ajustes.length > 3 && (
                      <span className={estilos.chipAjuste}>+{vacante.ajustes.length - 3}</span>
                    )}
                  </span>
                )}
              </span>
            </Link>
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
