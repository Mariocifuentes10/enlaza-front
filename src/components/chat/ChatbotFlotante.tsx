import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { chatbotApi, type MensajeChat } from '@/services/api/chatbotApi';
import { ApiError } from '@/types/api';
import { mensajeDe } from '@/lib/erroresFormulario';
import { Boton } from '@/components/ui/form/Boton';
import { Spinner } from '@/components/ui/Spinner';
import estilos from './chatbot.module.css';

const MAX_HISTORIAL_ENVIADO = 20;
const MAX_LONGITUD_MENSAJE = 4000;

const MENSAJE_BIENVENIDA: MensajeChat = {
  rol: 'asistente',
  contenido:
    '¡Hola! Soy el asistente de Enlaza. Puedo ayudarte con dudas sobre inclusión laboral, entrevistas y ajustes razonables.',
};

function mensajeErrorDe(evaluacion: unknown): string {
  if (evaluacion instanceof ApiError) {
    switch (evaluacion.code) {
      case 'IA_NO_CONFIGURADA':
      case 'IA_FALLIDA':
        return 'El asistente no está disponible por ahora. Inténtalo de nuevo en unos minutos.';
      case 'RATE_LIMIT_EXCEEDED':
        return 'Vas muy rápido. Espera un momento antes de enviar otro mensaje.';
      default:
        return evaluacion.message;
    }
  }
  return mensajeDe(evaluacion, 'No pudimos comunicarnos con el asistente.');
}

export function ChatbotFlotante() {
  const { usuario } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<MensajeChat[]>([MENSAJE_BIENVENIDA]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const botonRef = useRef<HTMLButtonElement>(null);
  const entradaRef = useRef<HTMLTextAreaElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);

  const cerrar = useCallback(() => {
    setAbierto(false);
    setError(null);
    botonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!abierto) return;
    const alPresionarTecla = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') cerrar();
    };
    window.addEventListener('keydown', alPresionarTecla);
    return () => window.removeEventListener('keydown', alPresionarTecla);
  }, [abierto, cerrar]);

  useEffect(() => {
    if (abierto) entradaRef.current?.focus();
  }, [abierto]);

  useEffect(() => {
    const area = areaRef.current;
    if (area) area.scrollTop = area.scrollHeight;
  }, [abierto, mensajes, enviando, error]);

  if (!usuario) return null;

  const enviar = async (contenido: string) => {
    if (!contenido || enviando) return;
    const mensajeUsuario: MensajeChat = { rol: 'usuario', contenido };
    setMensajes((prev) => [...prev, mensajeUsuario]);
    setTexto('');
    setError(null);
    setEnviando(true);
    try {
      const historial = mensajes.slice(-MAX_HISTORIAL_ENVIADO);
      const respuesta = await chatbotApi.enviarMensaje(contenido, historial);
      setMensajes((prev) => [...prev, { rol: 'asistente', contenido: respuesta.respuesta }]);
    } catch (evaluacion) {
      setMensajes((prev) => prev.filter((mensaje) => mensaje !== mensajeUsuario));
      setTexto(contenido);
      setError(mensajeErrorDe(evaluacion));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={estilos.contenedor}>
      {abierto && (
        <div
          id="chatbot-panel"
          className={estilos.panel}
          role="dialog"
          aria-label="Asistente Enlaza"
        >
          <div className={estilos.encabezado}>
            <span className={estilos.titulo}>Asistente Enlaza</span>
            <button
              type="button"
              className={estilos.cerrar}
              onClick={cerrar}
              aria-label="Cerrar asistente"
            >
              ×
            </button>
          </div>

          <div
            className={estilos.mensajes}
            ref={areaRef}
            role="log"
            aria-live="polite"
            aria-label="Conversación con el asistente"
          >
            {mensajes.map((mensaje, indice) => (
              <p
                key={indice}
                className={
                  mensaje.rol === 'usuario'
                    ? `${estilos.burbuja} ${estilos.usuario}`
                    : `${estilos.burbuja} ${estilos.asistente}`
                }
              >
                {mensaje.contenido}
              </p>
            ))}
            {enviando && (
              <p className={`${estilos.burbuja} ${estilos.asistente}`}>
                <Spinner label="Enlaza está escribiendo…" />
              </p>
            )}
          </div>

          <div className={estilos.pie}>
            {error && (
              <div className={estilos.errorCaja} role="alert">
                <span>{error}</span>
                <Boton type="button" variante="secundario" onClick={() => void enviar(texto)}>
                  Reintentar
                </Boton>
              </div>
            )}
            <form
              className={estilos.formulario}
              onSubmit={(evento) => {
                evento.preventDefault();
                void enviar(texto);
              }}
            >
              <label className={estilos.oculto} htmlFor="chatbot-entrada">
                Escribe tu mensaje para el asistente
              </label>
              <textarea
                id="chatbot-entrada"
                ref={entradaRef}
                className={estilos.entrada}
                value={texto}
                onChange={(evento) => setTexto(evento.target.value)}
                onKeyDown={(evento) => {
                  if (evento.key === 'Enter' && !evento.shiftKey) {
                    evento.preventDefault();
                    void enviar(texto);
                  }
                }}
                placeholder="Escribe tu mensaje…"
                rows={2}
                maxLength={MAX_LONGITUD_MENSAJE}
                disabled={enviando}
              />
              <Boton type="submit" disabled={!texto.trim()} cargando={enviando}>
                Enviar
              </Boton>
            </form>
          </div>
        </div>
      )}

      <button
        ref={botonRef}
        type="button"
        className={estilos.boton}
        aria-expanded={abierto}
        aria-controls="chatbot-panel"
        aria-label={abierto ? 'Cerrar asistente Enlaza' : 'Abrir asistente Enlaza'}
        onClick={() => (abierto ? cerrar() : setAbierto(true))}
      >
        <svg
          aria-hidden="true"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </button>
    </div>
  );
}
