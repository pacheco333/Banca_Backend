import { Request, Response } from 'express';
import { NotaDebitoService } from '../services/notaDebitoService';

const notaDebitoService = new NotaDebitoService();

export class NotaDebitoController {
  // Aplicar nota débito
  async aplicarNotaDebito(req: Request, res: Response) {
    try {
      const datos = req.body;

      // EXTRAER el nombre del cajero del token JWT
      const user = (req as any).user;
      const nombreCajero = user?.nombre || 'Cajero 01';

      console.log(`Nota débito por cajero: ${nombreCajero}`);

      if (!datos.idCuenta || !datos.numeroDocumento || datos.valor === undefined) {
        return res.status(400).json({
          error: 'Datos incompletos para aplicar la nota débito'
        });
      }

      // Pasar nombreCajero al servicio
      const resultado = await notaDebitoService.aplicarNotaDebito({
        ...datos,
        cajero: nombreCajero
      });

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
