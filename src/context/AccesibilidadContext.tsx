import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { applyTheme } from '@/theme/applyTheme';
import { tokens } from '@/theme/tokens';
import { tokensAltoContraste } from '@/theme/tokensAltoContraste';
import { FACTORES_ESCALA, escalarTipografia } from '@/theme/escalaTexto';

export type Contraste = 'normal' | 'alto';
export type Escala = keyof typeof FACTORES_ESCALA;

export interface PreferenciasAccesibilidad {
  contraste: Contraste;
  escala: Escala;
}

interface ContextoAccesibilidad extends PreferenciasAccesibilidad {
  actualizar: (cambios: Partial<PreferenciasAccesibilidad>) => void;
}

const CLAVE_STORAGE = 'enlaza:accesibilidad';

const PREFERENCIAS_PREDETERMINADAS: PreferenciasAccesibilidad = {
  contraste: 'normal',
  escala: 'normal',
};

export function leerPreferenciasAccesibilidad(): PreferenciasAccesibilidad {
  try {
    const crudo = localStorage.getItem(CLAVE_STORAGE);
    if (!crudo) return PREFERENCIAS_PREDETERMINADAS;
    const dato = JSON.parse(crudo) as Partial<PreferenciasAccesibilidad>;
    return {
      contraste: dato.contraste === 'alto' ? 'alto' : 'normal',
      escala: dato.escala === 'grande' || dato.escala === 'muyGrande' ? dato.escala : 'normal',
    };
  } catch {
    return PREFERENCIAS_PREDETERMINADAS;
  }
}

export function aplicarPreferenciasAccesibilidad(preferencias: PreferenciasAccesibilidad): void {
  const base =
    preferencias.contraste === 'alto'
      ? { ...tokens, color: { ...tokens.color, ...tokensAltoContraste } }
      : tokens;
  const escala = FACTORES_ESCALA[preferencias.escala];
  const tema =
    escala === 1
      ? base
      : {
          ...base,
          font: { ...base.font, size: escalarTipografia(base.font.size as Record<string, string>, escala) },
        };

  applyTheme(tema);

  const raiz = document.documentElement;
  raiz.dataset.contraste = preferencias.contraste;
  raiz.dataset.escala = preferencias.escala;
  raiz.style.colorScheme = preferencias.contraste === 'alto' ? 'dark' : 'light';
}

function guardar(preferencias: PreferenciasAccesibilidad): void {
  aplicarPreferenciasAccesibilidad(preferencias);
  try {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(preferencias));
  } catch {
    // Almacenamiento no disponible: las preferencias siguen vigentes en esta sesión.
  }
}

const AccesibilidadContext = createContext<ContextoAccesibilidad | null>(null);

export function AccesibilidadProvider({ children }: { children: ReactNode }) {
  const [preferencias, setPreferencias] = useState<PreferenciasAccesibilidad>(() =>
    leerPreferenciasAccesibilidad(),
  );

  const actualizar = useCallback((cambios: Partial<PreferenciasAccesibilidad>) => {
    setPreferencias((previas) => {
      const nuevas = { ...previas, ...cambios };
      guardar(nuevas);
      return nuevas;
    });
  }, []);

  const valor = useMemo(
    () => ({ ...preferencias, actualizar }),
    [preferencias, actualizar],
  );

  return <AccesibilidadContext.Provider value={valor}>{children}</AccesibilidadContext.Provider>;
}

export function useAccesibilidad(): ContextoAccesibilidad {
  const contexto = useContext(AccesibilidadContext);
  if (!contexto) {
    throw new Error('useAccesibilidad debe usarse dentro de AccesibilidadProvider');
  }
  return contexto;
}
