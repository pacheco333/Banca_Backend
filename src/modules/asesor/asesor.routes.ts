import { Router } from 'express';
import multer from 'multer';
import solicitudController from './controllers/solicitudController';

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

// Rutas para clientes
router.get('/clientes/:cedula', solicitudController.buscarCliente);

// Rutas para solicitudes
router.post('/solicitudes', upload.single('archivo'), solicitudController.crearSolicitud);
router.get('/solicitudes', solicitudController.obtenerSolicitudes);
router.get('/solicitudes/:id', solicitudController.obtenerSolicitudPorId);
router.put('/solicitudes/:id/estado', solicitudController.actualizarEstado);
router.delete('/solicitudes/:id', solicitudController.eliminarSolicitud);
router.get('/solicitudes/:id/archivo', solicitudController.descargarArchivo);

export default router;