import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '@/services/api';
import { paths } from '@/routes/paths';
import type { EstadisticasAdmin } from '@/types/admin';
import { mensajeDe } from '@/lib/erroresFormulario';
import { ErrorGeneral } from '@/components/ui/form/Field';
import { Boton } from '@/components/ui/form/Boton';
import { Spinner } from '@/components/ui/Spinner';
import estilos from './admin.module.css';

interface TarjetaProps {
  etiqueta: string;
  valor: number;
  pie?: string;
}

function Tarjeta({ etiqueta, valor, pie }: TarjetaProps) {
  return (
    <div className={estilos.tarjeta}>
      <span className={estilos.tarjetaEtiqueta}>{etiqueta}</span>
      <span className={estilos.tarjetaValor}>{valor}</span>
      {pie ? <span className={estilos.tarjetaPie}>{pie}</span> : null}
    </div>
  );
}

export function DashboardAdminPage() {
  const [datos, setDatos] = useState<EstadisticasAdmin | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    adminApi
      .estadisticas()
      .then((estadisticas) => {
        if (!cancelado) setDatos(estadisticas);
      })
      .catch((evaluacion: unknown) => {
        if (!cancelado) setError(mensajeDe(evaluacion, 'No se pudieron cargar las estadísticas.'));
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [intento]);

  return (
    <div className={estilos.pagina}>
      <div className={estilos.cabecera}>
        <div>
          <h1 className={estilos.titulo}>Panel de administración</h1>
          <p className={estilos.subtitulo}>
            Resumen general de la actividad de la plataforma Enlaza.
          </p>
        </div>
      </div>

      <ErrorGeneral mensaje={error ?? undefined} />

      {cargando ? (
        <div className={estilos.cargando}>
          <Spinner label="Cargando estadísticas…" />
        </div>
      ) : null}

      {!cargando && error ? (
        <Boton variante="secundario" onClick={() => setIntento((n) => n + 1)}>
          Reintentar
        </Boton>
      ) : null}

      {!cargando && datos ? (
        <>
          <section aria-label="Usuarios">
            <div className={estilos.rejilla}>
              <Tarjeta etiqueta="Usuarios totales" valor={datos.usuarios.total} />
              <Tarjeta etiqueta="Candidatos" valor={datos.usuarios.candidatos} />
              <Tarjeta etiqueta="Empresas" valor={datos.usuarios.empresas} />
              <Tarjeta etiqueta="Mentores" valor={datos.usuarios.mentores} />
              <Tarjeta
                etiqueta="Cuentas activas"
                valor={datos.usuarios.activos}
                pie={`${datos.usuarios.inactivos} inactivas`}
              />
            </div>
          </section>

          <section aria-label="Contenido">
            <div className={estilos.rejilla}>
              <Tarjeta
                etiqueta="Vacantes publicadas"
                valor={datos.vacantes.total}
                pie={`${datos.vacantes.activas} activas`}
              />
              <Tarjeta etiqueta="Postulaciones" valor={datos.postulaciones.total} />
              <Tarjeta etiqueta="Sellos pendientes" valor={datos.sellos.pendientes} />
              <Tarjeta etiqueta="Sellos aprobados" valor={datos.sellos.aprobados} />
            </div>
          </section>

          <section aria-label="Accesos rápidos">
            <div className={estilos.enlaces}>
              <Link className={estilos.enlace} to={paths.admin.usuarios}>
                Gestionar usuarios
              </Link>
              <Link className={estilos.enlace} to={paths.admin.empresas}>
                Gestionar empresas
              </Link>
              <Link className={estilos.enlace} to={paths.admin.sello}>
                Revisar sellos pendientes
              </Link>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
