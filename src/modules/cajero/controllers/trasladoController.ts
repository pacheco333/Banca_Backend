import { Request, Response } from 'express';
import { TrasladoService } from '../services/trasladoService';

const trasladoService = new TrasladoService();

export class TrasladoController {
  
  async enviarTraslado(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await trasladoService.enviarTraslado(req.body);
      
      if (resultado.exito) {
        res.status(200).json(resultado);
      } else {
        res.status(400).json(resultado);
      }
    } catch (error) {
      console.error('Error en enviarTraslado:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al enviar el traslado'
      });
    }
  }

  async consultarTrasladosPendientes(req: Request, res: Response): Promise<void> {
    try {
      const { cajeroDestino } = req.query;
      
      if (!cajeroDestino) {
        res.status(400).json({
          exito: false,
          mensaje: 'El cajero destino es requerido'
        });
        return;
      }

      const resultado = await trasladoService.consultarTrasladosPendientes(cajeroDestino as string);
      res.status(200).json(resultado);
    } catch (error) {
      console.error('Error en consultarTrasladosPendientes:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al consultar los traslados'
      });
    }
  }

  async aceptarTraslado(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await trasladoService.aceptarTraslado(req.body);
      
      if (resultado.exito) {
        res.status(200).json(resultado);
      } else {
        res.status(400).json(resultado);
      }
    } catch (error) {
      console.error('Error en aceptarTraslado:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al aceptar el traslado'
      });
    }
  }
}
