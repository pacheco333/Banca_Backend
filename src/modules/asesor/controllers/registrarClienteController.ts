import { Request, Response } from 'express';
import { RegistrarClienteService } from '../services/registrarClienteService';

const registrarClienteService = new RegistrarClienteService();

export class RegistrarClienteController {
  async registrar(req: Request, res: Response) {
    try {
      const result = await registrarClienteService.registrarClienteCompleto(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message || 'Error interno del servidor' });
    }
  }
}
