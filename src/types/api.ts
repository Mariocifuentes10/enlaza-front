export interface DetalleError {
  campo: string;
  mensaje: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: DetalleError[];

  constructor(status: number, message: string, code = 'ERROR', details: DetalleError[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const erroresPorCampo = (error: unknown): Record<string, string> => {
  if (!(error instanceof ApiError)) return {};
  return Object.fromEntries(error.details.map((detalle) => [detalle.campo, detalle.mensaje]));
};

export interface Paginada<T> {
  items: T[];
  total: number;
  pagina: number;
  porPagina: number;
}
