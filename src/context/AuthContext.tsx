import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { authApi, renovarSesion, EVENTO_SESION_EXPIRADA, tokenStore } from '@/services/api';
import { asignarUsuarioSentry, limpiarUsuarioSentry } from '@/lib/sentry';
import type { LoginRequest, SesionUsuario } from '@/types/auth';

type EstadoAuth = 'cargando' | 'autenticado' | 'anonimo';

interface ContextoAuth {
  estado: EstadoAuth;
  usuario: SesionUsuario | null;
  ingresar: (datos: LoginRequest) => Promise<SesionUsuario>;
  salir: () => Promise<void>;
}

const AuthContext = createContext<ContextoAuth | null>(null);

const MARGEN_REFRESCO_MS = 60_000;
const INTERVALO_MINIMO_MS = 15_000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoAuth>('cargando');
  const [usuario, setUsuario] = useState<SesionUsuario | null>(null);
  const timerRef = useRef<number | null>(null);

  const cancelarRefresco = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const programarRefresco = useCallback(
    (expiresIn: number) => {
      cancelarRefresco();
      const demora = Math.max(expiresIn * 1000 - MARGEN_REFRESCO_MS, INTERVALO_MINIMO_MS);
      timerRef.current = window.setTimeout(() => {
        void renovarSesion().then((sesion) => {
          if (sesion) {
            programarRefresco(sesion.expires_in);
          }
        });
      }, demora);
    },
    [cancelarRefresco],
  );

  const cerrarSesionLocal = useCallback(() => {
    cancelarRefresco();
    tokenStore.limpiar();
    setUsuario(null);
    setEstado('anonimo');
    limpiarUsuarioSentry();
  }, [cancelarRefresco]);

  useEffect(() => {
    let cancelado = false;

    void (async () => {
      const sesion = await renovarSesion();
      if (cancelado) return;
      if (!sesion) {
        setEstado('anonimo');
        return;
      }
      try {
        const yo = await authApi.me();
        if (cancelado) return;
        setUsuario(yo);
        setEstado('autenticado');
        asignarUsuarioSentry(yo);
        programarRefresco(sesion.expires_in);
      } catch {
        if (!cancelado) cerrarSesionLocal();
      }
    })();

    const alExpirar = () => cerrarSesionLocal();
    window.addEventListener(EVENTO_SESION_EXPIRADA, alExpirar);

    return () => {
      cancelado = true;
      cancelarRefresco();
      window.removeEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
    };
  }, [cancelarRefresco, cerrarSesionLocal, programarRefresco]);

  const ingresar = useCallback(
    async (datos: LoginRequest): Promise<SesionUsuario> => {
      const sesion = await authApi.login(datos);
      tokenStore.fijar(sesion.access_token);
      const yo = await authApi.me();
      setUsuario(yo);
      setEstado('autenticado');
      asignarUsuarioSentry(yo);
      programarRefresco(sesion.expires_in);
      return yo;
    },
    [programarRefresco],
  );

  const salir = useCallback(async (): Promise<void> => {
    try {
      await authApi.logout();
    } finally {
      cerrarSesionLocal();
    }
  }, [cerrarSesionLocal]);

  return (
    <AuthContext.Provider value={{ estado, usuario, ingresar, salir }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): ContextoAuth {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  }
  return contexto;
}
