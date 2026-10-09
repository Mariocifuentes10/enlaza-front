import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { mentoresApi } from '@/services/api';
import { ApiError } from '@/types/api';
import type { Mentor } from '@/types/mentores';
import { mensajeDe } from '@/lib/erroresFormulario';
import { ErrorGeneral, Field, MensajeExito } from '@/components/ui/form/Field';
import { TextArea, TextInput } from '@/components/ui/form/Controles';
import { Boton } from '@/components/ui/form/Boton';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import estilosForm from '@/components/ui/form/form.module.css';
import estilosPerfil from '../perfiles.module.css';
import estilos from './mentores.module.css';

function textoMentor(mentor: Mentor): string {
  return [
    mentor.candidato.nombre_completo,
    mentor.candidato.ubicacion,
    mentor.candidato.resumen_perfil,
    mentor.biografia,
  ]
    .filter((parte) => parte)
    .join(' ')
    .toLowerCase();
}

export function MentoresPage() {
  const { usuario } = useAuth();
  const [mentores, setMentores] = useState<Mentor[] | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  const [filtro, setFiltro] = useState('');
  const [seleccionado, setSeleccionado] = useState<Mentor | null>(null);
  const [fechaSesion, setFechaSesion] = useState('');
  const [notas, setNotas] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errorAgendar, setErrorAgendar] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    mentoresApi
      .listar()
      .then((lista) => {
        if (!cancelado) setMentores(lista);
      })
      .catch((evaluacion: unknown) => {
        if (!cancelado) setError(mensajeDe(evaluacion, 'No se pudieron cargar los mentores.'));
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [intento]);

  const filtrados = useMemo(() => {
    if (!mentores) return [];
    if (!filtro.trim()) return mentores;
    const termino = filtro.trim().toLowerCase();
    return mentores.filter((mentor) => textoMentor(mentor).includes(termino));
  }, [mentores, filtro]);

  const recargar = () => setIntento((n) => n + 1);

  const abrirAgendar = (mentor: Mentor) => {
    setSeleccionado(mentor);
    setFechaSesion('');
    setNotas('');
    setErrorAgendar(null);
  };

  const agendar = async () => {
    if (!seleccionado) return;
    setErrorAgendar(null);
    setEnviando(true);
    try {
      const mentoria = await mentoresApi.agendar({
        id_mentor: seleccionado.id_mentor,
        fecha_sesion: fechaSesion.trim() ? new Date(fechaSesion).toISOString() : null,
        notas: notas.trim() || null,
      });
      setMensaje(`Mentoría agendada con ${mentoria.mentor.candidato.nombre_completo}.`);
      setSeleccionado(null);
    } catch (evaluacion) {
      if (evaluacion instanceof ApiError) {
        if (evaluacion.code === 'NO_AUTO_MENTORIA') {
          setErrorAgendar('No puedes agendar una mentoría contigo mismo.');
          return;
        }
        if (evaluacion.code === 'MENTOR_NO_ENCONTRADO') {
          setErrorAgendar('El mentor ya no está disponible.');
          return;
        }
      }
      setErrorAgendar(mensajeDe(evaluacion, 'No se pudo agendar la mentoría.'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={estilosPerfil.pagina}>
      <h1 className={estilosPerfil.titulo}>Mentores</h1>
      <p className={estilosPerfil.subtitulo}>
        Encuentra un mentor con experiencia en inclusión laboral y agenda una sesión.
      </p>

      <MensajeExito mensaje={mensaje ?? undefined} />
      <ErrorGeneral mensaje={error ?? undefined} />

      {cargando && (
        <div className={estilosPerfil.cargando}>
          <Spinner label="Cargando mentores…" />
        </div>
      )}

      {!cargando && error && (
        <div className={estilosPerfil.acciones}>
          <Boton variante="secundario" onClick={recargar}>
            Reintentar
          </Boton>
        </div>
      )}

      {!cargando && !error && mentores && (
        <>
          <div className={estilos.filtro}>
            <Field id="filtro-mentores" label="Buscar mentores">
              <TextInput
                value={filtro}
                onChange={(evento) => setFiltro(evento.target.value)}
                placeholder="Nombre, ubicación, perfil…"
                maxLength={150}
              />
            </Field>
          </div>

          <p className={estilos.resultados}>
            {filtrados.length === 0
              ? 'Sin resultados para tu búsqueda.'
              : `${filtrados.length} ${filtrados.length === 1 ? 'mentor disponible' : 'mentores disponibles'}`}
          </p>

          {filtrados.length > 0 ? (
            <div className={estilos.grilla}>
              {filtrados.map((mentor) => {
                const soyYo = usuario?.id_candidato === mentor.id_candidato;
                return (
                  <article key={mentor.id_mentor} className={estilos.tarjeta}>
                    <h2 className={estilos.tarjetaNombre}>{mentor.candidato.nombre_completo}</h2>
                    {mentor.candidato.ubicacion && (
                      <p className={estilos.tarjetaMeta}>{mentor.candidato.ubicacion}</p>
                    )}
                    {mentor.candidato.resumen_perfil && (
                      <p className={estilos.tarjetaTexto}>{mentor.candidato.resumen_perfil}</p>
                    )}
                    {mentor.biografia && <p className={estilos.tarjetaMeta}>{mentor.biografia}</p>}
                    <div className={estilos.acciones}>
                      {soyYo ? (
                        <span className={estilos.eresTu}>Eres tú</span>
                      ) : (
                        <Boton variante="secundario" onClick={() => abrirAgendar(mentor)}>
                          Agendar mentoría
                        </Boton>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className={estilos.sinResultados}>No hay mentores disponibles por el momento.</p>
          )}
        </>
      )}

      <Modal
        abierto={seleccionado !== null}
        titulo={
          seleccionado
            ? `Agendar mentoría con ${seleccionado.candidato.nombre_completo}`
            : 'Agendar mentoría'
        }
        onCerrar={() => setSeleccionado(null)}
      >
        <ErrorGeneral mensaje={errorAgendar ?? undefined} />
        <Field
          id="fecha_sesion"
          label="Fecha de la sesión"
          error={undefined}
          pista="Opcional. Si la dejas vacía, el mentor te contactará para coordinarla."
        >
          <input
            type="date"
            className={estilosForm.control}
            value={fechaSesion}
            onChange={(evento) => setFechaSesion(evento.target.value)}
          />
        </Field>
        <Field
          id="notas"
          label="Notas para el mentor"
          error={undefined}
          pista="Opcional. Máximo 4000 caracteres."
        >
          <TextArea
            value={notas}
            onChange={(evento) => setNotas(evento.target.value)}
            rows={4}
            maxLength={4000}
          />
        </Field>
        <div className={estilosPerfil.acciones}>
          <Boton cargando={enviando} onClick={() => void agendar()}>
            Agendar
          </Boton>
        </div>
      </Modal>
    </div>
  );
}
