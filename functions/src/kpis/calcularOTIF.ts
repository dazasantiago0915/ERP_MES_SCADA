/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OTIFParams {
  fechaCompromisoMillis: number;
  fechaEntregaRealMillis?: number;
  cantidadSolicitada: number;
  cantidadEntregada: number;
}

export interface OTIFOutput {
  onTime: boolean;
  inFull: boolean;
  otif: boolean;
}

/**
 * Calcula OTIF puro para backend Cloud Functions (con tolerancia del 2% para In Full)
 */
export function calcularOTIF(params: OTIFParams): OTIFOutput {
  const { fechaCompromisoMillis, fechaEntregaRealMillis, cantidadSolicitada, cantidadEntregada } = params;

  if (!fechaEntregaRealMillis) {
    return { onTime: false, inFull: false, otif: false };
  }

  // A tiempo = fecha_entrega_real <= fecha_compromiso
  const onTime = fechaEntregaRealMillis <= fechaCompromisoMillis;
  
  // Completo = cantidad_entregada >= cantidad_solicitada * 0.98 (tolerancia del 2%)
  const inFull = cantidadEntregada >= (cantidadSolicitada * 0.98);
  
  const otif = onTime && inFull;

  return { onTime, inFull, otif };
}
