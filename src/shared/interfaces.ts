export interface Cliente {
  id_cliente?: number;
  tipo_documento: string;
  numero_documento: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  nombre_completo?: string;
  genero: string;
  fecha_nacimiento: string;
  estado_civil: string;
  profesion?: string;
  ocupacion?: string;
}

export interface SolicitudApertura {
  id_solicitud?: number;
  id_cliente: number;
  tipo_cuenta: string;
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Devuelta';
  comentario_director?: string;
  fecha_solicitud?: Date;
  fecha_respuesta?: Date;
}

export interface CuentaAhorro {
  id_cuenta?: number;
  numero_cuenta: string;
  id_cliente: number;
  id_solicitud?: number;
  saldo: number;
  estado_cuenta: string;
  fecha_apertura?: Date;
}

export interface Transaccion {
  id_transaccion?: number;
  id_cuenta: number;
  tipo_transaccion: string;
  tipo_deposito?: string;
  monto: number;
  codigo_cheque?: string;
  numero_cheque?: string;
  saldo_anterior: number;
  saldo_nuevo: number;
  fecha_transaccion?: Date;
}

export interface VerificarClienteRequest {
  tipoDocumento: string;
  numeroDocumento: string;
}

export interface VerificarClienteResponse {
  existe: boolean;
  estado: string;
  mensaje: string;
  icono?: string;
  nombreCompleto?: string;
  idCliente?: number;
  idSolicitud?: number;
}

export interface AperturarCuentaRequest {
  idSolicitud: number;
  tipoDeposito: string;
  valorDeposito: number;
  codigoCheque?: string;
  numeroCheque?: string;
}

export interface AperturarCuentaResponse {
  exito: boolean;
  mensaje: string;
  numeroCuenta?: string;
  idCuenta?: number;
  idTransaccion?: number;
}




// ========== INTERFACES PARA RETIRO ==========

export interface BuscarCuentaRequest {
  numeroCuenta: string;
}

export interface BuscarCuentaResponse {
  existe: boolean;
  mensaje: string;
  datos?: {
    numeroCuenta: string;
    numeroDocumento: string;
    titular: string;
    saldo: number;
    estadoCuenta: string;
    idCuenta: number;
    idCliente: number;
  };
}

export interface ProcesarRetiroRequest {
  idCuenta: number;
  numeroDocumento: string;
  montoRetirar: number;
}

export interface ProcesarRetiroResponse {
  exito: boolean;
  mensaje: string;
  datos?: {
    idTransaccion: number;
    saldoAnterior: number;
    saldoNuevo: number;
    montoRetirado: number;
    fechaTransaccion: Date;
  };
}




// ========== INTERFACES PARA NOTA DÉBITO ==========

export interface AplicarNotaDebitoRequest {
  idCuenta: number;
  numeroDocumento: string;
  valor: number;
}

export interface AplicarNotaDebitoResponse {
  exito: boolean;
  mensaje: string;
  datos?: {
    idTransaccion: number;
    saldoAnterior: number;
    saldoNuevo: number;
    valor: number;
    fechaTransaccion: Date;
  };
}
