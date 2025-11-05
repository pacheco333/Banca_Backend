import { Request, Response } from 'express';
import registrarService from '../services/registrarService';
import { RegistroUsuarioRequest } from '../../../shared/interfaces';

class RegistrarController {

  /**
   * POST /api/auth/registro
   * Registrar un nuevo usuario
   */
  async registrarUsuario(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, email, password, rol }: RegistroUsuarioRequest = req.body;

      // Validaciones básicas
      if (!nombre || !email || !password) {
        res.status(400).json({
          success: false,
          message: 'Todos los campos son obligatorios (nombre, email, password)'
        });
        return;
      }

      // Validar formato de nombre
      if (nombre.trim().length < 3) {
        res.status(400).json({
          success: false,
          message: 'El nombre debe tener al menos 3 caracteres'
        });
        return;
      }

      // Validar formato de correo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Formato de correo electrónico inválido'
        });
        return;
      }

      // Validar longitud de contraseña
      if (password.length < 8) {
        res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 8 caracteres'
        });
        return;
      }

      // Registrar usuario
      const usuario = await registrarService.registrarUsuario({
        nombre,
        email,
        password,
        rol
      });

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: usuario
      });

    } catch (error: any) {
      console.error('Error al registrar usuario:', error);

      // Manejo de errores específicos
      if (error.message === 'El correo electrónico ya está registrado') {
        res.status(409).json({
          success: false,
          message: error.message
        });
        return;
      }

      if (error.message.includes('inválido') || error.message.includes('debe tener')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al registrar usuario'
      });
    }
  }

  /**
   * GET /api/auth/validar-email?email=correo@ejemplo.com
   * Validar si un correo ya existe
   */
  async validarEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.query;

      if (!email || typeof email !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Debe proporcionar un email válido'
        });
        return;
      }

      const existe = await registrarService.validarEmail(email);

      res.status(200).json({
        exists: existe
      });

    } catch (error) {
      console.error('Error al validar email:', error);
      res.status(500).json({
        success: false,
        message: 'Error al validar email'
      });
    }
  }

  /**
   * GET /api/auth/usuarios
   * Obtener todos los usuarios (para administración)
   */
  async obtenerUsuarios(req: Request, res: Response): Promise<void> {
    try {
      const usuarios = await registrarService.obtenerUsuarios();

      res.status(200).json({
        success: true,
        data: usuarios,
        total: usuarios.length
      });

    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuarios'
      });
    }
  }

  /**
   * GET /api/auth/usuario/:email
   * Obtener usuario por correo
   */
  async obtenerUsuarioPorCorreo(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;

      const usuario = await registrarService.obtenerUsuarioPorCorreo(email);

      if (!usuario) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: usuario
      });

    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuario'
      });
    }
  }
}

export default new RegistrarController();