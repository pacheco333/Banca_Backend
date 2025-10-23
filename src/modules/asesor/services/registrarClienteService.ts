import pool from '../../../database'; // Ajusta la ruta a tu conexión

export class RegistrarClienteService {
  async registrarCliente(data: any) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1️⃣ Insertar información personal
      const [clienteResult]: any = await connection.query(
        `INSERT INTO clientes (
          numero_documento, tipo_documento, lugar_expedicion,
          ciudad_nacimiento, fecha_nacimiento, fecha_expedicion,
          primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
          genero, nacionalidad, otra_nacionalidad, estado_civil, grupo_etnico
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.informacionPersonal.numero_documento,
          data.informacionPersonal.tipo_documento,
          data.informacionPersonal.lugar_expedicion,
          data.informacionPersonal.ciudad_nacimiento,
          data.informacionPersonal.fecha_nacimiento,
          data.informacionPersonal.fecha_expedicion,
          data.informacionPersonal.primer_nombre,
          data.informacionPersonal.segundo_nombre,
          data.informacionPersonal.primer_apellido,
          data.informacionPersonal.segundo_apellido,
          data.informacionPersonal.genero,
          data.informacionPersonal.nacionalidad,
          data.informacionPersonal.otra_nacionalidad,
          data.informacionPersonal.estado_civil,
          data.informacionPersonal.grupo_etnico
        ]
      );

      const id_cliente = clienteResult.insertId;

      // 2️⃣ Insertar contacto personal
      await connection.query(
        `INSERT INTO contacto_personal (
          direccion, barrio, departamento, telefono,
          ciudad, pais, correo, bloque_torre, apto_casa, id_cliente
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.contactoPersonal.direccion,
          data.contactoPersonal.barrio,
          data.contactoPersonal.departamento,
          data.contactoPersonal.telefono,
          data.contactoPersonal.ciudad,
          data.contactoPersonal.pais,
          data.contactoPersonal.correo,
          data.contactoPersonal.bloque_torre,
          data.contactoPersonal.apto_casa,
          id_cliente
        ]
      );

      // 3️⃣ Insertar información laboral
      await connection.query(
        `INSERT INTO info_laboral (
          nombre_empresa, direccion_empresa, pais_empresa, departamento_empresa,
          ciudad_empresa, telefono_empresa, ext, celular_empresa, correo_laboral, id_cliente
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.informacionLaboral.nombre_empresa,
          data.informacionLaboral.direccion_empresa,
          data.informacionLaboral.pais_empresa,
          data.informacionLaboral.departamento_empresa,
          data.informacionLaboral.ciudad_empresa,
          data.informacionLaboral.telefono_empresa,
          data.informacionLaboral.ext,
          data.informacionLaboral.celular_empresa,
          data.informacionLaboral.correo_laboral,
          id_cliente
        ]
      );

      // 4️⃣ Insertar información financiera
      await connection.query(
        `INSERT INTO info_financiera (
          ingresos_mensuales, egresos_mensuales, total_activos, total_pasivos, id_cliente
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          data.informacionFinanciera.ingresos_mensuales,
          data.informacionFinanciera.egresos_mensuales,
          data.informacionFinanciera.total_activos,
          data.informacionFinanciera.total_pasivos,
          id_cliente
        ]
      );

      await connection.commit();
      return { id_cliente };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
