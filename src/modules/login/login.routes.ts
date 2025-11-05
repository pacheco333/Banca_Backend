import { Router } from 'express';
import { LoginController } from '../login/controllers/loginController';

const router = Router();
const loginController = new LoginController();

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuario con rol seleccionado
 * @access  Public
 */
router.post('/login', loginController.login);

/**
 * @route   GET /api/auth/roles-disponibles
 * @desc    Obtener roles disponibles para un usuario
 * @query   email - Email del usuario
 * @access  Public
 */
router.get('/roles-disponibles', loginController.getRolesDisponibles);

/**
 * @route   POST /api/auth/asignar-rol
 * @desc    Asignar un rol a un usuario
 * @access  Public (debería ser protegido en producción)
 */
router.post('/asignar-rol', loginController.asignarRol);

/**
 * @route   GET /api/auth/verificar-rol
 * @desc    Verificar si un usuario tiene un rol específico
 * @query   email - Email del usuario
 * @query   rol - Nombre del rol
 * @access  Public
 */
router.get('/verificar-rol', loginController.verificarRol);

/**
 * @route   GET /api/auth/roles
 * @desc    Obtener todos los roles del sistema
 * @access  Public
 */
router.get('/roles', loginController.getRoles);

export default router;