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
  tipo_cuenta: string;
  estado: string;
  comentario_asesor?: string;
  fecha_solicitud: Date;
  cliente?: ClienteResponse;
}