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
  cajero?: string;
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




// ========== INTERFACES PARA CONSIGNACIÓN ==========

export interface ProcesarConsignacionRequest {
  numeroCuenta: string;
  tipoConsignacion: 'Efectivo' | 'Cheque';
  valor: number;
  codigoCheque?: string;
  numeroCheque?: string;
  cajero?: string;
}

export interface ProcesarConsignacionResponse {
  exito: boolean;
  mensaje: string;
  datos?: {
    idTransaccion: number;
    numeroCuenta: string;
    titular: string;
    numeroDocumento: string;
    saldoAnterior: number;
    saldoNuevo: number;
    valorConsignado: number;
    tipoConsignacion: string;
    codigoCheque?: string;
    numeroCheque?: string;
    fechaTransaccion: Date;
  };
}




// ========== INTERFACES PARA CANCELACIÓN DE CUENTA ==========

export interface CancelarCuentaRequest {
  numeroCuenta: string;
  numeroDocumento: string;
  motivoCancelacion: string;
}

export interface CancelarCuentaResponse {
  exito: boolean;
  mensaje: string;
  datos?: {
    idCuenta: number;
    numeroCuenta: string;
    titular: string;
    numeroDocumento: string;
    saldoFinal: number;
    motivoCancelacion: string;
    fechaCancelacion: Date;
  };
}




// ========== INTERFACES PARA TRASLADO CAJERO ==========

export interface EnviarTrasladoRequest {
  cajeroOrigen: string;
  cajeroDestino: string;
  monto: number;
}

export interface EnviarTrasladoResponse {
  exito: boolean;
  mensaje: string;
  datos?: {
    idTraslado: number;
    cajeroOrigen: string;
    cajeroDestino: string;
    monto: number;
    fechaEnvio: Date;
  };
}

export interface TrasladoPendiente {
  idTraslado: number;
  cajeroOrigen: string;
  monto: number;
  fechaEnvio: Date;
}

export interface ConsultarTrasladosResponse {
  exito: boolean;
  traslados: TrasladoPendiente[];
}

export interface AceptarTrasladoRequest {
  idTraslado: number;
  cajeroDestino: string;
}

export interface AceptarTrasladoResponse {
  exito: boolean;
  mensaje: string;
  datos?: {
    idTraslado: number;
    cajeroOrigen: string;
    cajeroDestino: string;
    monto: number;
    fechaEnvio: Date;
    fechaAceptacion: Date;
  };
}
