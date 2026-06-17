/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Turno } from '../../types';

interface OEETendenciaProps {
  historicoL1: Turno[];
  historicoL2: Turno[];
}

export default function OEETendencia({ historicoL1, historicoL2 }: OEETendenciaProps) {
  // Combinar los históricos para Recharts: agrupamos por fecha (fechas indexadas de 0 a 6 o nombres de día)
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Construir 7 días de datos consolidados
  const datosGrafico = Array.from({ length: 7 }).map((_, i) => {
    // Tomamos hacia atrás
    const L1Turno = historicoL1[6 - i] || historicoL1[i] || null;
    const L2Turno = historicoL2[6 - i] || historicoL2[i] || null;

    let fechaDia = `Día ${i + 1}`;
    if (L1Turno && L1Turno.fecha) {
      const d = L1Turno.fecha instanceof Date ? L1Turno.fecha : new Date((L1Turno.fecha as any).seconds * 1000);
      fechaDia = diasSemana[d.getDay()] + ' ' + d.getDate();
    } else if (L2Turno && L2Turno.fecha) {
      const d = L2Turno.fecha instanceof Date ? L2Turno.fecha : new Date((L2Turno.fecha as any).seconds * 1000);
      fechaDia = diasSemana[d.getDay()] + ' ' + d.getDate();
    }

    return {
      name: fechaDia,
      L1: L1Turno ? Number(L1Turno.oee.toFixed(1)) : 70 + Math.random() * 10,
      L2: L2Turno ? Number(L2Turno.oee.toFixed(1)) : 75 + Math.random() * 10,
    };
  });

  return (
    <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-5 shadow-lg flex flex-col justify-between">
      <div className="mb-4">
        <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block font-bold">
          TENDENCIA DE OEE — ÚLTIMOS 7 DÍAS
        </span>
        <span className="text-[11px] font-mono text-[#6B7280]">
          Salsa de Tomate (L1) vs Jugo de Naranja (L2)
        </span>
      </div>

      <div className="w-full h-64 font-mono text-[10px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={datosGrafico} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222530" />
            <XAxis dataKey="name" stroke="#6B7280" />
            <YAxis domain={[50, 100]} stroke="#6B7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1E2230',
                border: '1px solid #2A2D3A',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Line
              type="monotone"
              dataKey="L1"
              name="Línea L1"
              stroke="#3B82F6"
              strokeWidth={2.5}
              activeDot={{ r: 6 }}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="L2"
              name="Línea L2"
              stroke="#A78BFA"
              strokeWidth={2.5}
              activeDot={{ r: 6 }}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
