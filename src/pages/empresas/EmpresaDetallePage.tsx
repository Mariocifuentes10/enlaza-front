import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { empresasApi, resenasApi } from '@/services/api';
import { ApiError } from '@/types/api';
import type { EmpresaResumen } from '@/types/empresas';
import { ETIQUETAS_CALIFICACION, OPCIONES_CALIFICACION, type Resena } from '@/types/resenas';
import { mensajeDe } from '@/lib/erroresFormulario';
import { formatoFecha } from '@/lib/formato';
import { ErrorGeneral, Field, MensajeExito } from '@/components/ui/form/Field';
import { Select, TextArea } from '@/components/ui/form/Controles';
import { Boton } from '@/components/ui/form/Boton';
import { Spinner } from '@/components/ui/Spinner';
import { SelloInclusivo } from '@/components/ui/SelloInclusivo';
import { paths } from '@/routes/paths';
import estilosVacante from '../vacantes/vacantes.module.css';
import estilos from './empresaDetalle.module.css';

function Estrellas({ valor }: { valor: number }) {
  const completas = Math.round(valor);
  return (
    <span className={estilos.estrellas} role="img" aria-label={`Calificación ${valor} de 5`}>
      <span aria-hidden="true">
        {'★'.repeat(completas)}
        {'☆'.repeat(5 - completas)}
      </span>
    </span>
  );
}

