// src/modules/asesor/asesor.routes.ts
import { Router } from 'express';
import { ClienteController } from './controllers/consultarController';
import { RegistrarClienteController } from './controllers/registrarClienteController';

const router = Router();
const clienteController = new ClienteController();
const registrarController = new RegistrarClienteController();

// ====== RUTAS DEL MÓDULO ASESOR ======
// Buscar cliente por número de documento (GET)
router.get('/cliente/:numeroDocumento', (req, res) =>
  clienteController.buscarCliente(req, res)
);

// Ruta para registrar cliente completo (modular)
router.post('/registrar-cliente', registrarClienteController.registrarCliente);



export default router;
// import { Router } from 'express';
// import { ClienteController } from './controllers/consultarController';

// const router = Router();
// const clienteController = new ClienteController();

// // ====== RUTAS DEL MÓDULO ASESOR ======
// router.get('/cliente/:numeroDocumento', (req, res) =>
//   clienteController.buscarCliente(req, res)
// );

// export default router;
