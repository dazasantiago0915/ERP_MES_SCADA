/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OEEParams {
  tiempoPlanificadoMin: number;
  tiempoParoProgramadoMin: number;
  tiempoParoNoProgramadoMin: number;
  unidadesProducidas: number;
  unidadesDefectuosas: number;
  velocidadNominal: number;
}

export interface OEEOutput {
  disponibilidad: number;
  rendimiento: number;
  calidad: number;
  oee: number;
}

/**
 * Calcula OEE puro para backend Cloud Functions
 */
export function calcularOEE(params: OEEParams): OEEOutput {
  const {
    tiempoPlanificadoMin,
    tiempoParoProgramadoMin,
    tiempoParoNoProgramadoMin,
    unidadesProducidas,
    unidadesDefectuosas,
    velocidadNominal,
  } = params;

  // Validación: si el tiempo neto planificado es <= 0, OEE = 0
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

  // OEE (%) = A * P * Q * 100
  const oee = disponibilidad * rendimiento * calidad * 100;

  return {
    disponibilidad: Number(disponibilidad.toFixed(4)),
    rendimiento: Number(rendimiento.toFixed(4)),
    calidad: Number(calidad.toFixed(4)),
    oee: Number(oee.toFixed(2)),
  };
}
