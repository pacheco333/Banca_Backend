import { Router } from 'express';
import registrarController from './controllers/registrarController';

const router = Router();

/**
      POST /api/auth/registro
      Registrar un nuevo usuario
      Public
 */
router.post('/registro', registrarController.registrarUsuario.bind(registrarController));

/**
     GET /api/auth/validar-email
     Validar si un correo electrónico ya existe
  
 */
router.get('/validar-email', registrarController.validarEmail.bind(registrarController));

/**
     GET /api/auth/usuarios
     Obtener todos los usuarios (solo admin)
     Private (añadir middleware de autenticación)
 */
router.get('/usuarios', registrarController.obtenerUsuarios.bind(registrarController));

/**
     GET /api/auth/usuario/:email
     Obtener usuario por correo

 */
router.get('/usuario/:email', registrarController.obtenerUsuarioPorCorreo.bind(registrarController));

export default router;