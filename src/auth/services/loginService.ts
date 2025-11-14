import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { PoolConnection } from "mysql2/promise";
import pool from '../../config/database'; // tu pool de conexiones
import { LoginRequest, LoginResponse, Rol } from '../../shared/interfaces';

export class LoginService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'banca_uno_secret_key_2025';
  private readonly JWT_EXPIRES_IN = '8h';

  // ------------------------------------------------------------
  // Método principal de login (modificado para asignación de caja)
  // ------------------------------------------------------------
  async login(loginData: LoginRequest): Promise<LoginResponse> {
    // 1) Obtener una conexión del pool (necesaria para transacciones)
    const connection = await pool.getConnection();

    try {
      // 2) Log de inicio del proceso
      console.log('\n🔐 === PROCESO DE LOGIN ===');
      console.log('📧 Correo:', loginData.correo);
      console.log('👤 Rol solicitado:', loginData.rol);

      // 3) Buscar el usuario por correo
      const [usuarios] = await connection.query<RowDataPacket[]>(
        'SELECT id_usuario, nombre, correo, contrasena, activo FROM usuarios WHERE correo = ?',
        [loginData.correo]
      );

      // 4) Si no existe, devolver error de credenciales
      if (usuarios.length === 0) {
        console.log('❌ Usuario no encontrado');
        return { success: false, message: 'Credenciales inválidas' };
      }

      const usuario = usuarios[0];
      console.log('✅ Usuario encontrado:', usuario.nombre);

      // 5) Verificar si el usuario está activo
      if (!usuario.activo) {
        console.log('❌ Usuario inactivo');
        return { success: false, message: 'Usuario inactivo. Contacte al administrador' };
      }

      // 6) Verificar contraseña (compara hash)
      const passwordValida = await bcryptjs.compare(loginData.contrasena, usuario.contrasena);
      if (!passwordValida) {
        console.log('❌ Contraseña incorrecta');
        return { success: false, message: 'Credenciales inválidas' };
      }
      console.log('✅ Contraseña correcta');

      // 7) Verificar que el rol existe
      const [rolesExistentes] = await connection.query<RowDataPacket[]>(
        'SELECT id_rol, nombre, descripcion FROM roles WHERE nombre = ?',
        [loginData.rol]
      );

      if (rolesExistentes.length === 0) {
        console.log('❌ Rol no existe:', loginData.rol);
        return { success: false, message: `El rol ${loginData.rol} no existe en el sistema` };
      }

      const rol = rolesExistentes[0];
      console.log('✅ Rol encontrado:', rol.nombre);

      // 8) Verificar si el usuario ya tiene el rol asignado; si no, asignarlo
      const [rolesUsuario] = await connection.query<RowDataPacket[]>(
        `SELECT id_usuario_rol FROM usuario_rol WHERE id_usuario = ? AND id_rol = ?`,
        [usuario.id_usuario, rol.id_rol]
      );

      let idUsuarioRol: number;
      if (rolesUsuario.length === 0) {
        // 8.a) Insertar relación usuario_rol
        const [result] = await connection.query<ResultSetHeader>(
          'INSERT INTO usuario_rol (id_usuario, id_rol) VALUES (?, ?)',
          [usuario.id_usuario, rol.id_rol]
        );
        idUsuarioRol = result.insertId;
        console.log(`✅ Rol ${loginData.rol} asignado automáticamente`);
      } else {
        idUsuarioRol = rolesUsuario[0].id_usuario_rol;
        console.log('✅ Usuario ya tiene el rol asignado');
      }

      // 9) Si el rol es "Cajero", asignar la primera caja libre (operación atómica)
      let cajaAsignada: { id_caja: number; nombre_caja: string } | null = null;
      if (rol.nombre.toLowerCase() === 'cajero') {
        // 9.a) Llamar a método que hace la asignación dentro de una transacción
        cajaAsignada = await this.asignarPrimeraCajaLibre(connection, usuario.id_usuario, usuario.nombre);
        // 9.b) Si no hay cajas disponibles, retornar error y no emitir token
        if (!cajaAsignada) {
          console.log('⚠️ No hay cajas libres en este momento');
          return { success: false, message: 'No hay cajas disponibles en este momento. Intente más tarde.' };
        }
        console.log('✅ Caja asignada al usuario:', cajaAsignada);
      }

      // 10) Generar token JWT incluyendo información útil (id_usuario, correo, nombre, rol, id_usuario_rol y caja si aplica)
      const tokenPayload: any = {
        id_usuario: usuario.id_usuario,
        correo: usuario.correo,
        nombre: usuario.nombre,
        rol: rol.nombre,
        id_usuario_rol: idUsuarioRol
      };

      if (cajaAsignada) {
        tokenPayload.id_caja = cajaAsignada.id_caja;
        tokenPayload.nombre_caja = cajaAsignada.nombre_caja;
      }

      const token = jwt.sign(tokenPayload, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN });
      console.log('✅ Token JWT generado');

      // 11) Preparar datos de respuesta (incluye caja si fue asignada)
      const responseUser: any = {
        id_usuario: usuario.id_usuario,
        correo: usuario.correo,
        nombre: usuario.nombre,
        rol: rol.nombre,
        id_usuario_rol: idUsuarioRol
      };
      if (cajaAsignada) {
        responseUser.id_caja = cajaAsignada.id_caja;
        responseUser.nombre_caja = cajaAsignada.nombre_caja;
      }

      console.log('✅ === LOGIN EXITOSO ===\n');

      // 12) Retornar login exitoso con token y datos de usuario
      return {
        success: true,
        message: 'Inicio de sesión exitoso',
        token,
        user: responseUser
      };

    } catch (error) {
      // 13) Manejo de errores
      console.error('❌ Error en login service:', error);
      throw error;
    } finally {
      // 14) Liberar la conexión al pool en cualquier caso
      connection.release();
    }
  }

  // ------------------------------------------------------------
  // Método auxiliar: asignarPrimeraCajaLibre
  // - Ejecuta una transacción para evitar race conditions
  // - Busca la primera caja LIBRE (ORDER BY id_caja LIMIT 1 FOR UPDATE)
  // - Marca la caja como OCUPADA y asigna el id_usuario
  // - Crea o actualiza el registro en saldos_cajero (vinculando id_caja)
  // ------------------------------------------------------------
  private async asignarPrimeraCajaLibre(connection: PoolConnection, idUsuario: number, nombreUsuario: string) {
    // 1) Iniciar transacción para garantizar atomicidad
    await connection.beginTransaction();

    try {
      // 2) Seleccionar la primera caja libre y bloquearla para esta transacción
      const [cajasRows] = await connection.query<RowDataPacket[]>(
        `SELECT id_caja, nombre_caja FROM cajas
         WHERE estado = 'LIBRE'
         ORDER BY id_caja
         LIMIT 1
         FOR UPDATE`
      );

      // 3) Si no hay cajas libres, hacer rollback y devolver null
      if (cajasRows.length === 0) {
        await connection.rollback();
        return null;
      }

      // 4) Tomar la primera caja disponible
      const caja = cajasRows[0];
      const idCaja = caja.id_caja;

      // 5) Marcar la caja como ocupada y asignar el usuario (UPDATE)
      await connection.query(
        `UPDATE cajas
         SET estado = 'OCUPADA', usuario_asignado = ?, fecha_asignacion = NOW()
         WHERE id_caja = ?`,
        [idUsuario, idCaja]
      );

      // 6) Verificar si existe un registro en saldos_cajero para esa caja
      const [saldoRows] = await connection.query<RowDataPacket[]>(
        `SELECT id_saldo FROM saldos_cajero WHERE id_caja = ? LIMIT 1`,
        [idCaja]
      );

      if (saldoRows.length === 0) {
        // 7.a) Si no existe, crear registro con saldo 0 y vincular id_caja
        await connection.query<ResultSetHeader>(
          `INSERT INTO saldos_cajero (cajero, saldo_efectivo, saldo_cheques, id_caja)
           VALUES (?, 0.00, 0.00, ?)`,
          [nombreUsuario, idCaja]
        );
      } else {
        // 7.b) Si existe, actualizar el campo 'cajero' por si cambió el nombre del usuario
        await connection.query(
          `UPDATE saldos_cajero SET cajero = ? WHERE id_caja = ?`,
          [nombreUsuario, idCaja]
        );
      }

      // 8) Commit de la transacción para persistir cambios
      await connection.commit();

      // 9) Devolver datos de la caja asignada
      return { id_caja: idCaja, nombre_caja: caja.nombre_caja };

    } catch (err) {
      // 10) Si hay error, hacer rollback y re-lanzar
      await connection.rollback();
      console.error('Error asignando caja (transacción):', err);
      throw err;
    }
  }

  // ------------------------------------------------------------
  // Método público para liberar la caja asociada a un usuario
  // - Busca cajas donde usuario_asignado = idUsuario y las libera
  // - Se usa al cerrar sesión (logout)
  // ------------------------------------------------------------
  async liberarCajaPorUsuario(idUsuario: number): Promise<{ success: boolean; message: string }> {
    const connection = await pool.getConnection();

    try {
      // 1) Liberar todas las cajas asignadas a este usuario (normalmente será 0 o 1)
      const [result] = await connection.query<ResultSetHeader>(
        `UPDATE cajas
         SET estado = 'LIBRE', usuario_asignado = NULL, fecha_asignacion = NULL
         WHERE usuario_asignado = ?`,
        [idUsuario]
      );

      // 2) Si no se afectaron filas, significa que no tenía caja asignada
      if (result.affectedRows === 0) {
        return { success: true, message: 'No se encontró caja asignada para este usuario.' };
      }

      return { success: true, message: 'Caja liberada correctamente.' };

    } catch (error) {
      console.error('Error liberando caja:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Obtener roles disponibles para un usuario
   */
  async getRolesDisponibles(correo: string): Promise<Rol[]> {
    const connection = await pool.getConnection();

    try {
      const [roles] = await connection.query<RowDataPacket[]>(
        `SELECT r.id_rol, r.nombre, r.descripcion 
         FROM usuario_rol ur
         INNER JOIN roles r ON ur.id_rol = r.id_rol
         INNER JOIN usuarios u ON ur.id_usuario = u.id_usuario
         WHERE u.correo = ? AND u.activo = TRUE`,
        [correo]
      );

      return roles as Rol[];
    } catch (error) {
      console.error('Error al obtener roles disponibles:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Asignar un rol a un usuario
   */
  async asignarRol(correo: string, nombreRol: string): Promise<{ success: boolean; message: string }> {
    const connection = await pool.getConnection();

    try {
      // 1. Obtener id del usuario
      const [usuarios] = await connection.query<RowDataPacket[]>(
        'SELECT id_usuario FROM usuarios WHERE correo = ?',
        [correo]
      );

      if (usuarios.length === 0) {
        return { success: false, message: 'Usuario no encontrado' };
      }

      const idUsuario = usuarios[0].id_usuario;

      // 2. Obtener id del rol
      const [roles] = await connection.query<RowDataPacket[]>(
        'SELECT id_rol FROM roles WHERE nombre = ?',
        [nombreRol]
      );

      if (roles.length === 0) {
        return { success: false, message: 'Rol no encontrado' };
      }

      const idRol = roles[0].id_rol;

      // 3. Verificar si ya tiene el rol asignado
      const [rolExistente] = await connection.query<RowDataPacket[]>(
        'SELECT id_usuario_rol FROM usuario_rol WHERE id_usuario = ? AND id_rol = ?',
        [idUsuario, idRol]
      );

      if (rolExistente.length > 0) {
        return { success: false, message: 'El usuario ya tiene este rol asignado' };
      }

      // 4. Asignar rol
      await connection.query<ResultSetHeader>(
        'INSERT INTO usuario_rol (id_usuario, id_rol) VALUES (?, ?)',
        [idUsuario, idRol]
      );

      return { success: true, message: 'Rol asignado correctamente' };

    } catch (error) {
      console.error('Error al asignar rol:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Verificar si un usuario tiene un rol específico
   */
  async verificarRol(correo: string, nombreRol: string): Promise<boolean> {
    const connection = await pool.getConnection();

    try {
      const [resultado] = await connection.query<RowDataPacket[]>(
        `SELECT ur.id_usuario_rol 
         FROM usuario_rol ur
         INNER JOIN usuarios u ON ur.id_usuario = u.id_usuario
         INNER JOIN roles r ON ur.id_rol = r.id_rol
         WHERE u.correo = ? AND r.nombre = ?`,
        [correo, nombreRol]
      );

      return resultado.length > 0;
    } catch (error) {
      console.error('Error al verificar rol:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Obtener todos los roles del sistema
   */
  async getRoles(): Promise<Rol[]> {
    const connection = await pool.getConnection();

    try {
      const [roles] = await connection.query<RowDataPacket[]>(
        'SELECT id_rol, nombre, descripcion FROM roles ORDER BY nombre'
      );

      return roles as Rol[];
    } catch (error) {
      console.error('Error al obtener roles:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}