export function EmpresaDetallePage() {
  const { id } = useParams();
  const idEmpresa = Number(id);
  const { usuario } = useAuth();

  const [empresa, setEmpresa] = useState<EmpresaResumen | null>(null);
  const [resenas, setResenas] = useState<Resena[] | null>(null);
  const [promedio, setPromedio] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  const [calificacion, setCalificacion] = useState('5');
  const [comentario, setComentario] = useState('');
  const [escribiendo, setEscribiendo] = useState(false);
  const [errorResena, setErrorResena] = useState<string | null>(null);
  const [guardada, setGuardada] = useState(false);
  const [yaResenada, setYaResenada] = useState(false);

  useEffect(() => {
    if (!idEmpresa) {
      setCargando(false);
      setError('Empresa no válida.');
      return;
    }
    let cancelado = false;
    setCargando(true);
    setError(null);

    Promise.all([empresasApi.resumen(idEmpresa), resenasApi.listar(idEmpresa)])
      .then(([resumen, listado]) => {
        if (cancelado) return;
        setEmpresa(resumen);
        setResenas(listado.data);
        setPromedio(listado.promedio);
      })
      .catch((evaluacion: unknown) => {
        if (cancelado) return;
        setError(mensajeDe(evaluacion, 'No se pudo cargar el perfil de la empresa.'));
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [idEmpresa, intento]);

  const enviarResena = async () => {
    setErrorResena(null);
    setGuardada(false);
    setEscribiendo(true);
    try {
      await resenasApi.crear(idEmpresa, {
        calificacion: Number(calificacion),
        comentario: comentario.trim() || null,
      });
      setGuardada(true);
      setComentario('');
      const listado = await resenasApi.listar(idEmpresa);
      setResenas(listado.data);
      setPromedio(listado.promedio);
    } catch (evaluacion) {
      if (evaluacion instanceof ApiError) {
        if (evaluacion.code === 'RESENA_NO_PERMITIDA') {
          setErrorResena(
            'Solo puedes reseñar empresas con las que hayas tenido una entrevista o hayas sido contratado.',
          );
          return;
        }
        if (evaluacion.code === 'RESENA_YA_EXISTE') {
          setYaResenada(true);
          setErrorResena('Ya publicaste una reseña de esta empresa.');
          return;
        }
      }
      setErrorResena(mensajeDe(evaluacion, 'No se pudo publicar la reseña.'));
    } finally {
      setEscribiendo(false);
    }
  };

  if (cargando) {
    return (
      <div className={estilosVacante.cargando}>
        <Spinner label="Cargando el perfil de la empresa…" />
      </div>
    );
  }

  if (error || !empresa) {
    return (
      <div className={estilosVacante.pagina}>
        <Link className={estilosVacante.volver} to={paths.vacantes}>
          ← Volver a vacantes
        </Link>
        <ErrorGeneral mensaje={error ?? 'No encontramos el perfil de la empresa.'} />
        {error && (
          <div className={estilosVacante.acciones}>
            <Boton variante="secundario" onClick={() => setIntento((n) => n + 1)}>
              Reintentar
            </Boton>
          </div>
        )}
      </div>
    );
  }

  const puedeResenar = usuario?.tipo_usuario === 'candidato' && !yaResenada;

  return (
    <article className={estilosVacante.pagina}>
      <Link className={estilosVacante.volver} to={paths.vacantes}>
        ← Volver a vacantes
      </Link>

      <header>
        <div className={estilosVacante.detalleEmpresa}>
          {empresa.logo_url && (
            <img
              className={`${estilosVacante.logo} ${estilosVacante.logoGrande}`}
              src={empresa.logo_url}
              alt=""
              aria-hidden="true"
            />
          )}
          <h1 className={estilosVacante.detalleTitulo}>{empresa.nombre_empresa}</h1>
          <SelloInclusivo sello={empresa.sello} />
        </div>

        <div className={estilosVacante.detalleMeta}>
          {empresa.ubicacion && (
            <span className={estilosVacante.etiqueta}>{empresa.ubicacion}</span>
          )}
          {empresa.sitio_web && (
            <a
              className={estilos.sitioWeb}
              href={empresa.sitio_web}
              target="_blank"
              rel="noreferrer"
            >
              Sitio web
            </a>
          )}
        </div>
      </header>

      <section className={estilosVacante.seccion} aria-label="Acerca de la empresa">
        <h2 className={estilosVacante.seccionTitulo}>Acerca de la empresa</h2>
        <p className={estilosVacante.descripcion}>
          {empresa.descripcion ?? 'Esta empresa aún no comparte una descripción.'}
        </p>
      </section>

      <section className={estilosVacante.seccion} aria-label="Reseñas de la empresa">
        <h2 className={estilosVacante.seccionTitulo}>Reseñas</h2>

        {resenas && resenas.length > 0 && promedio !== null ? (
          <p className={estilos.promedio}>
            <Estrellas valor={promedio} />
            <span>
              {promedio.toFixed(1)} de 5 · {resenas.length}{' '}
              {resenas.length === 1 ? 'reseña' : 'reseñas'}
            </span>
          </p>
        ) : (
          <p className={estilos.promedio}>Aún no hay calificaciones.</p>
        )}

        {resenas && resenas.length > 0 ? (
          <div>
            {resenas.map((resena) => (
              <div key={resena.id_resena} className={estilos.resena}>
                <div className={estilos.resenaCabeza}>
                  <Estrellas valor={resena.calificacion} />
                  <span className={estilos.resenaAutor}>{resena.candidato.nombre_completo}</span>
                  <span className={estilos.resenaFecha}>{formatoFecha(resena.fecha_resena)}</span>
                </div>
                {resena.comentario && (
                  <p className={estilos.resenaComentario}>{resena.comentario}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className={estilosVacante.vacio}>Aún no hay reseñas de esta empresa.</p>
        )}

        {puedeResenar && (
          <div className={estilos.formularioResena}>
            <h3 className={estilos.formularioTitulo}>Escribe una reseña</h3>
            <ErrorGeneral mensaje={errorResena ?? undefined} />
            <MensajeExito
              mensaje={guardada ? 'Gracias por tu reseña. Se publicó correctamente.' : undefined}
            />
            <Field id="calificacion" label="Calificación (1 a 5)" error={undefined} requerido>
              <Select
                value={calificacion}
                onChange={(evento) => setCalificacion(evento.target.value)}
              >
                {OPCIONES_CALIFICACION.map((valor) => (
                  <option key={valor} value={valor}>
                    {valor} — {ETIQUETAS_CALIFICACION[valor]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              id="comentario"
              label="Comentario"
              error={undefined}
              pista="Opcional. Máximo 4000 caracteres. Comparte tu experiencia."
            >
              <TextArea
                value={comentario}
                onChange={(evento) => setComentario(evento.target.value)}
                rows={4}
                maxLength={4000}
              />
            </Field>
            <div className={estilos.accionesResena}>
              <Boton cargando={escribiendo} onClick={() => void enviarResena()}>
                Publicar reseña
              </Boton>
            </div>
          </div>
        )}

        {usuario?.tipo_usuario === 'candidato' && yaResenada && (
          <p className={estilosVacante.textoMuted}>Ya publicaste una reseña de esta empresa.</p>
        )}
      </section>
    </article>
  );
}
