export type Rol = 'candidato' | 'empresa' | 'admin' | 'mentor';

export type RolRegistro = Exclude<Rol, 'admin'>;

export interface Usuario {
  id_usuario: number;
  correo: string;
  tipo_usuario: Rol;
  fecha_registro: string;
  activo: boolean;
}

export interface SesionUsuario extends Usuario {
  id_candidato: number | null;
  id_empresa: number | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
}

export interface RegistroRequest {
  correo: string;
  contrasena: string;
  tipo_usuario: RolRegistro;
  nombre_completo?: string;
  nombre_empresa?: string;
}

export interface LoginRequest {
  correo: string;
  contrasena: string;
}
