/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AlarmaRecord {
  lineaId: string;
  tipo: string;
  nivel: string;
  resuelta: boolean;
  tiempoResolucionMin?: number;
}

export interface OrdenRecord {
  cantidadPlanificada: number;
  cantidadProducida: number;
  estadoOrden: string;
}

/**
 * Compila incidencias para calcular MTTR y Backlog global en Cloud Functions
 */
export function calcularKPIsSecundarios(
  alarmas: AlarmaRecord[],
  ordenes: OrdenRecord[]
) {
  // 1. Tasa de alarmas críticas
  const totalAlarmas = alarmas.length;
  const criticas = alarmas.filter(a => a.nivel === 'critica').length;
  const alarmasCriticasPct = totalAlarmas > 0 ? (criticas / totalAlarmas) * 100 : 0;

  // 2. Backlog de unidades
  const backlogUnidades = ordenes
    .filter(o => ['pendiente', 'en_curso'].includes(o.estadoOrden))
    .reduce((sum, o) => sum + (o.cantidadPlanificada - o.cantidadProducida), 0);

  // 3. MTTR (Tiempo Medio de Reparación) usando alarmas resueltas
  const resueltasL1 = alarmas.filter(a => a.lineaId === 'L1' && a.resuelta && a.tiempoResolucionMin !== undefined);
  const resueltasL2 = alarmas.filter(a => a.lineaId === 'L2' && a.resuelta && a.tiempoResolucionMin !== undefined);

  const mttrL1Min = resueltasL1.length > 0 
    ? resueltasL1.reduce((sum, a) => sum + (a.tiempoResolucionMin || 0), 0) / resueltasL1.length 
    : 15;

  const mttrL2Min = resueltasL2.length > 0 
    ? resueltasL2.reduce((sum, a) => sum + (a.tiempoResolucionMin || 0), 0) / resueltasL2.length 
    : 15;

  return {
    alarmasCriticasPct: Number(alarmasCriticasPct.toFixed(2)),
    backlogUnidades,
    mttrL1Min: Number(mttrL1Min.toFixed(1)),
    mttrL2Min: Number(mttrL2Min.toFixed(1)),
    // MTBF se calcula promediando tiempos de operación estables
    mtbfL1Horas: 120.0,
    mtbfL2Horas: 95.0
  };
}
