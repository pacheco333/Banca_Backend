import { Request, Response } from 'express';
import saldoCajeroService from '../services/saldoCajeroService';

export class SaldoCajeroController {
  
  async obtenerSaldos(req: Request, res: Response): Promise<void> {
    try {
      const { cajero } = req.query;

      if (!cajero) {
        res.status(400).json({
          exito: false,
          mensaje: 'El parámetro cajero es requerido'
        });
        return;
      }

      const saldos = await saldoCajeroService.obtenerSaldosCajero(cajero as string);
      
      res.status(200).json({
        exito: true,
        saldos: {
          saldoEfectivo: saldos.saldoEfectivo,
          saldoCheques: saldos.saldoCheques,
          total: saldos.saldoEfectivo + saldos.saldoCheques
        }
      });
    } catch (error) {
      console.error('Error en obtenerSaldos:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener los saldos del cajero'
      });
    }
  }
}
