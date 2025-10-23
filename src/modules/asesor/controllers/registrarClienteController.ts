import { Request, Response } from 'express';
import { RegistrarClienteService } from '../services/registrarClienteService';

const registrarClienteService = new RegistrarClienteService();

export class RegistrarClienteController {
  async registrarCliente(req: Request, res: Response) {
    try {
      const clienteData = req.body; // Recibe todos los submódulos juntos

      const result = await registrarClienteService.registrarCliente(clienteData);

      return res.status(201).json({
        message: 'Cliente registrado exitosamente',
        id_cliente: result.id_cliente,
      });
    } catch (error: any) {
      console.error('Error en registrarClienteController:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}
