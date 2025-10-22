import express from 'express';
import cors from 'cors';
import asesorRoutes from './modules/asesor/asesor.routes';

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas por módulos/roles

app.use('/api/asesor', asesorRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Banca Uno - Sistema Bancario',
    modules: {
      cajero: '/api/cajero/*',
      asesor: '/api/asesor/*'
    }
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(` Servidor corriendo en http://localhost:${PORT}`);
  console.log(` Base de datos: banca_uno`);
 
});
