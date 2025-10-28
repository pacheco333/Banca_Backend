import pool from '../../../config/database';
import { CancelarCuentaRequest, CancelarCuentaResponse } from '../../../shared/interfaces';
import saldoCajeroService from './saldoCajeroService';

export class CancelacionService {

  async cancelarCuenta(datos: CancelarCuentaRequest): Promise<CancelarCuentaResponse> {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Buscar cuenta y validar que exista y esté activa
      // ✅ NOMBRE COMPLETO CONSTRUIDO CON CONCAT
      const [cuentas]: any = await connection.query(`
        SELECT 
          ca.id_cuenta,
          ca.numero_cuenta,
          ca.saldo,
          ca.id_cliente,
          ca.estado_cuenta,
          c.numero_documento,
          CONCAT(c.primer_nombre, ' ', 
                 IFNULL(CONCAT(c.segundo_nombre, ' '), ''), 
                 c.primer_apellido, ' ', 
                 IFNULL(c.segundo_apellido, '')) AS nombre_completo
        FROM cuentas_ahorro ca
        INNER JOIN clientes c ON ca.id_cliente = c.id_cliente
        WHERE ca.numero_cuenta = ?
        FOR UPDATE
      `, [datos.numeroCuenta]);

      if (cuentas.length === 0) {
        await connection.rollback();
        return {
          exito: false,
          mensaje: 'La cuenta no existe.'
        };
      }

      const cuenta = cuentas[0];

      // 2. Validar que la cuenta esté activa
      if (cuenta.estado_cuenta !== 'Activa') {
        await connection.rollback();
        return {
          exito: false,
          mensaje: `La cuenta ya está ${cuenta.estado_cuenta}.`
        };
      }

      // 3. Validar que el número de documento coincida
      if (cuenta.numero_documento !== datos.numeroDocumento) {
        await connection.rollback();
        return {
          exito: false,
          mensaje: 'El número de documento no coincide con el titular de la cuenta.'
        };
      }

      // 4. Validar que el saldo sea 0
      const saldoActual = parseFloat(cuenta.saldo);
      if (saldoActual !== 0) {
        await connection.rollback();
        return {
          exito: false,
          mensaje: `No se puede cancelar la cuenta. Saldo actual: $${saldoActual.toLocaleString()}. El saldo debe ser $0 para cancelar.`
        };
      }

      // 5. Validar que haya motivo de cancelación
      if (!datos.motivoCancelacion || datos.motivoCancelacion.trim() === '') {
        await connection.rollback();
        return {
          exito: false,
          mensaje: 'Debe ingresar un motivo de cancelación.'
        };
      }

      // 6. Actualizar estado de la cuenta a "Cerrada"
      await connection.query(
        'UPDATE cuentas_ahorro SET estado_cuenta = ? WHERE id_cuenta = ?',
        ['Cerrada', cuenta.id_cuenta]
      );

      // 6.1 Marcar la solicitud como "Utilizada" o cambiarla a NULL (desvinculación)
      // Esto evita que la misma solicitud aprobada pueda usarse para abrir otra cuenta
      await connection.query(`
        UPDATE cuentas_ahorro 
        SET id_solicitud = NULL 
        WHERE id_cuenta = ?
      `, [cuenta.id_cuenta]);

      // 7. Registrar transacción de cierre (opcional, para auditoría)
      await connection.query(`
        INSERT INTO transacciones 
        (id_cuenta, tipo_transaccion, monto, saldo_anterior, saldo_nuevo, fecha_transaccion, motivo_cancelacion) 
        VALUES (?, 'Cancelación', 0, 0, 0, NOW(), ?)
      `, [cuenta.id_cuenta, datos.motivoCancelacion]);

      await connection.commit();

      return {
        exito: true,
        mensaje: 'Cuenta cancelada exitosamente.',
        datos: {
          idCuenta: cuenta.id_cuenta,
          numeroCuenta: cuenta.numero_cuenta,
          titular: cuenta.nombre_completo,
          numeroDocumento: cuenta.numero_documento,
          saldoFinal: 0,
          motivoCancelacion: datos.motivoCancelacion,
          fechaCancelacion: new Date()
        }
      };

    } catch (error) {
      await connection.rollback();
      console.error('Error al cancelar cuenta:', error);
      throw new Error('Error al cancelar la cuenta');
    } finally {
      connection.release();
    }
  }
}

export default new CancelacionService();
