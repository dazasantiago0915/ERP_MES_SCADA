/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Alarma } from '../../types';
import { useAuth } from '../../auth/useAuth';
import { dbSimulada } from '../../utils/simulatedDb';
import { AlertTriangle, AlertOctagon, Info, Flame, ShieldAlert, Check } from 'lucide-react';

interface PanelAlarmasProps {
  alarmas: Alarma[];
}

export default function PanelAlarmas({ alarmas }: PanelAlarmasProps) {
  const { role } = useAuth();
  const [resolucionTiempo, setResolucionTiempo] = useState<number>(15);

  const handleResolver = (id: string) => {
    dbSimulada.resolverAlarma(id, resolucionTiempo);
  };

  const getNivelStyles = (nivel: 'info' | 'advertencia' | 'critica') => {
    switch (nivel) {
      case 'critica':
        return {
          border: 'border-red-500/30 bg-red-500/10 text-red-400',
          dot: 'bg-red-500',
          icon: <AlertOctagon className="w-4 h-4 text-red-400" />
        };
      case 'advertencia':
        return {
          border: 'border-amber-500/20 bg-amber-500/5 text-amber-400',
          dot: 'bg-amber-400',
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />
        };
      case 'info':
      default:
        return {
          border: 'border-blue-500/20 bg-blue-500/5 text-blue-400',
          dot: 'bg-blue-400',
          icon: <Info className="w-4 h-4 text-blue-400" />
        };
    }
  };

  const autorizadosEscribir = ['operador', 'supervisor', 'gerente'].includes(role);

  return (
    <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-5 shadow-lg flex flex-col justify-between">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#2A2D3A]/60">
        <div>
          <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block font-bold">
            SENSADO DE ALERTAS DE SEGURIDAD INDUSTRIAL (PLC)
          </span>
          <span className="text-[11px] font-mono text-[#6B7280]">
            Feed instantáneo de alarmas de sistemas y calibraciones críticas
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-red-400 font-mono">
          <Flame className="w-4 h-4 animate-pulse" />
          <span>REAL-TIME SCADA</span>
        </div>
      </div>

      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
        {alarmas.length === 0 ? (
          <div className="text-center py-10 font-mono text-xs text-gray-500 bg-[#14161F] border border-[#282C3A] rounded-lg">
            ✓ No se registran contingencias ni alarmas activas en planta.
          </div>
        ) : (
          alarmas.map((a) => {
            const style = getNivelStyles(a.nivel);
            const ts = a.timestamp instanceof Date ? a.timestamp : new Date((a.timestamp as any).seconds * 1000);

            return (
              <div 
                key={a.id} 
                className={`border rounded-lg p-3.5 flex items-center justify-between gap-4 font-mono text-xs transition-all ${style.border} ${
                  a.nivel === 'critica' ? 'shadow-[0_0_15px_rgba(239,68,68,0.08)] animate-pulse' : ''
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 flex-shrink-0">{style.icon}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-extrabold text-slate-200">LÍNEA {a.lineaId}</span>
                      <span className="text-[10px] text-gray-500">•</span>
                      <span className="text-[10px] text-gray-400 uppercase">{a.tipo}</span>
                      <span className="text-[10px] text-gray-500">•</span>
                      <span className="text-[9.5px] text-gray-500">{ts.toLocaleTimeString()}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-sans leading-snug break-words">{a.descripcion}</p>
                  </div>
                </div>

                {autorizadosEscribir ? (
                  <button
                    onClick={() => handleResolver(a.id)}
                    className="bg-[#202432]/60 hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-400 py-1.5 px-2.5 rounded border border-[#2D313F] hover:border-emerald-500/20 flex items-center gap-1 font-sans text-[10px] font-bold flex-shrink-0 cursor-pointer transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Aceptar
                  </button>
                ) : (
                  <span className="text-[9px] text-[#6B7280] flex-shrink-0 font-sans italic">Lectura</span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
