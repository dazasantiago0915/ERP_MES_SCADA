/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useOEELinea } from '../hooks/useOEELinea';
import GaugeOEE from '../components/kpi/GaugeOEE';
import { dbSimulada } from '../utils/simulatedDb';
import { useAuth } from '../auth/useAuth';
import { calcularOEE } from '../utils/formulas';
import { Cpu, Settings, Play, Sliders, CheckCircle, RefreshCw } from 'lucide-react';

interface LineaPageProps {
  lineaId: 'L1' | 'L2';
}

export default function LineaPage({ lineaId }: LineaPageProps) {
  const { role } = useAuth();
  const { turnoActual, historico7dias, loading } = useOEELinea(lineaId);

  // Estados de edición del turno activo
  const [tiempoPlanificado, setTiempoPlanificado] = useState<number>(480);
  const [paroProg, setParoProg] = useState<number>(20);
  const [paroNoProg, setParoNoProg] = useState<number>(30);
  const [producido, setProducido] = useState<number>(1000);
  const [defectos, setDefectos] = useState<number>(12);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Sincronizar campos de edición cuando el turno real cambia
  useEffect(() => {
    if (turnoActual) {
      setTiempoPlanificado(turnoActual.tiempoPlanificadoMin);
      setParoProg(turnoActual.tiempoParoProgramadoMin);
      setParoNoProg(turnoActual.tiempoParoNoProgramadoMin);
      setProducido(turnoActual.unidadesProducidas);
      setDefectos(turnoActual.unidadesDefectuosas);
    }
  }, [turnoActual]);

  const guardarCambiosTurno = () => {
    if (!turnoActual) return;
    
    // Calcular nueva velocidad nominal dependiente de la línea
    const velocidadNominal = lineaId === 'L1' ? 120 : 90;
    const tiempoOperativoHrs = (tiempoPlanificado - paroProg - paroNoProg) / 60;
    const velocidadReal = tiempoOperativoHrs > 0 ? (producido / tiempoOperativoHrs) : 0;

    const calculations = calcularOEE({
      tiempoPlanificadoMin: tiempoPlanificado,
      tiempoParoProgramadoMin: paroProg,
      tiempoParoNoProgramadoMin: paroNoProg,
      unidadesProducidas: producido,
      unidadesDefectuosas: defectos,
      velocidadNominal: velocidadNominal
    });

    // Guardar en base de datos simulada
    // Buscamos cambiar el turno activo del simulador
    const turnosModificados = dbSimulada.getTurnos(lineaId).map(t => {
      if (t.id === turnoActual.id) {
        return {
          ...t,
          tiempoPlanificadoMin: tiempoPlanificado,
          tiempoParoProgramadoMin: paroProg,
          tiempoParoNoProgramadoMin: paroNoProg,
          unidadesProducidas: producido,
          unidadesDefectuosas: defectos,
          velocidadReal: Number(velocidadReal.toFixed(2)),
          ...calculations,
          updatedAt: new Date()
        };
      }
      return t;
    });

    // Subimos de regreso las modificaciones
    // Para simplificar, actualizamos en el store
    (dbSimulada as any).turnos = (dbSimulada as any).turnos.map((t: any) => {
      if (t.id === turnoActual.id) {
        return { ...t, ...calculations, tiempoPlanificadoMin: tiempoPlanificado, tiempoParoProgramadoMin: paroProg, tiempoParoNoProgramadoMin: paroNoProg, unidadesProducidas: producido, unidadesDefectuosas: defectos, velocidadReal: Number(velocidadReal.toFixed(2)), updatedAt: new Date() };
      }
      return t;
    });

    (dbSimulada as any).recalcularResumen();
    (dbSimulada as any).guardarEnStorage();
    (dbSimulada as any).notificar();
    
    setFeedback('✓ Registro SCADA calibrado exitosamente en este turno.');
    setTimeout(() => setFeedback(null), 5000);
  };

  const autorizadosEscribir = ['operador', 'supervisor', 'gerente'].includes(role);

  if (loading || !turnoActual) {
    return (
      <div className="flex-1 bg-[#0F1117] flex items-center justify-center font-mono text-xs text-blue-400 gap-3">
        <Cpu className="w-5 h-5 animate-spin" />
        <span>CONECTANDO SENSORES DE DETALLE LÍNEA LOTE...</span>
      </div>
    );
  }

  const oeeActual = turnoActual.oee;
  const nominal = lineaId === 'L1' ? 120 : 90;
  const descripcionProd = lineaId === 'L1' ? 'Salsa de Tomate 500 g' : 'Jugo de Naranja 1 L';

  return (
    <div className="flex-1 bg-[#0F1117] p-6 space-y-6 overflow-y-auto">
      {/* HEADER DE TELEMETRÍA */}
      <div className="flex items-center justify-between border-b border-[#2A2D3A] pb-4">
        <div>
          <span className="text-[10px] text-blue-400 font-mono font-bold block uppercase tracking-widest">
            PANEL DE TELEMETRÍA DETALLADO
          </span>
          <h1 className="text-xl font-extrabold text-white font-sans mt-0.5">
            {lineaId === 'L1' ? 'Línea L1 — Mezclado y Envasado' : 'Línea L2 — Pasteurización y Sellado'}
          </h1>
        </div>
        <div className="text-right font-mono text-[#6B7280] text-xs">
          <span>Capacidad Nominal: <strong>{nominal} ud/hora</strong></span>
          <span className="block mt-0.5 text-[#A78BFA]">{descripcionProd}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA 1: GAUGE OEE CENTRAL DE LA LÍNEA */}
        <div className="lg:col-span-1 space-y-4">
          <GaugeOEE
            lineaId={lineaId}
            oee={oeeActual}
            disponibilidad={turnoActual.disponibilidad}
            rendimiento={turnoActual.rendimiento}
            calidad={turnoActual.calidad}
          />

          <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-5 font-mono text-xs space-y-3">
            <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-widest border-b border-[#2A2D3A] pb-2 mb-2">
              ESTADÍSTICAS DEL TURNO ACTIVO
            </span>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Producido:</span>
              <span className="text-slate-200 font-bold">{turnoActual.unidadesProducidas.toLocaleString()} ud</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Descartes Defectuosos:</span>
              <span className="text-red-400 font-bold">{turnoActual.unidadesDefectuosas.toLocaleString()} ud</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Velocidad Medida:</span>
              <span className="text-slate-200 font-bold">{turnoActual.velocidadReal} ud/hora</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Horas Operativas:</span>
              <span className="text-blue-400 font-bold">
                {((turnoActual.tiempoPlanificadoMin - turnoActual.tiempoParoProgramadoMin - turnoActual.tiempoParoNoProgramadoMin) / 60).toFixed(1)} h
              </span>
            </div>
          </div>
        </div>

        {/* COLUMNA 2: MODIFICADOR DE PARÁMETROS (OPERADORES) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6 shadow-lg relative overflow-hidden group">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#2A2D3A]/60">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Calibración Manual de Parámetros de Turno (SCADA MES)
                </h3>
              </div>
            </div>

            {autorizadosEscribir ? (
              <div className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9.5px] uppercase text-[#6B7280] block mb-1">
                      Tiempo Planificado (minutos)
                    </label>
                    <input
                      type="number"
                      value={tiempoPlanificado}
                      onChange={(e) => setTiempoPlanificado(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-[#11131E] border border-[#2A2D3A] rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-blue-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] uppercase text-[#6B7280] block mb-1">
                      Paros Programados (minutos)
                    </label>
                    <input
                      type="number"
                      value={paroProg}
                      onChange={(e) => setParoProg(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-[#11131E] border border-[#2A2D3A] rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] uppercase text-[#6B7280] block mb-1">
                      Paros No Programados / Fallos (minutos)
                    </label>
                    <input
                      type="number"
                      value={paroNoProg}
                      onChange={(e) => setParoNoProg(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-[#11131E] border border-[#2A2D3A] rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-blue-500 text-red-400"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] uppercase text-[#6B7280] block mb-1">
                      Unidades Totales Reguladas
                    </label>
                    <input
                      type="number"
                      value={producido}
                      onChange={(e) => setProducido(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-[#11131E] border border-[#2A2D3A] rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] uppercase text-[#6B7280] block mb-1">
                      Unidades Defectuosas (Control Calidad)
                    </label>
                    <input
                      type="number"
                      value={defectos}
                      onChange={(e) => setDefectos(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-[#11131E] border border-[#2A2D3A] rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-blue-500 text-red-400"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#2A2D3A] flex items-center justify-between gap-4">
                  {feedback ? (
                    <span className="text-emerald-400 font-mono text-[11px] font-medium animate-pulse">{feedback}</span>
                  ) : (
                    <span />
                  )}
                  <button
                    onClick={guardarCambiosTurno}
                    className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-xs tracking-wider transition-all flex items-center gap-2 cursor-pointer border border-blue-400/20"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Guardar y Recalcular
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500 font-mono text-xs">
                🔒 Access Restricted: Sólo personal autenticado con roles de de Planta o Operativo puede recalibrar variables físicas de sensores.
              </div>
            )}
          </div>

          {/* HISTÓRICO DE LOS ÚLTIMOS 7 REPORTES DE TURNO */}
          <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-5 shadow-lg">
            <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-4 font-bold">
              HISTORIAL DE TURNOS RECIENTES (7 DÍAS)
            </span>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {historico7dias.map((h, i) => {
                const f = h.fecha instanceof Date ? h.fecha : new Date((h.fecha as any).seconds * 1000);
                return (
                  <div key={i} className="bg-[#14161F] border border-[#2A2D3A]/60 rounded-lg p-3 flex justify-between items-center text-xs font-mono">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-200 font-bold capitalize">Turno {h.turno}</span>
                        <span className="text-[#6B7280]">•</span>
                        <span className="text-[#6B7280]">{f.toLocaleDateString()}</span>
                      </div>
                      <span className="text-[10px] text-[#6B7280] block mt-0.5">
                        Producido: <strong className="text-slate-300">{h.unidadesProducidas.toLocaleString()}</strong> · Defectos: <strong className="text-red-400">{h.unidadesDefectuosas}</strong>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-[#A78BFA] block">{h.oee.toFixed(1)}%</span>
                      <span className="text-[9px] uppercase text-[#6B7280]">OEE Promedio</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
