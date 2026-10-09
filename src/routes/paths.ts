import type { Rol } from '@/types/auth';

export const paths = {
  home: '/',
  login: '/login',
  registro: '/registro',
  olvidePassword: '/olvide-password',
  noAutorizado: '/no-autorizado',
  vacantes: '/vacantes',
  vacanteDetalle: '/vacantes/:id',
  empresaDetalle: '/empresas/:id',
  candidato: {
    dashboard: '/candidato/dashboard',
    postulaciones: '/candidato/postulaciones',
    perfil: '/candidato/perfil',
    mentores: '/candidato/mentores',
  },
  empresa: {
    dashboard: '/empresa/dashboard',
    publicarVacante: '/empresa/vacantes/nueva',
    postulaciones: '/empresa/postulaciones',
    perfil: '/empresa/perfil',
  },
  admin: {
    dashboard: '/admin/dashboard',
    usuarios: '/admin/usuarios',
    empresas: '/admin/empresas',
    sello: '/admin/sello',
  },
} as const;

export const rutaPorRol = (rol: Rol | null | undefined): string => {
  switch (rol) {
    case 'empresa':
      return paths.empresa.dashboard;
    case 'admin':
      return paths.admin.dashboard;
    case 'candidato':
    case 'mentor':
      return paths.candidato.dashboard;
    default:
      return paths.login;
  }
};
