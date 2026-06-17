/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Calcula el OEE (Overall Equipment Effectiveness) de una línea de producción
 * 
 * Fórmulas:
 * - Tiempo Operativo = Tiempo Planificado - Tiempo Paro Programado - Tiempo Paro No Programado
 * - Disponibilidad (A) = Tiempo Operativo / Tiempo Planificado
 * - Rendimiento (P) = (Unidades Producidas / Tiempo Operativo) / Velocidad Nominal
 * - Calidad (Q) = Unidades Buenas / Unidades Totales Producidas
 *   donde Unidades Buenas = Unidades Producidas - Unidades Defectuosas
 * - OEE (%) = A * P * Q * 100
 * 
 * Validación: si (Tiempo Planificado - Tiempo Paro Programado) <= 0 -> OEE = 0
 * Todos los valores se redondean a 2 decimales.
 */
export function calcularOEE(params: {
  tiempoPlanificadoMin: number;
  tiempoParoProgramadoMin: number;
  tiempoParoNoProgramadoMin: number;
  unidadesProducidas: number;
  unidadesDefectuosas: number;
  velocidadNominal: number; // unidades/hora
}) {
  const {
    tiempoPlanificadoMin,
    tiempoParoProgramadoMin,
    tiempoParoNoProgramadoMin,
    unidadesProducidas,
    unidadesDefectuosas,
    velocidadNominal,
  } = params;

  // Validación inicial
  if (tiempoPlanificadoMin - tiempoParoProgramadoMin <= 0) {
    return { disponibilidad: 0, rendimiento: 0, calidad: 0, oee: 0 };
  }

  const tiempoOperativoMin = tiempoPlanificadoMin - tiempoParoProgramadoMin - tiempoParoNoProgramadoMin;
  const tiempoOperativoHoras = Math.max(0, tiempoOperativoMin / 60);

  // 1. Disponibilidad (A)
  const disponibilidad = Math.max(0, Math.min(1, tiempoOperativoMin / (tiempoPlanificadoMin - tiempoParoProgramadoMin)));

  // 2. Rendimiento (P)
  let rendimiento = 0;
  if (tiempoOperativoHoras > 0 && velocidadNominal > 0) {
    rendimiento = (unidadesProducidas / tiempoOperativoHoras) / velocidadNominal;
  }
  rendimiento = Math.max(0, Math.min(1, rendimiento));

  // 3. Calidad (Q)
  let calidad = 0;
  if (unidadesProducidas > 0) {
    const unidadesBuenas = unidadesProducidas - unidadesDefectuosas;
    calidad = unidadesBuenas / unidadesProducidas;
  }
  calidad = Math.max(0, Math.min(1, calidad));

  // OEE %
  const oee = disponibilidad * rendimiento * calidad * 100;

  return {
    disponibilidad: Number(disponibilidad.toFixed(4)),
    rendimiento: Number(rendimiento.toFixed(4)),
    calidad: Number(calidad.toFixed(4)),
    oee: Number(oee.toFixed(2)),
  };
}

/**
 * Obtener color y etiqueta del Semáforo OEE (4 niveles):
 * OEE < 65%              -> CRÍTICO    (rojo    #EF4444)
 * 65% <= OEE < 75%        -> MEJORAR    (amarillo #F59E0B)
 * 75% <= OEE < 85%        -> ACEPTABLE  (verde   #22C55E)
 * OEE >= 85%              -> WORLD CLASS (violeta #A78BFA)
 */
export function obtenerSemaforoOEE(oee: number) {
  if (oee < 65) {
    return { color: '#EF4444', label: 'CRÍTICO', bgClass: 'bg-red-500/10 text-red-400 border-red-500/20' };
  } else if (oee < 75) {
    return { color: '#F59E0B', label: 'POR MEJORAR', bgClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
  } else if (oee < 85) {
    return { color: '#22C55E', label: 'ACEPTABLE', bgClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
  } else {
    return { color: '#A78BFA', label: 'WORLD CLASS', bgClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
  }
}

/**
 * Evalúa OTIF (On Time In Full) para un pedido individual:
 * - "A tiempo" (On Time) = fechaEntregaReal <= fechaCompromiso
 * - "Completo" (In Full) = cantidadEntregada >= cantidadSolicitada * 0.98 (tolerancia del 2%)
 * - OTIF por pedido = On Time && In Full
 */
export function evaluarOTIF(pedido: {
  fechaCompromiso: Date | { seconds: number };
  fechaEntregaReal?: Date | { seconds: number } | null;
  cantidadSolicitada: number;
  cantidadEntregada: number;
}) {
  const { fechaCompromiso, fechaEntregaReal, cantidadSolicitada, cantidadEntregada } = pedido;

  if (!fechaEntregaReal) {
    return { onTime: false, inFull: false, otif: false };
  }

  const compTime = fechaCompromiso instanceof Date ? fechaCompromiso.getTime() : (fechaCompromiso.seconds * 1000);
  const realTime = fechaEntregaReal instanceof Date ? fechaEntregaReal.getTime() : (fechaEntregaReal.seconds * 1000);

  const onTime = realTime <= compTime;
  const inFull = cantidadEntregada >= (cantidadSolicitada * 0.98);
  const otif = onTime && inFull;

  return { onTime, inFull, otif };
}
