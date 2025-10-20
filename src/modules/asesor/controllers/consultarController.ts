// src/modules/asesor/controllers/consultarController.ts
import { Request, Response } from 'express';
import { ClienteService } from '../services/consultarService';

const clienteService = new ClienteService();

export class ClienteController {
  async buscarCliente(req: Request, res: Response) {
    try {
      const { numeroDocumento } = req.params;

      // 🧱 Validación del parámetro
      if (!numeroDocumento) {
        return res.status(400).json({
          mensaje: 'El número de documento es requerido',
          existe: false
        });
      }

      // 🔍 Buscar cliente en la base de datos
      const resultado = await clienteService.buscarPorDocumento(numeroDocumento);

      // 📭 Si no se encontró
      if (!resultado.existe) {
        return res.status(404).json({
          mensaje: 'Cliente no encontrado',
          existe: false
        });
      }

      // ✅ Si se encontró, devolver la info
      return res.json({
        mensaje: 'Cliente encontrado correctamente',
        existe: true,
        cliente: resultado.cliente
      });

    } catch (error) {
      console.error('Error en ClienteController.buscarCliente:', error);
      return res.status(500).json({
        mensaje: 'Error interno del servidor',
        existe: false
      });
    }
  }
}



// import { Request, Response } from 'express';
// import { ClienteService } from '../services/consultarService';

// const clienteService = new ClienteService();

// export class ClienteController {
//   async buscarCliente(req: Request, res: Response) {
//     try {
//       const { numeroDocumento } = req.params;

//       if (!numeroDocumento) {
//         return res.status(400).json({ error: 'El número de documento es requerido' });
//       }

//       const resultado = await clienteService.buscarPorDocumento(numeroDocumento);

//       if (!resultado.existe) {
//         return res.status(404).json({ error: 'Cliente no encontrado' });
//       }

//       res.json(resultado);
//     } catch (error) {
//       console.error('Error en ClienteController.buscarCliente:', error);
//       res.status(500).json({ error: 'Error interno del servidor' });
//     }
//   }
// }
