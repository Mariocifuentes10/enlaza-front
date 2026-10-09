import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '@/services/api';
import type { EmpresaAdmin, EstadoSelloFiltroAdmin, FiltrosEmpresasAdmin } from '@/types/admin';
import { paths } from '@/routes/paths';
import { mensajeDe } from '@/lib/erroresFormulario';
import { formatoFecha } from '@/lib/formato';
import { ErrorGeneral } from '@/components/ui/form/Field';
import { Boton } from '@/components/ui/form/Boton';
import { Spinner } from '@/components/ui/Spinner';
import { Paginacion } from './Paginacion';
import estilos from './admin.module.css';

const LIMITE = 20;

const ETIQUETAS_SELLO: Record<string, string> = {
  basico: 'Básico',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};

function clasesSello(estado: string | null): string {
  if (estado === 'aprobado') return `${estilos.badge} ${estilos.badgeSelloAprobado}`;
  if (estado === 'pendiente') return `${estilos.badge} ${estilos.badgeSelloPendiente}`;
  if (estado === 'rechazado') return `${estilos.badge} ${estilos.badgeSelloRechazado}`;
  return estilos.badge;
}

export function EmpresasPage() {
  const [filtros, setFiltros] = useState<FiltrosEmpresasAdmin>({ page: 1, limit: LIMITE });
  const [busqueda, setBusqueda] = useState('');
  const [empresas, setEmpresas] = useState<EmpresaAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    adminApi
      .empresas(filtros)
      .then((listado) => {
        if (cancelado) return;
        setEmpresas(listado.data);
        setTotal(listado.total);
      })
      .catch((evaluacion: unknown) => {
        if (!cancelado) setError(mensajeDe(evaluacion, 'No se pudieron cargar las empresas.'));
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [filtros]);

  useEffect(() => cargar(), [cargar]);

  const buscar = (evento: FormEvent) => {
    evento.preventDefault();
    setFiltros((previos) => ({ ...previos, busqueda: busqueda.trim() || undefined, page: 1 }));
  };

  const cambiarFiltro = (cambios: Partial<FiltrosEmpresasAdmin>) => {
    setFiltros((previos) => ({ ...previos, ...cambios, page: 1 }));
  };

  const page = filtros.page ?? 1;
  const mostrarPaginacion = !cargando && !error && total > 0;

  return (
    <div className={estilos.pagina}>
      <div className={estilos.cabecera}>
        <div>
          <h1 className={estilos.titulo}>Empresas</h1>
          <p className={estilos.subtitulo}>Administra las empresas registradas en la plataforma.</p>
        </div>
      </div>

      <div className={estilos.panel}>
        <form className={estilos.barra} onSubmit={buscar}>
          <label className={`${estilos.campo} ${estilos.crecer}`}>
            <span className={estilos.campoEtiqueta}>Buscar por nombre o correo</span>
            <input
              className={estilos.entrada}
              type="search"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Nombre de empresa"
            />
          </label>

          <label className={estilos.campo}>
            <span className={estilos.campoEtiqueta}>Sello</span>
            <select
              className={estilos.select}
              value={filtros.sello ?? ''}
              onChange={(evento) =>
                cambiarFiltro({
                  sello: (evento.target.value || undefined) as EstadoSelloFiltroAdmin | undefined,
                })
              }
            >
              <option value="">Todos</option>
              <option value="aprobado">Aprobado</option>
              <option value="pendiente">Pendiente</option>
              <option value="rechazado">Rechazado</option>
              <option value="sin_sello">Sin sello</option>
            </select>
          </label>

          <Boton type="submit">Buscar</Boton>
        </form>

        <ErrorGeneral mensaje={error ?? undefined} />

        {cargando ? (
          <div className={estilos.cargando}>
            <Spinner label="Cargando empresas…" />
          </div>
        ) : null}

        {!cargando && !error && empresas.length === 0 ? (
          <p className={estilos.vacio}>No se encontraron empresas con esos filtros.</p>
        ) : null}

        {!cargando && empresas.length > 0 ? (
          <div className={estilos.tablaContenedor}>
            <table className={estilos.tabla}>
              <thead>
                <tr>
                  <th scope="col">Empresa</th>
                  <th scope="col">Correo</th>
                  <th scope="col">Ubicación</th>
                  <th scope="col">Vacantes</th>
                  <th scope="col">Sello</th>
                  <th scope="col">Registro</th>
                  <th scope="col">Ver</th>
                </tr>
              </thead>
              <tbody>
                {empresas.map((empresa) => (
                  <tr key={empresa.id_empresa}>
                    <td>
                      <div className={estilos.celdaPrincipal}>
                        {empresa.logo_url ? (
                          <img
                            className={estilos.logo}
                            src={empresa.logo_url}
                            alt=""
                            aria-hidden="true"
                          />
                        ) : null}
                        <span className={estilos.nombre}>{empresa.nombre_empresa}</span>
                      </div>
                    </td>
                    <td className={estilos.muted}>{empresa.correo}</td>
                    <td className={estilos.muted}>{empresa.ubicacion ?? '—'}</td>
                    <td>{empresa.total_vacantes}</td>
                    <td>
                      {empresa.sello_estado ? (
                        <span className={clasesSello(empresa.sello_estado)}>
                          {empresa.sello_estado === 'aprobado' && empresa.sello_nivel
                            ? `Aprobado · ${ETIQUETAS_SELLO[empresa.sello_nivel] ?? empresa.sello_nivel}`
                            : empresa.sello_estado}
                        </span>
                      ) : (
                        <span className={estilos.badge}>Sin sello</span>
                      )}
                    </td>
                    <td className={estilos.muted}>{formatoFecha(empresa.fecha_creacion)}</td>
                    <td>
                      <Link
                        className={estilos.enlace}
                        to={paths.empresaDetalle.replace(':id', String(empresa.id_empresa))}
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {mostrarPaginacion ? (
          <Paginacion
            page={page}
            limit={filtros.limit ?? LIMITE}
            total={total}
            onCambiar={(nueva) => setFiltros((previos) => ({ ...previos, page: nueva }))}
          />
        ) : null}
      </div>
    </div>
  );
}
