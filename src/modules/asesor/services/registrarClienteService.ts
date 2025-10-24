import pool from '../../../config/database'; // Ajusta la ruta según tu proyecto

export class RegistrarClienteService {
  async registrarClienteCompleto(data: any) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // === 1. Insertar cliente ===
      const [clienteResult]: any = await connection.execute(
        `
        INSERT INTO clientes (
          tipo_documento, numero_documento, lugar_expedicion,
          ciudad_nacimiento, fecha_nacimiento, fecha_expedicion,
          primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
          genero, nacionalidad, otra_nacionalidad, estado_civil, grupo_etnico
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          data.tipoDocumento,
          data.numeroDocumento,
          data.lugarExpedicion,
          data.ciudadNacimiento,
          data.fechaNacimiento,
          data.fechaExpedicion,
          data.primerNombre,
          data.segundoNombre,
          data.primerApellido,
          data.segundoApellido,
          data.genero,
          data.nacionalidad,
          data.otraNacionalidad,
          data.estadoCivil,
          data.grupoEtnico,
        ]
      );

      const idCliente = clienteResult.insertId;

      // === 2. Insertar contacto personal ===
      await connection.execute(
        `
        INSERT INTO contacto_personal (
          direccion, barrio, departamento, telefono, ciudad,
          pais, correo, bloque_torre, apto_casa, id_cliente
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          data.contacto?.direccion,
          data.contacto?.barrio,
          data.contacto?.departamento,
          data.contacto?.telefono,
          data.contacto?.ciudad,
          data.contacto?.pais,
          data.contacto?.correo,
          data.contacto?.bloqueTorre,
          data.contacto?.aptoCasa,
          idCliente,
        ]
      );

      // === 3. Insertar información laboral ===
      await connection.execute(
        `
        INSERT INTO info_laboral (
          nombre_empresa, direccion_empresa, pais_empresa,
          departamento_empresa, ciudad_empresa, telefono_empresa,
          ext, celular_empresa, correo_laboral, id_cliente
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          data.laboral?.nombreEmpresa,
          data.laboral?.direccionEmpresa,
          data.laboral?.paisEmpresa,
          data.laboral?.departamentoEmpresa,
          data.laboral?.ciudadEmpresa,
          data.laboral?.telefonoEmpresa,
          data.laboral?.ext,
          data.laboral?.celularEmpresa,
          data.laboral?.correoLaboral,
          idCliente,
        ]
      );

      // === 4. Insertar FACTA/CRS ===
      await connection.execute(
        `
        INSERT INTO facta_crs (id_cliente, es_residente_extranjero, pais)
        VALUES (?, ?, ?)
        `,
        [idCliente, data.facta?.esResidenteExtranjero, data.facta?.pais]
      );

      await connection.commit();

      return { success: true, message: 'Cliente registrado correctamente', idCliente };
    } catch (error) {
      await connection.rollback();
      console.error('Error al registrar cliente:', error);
      throw new Error('Error al registrar cliente');
    } finally {
      connection.release();
    }
  }
}
