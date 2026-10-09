import { z } from 'zod';

export const esquemaLogin = z.object({
  correo: z.email('Ingresa un correo válido.').max(150, 'Máximo 150 caracteres.'),
  contrasena: z.string().min(1, 'Ingresa tu contraseña.'),
});

export type ValoresLogin = z.infer<typeof esquemaLogin>;

export const esquemaRegistro = z
  .object({
    tipo_usuario: z.enum(['candidato', 'empresa', 'mentor']),
    nombre_completo: z.string().max(150, 'Máximo 150 caracteres.'),
    nombre_empresa: z.string().max(150, 'Máximo 150 caracteres.'),
    correo: z.email('Ingresa un correo válido.').max(150, 'Máximo 150 caracteres.'),
    contrasena: z.string().min(8, 'Usa al menos 8 caracteres.').max(72, 'Máximo 72 caracteres.'),
    confirmacion: z.string(),
  })
  .superRefine((valores, contexto) => {
    if (valores.contrasena !== valores.confirmacion) {
      contexto.addIssue({
        code: 'custom',
        path: ['confirmacion'],
        message: 'Las contraseñas no coinciden.',
      });
    }
    if (valores.tipo_usuario === 'empresa') {
      if (!valores.nombre_empresa.trim()) {
        contexto.addIssue({
          code: 'custom',
          path: ['nombre_empresa'],
          message: 'Ingresa el nombre de la empresa.',
        });
      }
    } else if (!valores.nombre_completo.trim()) {
      contexto.addIssue({
        code: 'custom',
        path: ['nombre_completo'],
        message: 'Ingresa tu nombre completo.',
      });
    }
  });

export type ValoresRegistro = z.infer<typeof esquemaRegistro>;

export const OPCIONES_DISCAPACIDAD = [
  { valor: '', etiqueta: 'Prefiero no decirlo' },
  { valor: 'Física o motriz', etiqueta: 'Física o motriz' },
  { valor: 'Visual', etiqueta: 'Visual' },
  { valor: 'Auditiva', etiqueta: 'Auditiva' },
  { valor: 'Intelectual', etiqueta: 'Intelectual' },
  { valor: 'Psicosocial', etiqueta: 'Psicosocial' },
  { valor: 'Múltiple', etiqueta: 'Múltiple' },
  { valor: 'Otra', etiqueta: 'Otra' },
] as const;

export const esquemaPerfilCandidato = z.object({
  nombre_completo: z
    .string()
    .min(1, 'Ingresa tu nombre completo.')
    .max(150, 'Máximo 150 caracteres.'),
  telefono: z.string().max(20, 'Máximo 20 caracteres.'),
  ubicacion: z.string().max(150, 'Máximo 150 caracteres.'),
  resumen_perfil: z.string().max(4000, 'Máximo 4000 caracteres.'),
  tipo_discapacidad: z.string().max(100, 'Máximo 100 caracteres.'),
  visible_discapacidad: z.boolean(),
});

export type ValoresPerfilCandidato = z.infer<typeof esquemaPerfilCandidato>;

export const esquemaPerfilEmpresa = z.object({
  nombre_empresa: z
    .string()
    .min(1, 'Ingresa el nombre de la empresa.')
    .max(150, 'Máximo 150 caracteres.'),
  descripcion: z.string().max(4000, 'Máximo 4000 caracteres.'),
  sitio_web: z.union([
    z.literal(''),
    z.url({ message: 'Ingresa una URL válida, por ejemplo https://ejemplo.com' }),
  ]),
  ubicacion: z.string().max(150, 'Máximo 150 caracteres.'),
});

export type ValoresPerfilEmpresa = z.infer<typeof esquemaPerfilEmpresa>;
