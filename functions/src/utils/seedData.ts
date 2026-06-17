/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const LINEAS_SEED = [
  {
    id: 'L1',
    nombre: 'Línea L1 - Salsa de Tomate',
    tipoProceso: 'Mezclado y envasado',
    capacidadNominal: 120, // unidades por hora
    updatedAt: new Date()
  },
  {
    id: 'L2',
    nombre: 'Línea L2 - Jugo de Naranja',
    tipoProceso: 'Pasteurización',
    capacidadNominal: 90, // unidades por hora
    updatedAt: new Date()
  }
];

export const PEDIDOS_SEED = [
  {
    id: 'PED-401',
    clienteNombre: 'Supermercados Carulla',
    productoId: 'P1',
    cantidadSolicitada: 1500,
    cantidadEntregada: 1500,
    fechaPedido: new Date(),
    fechaCompromiso: new Date(),
    fechaEntregaReal: new Date(),
    estadoPedido: 'completada',
    onTime: true,
    inFull: true,
    otif: true
  },
  {
    id: 'PED-402',
    clienteNombre: 'Distribuciones Éxito S.A.',
    productoId: 'P2',
    cantidadSolicitada: 2000,
    cantidadEntregada: 1980,
    fechaPedido: new Date(),
    fechaCompromiso: new Date(),
    fechaEntregaReal: new Date(),
    estadoPedido: 'completada',
    onTime: true,
    inFull: true, // cumple por tolerancia del 2%
    otif: true
  },
  {
    id: 'PED-403',
    clienteNombre: 'Tiendas Ara Express',
    productoId: 'P1',
    cantidadSolicitada: 1200,
    cantidadEntregada: 0,
    fechaPedido: new Date(),
    fechaCompromiso: new Date(),
    estadoPedido: 'pendiente',
    onTime: false,
    inFull: false,
    otif: false
  }
];
