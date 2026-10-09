import { ApiError, type DetalleError } from '@/types/api';
import type { AuthResponse } from '@/types/auth';
import { capturarError, registrarBreadcrumb } from '@/lib/sentry';
import { notificarSesionExpirada, tokenStore } from './tokenStore';

const rawBaseUrl = (import.meta.env.VITE_API_URL ?? '').trim();

if (!rawBaseUrl) {
  throw new Error(
    'Falta VITE_API_URL. Copia .env.example a .env y define la URL base de enlaza-backend.',
  );
}

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

const RUTAS_DE_SESION = [
  '/api/auth/login',
  '/api/auth/registro',
  '/api/auth/refresh',
  '/api/auth/logout',
];

export interface OpcionesPeticion extends Omit<RequestInit, 'body'> {
  body?: unknown;
  refrescar?: boolean;
}

async function ejecutarFetch(path: string, init: OpcionesPeticion): Promise<Response> {
  const { body, headers: cabecerasExtra, ...resto } = init;
  const headers = new Headers(cabecerasExtra);
  headers.set('Accept', 'application/json');

  const token = tokenStore.obtener();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let cuerpo: BodyInit | null | undefined;
  if (body instanceof FormData) {
    cuerpo = body;
  } else if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
    cuerpo = JSON.stringify(body);
  }

  try {
    const respuesta = await fetch(`${API_BASE_URL}${path}`, {
      ...resto,
      headers,
      credentials: 'include',
      body: cuerpo,
    });
    registrarBreadcrumb(`Petición HTTP ${respuesta.status}`, {
      metodo: (init.method ?? 'GET').toUpperCase(),
      path,
      status: respuesta.status,
    });
    return respuesta;
  } catch {
    registrarBreadcrumb('Fallo de red al conectar con el servidor', { path });
    const error = new ApiError(0, 'No se pudo conectar con el servidor.', 'SIN_CONEXION');
    capturarError(error, { path, motivo: 'SIN_CONEXION' });
    throw error;
  }
}

function mensajePorDefecto(status: number): string {
  if (status === 0) return 'No se pudo conectar con el servidor.';
  if (status === 401) return 'Tu sesión expiró. Inicia sesión de nuevo.';
  if (status === 403) return 'No tienes permisos para esta acción.';
  if (status === 404) return 'No encontramos lo que buscas.';
  if (status === 429) return 'Demasiados intentos. Inténtalo de nuevo más tarde.';
  return `Error ${status}`;
}

async function interpretar<T>(respuesta: Response): Promise<T> {
  if (respuesta.status === 204) return undefined as T;

  const texto = await respuesta.text();
  let datos: unknown = null;
  if (texto) {
    try {
      datos = JSON.parse(texto);
    } catch {
      datos = texto;
    }
  }

  if (respuesta.ok) {
    if (datos !== null && typeof datos === 'object' && 'success' in datos) {
      const envoltura = datos as { success: boolean; data?: unknown };
      if (envoltura.success) return envoltura.data as T;
    }
    return datos as T;
  }

  const envolturaError =
    datos !== null && typeof datos === 'object' && 'error' in datos
      ? (datos as { error?: { code?: string; message?: string; details?: DetalleError[] } }).error
      : undefined;

  if (respuesta.status >= 500) {
    capturarError(
      new ApiError(
        respuesta.status,
        envolturaError?.message ?? mensajePorDefecto(respuesta.status),
        envolturaError?.code ?? 'ERROR',
        envolturaError?.details ?? [],
      ),
      { path: respuesta.url, status: respuesta.status },
    );
  }

  throw new ApiError(
    respuesta.status,
    envolturaError?.message ?? mensajePorDefecto(respuesta.status),
    envolturaError?.code ?? 'ERROR',
    envolturaError?.details ?? [],
  );
}

async function pedir<T>(path: string, opciones: OpcionesPeticion = {}): Promise<T> {
  const { refrescar = true, ...init } = opciones;
  const respuesta = await ejecutarFetch(path, init);

  if (respuesta.status === 401 && refrescar && !RUTAS_DE_SESION.includes(path)) {
    const sesion = await renovarSesion();
    if (sesion) return pedir<T>(path, { ...init, refrescar: false });
    throw new ApiError(401, 'Tu sesión expiró. Inicia sesión de nuevo.', 'SESION_EXPIRADA');
  }

  return interpretar<T>(respuesta);
}

async function intentarRenovar(): Promise<AuthResponse | null> {
  try {
    const sesion = await pedir<AuthResponse>('/api/auth/refresh', {
      method: 'POST',
      refrescar: false,
    });
    tokenStore.fijar(sesion.access_token);
    return sesion;
  } catch {
    tokenStore.limpiar();
    notificarSesionExpirada();
    return null;
  }
}

let renovacionEnCurso: Promise<AuthResponse | null> | null = null;

export function renovarSesion(): Promise<AuthResponse | null> {
  if (!renovacionEnCurso) {
    renovacionEnCurso = intentarRenovar().finally(() => {
      renovacionEnCurso = null;
    });
  }
  return renovacionEnCurso;
}

export const api = {
  get: <T>(path: string, init?: OpcionesPeticion) => pedir<T>(path, { ...init, method: 'GET' }),
  post: <T>(path: string, body?: unknown, init?: OpcionesPeticion) =>
    pedir<T>(path, { ...init, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, init?: OpcionesPeticion) =>
    pedir<T>(path, { ...init, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, init?: OpcionesPeticion) =>
    pedir<T>(path, { ...init, method: 'PATCH', body }),
  delete: <T>(path: string, init?: OpcionesPeticion) =>
    pedir<T>(path, { ...init, method: 'DELETE' }),
};
