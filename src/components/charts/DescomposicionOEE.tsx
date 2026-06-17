/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface DescomposicionOEEProps {
  factoresL1: { disponibilidad: number; rendimiento: number; calidad: number };
  factoresL2: { disponibilidad: number; rendimiento: number; calidad: number };
}

export default function DescomposicionOEE({ factoresL1, factoresL2 }: DescomposicionOEEProps) {
  // Modelar datos para Recharts
  const datos = [
    {
      name: 'Disponibilidad (A)',
      L1: Number((factoresL1.disponibilidad * 100).toFixed(1)),
      L2: Number((factoresL2.disponibilidad * 100).toFixed(1)),
    },
    {
      name: 'Rendimiento (P)',
      L1: Number((factoresL1.rendimiento * 100).toFixed(1)),
      L2: Number((factoresL2.rendimiento * 100).toFixed(1)),
    },
    {
      name: 'Calidad (Q)',
      L1: Number((factoresL1.calidad * 100).toFixed(1)),
      L2: Number((factoresL2.calidad * 100).toFixed(1)),
    },
  ];

  return (
    <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-5 shadow-lg flex flex-col justify-between">
      <div className="mb-4">
        <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block font-bold">
          DESCOMPOSICIÓN DE FACTORES — OEE (A · P · Q)
        </span>
        <span className="text-[11px] font-mono text-[#6B7280]">
          Factores individuales expresados en porcentaje (0% - 100%)
        </span>
      </div>

      <div className="w-full h-64 font-mono text-[10px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={datos} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222530" />
            <XAxis dataKey="name" stroke="#6B7280" />
            <YAxis domain={[0, 100]} stroke="#6B7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1E2230',
                border: '1px solid #2A2D3A',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Bar dataKey="L1" name="Línea L1" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="L2" name="Línea L2" fill="#A78BFA" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
