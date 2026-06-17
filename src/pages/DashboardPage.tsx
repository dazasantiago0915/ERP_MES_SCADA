/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import GaugeOEE from '../components/kpi/GaugeOEE';
import OTIFProgressBar from '../components/kpi/OTIFProgressBar';
import TarjetaKPI from '../components/kpi/TarjetaKPI';
import OEETendencia from '../components/charts/OEETendencia';
import DescomposicionOEE from '../components/charts/DescomposicionOEE';
import PanelAlarmas from '../components/alerts/PanelAlarmas';
import TablaPedidos from '../components/tables/TablaPedidos';
import SemaforoOEE from '../components/kpi/SemaforoOEE';
import BacklogFunnel from '../components/charts/BacklogFunnel';

import { useOEELinea } from '../hooks/useOEELinea';
import { useOTIF } from '../hooks/useOTIF';
import { useAlarmas } from '../hooks/useAlarmas';
import { useKPIsSecundarios } from '../hooks/useKPIsSecundarios';
import { Layers, AlertOctagon, Cpu, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { turnoActual: L1Turno, historico7dias: L1Hist, loading: L1Loading } = useOEELinea('L1');
  const { turnoActual: L2Turno, historico7dias: L2Hist, loading: L2Loading } = useOEELinea('L2');
  const { otifMensual, pedidosEnRiesgo, loading: otifLoading } = useOTIF();
  const { alarmasActivas, alarmasCriticas, tasaCriticidad, loading: alarmasLoading } = useAlarmas();
  const { resumen, loading: kpisLoading } = useKPIsSecundarios();

  // Estados por defecto si cargan
  const oeeL1 = L1Turno ? L1Turno.oee : 76.5;
  const oeeL2 = L2Turno ? L2Turno.oee : 81.2;

  const dispL1 = L1Turno ? L1Turno.disponibilidad : 0.92;
  const rendL1 = L1Turno ? L1Turno.rendimiento : 0.85;
  const calL1 = L1Turno ? L1Turno.calidad : 0.98;

  const dispL2 = L1Turno ? L2Turno?.disponibilidad || 0.94 : 0.94;
  const rendL2 = L1Turno ? L2Turno?.rendimiento || 0.88 : 0.88;
  const calL2 = L1Turno ? L2Turno?.calidad || 0.98 : 0.98;

  const backlogVal = resumen ? resumen.backlogUnidades : 4850;

  const cargandoGeneral = L1Loading || L2Loading || otifLoading || alarmasLoading || kpisLoading;

  if (cargandoGeneral) {
    return (
      <div className="flex-1 bg-[#0F1117] flex items-center justify-center font-mono text-xs text-blue-400 gap-3">
        <Cpu className="w-5 h-5 animate-spin" />
        <span>SINCRO SCADA EN PROCESO...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0F1117] p-6 space-y-6 overflow-y-auto">
      {/* SECCIÓN ANALÍTICA DE INDICADORES - TITULAR */}
      <div className="flex items-center justify-between border-b border-[#2A2D3A] pb-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-white font-sans">
            SISTEMA INTEGRADO DE MANUFACTURA (OEE / OTIF)
          </h1>
          <p className="text-xs text-[#6B7280] font-mono mt-0.5">
            Vista global acoplada a través de Firebase Firestore real-time onSnapshot
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#1A1D27] border border-[#2A2D3A] rounded-lg px-3.5 py-1.5 text-xs text-slate-300 font-mono">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>OEE Meta: <strong className="text-emerald-400">≥85%</strong></span>
        </div>
      </div>

      {/* FILA 1: 5 COLUMNAS EN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Gauge L1 */}
        <GaugeOEE
          lineaId="L1"
          oee={oeeL1}
          disponibilidad={dispL1}
          rendimiento={rendL1}
          calidad={calL1}
        />

        {/* Gauge L2 */}
        <GaugeOEE
          lineaId="L2"
          oee={oeeL2}
          disponibilidad={dispL2}
          rendimiento={rendL2}
          calidad={calL2}
        />

        {/* OTIF Progress */}
        <OTIFProgressBar otif={otifMensual} />

        {/* Backlog Tarjeta */}
        <TarjetaKPI
          titulo="Backlog de Órdenes"
          valor={`${backlogVal.toLocaleString()} ud`}
          subtexto="Órdenes pendientes y en proceso"
          colorClase="text-amber-400"
          icon={<Layers className="w-4 h-4 text-amber-400" />}
        />

        {/* Alertas Críticas */}
        <TarjetaKPI
          titulo="Tasa Alarmas Críticas"
          valor={`${tasaCriticidad.toFixed(1)}%`}
          subtexto={`${alarmasCriticas} alarmas activas en panel`}
          colorClase="text-red-400"
          icon={<AlertOctagon className="w-4 h-4 text-red-400" />}
        />
      </div>

      {/* FILA 2: GRÁFICOS DE COMPARATIVOS (2 COLUMNAS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <OEETendencia
          historicoL1={L1Hist}
          historicoL2={L2Hist}
        />

        <DescomposicionOEE
          factoresL1={{ disponibilidad: dispL1, rendimiento: rendL1, calidad: calL1 }}
          factoresL2={{ disponibilidad: dispL2, rendimiento: rendL2, calidad: calL2 }}
        />
      </div>

      {/* FILA 3: ALARMAS SCADA Y PEDIDOS EN RIESGO (2 COLUMNAS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PanelAlarmas
          alarmas={alarmasActivas}
        />

        <TablaPedidos
          pedidos={pedidosEnRiesgo}
        />
      </div>

      {/* FILA AUXILIAR: SEMAFORIZACIÓN COMPLETA & ANALISIS DE EMBUDO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SemaforoOEE />
        <BacklogFunnel ordenes={resumen ? [] : []} /> {/* can take database state dynamically */}
      </div>
    </div>
  );
}
