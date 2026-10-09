import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { selloApi } from '@/services/api';
import { ETIQUETAS_NIVEL_SELLO, type EstadoSello, type SolicitudSello } from '@/types/sello';
import { mensajeDe } from '@/lib/erroresFormulario';
import { formatoFecha } from '@/lib/formato';
import { ErrorGeneral } from '@/components/ui/form/Field';
import { Boton } from '@/components/ui/form/Boton';
import { Spinner } from '@/components/ui/Spinner';
import estilosPerfil from '../perfiles.module.css';
import estilosVacante from '../vacantes/vacantes.module.css';
import estilos from './sello.module.css';

const OPCIONES_ESTADO: Array<{ valor: EstadoSello; etiqueta: string }> = [
  { valor: 'pendiente', etiqueta: 'Pendientes' },
  { valor: 'aprobado', etiqueta: 'Aprobadas' },
  { valor: 'rechazado', etiqueta: 'Rechazadas' },
];

interface FilaSolicitudProps {
  solicitud: SolicitudSello;
  onRevisada: () => void;
}

function FilaSolicitud({ solicitud, onRevisada }: FilaSolicitudProps) {
  const [rechazando, setRechazando] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendiente = solicitud.estado === 'pendiente';

  const aprobar = async () => {
    setError(null);
    setCargando(true);
    try {
      await selloApi.revisar(solicitud.id_sello, { estado: 'aprobado' });
      onRevisada();
    } catch (evaluacion) {
      setError(mensajeDe(evaluacion, 'No se pudo aprobar la solicitud.'));
    } finally {
      setCargando(false);
    }
  };

  const rechazar = async (evento: FormEvent) => {
    evento.preventDefault();
    if (!motivo.trim()) return;
    setError(null);
    setCargando(true);
    try {
      await selloApi.revisar(solicitud.id_sello, {
        estado: 'rechazado',
        motivo_rechazo: motivo.trim(),
      });
      onRevisada();
    } catch (evaluacion) {
      setError(mensajeDe(evaluacion, 'No se pudo rechazar la solicitud.'));
    } finally {
      setCargando(false);
    }
  };

  return (
    <li className={estilos.fila}>
      <div className={estilos.empresa}>
        {solicitud.empresa.logo_url && (
          <img
            className={estilos.logo}
            src={solicitud.empresa.logo_url}
            alt=""
            aria-hidden="true"
          />
        )}
        <div>
          <p className={estilos.empresaNombre}>{solicitud.empresa.nombre_empresa}</p>
          <p className={estilosVacante.textoMuted}>
            {solicitud.empresa.ubicacion ?? 'Sin ubicación'}
          </p>
        </div>
      </div>

      <span className={estilos.nivel}>Nivel {ETIQUETAS_NIVEL_SELLO[solicitud.nivel]}</span>

      {solicitud.evidencia_url && (
        <a
          className={estilos.enlace}
          href={solicitud.evidencia_url}
          target="_blank"
          rel="noreferrer"
        >
          Ver evidencia
        </a>
      )}

      {solicitud.fecha_verificacion && (
        <span className={estilosVacante.textoMuted}>
          Revisada el {formatoFecha(solicitud.fecha_verificacion)}
        </span>
      )}

      {solicitud.motivo_rechazo && (
        <p className={estilos.motivo}>Motivo: {solicitud.motivo_rechazo}</p>
      )}

      <div className={estilos.acciones}>
        {pendiente ? (
          <>
            <Boton variante="secundario" cargando={cargando} onClick={() => void aprobar()}>
              Aprobar
            </Boton>
            {!rechazando ? (
              <Boton
                variante="secundario"
                disabled={cargando}
                onClick={() => {
                  setRechazando(true);
                  setError(null);
                }}
              >
                Rechazar
              </Boton>
            ) : (
              <form className={estilos.rechazo} onSubmit={(evento) => void rechazar(evento)}>
                <input
                  className={estilos.rechazoEntrada}
                  value={motivo}
                  onChange={(evento) => setMotivo(evento.target.value)}
                  placeholder="Motivo del rechazo"
                  aria-label="Motivo del rechazo"
                  maxLength={255}
                  required
                />
                <Boton type="submit" cargando={cargando}>
                  Confirmar
                </Boton>
                <Boton
                  type="button"
                  variante="secundario"
                  disabled={cargando}
                  onClick={() => setRechazando(false)}
                >
                  Cancelar
                </Boton>
              </form>
            )}
          </>
        ) : (
          <span className={estilos.estado}>{solicitud.estado}</span>
        )}
      </div>

      {error && (
        <p className={estilos.error} role="alert">
          {error}
        </p>
      )}
    </li>
  );
}

export function SelloPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const parametro = searchParams.get('estado') ?? 'pendiente';
  const estado = OPCIONES_ESTADO.some((opcion) => opcion.valor === parametro)
    ? (parametro as EstadoSello)
    : 'pendiente';

  const [solicitudes, setSolicitudes] = useState<SolicitudSello[] | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    selloApi
      .listar(estado)
      .then((listado) => {
        if (!cancelado) setSolicitudes(listado.data);
      })
      .catch((evaluacion: unknown) => {
        if (!cancelado) setError(mensajeDe(evaluacion, 'No se pudieron cargar las solicitudes.'));
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [estado, intento]);

  const cambiarEstado = (siguiente: EstadoSello) => {
    setSearchParams({ estado: siguiente });
  };

  const recargar = () => setIntento((n) => n + 1);

  return (
    <div className={estilosPerfil.pagina}>
      <h1 className={estilosPerfil.titulo}>Solicitudes de sello de inclusión</h1>
      <p className={estilosPerfil.subtitulo}>
        Revisa la evidencia y aprueba o rechaza el sello solicitado por cada empresa.
      </p>

      <div className={estilos.tabs} role="group" aria-label="Filtrar por estado">
        {OPCIONES_ESTADO.map((opcion) => (
          <button
            key={opcion.valor}
            type="button"
            className={`${estilos.tab} ${estado === opcion.valor ? estilos.tabActiva : ''}`}
            aria-pressed={estado === opcion.valor}
            onClick={() => cambiarEstado(opcion.valor)}
          >
            {opcion.etiqueta}
          </button>
        ))}
      </div>

      <ErrorGeneral mensaje={error ?? undefined} />

      {cargando && (
        <div className={estilosPerfil.cargando}>
          <Spinner label="Cargando solicitudes…" />
        </div>
      )}

      {!cargando && error && (
        <div className={estilosPerfil.acciones}>
          <Boton variante="secundario" onClick={recargar}>
            Reintentar
          </Boton>
        </div>
      )}

      {!cargando && solicitudes && solicitudes.length === 0 && !error && (
        <p className={estilosVacante.vacio}>No hay solicitudes en este estado.</p>
      )}

      {!cargando && solicitudes && solicitudes.length > 0 && (
        <ul className={estilos.lista}>
          {solicitudes.map((solicitud) => (
            <FilaSolicitud key={solicitud.id_sello} solicitud={solicitud} onRevisada={recargar} />
          ))}
        </ul>
      )}
    </div>
  );
}
