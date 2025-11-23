import express from 'express';
import cors from 'cors';
import { authMiddleware } from './shared/middleware/authMiddleware';
import asesorRoutes from './modules/asesor/asesor.routes';
import cajeroRoutes from './modules/cajero/cajero.routes';
import directorRoutes from './modules/director-operativo/director.routes';
import authRoutes from './auth/auth.routes';

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas públicas (SIN autenticación)
app.use('/api/auth', authRoutes);

// Rutas protegidas (CON autenticación)
app.use('/api/asesor',authMiddleware, asesorRoutes);    
app.use('/api/director',authMiddleware, directorRoutes);
app.use('/api/cajero', authMiddleware, cajeroRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Banca Uno - Sistema Bancario',
    version: '1.0.0',
    modules: {
      auth: '/api/auth/*',
      asesor: '/api/asesor/*',
      director: '/api/director/*'
    },
    endpoints: {
       // Autenticación
      login: 'POST /api/auth/login',
      registro: 'POST /api/auth/registro',
      rolesDisponibles: 'GET /api/auth/roles?correo=...',
     
      // Asesor
      solicitudes: 'GET /api/asesor/solicitudes',
      crearSolicitud: 'POST /api/asesor/solicitudes',
      buscarCliente: 'GET /api/asesor/clientes/:cedula',
      buscarPorCedula: 'GET /api/asesor/solicitudes/cedula/:cedula',
      obtenerSolicitud: 'GET /api/asesor/solicitudes/:id',
      verificarSolicitud: 'GET /api/asesor/solicitudes/existe/:id',

      // Director - Consultas
      buscarPorAsesor: 'GET /api/director/solicitudes/asesor/:id_usuario_rol',
      detalleSolicitud: 'GET /api/director/solicitudes/:id_solicitud',
      todasSolicitudes: 'GET /api/director/solicitudes?estado=Pendiente',
      
      // Director - Gestión de solicitudes
      detalleCompleto: 'GET /api/director/solicitud-detalle/:id_solicitud',
      rechazarSolicitud: 'PUT /api/director/solicitud/:id_solicitud/rechazar',
      aprobarSolicitud: 'PUT /api/director/solicitud/:id_solicitud/aprobar',
      descargarArchivo: 'GET /api/director/solicitud/:id_solicitud/archivo',

      // Cajero (protegidas)
      apertura: 'POST /api/cajero/apertura/aperturar-cuenta',
      retiro: 'POST /api/cajero/retiro/procesar-retiro',
      consignacion: 'POST /api/cajero/consignacion/procesar',
      saldo: 'GET /api/cajero/saldo/consultar'
    }
  });
});

// Manejo de errores
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Base de datos: banca_uno`);
  console.log(`🔐 Módulo de autenticación: /api/auth/*`);
  console.log(`👤 Módulo de asesor: /api/asesor/*`);
  console.log(`👔 Módulo de director: /api/director/*`);
  console.log('');
  console.log('Endpoints disponibles:');
  console.log('  AUTH:');
  console.log('    - POST /api/auth/registro');
  console.log('    - POST /api/auth/login');
  console.log('    - GET  /api/auth/roles-disponibles?email=...');
  console.log('    - POST /api/auth/asignar-rol');
  console.log('    - GET  /api/auth/roles');
  console.log('');
  console.log('  DIRECTOR - Consultas:');
  console.log('    - GET  /api/director/solicitudes/asesor/:id_usuario_rol');
  console.log('    - GET  /api/director/solicitudes/:id_solicitud');
  console.log('    - GET  /api/director/solicitudes');
  console.log('');
  console.log('  DIRECTOR - Gestión:');
  console.log('    - GET  /api/director/solicitud-detalle/:id_solicitud');
  console.log('    - PUT  /api/director/solicitud/:id_solicitud/rechazar');
  console.log('    - PUT  /api/director/solicitud/:id_solicitud/aprobar');
  console.log('    - GET  /api/director/solicitud/:id_solicitud/archivo');
   console.log(`👤 Módulo de cajero: /api/cajero/*`);
    console.log('  - POST /api/auth/registro');
  console.log('  - POST /api/auth/login');
  console.log('  - GET  /api/auth/roles?correo=...');
  console.log('  - POST /api/cajero/apertura/aperturar-cuenta (requiere JWT)');
  console.log('  - POST /api/cajero/retiro/procesar-retiro (requiere JWT)');
  console.log('  - POST /api/cajero/consignacion/procesar (requiere JWT)');
});
