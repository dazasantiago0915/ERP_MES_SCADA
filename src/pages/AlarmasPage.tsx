/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAlarmas } from '../hooks/useAlarmas';
import { useAuth } from '../auth/useAuth';
import { dbSimulada } from '../utils/simulatedDb';
import PanelAlarmas from '../components/alerts/PanelAlarmas';
import AlarmasPorTipo from '../components/charts/AlarmasPorTipo';
import { AlertCircle, PlusCircle, Radio, Clock, ShieldAlert } from 'lucide-react';

export default function AlarmasPage() {
  const { role } = useAuth();
  const { alarmasActivas } = useAlarmas();
  
  // Traemos todo el listado de alarmas, tanto resueltas como activas para la auditoría
  const todasLasAlarmas = dbSimulada.getAlarmas();

  // Estados del creador manual
  const [lineaId, setLineaId] = useState<'L1' | 'L2'>('L1');
  const [tipo, setTipo] = useState<'temperatura' | 'presion' | 'velocidad' | 'calidad' | 'mecanico' | 'electrico'>('temperatura');
  const [nivel, setNivel] = useState<'info' | 'advertencia' | 'critica'>('info');
  const [descripcion, setDescripcion] = useState<string>('');
  const [feedback, setFeedback] = useState<{ text: string; error: boolean } | null>(null);

  const dispararAlarmaManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim()) {
      setFeedback({ text: 'Por favor ingrese una descripción detallada del suceso.', error: true });
      setTimeout(() => setFeedback(null), 5000);
      return;
    }

    dbSimulada.crearAlarma({
      lineaId,
      tipo,
      nivel,
      descripcion: descripcion.trim()
    });

    setDescripcion('');
    setFeedback({ text: '✓ Alarma reportada y transmitida con éxito a los PLCs.', error: false });
    setTimeout(() => setFeedback(null), 5000);
  };

  const autorizadosEscribir = ['operador', 'supervisor', 'gerente'].includes(role);

  return (
    <div className="flex-1 bg-[#0F1117] p-6 space-y-6 overflow-y-auto font-sans">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-[#2A2D3A] pb-4">
        <div>
          <span className="text-[10px] text-blue-400 font-mono font-bold block uppercase tracking-widest">
            SISTEMA DE EVENTOS Y INCIDENCIAS
          </span>
          <h1 className="text-xl font-extrabold text-white">
            Panel de Alarmas y Auditoría SCADA
          </h1>
        </div>
        <div className="flex items-center gap-1 text-slate-400 font-mono text-xs">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Canal de Eventos Activo</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA izquierdo: FORMULARIO DISPARADOR DE ALARMAS */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-5 shadow-lg relative overflow-hidden">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
              <PlusCircle className="w-4.5 h-4.5 text-red-400" />
              Reportar Incidencia Manual
            </h3>

            {autorizadosEscribir ? (
              <form onSubmit={dispararAlarmaManual} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="text-[10px] uppercase text-[#6B7280] block mb-1">Impacto en línea</label>
                  <select
                    value={lineaId}
                    onChange={(e) => setLineaId(e.target.value as 'L1' | 'L2')}
                    className="w-full bg-[#11131E] border border-[#2A2D3A] rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="L1">Línea L1 — Salsa de Tomate</option>
                    <option value="L2">Línea L2 — Jugo de Naranja</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase text-[#6B7280] block mb-1">Categoría</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as any)}
                    className="w-full bg-[#11131E] border border-[#2A2D3A] rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="temperatura">Temperatura</option>
                    <option value="presion">Presión de Fluidos</option>
                    <option value="velocidad">Velocidad de Faja</option>
                    <option value="calidad">Calidad del Sello</option>
                    <option value="mecanico">Fallo Mecánico</option>
                    <option value="electrico">Cortocircuito / Eléctrico</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase text-[#6B7280] block mb-1">Severidad</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['info', 'advertencia', 'critica'] as const).map((n) => (
                      <button
                        type="button"
                        key={n}
                        onClick={() => setNivel(n)}
                        className={`py-1.5 rounded-md border text-[9px] uppercase font-bold text-center capitalize cursor-pointer transition-all ${
                          nivel === n
                            ? n === 'critica'
                              ? 'bg-red-500/10 border-red-500/40 text-red-400'
                              : n === 'advertencia'
                              ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                              : 'bg-blue-500/10 border-blue-500/40 text-blue-400'
                            : 'bg-[#14161F] border-[#2A2D3A] text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase text-[#6B7280] block mb-1 font-bold">Descripción del Evento</label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows={3}
                    placeholder="E.g. Sensor de temperatura sobrecalentando lote 4 pasteurizador..."
                    className="w-full bg-[#11131E] border border-[#2A2D3A] rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {feedback && (
                  <div className={`p-2.5 rounded border text-[11px] ${
                    feedback.error 
                      ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  }`}>
                    {feedback.text}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg tracking-wider text-center cursor-pointer transition-all shadow-[0_4px_15px_rgba(239,68,68,0.2)]"
                >
                  Disparar Alarma (Trigger)
                </button>
              </form>
            ) : (
              <div className="py-8 text-center text-[#6B7280] text-xs">
                🔒 Acceso restringido. Sólo personal con claims autorizados de planta puede disparar alarmas en los PLCs.
              </div>
            )}
          </div>

          <AlarmasPorTipo alarmas={todasLasAlarmas} />
        </div>

        {/* COLUMNA CENTRAL Y DERECHO: CONSOLAS DE ALARMAS */}
        <div className="lg:col-span-2 space-y-6">
          <PanelAlarmas alarmas={alarmasActivas} />

          {/* HISTÓRICO COMPLETO RECIENTE */}
          <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-5 shadow-lg overflow-x-auto font-mono text-xs text-gray-300">
            <span className="text-[10px] uppercase text-gray-400 tracking-widest block mb-4 font-bold">
              LOG HISTÓRICO GENERAL DE ALARMAS EN PLANTA
            </span>

            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
              {todasLasAlarmas.slice(0, 20).map((a, i) => {
                const ts = a.timestamp instanceof Date ? a.timestamp : new Date((a.timestamp as any).seconds * 1000);
                
                return (
                  <div key={i} className="bg-[#14161F]/60 border border-[#2A2D3A]/40 rounded px-3 py-2 flex justify-between items-center text-[11px]">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full ${
                        a.nivel === 'critica' ? 'bg-red-500' : a.nivel === 'advertencia' ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                      <span className="font-bold text-slate-300">ALM-{a.id}</span>
                      <span className="text-[#6B7280]">•</span>
                      <span className="text-[#6B7280] uppercase">{a.tipo}</span>
                      <span className="text-[#6B7280]">•</span>
                      <span className="text-slate-400 font-sans truncate max-w-[200px] sm:max-w-[320px]" title={a.descripcion}>{a.descripcion}</span>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <span className="text-[10px] text-gray-400">{ts.toLocaleDateString()}</span>
                      {a.resuelta ? (
                        <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[9.5px]">Resuelta</span>
                      ) : (
                        <span className="text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded text-[9.5px] animate-pulse">Activa</span>
                      )}
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
