import { Router } from 'express';
import multer from 'multer';
import solicitudController from './controllers/solicitudController';
import { authMiddleware, requireRole } from '../../middlewares/authMiddleware';

const router = Router();

// Configuración de multer para manejar archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Límite de 5MB
  },
  fileFilter: (req, file, cb) => {
    // Tipos de archivo permitidos
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se permiten PDF, imágenes y Word.'));
    }
  }
});

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas para clientes
router.get('/clientes/:cedula', solicitudController.buscarCliente);

// Rutas para solicitudes - Solo asesores pueden crear solicitudes
router.post(
  '/solicitudes', 
  requireRole('Asesor'), 
  upload.single('archivo'), 
  solicitudController.crearSolicitud
);

// Obtener solicitudes - Accesible para Asesor y Director-operativo
router.get(
  '/solicitudes', 
  requireRole('Asesor', 'Director-operativo'), 
  solicitudController.obtenerSolicitudes
);

router.get(
  '/solicitudes/:id', 
  requireRole('Asesor', 'Director-operativo'), 
  solicitudController.obtenerSolicitudPorId
);

// Actualizar estado - Solo Director-operativo
router.put(
  '/solicitudes/:id/estado', 
  requireRole('Director-operativo'), 
  solicitudController.actualizarEstado
);

// Eliminar solicitud - Solo Asesor o Administrador
router.delete(
  '/solicitudes/:id', 
  requireRole('Asesor', 'Administrador'), 
  solicitudController.eliminarSolicitud
);

// Descargar archivo - Accesible para Asesor y Director-operativo
router.get(
  '/solicitudes/:id/archivo', 
  requireRole('Asesor', 'Director-operativo'), 
  solicitudController.descargarArchivo
);

export default router;