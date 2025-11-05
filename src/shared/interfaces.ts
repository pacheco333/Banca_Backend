// Interfaces para el módulo de solicitudes

export interface Cliente {
  id_cliente: number;
  numero_documento: string;
  tipo_documento: 'CC' | 'TI' | 'R.Civil' | 'PPT' | 'Pasaporte' | 'Carne diplomático' | 'Cédula de extranjería';
  lugar_expedicion?: string;
  ciudad_nacimiento?: string;
  fecha_nacimiento: Date;
  fecha_expedicion?: Date;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  genero: 'M' | 'F';
  nacionalidad: 'Colombiano' | 'Estadounidense' | 'Otra';
  otra_nacionalidad?: string;
  estado_civil: 'Soltero' | 'Casado' | 'Unión Libre';
  grupo_etnico: 'Indígena' | 'Gitano' | 'Raizal' | 'Palenquero' | 'Afrocolombiano' | 'Ninguna';
  fecha_registro?: Date;
}

export interface SolicitudApertura {
  id_solicitud?: number;
  id_cliente: number;
  id_usuario_rol: number;  // Agregado para rastrear quién creó la solicitud
  tipo_cuenta: 'Ahorros';
  estado?: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Devuelta';
  comentario_director?: string;
  comentario_asesor?: string;
  archivo?: Buffer;
  fecha_solicitud?: Date;
  fecha_respuesta?: Date;
}

export interface SolicitudRequest {
  cedula: string;
  producto: string;
  comentario?: string;
}

export interface ClienteResponse {
  id_cliente: number;
  numero_documento: string;
  tipo_documento: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  nombre_completo: string;
}

export interface SolicitudResponse {
  id_solicitud: number;
  id_cliente: number;
  id_usuario_rol?: number;  // Agregado
  tipo_cuenta: string;
  estado: string;
  comentario_asesor?: string;
  fecha_solicitud: Date;
  cliente?: ClienteResponse;
  creado_por?: {  // Agregado para mostrar quién creó la solicitud
    nombre: string;
    email: string;
    rol: string;
  };
}


// Interfaces para el módulo de usuarios

export interface Usuario {
  id_usuario: number;
  nombre: string;
  correo: string;
  contrasena: string;
  fecha_creacion: Date;
  activo: boolean;
}

export interface RegistroUsuarioRequest {
  nombre: string;
  email: string;
  password: string;
  rol?: string;
}

export interface UsuarioResponse {
  id_usuario: number;
  nombre: string;
  correo: string;
  fecha_creacion: Date;
  activo: boolean;
}

export interface RegistroResponse {
  success: boolean;
  message: string;
  data?: UsuarioResponse;
}

export interface ValidacionEmailResponse {
  exists: boolean;
}


// Interfaces para el módulo de login

export interface LoginRequest {
  email: string;
  password: string;
  rol: string;  // El usuario selecciona con qué rol quiere acceder
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: number;
    email: string;
    nombre: string;
    rol: string;
    id_usuario_rol?: number;
  };
}

export interface Rol {
  id_rol: number;
  nombre: string;
  descripcion?: string;
}

export interface UsuarioConRoles {
  id_usuario: number;
  nombre: string;
  correo: string;
  activo: boolean;
  fecha_creacion: Date;
  roles: Rol[];
}

export interface AsignarRolRequest {
  email: string;
  rol: string;
}

export interface AsignarRolResponse {
  success: boolean;
  message: string;
}

export interface VerificarRolRequest {
  email: string;
  rol: string;
}

export interface VerificarRolResponse {
  success: boolean;
  tieneRol: boolean;
}

// Interface para el usuario autenticado en el request
export interface AuthUser {
  id_usuario: number;
  email: string;
  rol: string;
  id_usuario_rol: number;
}