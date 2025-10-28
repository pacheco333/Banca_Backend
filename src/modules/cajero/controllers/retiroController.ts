import { Request, Response } from 'express';
import { RetiroService } from '../services/retiroService';

const retiroService = new RetiroService();

export class RetiroController {

  // Buscar cuenta por número
  async buscarCuenta(req: Request, res: Response) {
    try {
      const { numeroCuenta } = req.body;

      if (!numeroCuenta) {
        return res.status(400).json({
          error: 'El número de cuenta es requerido'
        });
      }

      const resultado = await retiroService.buscarCuenta(numeroCuenta);
      res.json(resultado);

    } catch (error) {
      console.error('Error en buscarCuenta:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  // Procesar retiro de dinero
  async procesarRetiro(req: Request, res: Response) {
    try {
      const datos = req.body;

      if (!datos.idCuenta || !datos.numeroDocumento || datos.montoRetirar === undefined) {
        return res.status(400).json({
          error: 'Datos incompletos para procesar el retiro'
        });
      }

      const resultado = await retiroService.procesarRetiro(datos);
      
      if (resultado.exito) {
        res.json(resultado);
      } else {
        res.status(400).json(resultado);
      }

    } catch (error) {
      console.error('Error en procesarRetiro:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }
}
