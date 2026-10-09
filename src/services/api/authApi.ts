import { api } from './client';
import type {
  AuthResponse,
  LoginRequest,
  RegistroRequest,
  SesionUsuario,
  Usuario,
} from '@/types/auth';

export const authApi = {
  registro: (datos: RegistroRequest) => api.post<Usuario>('/api/auth/registro', datos),
  login: (datos: LoginRequest) => api.post<AuthResponse>('/api/auth/login', datos),
  logout: () => api.post<void>('/api/auth/logout', undefined, { refrescar: false }),
  me: () => api.get<SesionUsuario>('/api/auth/me'),
};
