// src/modules/asesor/asesor.routes.ts
import { Router } from 'express';
import { ClienteController } from './controllers/consultarController';
import { RegistrarClienteController } from './controllers/registrarClienteController';

const router = Router();
const clienteController = new ClienteController();
const registrarCLienteController = new RegistrarClienteController();

// ====== RUTAS DEL MÓDULO ASESOR ======
// Buscar cliente por número de documento (GET)
router.get('/cliente/:numeroDocumento', (req, res) =>
  clienteController.buscarCliente(req, res)
);


// Registrar cliente completo
router.post('/registrar-cliente', (req, res) => registrarCLienteController.registrar(req, res));


// Ruta para registrar cliente completo (modular)
// router.post('/registrar-cliente', (req, res) =>
//   registrarController.registrarCliente(req, res)
// );



export default router;
