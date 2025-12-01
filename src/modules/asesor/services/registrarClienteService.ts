import pool from '../../../config/database'; // La ruta a la base de datos

export class RegistrarClienteService {
  async registrarClienteCompleto(data: any) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 🧹 LIMPIEZA DE DATOS: convierte undefined en null para evitar errores de MySQL
      for (const key in data) {
        if (data[key] === undefined) {
          data[key] = null;
        }
      }

      // También limpia los subobjetos (contacto, actividad, laboral, financiera, facta)
      const secciones = ['contacto', 'actividad', 'laboral', 'financiera', 'facta'];
      for (const seccion of secciones) {
        if (data[seccion]) {
          for (const key in data[seccion]) {
            if (data[seccion][key] === undefined) {
              data[seccion][key] = null;
            }
          }
        }
      }

      console.log('🧩 Datos limpios antes del INSERT:', JSON.stringify(data, null, 2));

      // Validación/normalización: estado civil debe coincidir con el ENUM de la BD
      const estadoCivilMap: Record<string, string> = {
        'UnionLibre': 'Unión Libre',
        'unionlibre': 'Unión Libre',
        'Unión libre': 'Unión Libre',
        'unión libre': 'Unión Libre',
        'union libre': 'Unión Libre'
      };
      if (data.estadoCivil && estadoCivilMap[data.estadoCivil]) {
        data.estadoCivil = estadoCivilMap[data.estadoCivil];
      }
      const estadoCivilPermitidos = new Set(['Soltero', 'Casado', 'Unión Libre', 'Divorciado', 'Viudo']);
      if (data.estadoCivil && !estadoCivilPermitidos.has(data.estadoCivil)) {
        throw new Error("Valor inválido para estado_civil. Permitidos: 'Soltero','Casado','Unión Libre'");
      }


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
      // como la base de datos usa 'Sí'/'No' en vez de booleanos esta linea hace la conversion
      const factaCrsEconomica = data.actividad.factaCrs ? 'Sí' : 'No';
       // === ⚠️ 3. Insertar actividad económica (faltante totalmente) ===
      await connection.execute(
        `
        INSERT INTO actividad_economica (
          profesion, ocupacion, codigo_CIIU, detalle_actividad,
          numero_empleados, facta_crs, id_cliente
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          data.actividad?.profesion,
          data.actividad?.ocupacion,
          data.actividad?.codigoCiiu,
          data.actividad?.detalleActividad,
          data.actividad?.numeroEmpleados,
          factaCrsEconomica,
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

      // === ⚠️ 5. Insertar información financiera (faltante totalmente) ===
      await connection.execute(
        `
        INSERT INTO info_financiera (
          ingresos_mensuales, egresos_mensuales, total_activos,
          total_pasivos, id_cliente
        ) VALUES (?, ?, ?, ?, ?)
        `,
        [
          data.financiera?.ingresosMensuales,
          data.financiera?.egresosMensuales,
          data.financiera?.totalActivos,
          data.financiera?.totalPasivos,
          idCliente,
        ]
      );
  
      const esResidente = data.facta.esResidenteExtranjero ? 'Sí' : 'No';
      // === 4. Insertar FACTA/CRS ===
      await connection.execute(
        `
        INSERT INTO Facta_Crs (id_cliente, es_residente_extranjero, pais)
        VALUES (?, ?, ?)
        `,
        [idCliente,esResidente, data.facta?.pais]
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
