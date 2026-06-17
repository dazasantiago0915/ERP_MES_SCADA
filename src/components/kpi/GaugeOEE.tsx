/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { obtenerSemaforoOEE } from '../../utils/formulas';

interface GaugeOEEProps {
  oee: number;
  disponibilidad: number;
  rendimiento: number;
  calidad: number;
  lineaId: 'L1' | 'L2';
}

export default function GaugeOEE({ oee, disponibilidad, rendimiento, calidad, lineaId }: GaugeOEEProps) {
  const { color, label, bgClass } = obtenerSemaforoOEE(oee);
  const [offset, setOffset] = useState(270); // Inicializar en el máximo para animar

  // SVG parameters
  const radius = 80;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius; // ~502 px
  const arcLength = circumference * 0.75; // 270 grados de circulo completo
  
  useEffect(() => {
    // Calcular el stroke-dashoffset: 0% significa llenar los 270 grados enteros (arcLength)
    const oeeFraccion = Math.max(0, Math.min(100, oee)) / 100;
    const finalOffset = arcLength - (oeeFraccion * arcLength);
    
    // Pequeño timeout para asegurar la animación CSS inicial al revivir la vista
    const t = setTimeout(() => {
      setOffset(finalOffset);
    }, 100);
    return () => clearTimeout(t);
  }, [oee, arcLength]);

  const formattingPct = (val: number) => {
    return (val * 100).toFixed(1) + '%';
  };

  return (
    <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-5 flex flex-col items-center justify-center relative shadow-lg group hover:border-[#3B82F6]/30 transition-all">
      {/* Etiqueta de la línea */}
      <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-2 font-semibold">
        LÍNEA {lineaId} — RENDIMIENTO ACTUAL OEE
      </span>

      {/* SVG Metrizada */}
      <div className="relative w-48 h-44 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-225" viewBox="0 0 200 200">
          {/* Sombra de círculo de calibración */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke="#212532"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Arco activo coloreado de OEE */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${color}50)`
            }}
          />
        </svg>

        {/* Textos de Lectura en el Centro */}
        <div className="absolute text-center flex flex-col justify-center items-center mt-[-10px]">
          <span className="font-mono text-3xl font-extrabold tracking-tight text-white">
            {oee.toFixed(1)}%
          </span>
          <span className={`text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full mt-1.5 border ${bgClass}`}>
            {label}
          </span>
        </div>
      </div>

      {/* Lecturas de factores OEE auxiliares en la parte inferior */}
      <div className="w-full grid grid-cols-3 gap-1 pt-3 border-t border-[#2A2D3A] text-center">
        <div>
          <span className="text-[10px] text-[#6B7280] block font-mono">Disponibilidad</span>
          <span className="text-xs font-mono text-slate-300 font-semibold">{formattingPct(disponibilidad)}</span>
        </div>
        <div className="border-x border-[#2A2D3A]">
          <span className="text-[10px] text-[#6B7280] block font-mono">Eficiencia</span>
          <span className="text-xs font-mono text-slate-300 font-semibold">{formattingPct(rendimiento)}</span>
        </div>
        <div>
          <span className="text-[10px] text-[#6B7280] block font-mono">Calidad</span>
          <span className="text-xs font-mono text-slate-300 font-semibold">{formattingPct(calidad)}</span>
        </div>
      </div>
    </div>
  );
}
