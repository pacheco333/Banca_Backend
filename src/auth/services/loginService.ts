import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../../config/database';
import { LoginRequest, LoginResponse, Rol } from '../../shared/interfaces';

export class LoginService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'banca_uno_secret_key_2025';
  private readonly JWT_EXPIRES_IN = '8h';

  /**
   * Login de usuario con asignación automática de rol si no lo tiene
   */
  async login(loginData: LoginRequest): Promise<LoginResponse> {
    const connection = await pool.getConnection();

    try {
      console.log('\n🔐 === PROCESO DE LOGIN ===');
      console.log('📧 Correo:', loginData.correo);
      console.log('👤 Rol:', loginData.rol);

      // 1. Buscar usuario por correo
      const [usuarios] = await connection.query<RowDataPacket[]>(
        'SELECT id_usuario, nombre, correo, contrasena, activo FROM usuarios WHERE correo = ?',
        [loginData.correo]
      );

      if (usuarios.length === 0) {
        console.log('❌ Usuario no encontrado');
        return {
          success: false,
          message: 'Credenciales inválidas'
        };
      }

      const usuario = usuarios[0];
      console.log('✅ Usuario encontrado:', usuario.nombre);

      // 2. Verificar si el usuario está activo
      if (!usuario.activo) {
        console.log('❌ Usuario inactivo');
        return {
          success: false,
          message: 'Usuario inactivo. Contacte al administrador'
        };
      }

      // 3. Verificar contraseña
      const passwordValida = await bcrypt.compare(loginData.contrasena, usuario.contrasena);

      if (!passwordValida) {
        console.log('❌ Contraseña incorrecta');
        return {
          success: false,
          message: 'Credenciales inválidas'
        };
      }

      console.log('✅ Contraseña correcta');

      // 4. Verificar que el rol existe en el sistema
      const [rolesExistentes] = await connection.query<RowDataPacket[]>(
        'SELECT id_rol, nombre, descripcion FROM roles WHERE nombre = ?',
        [loginData.rol]
      );

      if (rolesExistentes.length === 0) {
        console.log('❌ Rol no existe:', loginData.rol);
        return {
          success: false,
          message: `El rol ${loginData.rol} no existe en el sistema`
        };
      }

      const rol = rolesExistentes[0];
      console.log('✅ Rol encontrado:', rol.nombre);

      // 5. Verificar si el usuario ya tiene el rol asignado
      const [rolesUsuario] = await connection.query<RowDataPacket[]>(
        `SELECT id_usuario_rol FROM usuario_rol 
         WHERE id_usuario = ? AND id_rol = ?`,
        [usuario.id_usuario, rol.id_rol]
      );

      let idUsuarioRol: number;

      // 6. Si no tiene el rol, asignárselo automáticamente
      if (rolesUsuario.length === 0) {
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

      // 7. Generar token JWT
      const token = jwt.sign(
        {
          id_usuario: usuario.id_usuario,
          correo: usuario.correo,
          nombre: usuario.nombre,
          rol: rol.nombre,
          id_usuario_rol: idUsuarioRol
        },
        this.JWT_SECRET,
        { expiresIn: this.JWT_EXPIRES_IN }
      );

      console.log('✅ Token JWT generado');
      console.log('✅ === LOGIN EXITOSO ===\n');

      // 8. Retornar respuesta exitosa
      return {
        success: true,
        message: 'Inicio de sesión exitoso',
        token,
        user: {
          id_usuario: usuario.id_usuario,
          correo: usuario.correo,
          nombre: usuario.nombre,
          rol: rol.nombre,
          id_usuario_rol: idUsuarioRol
        }
      };

    } catch (error) {
      console.error('❌ Error en login service:', error);
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