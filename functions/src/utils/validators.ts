/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Validador de modelos de datos para la ingesta en batch
 */
export function validarPedidoCSV(row: any): string[] {
  const errores: string[] = [];

  if (!row.clienteNombre || typeof row.clienteNombre !== 'string') {
    errores.push('El campo "clienteNombre" es requerido y debe ser texto.');
  }

  const solicitada = Number(row.cantidadSolicitada);
  if (isNaN(solicitada) || solicitada <= 0) {
    errores.push('La cantidad solicitada debe ser un número entero positivo.');
  }

  const entregada = Number(row.cantidadEntregada || 0);
  if (isNaN(entregada) || entregada < 0) {
    errores.push('La cantidad entregada debe ser un número entero mayor o igual a cero.');
  }

  const estadosValidos = ['pendiente', 'completada'];
  if (row.estadoPedido && !estadosValidos.includes(row.estadoPedido)) {
    errores.push('El campo "estadoPedido" debe ser uno de: pendiente, completada.');
  }

  return errores;
}
