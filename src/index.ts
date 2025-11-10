import express from 'express';
import cors from 'cors';
import { authMiddleware } from './shared/middleware/authMiddleware';
import cajeroRoutes from './modules/cajero/cajero.routes';
import authRoutes from './auth/auth.routes';

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas públicas (SIN autenticación)
app.use('/api/auth', authRoutes);

// Rutas protegidas (CON autenticación)
app.use('/api/cajero', authMiddleware, cajeroRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: 'API Banca Uno - Sistema Bancario',
    version: '1.0.0',
    modules: {
      auth: '/api/auth/*',
      cajero: '/api/cajero/*'
    },
    endpoints: {
      // Autenticación
      login: 'POST /api/auth/login',
      registro: 'POST /api/auth/registro',
      rolesDisponibles: 'GET /api/auth/roles?correo=...',
      
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

// Iniciar servidor //Mensajes en consolo para verificar que funcione todo 
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Base de datos: banca_uno`);
  console.log(`🔐 Autenticación con JWT: /api/auth/*`);
  console.log(`👤 Módulo de cajero: /api/cajero/*`);
  console.log('');
  console.log('Endpoints disponibles:');
  console.log('  - POST /api/auth/registro');
  console.log('  - POST /api/auth/login');
  console.log('  - GET  /api/auth/roles?correo=...');
  console.log('  - POST /api/cajero/apertura/aperturar-cuenta (requiere JWT)');
  console.log('  - POST /api/cajero/retiro/procesar-retiro (requiere JWT)');
  console.log('  - POST /api/cajero/consignacion/procesar (requiere JWT)');
});
