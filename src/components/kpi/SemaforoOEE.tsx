/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export default function SemaforoOEE() {
  const niveles = [
    { rango: 'OEE < 65%', estado: 'CRÍTICO', color: '#EF4444', desc: 'Rendimiento defectuoso, requiere paro u optimización urgente.' },
    { rango: '65% ≤ OEE < 75%', estado: 'MEJORAR', color: '#F59E0B', desc: 'Subóptimo. Analizar detenciones menores y fricción de fajas.' },
    { rango: '75% ≤ OEE < 85%', estado: 'ACEPTABLE', color: '#22C55E', desc: 'Operación dentro del promedio planificado de ingeniería.' },
    { rango: 'OEE ≥ 85%', estado: 'WORLD CLASS', color: '#A78BFA', desc: 'Clasificación mundial. Máxima eficacia operativa alcanzada.' },
  ];

  return (
    <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-5 shadow-lg">
      <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-4 font-bold">
        SEMAFORIZACIÓN DEL ESTÁNDAR OEE
      </span>
      <div className="space-y-3">
        {niveles.map((n, i) => (
          <div key={i} className="flex gap-3 items-start border-b border-[#2A2D3A]/40 pb-3 last:border-b-0 last:pb-0">
            <div 
              className="w-3.5 h-3.5 rounded-full mt-0.5 flex-shrink-0"
              style={{ 
                backgroundColor: n.color,
                boxShadow: `0 0 10px ${n.color}50`
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-gray-200">{n.rango}</span>
                <span className="text-[10px] font-mono font-bold" style={{ color: n.color }}>{n.estado}</span>
              </div>
              <p className="text-[11px] text-gray-400 font-sans leading-relaxed mt-0.5">{n.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
