import * as Sentry from '@sentry/react';
import type { SesionUsuario } from '@/types/auth';

const DSN = import.meta.env.VITE_SENTRY_DSN ?? '';

export const sentryActivo = DSN.trim().length > 0;

export function initSentry(): void {
  if (!sentryActivo) return;

  Sentry.init({
    dsn: DSN.trim(),
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT ?? 'development',
    release: import.meta.env.VITE_RELEASE ?? 'enlaza-frontend@dev',
    tracesSampleRate: 0.1,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.httpClientIntegration(),
      Sentry.globalHandlersIntegration(),
    ],
  });
}

export function asignarUsuarioSentry(usuario: SesionUsuario): void {
  if (!sentryActivo) return;
  Sentry.setUser({
    id: String(usuario.id_usuario),
    email: usuario.correo,
    tipo_usuario: usuario.tipo_usuario,
  });
}

export function limpiarUsuarioSentry(): void {
  if (!sentryActivo) return;
  Sentry.setUser(null);
}

export function registrarBreadcrumb(descripcion: string, datos?: Record<string, unknown>): void {
  if (!sentryActivo) return;
  Sentry.addBreadcrumb({ message: descripcion, data: datos, level: 'info' });
}

export function capturarError(error: unknown, contexto?: Record<string, unknown>): void {
  if (!sentryActivo) return;
  Sentry.captureException(error, { extra: contexto });
}
