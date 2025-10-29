import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../../../config/database';
import { Cliente, SolicitudApertura, ClienteResponse, SolicitudResponse } from '../../../shared/interfaces';

export class SolicitudService {
  
  // Buscar cliente por número de documento
  async buscarClientePorCedula(numeroDocumento: string): Promise<ClienteResponse | null> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT 
          id_cliente,
          numero_documento,
          tipo_documento,
          primer_nombre,
          segundo_nombre,
          primer_apellido,
          segundo_apellido,
          CONCAT_WS(' ', primer_nombre, segundo_nombre, primer_apellido, segundo_apellido) as nombre_completo
        FROM clientes 
        WHERE numero_documento = ?`,
        [numeroDocumento]
      );

      if (rows.length === 0) {
        return null;
      }

      return rows[0] as ClienteResponse;
    } catch (error) {
      console.error('Error al buscar cliente:', error);
      throw new Error('Error al buscar cliente en la base de datos');
    }
  }

  // Crear nueva solicitud de apertura
  async crearSolicitud(
    idCliente: number,
    comentarioAsesor?: string,
    archivo?: Buffer
  ): Promise<number> {
    try {
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO solicitudes_apertura 
        (id_cliente, tipo_cuenta, estado, comentario_asesor, archivo) 
        VALUES (?, 'Ahorros', 'Pendiente', ?, ?)`,
        [idCliente, comentarioAsesor || null, archivo || null]
      );

      return result.insertId;
    } catch (error) {
      console.error('Error al crear solicitud:', error);
      throw new Error('Error al crear la solicitud en la base de datos');
    }
  }

  // Obtener todas las solicitudes
  async obtenerSolicitudes(): Promise<SolicitudResponse[]> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT 
          s.id_solicitud,
          s.id_cliente,
          s.tipo_cuenta,
          s.estado,
          s.comentario_asesor,
          s.comentario_director,
          s.fecha_solicitud,
          s.fecha_respuesta,
          c.numero_documento,
          c.tipo_documento,
          c.primer_nombre,
          c.segundo_nombre,
          c.primer_apellido,
          c.segundo_apellido,
          CONCAT_WS(' ', c.primer_nombre, c.segundo_nombre, c.primer_apellido, c.segundo_apellido) as nombre_completo
        FROM solicitudes_apertura s
        INNER JOIN clientes c ON s.id_cliente = c.id_cliente
        ORDER BY s.fecha_solicitud DESC`
      );

      return rows.map(row => ({
        id_solicitud: row.id_solicitud,
        id_cliente: row.id_cliente,
        tipo_cuenta: row.tipo_cuenta,
        estado: row.estado,
        comentario_asesor: row.comentario_asesor,
        fecha_solicitud: row.fecha_solicitud,
        cliente: {
          id_cliente: row.id_cliente,
          numero_documento: row.numero_documento,
          tipo_documento: row.tipo_documento,
          primer_nombre: row.primer_nombre,
          segundo_nombre: row.segundo_nombre,
          primer_apellido: row.primer_apellido,
          segundo_apellido: row.segundo_apellido,
          nombre_completo: row.nombre_completo
        }
      }));
    } catch (error) {
      console.error('Error al obtener solicitudes:', error);
      throw new Error('Error al obtener las solicitudes');
    }
  }

  // Obtener solicitud por ID
  async obtenerSolicitudPorId(idSolicitud: number): Promise<SolicitudResponse | null> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT 
          s.id_solicitud,
          s.id_cliente,
          s.tipo_cuenta,
          s.estado,
          s.comentario_asesor,
          s.comentario_director,
          s.fecha_solicitud,
          s.fecha_respuesta,
          c.numero_documento,
          c.tipo_documento,
          c.primer_nombre,
          c.segundo_nombre,
          c.primer_apellido,
          c.segundo_apellido,
          CONCAT_WS(' ', c.primer_nombre, c.segundo_nombre, c.primer_apellido, c.segundo_apellido) as nombre_completo
        FROM solicitudes_apertura s
        INNER JOIN clientes c ON s.id_cliente = c.id_cliente
        WHERE s.id_solicitud = ?`,
        [idSolicitud]
      );

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      return {
        id_solicitud: row.id_solicitud,
        id_cliente: row.id_cliente,
        tipo_cuenta: row.tipo_cuenta,
        estado: row.estado,
        comentario_asesor: row.comentario_asesor,
        fecha_solicitud: row.fecha_solicitud,
        cliente: {
          id_cliente: row.id_cliente,
          numero_documento: row.numero_documento,
          tipo_documento: row.tipo_documento,
          primer_nombre: row.primer_nombre,
          segundo_nombre: row.segundo_nombre,
          primer_apellido: row.primer_apellido,
          segundo_apellido: row.segundo_apellido,
          nombre_completo: row.nombre_completo
        }
      };
    } catch (error) {
      console.error('Error al obtener solicitud:', error);
      throw new Error('Error al obtener la solicitud');
    }
  }

  // Actualizar estado de solicitud
  async actualizarEstadoSolicitud(
    idSolicitud: number,
    estado: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Devuelta',
    comentarioDirector?: string
  ): Promise<boolean> {
    try {
      const [result] = await pool.query<ResultSetHeader>(
        `UPDATE solicitudes_apertura 
        SET estado = ?, 
            comentario_director = ?,
            fecha_respuesta = CURRENT_TIMESTAMP
        WHERE id_solicitud = ?`,
        [estado, comentarioDirector || null, idSolicitud]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar solicitud:', error);
      throw new Error('Error al actualizar la solicitud');
    }
  }

  // Eliminar solicitud
  async eliminarSolicitud(idSolicitud: number): Promise<boolean> {
    try {
      const [result] = await pool.query<ResultSetHeader>(
        'DELETE FROM solicitudes_apertura WHERE id_solicitud = ?',
        [idSolicitud]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al eliminar solicitud:', error);
      throw new Error('Error al eliminar la solicitud');
    }
  }

  // Obtener archivo de solicitud
  async obtenerArchivo(idSolicitud: number): Promise<Buffer | null> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT archivo FROM solicitudes_apertura WHERE id_solicitud = ?',
        [idSolicitud]
      );

      if (rows.length === 0 || !rows[0].archivo) {
        return null;
      }

      return rows[0].archivo as Buffer;
    } catch (error) {
      console.error('Error al obtener archivo:', error);
      throw new Error('Error al obtener el archivo');
    }
  }
}

export default new SolicitudService();