import { Router } from 'express';
import { AperturaController } from './controllers/aperturaController';
import { RetiroController } from './controllers/retiroController';
import { NotaDebitoController } from './controllers/notaDebitoController';
import { SaldoCajeroController } from './controllers/saldoCajeroController';
import { ConsignacionController } from './controllers/consignacionController';
import { CancelacionController } from './controllers/cancelacionController';
import { TrasladoController } from './controllers/trasladoController'; // ← DEBE ESTAR

const router = Router();

// Controllers
const aperturaController = new AperturaController();
const retiroController = new RetiroController();
const notaDebitoController = new NotaDebitoController();
const saldoCajeroController = new SaldoCajeroController();
const consignacionController = new ConsignacionController();
const cancelacionController = new CancelacionController();
const trasladoController = new TrasladoController(); // ← DEBE ESTAR

// ========== RUTAS DE APERTURA ==========
router.post('/apertura/verificar-cliente', (req, res) => 
  aperturaController.verificarCliente(req, res)
);
router.post('/apertura/aperturar-cuenta', (req, res) => 
  aperturaController.aperturarCuenta(req, res)
);

// ========== RUTAS DE RETIRO ==========
router.post('/retiro/buscar-cuenta', (req, res) => 
  retiroController.buscarCuenta(req, res)
);
router.post('/retiro/procesar-retiro', (req, res) => 
  retiroController.procesarRetiro(req, res)
);

// ========== RUTAS DE NOTA DÉBITO ==========
router.post('/nota-debito/aplicar-nota-debito', (req, res) => 
  notaDebitoController.aplicarNotaDebito(req, res)
);

// ========== RUTAS DE CONSIGNACIÓN ==========
router.post('/consignacion/procesar', (req, res) => 
  consignacionController.procesarConsignacion(req, res)
);

// ========== RUTAS DE CANCELACIÓN ==========
router.post('/cancelacion/cancelar', (req, res) => 
  cancelacionController.cancelarCuenta(req, res)
);

// ========== RUTAS DE TRASLADO ========== ← AGREGAR ESTAS
router.post('/traslado/enviar', (req, res) => 
  trasladoController.enviarTraslado(req, res)
);
router.get('/traslado/consultar-pendientes', (req, res) => 
  trasladoController.consultarTrasladosPendientes(req, res)
);
router.post('/traslado/aceptar', (req, res) => 
  trasladoController.aceptarTraslado(req, res)
);

// ========== RUTAS DE SALDOS ==========
router.get('/saldo/consultar', (req, res) => 
  saldoCajeroController.obtenerSaldos(req, res)
);

export default router;
