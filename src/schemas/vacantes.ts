import { z } from 'zod';
import type { ModalidadVacante, VacanteCrear } from '@/types/vacantes';

export const OPCIONES_MODALIDAD: Array<{ valor: ModalidadVacante; etiqueta: string }> = [
  { valor: 'presencial', etiqueta: 'Presencial' },
  { valor: 'remoto', etiqueta: 'Remoto' },
  { valor: 'hibrido', etiqueta: 'Híbrido' },
];

const campoSalario = z
  .string()
  .max(12, 'Máximo 12 caracteres.')
  .refine((valor) => valor === '' || /^\d+(\.\d{1,2})?$/.test(valor), 'Ingresa un número válido.');

export const esquemaVacante = z
  .object({
    titulo: z.string().min(1, 'Ingresa el título.').max(150, 'Máximo 150 caracteres.'),
    descripcion: z.string().min(1, 'Ingresa la descripción.').max(8000, 'Máximo 8000 caracteres.'),
    modalidad: z.enum(['presencial', 'remoto', 'hibrido'], {
      message: 'Selecciona la modalidad.',
    }),
    ubicacion: z.string().max(150, 'Máximo 150 caracteres.'),
    salario_min: campoSalario,
    salario_max: campoSalario,
    fecha_cierre: z
      .string()
      .refine((valor) => valor === '' || /^\d{4}-\d{2}-\d{2}$/.test(valor), 'Fecha inválida.'),
    ajustes: z.array(z.number()).max(50, 'Máximo 50 ajustes.'),
  })
  .superRefine((valores, contexto) => {
    const minimo = valores.salario_min ? Number(valores.salario_min) : null;
    const maximo = valores.salario_max ? Number(valores.salario_max) : null;
    if (minimo !== null && maximo !== null && minimo > maximo) {
      contexto.addIssue({
        code: 'custom',
        path: ['salario_min'],
        message: 'El salario mínimo no puede ser mayor que el máximo.',
      });
    }
    if (valores.fecha_cierre && valores.fecha_cierre <= new Date().toISOString().slice(0, 10)) {
      contexto.addIssue({
        code: 'custom',
        path: ['fecha_cierre'],
        message: 'La fecha de cierre debe ser futura.',
      });
    }
  });

export type ValoresVacante = z.infer<typeof esquemaVacante>;

export function aPayloadVacante(valores: ValoresVacante): VacanteCrear {
  return {
    titulo: valores.titulo.trim(),
    descripcion: valores.descripcion.trim(),
    modalidad: valores.modalidad,
    ubicacion: valores.ubicacion.trim() || null,
    salario_min: valores.salario_min ? Number(valores.salario_min) : null,
    salario_max: valores.salario_max ? Number(valores.salario_max) : null,
    fecha_cierre: valores.fecha_cierre ? new Date(valores.fecha_cierre).toISOString() : null,
    ajustes: valores.ajustes,
  };
}
