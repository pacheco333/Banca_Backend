import { Request, Response } from 'express';
import { ConsignacionService } from '../services/consignacionService';

const consignacionService = new ConsignacionService();

export class ConsignacionController {
  
  async procesarConsignacion(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await consignacionService.procesarConsignacion(req.body);
      
      if (resultado.exito) {
        res.status(200).json(resultado);
      } else {
        res.status(400).json(resultado);
      }
    } catch (error) {
      console.error('Error en procesarConsignacion:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al procesar la consignación'
      });
    }
  }
}
