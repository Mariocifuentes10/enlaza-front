import { lazy, type ComponentType } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RootRedirect } from './RootRedirect';
import { paths } from './paths';

function pag<Modulo extends Record<string, unknown>>(
  cargador: () => Promise<Modulo>,
  nombre: keyof Modulo & string,
) {
  return lazy(() => cargador().then((modulo) => ({ default: modulo[nombre] as ComponentType })));
}

const LoginPage = pag(() => import('@/pages/auth/LoginPage'), 'LoginPage');
const RegistroPage = pag(() => import('@/pages/auth/RegistroPage'), 'RegistroPage');
const OlvidePasswordPage = pag(
  () => import('@/pages/auth/OlvidePasswordPage'),
  'OlvidePasswordPage',
);
const DashboardCandidatoPage = pag(
  () => import('@/pages/candidato/DashboardCandidatoPage'),
  'DashboardCandidatoPage',
);
const PostulacionesCandidatoPage = pag(
  () => import('@/pages/candidato/PostulacionesPage'),
  'PostulacionesPage',
);
const PerfilCandidatoPage = pag(() => import('@/pages/candidato/PerfilPage'), 'PerfilPage');
const MentoresPage = pag(() => import('@/pages/candidato/MentoresPage'), 'MentoresPage');
const VacantesListadoPage = pag(
  () => import('@/pages/vacantes/VacantesListadoPage'),
  'VacantesListadoPage',
);
const VacanteDetallePage = pag(
  () => import('@/pages/vacantes/VacanteDetallePage'),
  'VacanteDetallePage',
);
const EmpresaDetallePage = pag(
  () => import('@/pages/empresas/EmpresaDetallePage'),
  'EmpresaDetallePage',
);
const DashboardEmpresaPage = pag(
  () => import('@/pages/empresa/DashboardEmpresaPage'),
  'DashboardEmpresaPage',
);
const PublicarVacantePage = pag(
  () => import('@/pages/empresa/PublicarVacantePage'),
  'PublicarVacantePage',
);
const PostulacionesEmpresaPage = pag(
  () => import('@/pages/empresa/PostulacionesPage'),
  'PostulacionesPage',
);
const PerfilEmpresaPage = pag(() => import('@/pages/empresa/PerfilPage'), 'PerfilPage');
const DashboardAdminPage = pag(
  () => import('@/pages/admin/DashboardAdminPage'),
  'DashboardAdminPage',
);
const UsuariosPage = pag(() => import('@/pages/admin/UsuariosPage'), 'UsuariosPage');
const EmpresasPage = pag(() => import('@/pages/admin/EmpresasPage'), 'EmpresasPage');
const SelloPage = pag(() => import('@/pages/admin/SelloPage'), 'SelloPage');
const UnauthorizedPage = pag(() => import('@/pages/errors/UnauthorizedPage'), 'UnauthorizedPage');
const NotFoundPage = pag(() => import('@/pages/errors/NotFoundPage'), 'NotFoundPage');

export const router = createBrowserRouter([
  { path: paths.home, Component: RootRedirect },
  {
    element: <AuthLayout />,
    children: [
      { path: paths.login, Component: LoginPage },
      { path: paths.registro, Component: RegistroPage },
      { path: paths.olvidePassword, Component: OlvidePasswordPage },
    ],
  },
  {
    element: <ProtectedRoute roles={['candidato', 'mentor']} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: paths.candidato.dashboard, Component: DashboardCandidatoPage },
          { path: paths.candidato.postulaciones, Component: PostulacionesCandidatoPage },
          { path: paths.candidato.perfil, Component: PerfilCandidatoPage },
          { path: paths.candidato.mentores, Component: MentoresPage },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute roles={['candidato', 'mentor', 'empresa']} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: paths.vacantes, Component: VacantesListadoPage },
          { path: paths.vacanteDetalle, Component: VacanteDetallePage },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute roles={['empresa']} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: paths.empresa.dashboard, Component: DashboardEmpresaPage },
          { path: paths.empresa.publicarVacante, Component: PublicarVacantePage },
          { path: paths.empresa.postulaciones, Component: PostulacionesEmpresaPage },
          { path: paths.empresa.perfil, Component: PerfilEmpresaPage },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute roles={['candidato', 'mentor', 'empresa', 'admin']} />,
    children: [
      {
        element: <AppLayout />,
        children: [{ path: paths.empresaDetalle, Component: EmpresaDetallePage }],
      },
    ],
  },
  {
    element: <ProtectedRoute roles={['admin']} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: paths.admin.dashboard, Component: DashboardAdminPage },
          { path: paths.admin.usuarios, Component: UsuariosPage },
          { path: paths.admin.empresas, Component: EmpresasPage },
          { path: paths.admin.sello, Component: SelloPage },
        ],
      },
    ],
  },
  { path: paths.noAutorizado, Component: UnauthorizedPage },
  { path: '*', Component: NotFoundPage },
]);
