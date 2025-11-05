import express from 'express';
import cors from 'cors';
import asesorRoutes from './modules/asesor/asesor.routes';
import registroRoutes from './modules/registro/registro.routes';
import loginRoutes from './modules/login/login.routes';

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas por módulos/roles
app.use('/api/auth', registroRoutes);  // Rutas de registro
app.use('/api/auth', loginRoutes);     // Rutas de login
app.use('/api/asesor', asesorRoutes);  // Rutas del asesor

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Banca Uno - Sistema Bancario',
    version: '1.0.0',
    modules: {
      auth: '/api/auth/*',
      asesor: '/api/asesor/*'
    },
    endpoints: {
      // Registro
      registro: 'POST /api/auth/registro',
      validarEmail: 'GET /api/auth/validar-email?email=correo@ejemplo.com',
      usuarios: 'GET /api/auth/usuarios',
      
      // Login
      login: 'POST /api/auth/login',
      rolesDisponibles: 'GET /api/auth/roles-disponibles?email=correo@ejemplo.com',
      asignarRol: 'POST /api/auth/asignar-rol',
      verificarRol: 'GET /api/auth/verificar-rol?email=correo@ejemplo.com&rol=Asesor',
      roles: 'GET /api/auth/roles',
      
      // Asesor
      solicitudes: 'GET /api/asesor/solicitudes',
      crearSolicitud: 'POST /api/asesor/solicitudes'
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
  console.log(` Servidor corriendo en http://localhost:${PORT}`);
  console.log(` Base de datos: banca_uno`);
  console.log(` Módulo de autenticación: /api/auth/*`);
  console.log(` Módulo de asesor: /api/asesor/*`);
  console.log('');
  console.log('Endpoints disponibles:');
  console.log('  - POST /api/auth/registro');
  console.log('  - POST /api/auth/login');
  console.log('  - GET  /api/auth/roles-disponibles?email=...');
  console.log('  - POST /api/auth/asignar-rol');
  console.log('  - GET  /api/auth/roles');
});