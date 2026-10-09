let accessToken: string | null = null;

export const tokenStore = {
  obtener: (): string | null => accessToken,
  fijar: (token: string): void => {
    accessToken = token;
  },
  limpiar: (): void => {
    accessToken = null;
  },
};

export const EVENTO_SESION_EXPIRADA = 'enlaza:sesion-expirada';

export const notificarSesionExpirada = (): void => {
  window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
};
