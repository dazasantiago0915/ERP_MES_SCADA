/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Target, CheckCircle2 } from 'lucide-react';

interface OTIFProgressBarProps {
  otif: number;
  objetivo?: number;
}

export default function OTIFProgressBar({ otif, objetivo = 95 }: OTIFProgressBarProps) {
  const complies = otif >= objetivo;

  // Cálculos para el render
  const fillPct = Math.min(100, Math.max(0, otif));

  return (
    <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-5 shadow-lg hover:border-[#3B82F6]/30 transition-all flex flex-col justify-between group">
      <div>
        <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-2 font-bold">
          OTIF MENSUAL — AGREGADO DE CARTERA
        </span>

        <div className="flex justify-between items-baseline mb-4">
          <span className="text-3xl font-mono font-extrabold text-[#A78BFA] tracking-tight">
            {otif.toFixed(1)}%
          </span>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#6B7280]">
            <Target className="w-3.5 h-3.5 text-blue-400" />
            <span>Objetivo: <strong className="text-slate-300">{objetivo}%</strong></span>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="relative w-full h-3.5 bg-[#202432] rounded-full overflow-hidden border border-[#2A2D3A]">
          {/* Marcador de Objetivo del 95% */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-[#EF4444] z-10" 
            style={{ left: `${objetivo}%` }}
            title={`Límite objetivo: ${objetivo}%`}
          />
          {/* El fill */}
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              complies 
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' 
                : 'bg-gradient-to-r from-amber-500 to-[#A78BFA]'
            }`}
            style={{ width: `${fillPct}%` }}
          />
        </div>
      </div>

      {/* Explicativo */}
      <div className="mt-4 pt-4 border-t border-[#2A2D3A] text-[10px] font-mono text-gray-400 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            On Time: Entregado ≤ Fecha Compromiso
          </span>
          <span className="text-emerald-400">Sí (Tolerancia 0d)</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            In Full: Entregado ≥ 98% de lo Solicitado
          </span>
          <span className="text-[#A78BFA]">Sí (Margen 2%)</span>
        </div>
      </div>
    </div>
  );
}
