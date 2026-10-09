import { api } from './client';

export interface MensajeChat {
  rol: 'usuario' | 'asistente';
  contenido: string;
}

export interface RespuestaChatbot {
  respuesta: string;
}

export const chatbotApi = {
  enviarMensaje: (mensaje: string, historial: MensajeChat[]) =>
    api.post<RespuestaChatbot>('/api/chatbot/mensaje', { mensaje, historial }),
};
