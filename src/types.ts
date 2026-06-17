/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Representa un timestamp similar al de Firestore
export interface TimestampLike {
  seconds: number;
  nanoseconds: number;
  toDate?: () => Date;
}

// /lineas/{lineaId}
export interface Linea {
  id: 'L1' | 'L2';
  nombre: string;
  velocidadNominal: number;    // unidades/hora diseño
  activa: boolean;
  turnoActual: 'mañana' | 'tarde' | 'noche';
}

// /lineas/{lineaId}/turnos/{turnoId}
export interface Turno {
  id?: string;
  lineaId: 'L1' | 'L2';
  fecha: Date | TimestampLike;
  turno: 'mañana' | 'tarde' | 'noche';
  tiempoPlanificadoMin: number;
  tiempoParoProgramadoMin: number;
  tiempoParoNoProgramadoMin: number;
  unidadesProducidas: number;
  unidadesDefectuosas: number;
  velocidadReal: number;
  // Calculados:
  disponibilidad: number;   // 0-1
  rendimiento: number;      // 0-1
  calidad: number;          // 0-1
  oee: number;              // 0-100
  estado: 'activo' | 'cerrado';
  updatedAt: Date | TimestampLike;
}

// /ordenes/{ordenId}
export interface OrdenProduccion {
  id: string;
  lineaId: 'L1' | 'L2';
  productoId: string;
  nombreProducto: string;
  cantidadPlanificada: number;
  cantidadProducida: number;
  fechaInicio: Date | TimestampLike;
  fechaFin?: Date | TimestampLike;
  estadoOrden: 'pendiente' | 'en_curso' | 'completada' | 'cancelada';
  tiempoHoras?: number;
}

// /pedidos/{pedidoId}
export interface Pedido {
  id: string;
  clienteNombre: string;
  productoId: string;
  cantidadSolicitada: number;
  cantidadEntregada: number;
  fechaPedido: Date | TimestampLike;
  fechaCompromiso: Date | TimestampLike;
  fechaEntregaReal?: Date | TimestampLike;
  estadoPedido: 'pendiente' | 'en_produccion' | 'enviado' | 'completada' | 'retrasado';
  onTime?: boolean;
  inFull?: boolean;
  otif?: boolean;
}

// /alarmas/{alarmaId}
export interface Alarma {
  id: string;
  lineaId: 'L1' | 'L2';
  tipo: 'temperatura' | 'presion' | 'velocidad' | 'calidad' | 'mecanico' | 'electrico';
  nivel: 'info' | 'advertencia' | 'critica';
  descripcion: string;
  timestamp: Date | TimestampLike;
  resuelta: boolean;
  tiempoResolucionMin?: number;
}

// /kpis/resumen
export interface ResumenKPIs {
  otifMensual: number;
  otifObjetivo: number;        // siempre 95
  alarmasCriticasPct: number;
  backlogUnidades: number;
  oeeL1Actual: number;
  oeeL2Actual: number;
  mtbfL1Horas: number;
  mtbfL2Horas: number;
  mttrL1Min: number;
  mttrL2Min: number;
  updatedAt: Date | TimestampLike;
}

export type UserRole = 'operador' | 'supervisor' | 'gerente';

export enum OperationType {
  LIST = 'LIST',
  GET = 'GET',
  UPDATE = 'UPDATE',
  CREATE = 'CREATE',
  DELETE = 'DELETE'
}

export interface UserProfile {

  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
}
