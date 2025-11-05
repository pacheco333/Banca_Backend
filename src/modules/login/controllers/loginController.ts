import { Request, Response } from 'express';
import { LoginService } from '../services/loginService';
import { LoginRequest } from '../../../shared/interfaces';

export class LoginController {
  private loginService: LoginService;

  constructor() {
    this.loginService = new LoginService();
  }

  /**
   * Login de usuario con rol seleccionado
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const loginData: LoginRequest = req.body;

      // Validar datos requeridos
      if (!loginData.email || !loginData.password || !loginData.rol) {
        res.status(400).json({
          success: false,
          message: 'Email, contraseña y rol son requeridos'
        });
        return;
      }

      // Intentar login
      const result = await this.loginService.login(loginData);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(401).json(result);
      }
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener roles disponibles para un usuario
   */
  getRolesDisponibles = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.query;

      if (!email || typeof email !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Email es requerido'
        });
        return;
      }

      const roles = await this.loginService.getRolesDisponibles(email);

      res.status(200).json({
        success: true,
        roles
      });
    } catch (error) {
      console.error('Error al obtener roles:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener roles disponibles'
      });
    }
  };

  /**
   * Asignar rol a un usuario
   */
  asignarRol = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, rol } = req.body;

      if (!email || !rol) {
        res.status(400).json({
          success: false,
          message: 'Email y rol son requeridos'
        });
        return;
      }

      const result = await this.loginService.asignarRol(email, rol);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error al asignar rol:', error);
      res.status(500).json({
        success: false,
        message: 'Error al asignar rol'
      });
    }
  };

  /**
   * Verificar si un usuario tiene un rol específico
   */
  verificarRol = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, rol } = req.query;

      if (!email || !rol || typeof email !== 'string' || typeof rol !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Email y rol son requeridos'
        });
        return;
      }

      const tieneRol = await this.loginService.verificarRol(email, rol);

      res.status(200).json({
        success: true,
        tieneRol
      });
    } catch (error) {
      console.error('Error al verificar rol:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar rol'
      });
    }
  };

  /**
   * Obtener todos los roles del sistema
   */
  getRoles = async (req: Request, res: Response): Promise<void> => {
    try {
      const roles = await this.loginService.getRoles();

      res.status(200).json({
        success: true,
        roles
      });
    } catch (error) {
      console.error('Error al obtener roles:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener roles'
      });
    }
  };
}