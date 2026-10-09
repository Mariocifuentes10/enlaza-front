export const FACTORES_ESCALA = {
  normal: 1,
  grande: 1.15,
  muyGrande: 1.3,
} as const;

export function escalarTipografia(
  size: Record<string, string>,
  factor: number,
): Record<string, string> {
  const resultado: Record<string, string> = {};
  for (const [clave, valor] of Object.entries(size)) {
    const base = Number.parseFloat(valor);
    resultado[clave] = Number.isNaN(base) ? valor : `${Math.round(base * factor * 1000) / 1000}rem`;
  }
  return resultado;
}
