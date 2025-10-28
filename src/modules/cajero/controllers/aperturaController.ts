import { Request, Response } from 'express';
import { AperturaService } from '../services/aperturaService';

const aperturaService = new AperturaService();

export class AperturaController {
  
  async verificarCliente(req: Request, res: Response) {
    try {
      const { tipoDocumento, numeroDocumento } = req.body;

      if (!tipoDocumento || !numeroDocumento) {
        return res.status(400).json({
          error: 'Tipo de documento y número de documento son requeridos'
        });
      }

      const resultado = await aperturaService.verificarCliente(tipoDocumento, numeroDocumento);
      res.json(resultado);

    } catch (error) {
      console.error('Error en verificarCliente:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  async aperturarCuenta(req: Request, res: Response) {
    try {
      const datos = req.body;

      if (!datos.idSolicitud || !datos.tipoDeposito || datos.valorDeposito === undefined) {
        return res.status(400).json({
          error: 'Datos incompletos para aperturar la cuenta'
        });
      }

      const resultado = await aperturaService.aperturarCuenta(datos);
      
      if (resultado.exito) {
        res.json(resultado);
      } else {
        res.status(400).json(resultado);
      }

    } catch (error) {
      console.error('Error en aperturarCuenta:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }
}
