import { Request, Response } from 'express';
import { NotaDebitoService } from '../services/notaDebitoService';

const notaDebitoService = new NotaDebitoService();

export class NotaDebitoController {

  // Aplicar nota débito
  async aplicarNotaDebito(req: Request, res: Response) {
    try {
      const datos = req.body;

      if (!datos.idCuenta || !datos.numeroDocumento || datos.valor === undefined) {
        return res.status(400).json({
          error: 'Datos incompletos para aplicar la nota débito'
        });
      }

      const resultado = await notaDebitoService.aplicarNotaDebito(datos);
      
      if (resultado.exito) {
        res.json(resultado);
      } else {
        res.status(400).json(resultado);
      }

    } catch (error) {
      console.error('Error en aplicarNotaDebito:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }
}
