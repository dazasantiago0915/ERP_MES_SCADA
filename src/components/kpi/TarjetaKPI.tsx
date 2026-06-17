/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface TarjetaKPIProps {
  titulo: string;
  valor: string | number;
  subtexto: string;
  colorClase?: string;
  icon?: React.ReactNode;
}

export default function TarjetaKPI({ titulo, valor, subtexto, colorClase = 'text-blue-400', icon }: TarjetaKPIProps) {
  return (
    <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-[#3B82F6]/30 transition-all relative overflow-hidden group">
      {/* Elemento de brillo sutil */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all pointer-events-none"></div>

      <div className="flex items-start justify-between">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#6B7280] block font-bold mb-1">
            {titulo}
          </span>
          <span className={`text-2xl font-mono font-extrabold tracking-tight ${colorClase}`}>
            {valor}
          </span>
        </div>
        {icon && (
          <div className="p-2 bg-[#202432] rounded-lg border border-[#2A2D3A] text-slate-400 group-hover:text-blue-400 transition-colors">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[#2A2D3A]/50 flex items-center justify-between text-[11px] font-mono text-gray-400">
        <span>{subtexto}</span>
        <span className="text-[10px] text-emerald-400">● LIVE</span>
      </div>
    </div>
  );
}
