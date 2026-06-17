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
  Cell,
} from 'recharts';
import { Alarma } from '../../types';

interface AlarmasPorTipoProps {
  alarmas: Alarma[];
}

export default function AlarmasPorTipo({ alarmas }: AlarmasPorTipoProps) {
  // Contabilizar las alarmas históricas y activas por tipo
  const counts: Record<string, number> = {
    temperatura: 0,
    presion: 0,
    velocidad: 0,
    calidad: 0,
    mecanico: 0,
    electrico: 0,
  };

  alarmas.forEach((a) => {
    if (counts[a.tipo] !== undefined) {
      counts[a.tipo]++;
    }
  });

  const coloresMap: Record<string, string> = {
    temperatura: '#EF4444', // rojo térmico
    presion: '#3B82F6',     // azul hidráulico
    velocidad: '#F59E0B',   // amarillo velocidad
    calidad: '#10B981',     // esmeralda
    mecanico: '#A78BFA',    // lila
    electrico: '#EC4899',   // fucsia
  };

  const datos = Object.entries(counts).map(([type, value]) => ({
    tipo: type.charAt(0).toUpperCase() + type.slice(1),
    cantidad: value,
    raw: type,
  }));

  return (
    <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-5 shadow-lg flex flex-col justify-between">
      <div>
        <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block font-bold">
          CONSOLIDADO DE FALLOS POR CATEGORÍA
        </span>
        <span className="text-[11px] font-mono text-[#6B7280]">
          Total histórico de alarmas enviadas al PLC
        </span>
      </div>

      <div className="w-full h-56 font-mono text-[10px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={datos} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222530" horizontal={false} />
            <XAxis type="number" stroke="#6B7280" />
            <YAxis dataKey="tipo" type="category" stroke="#6B7280" width={80} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1E2230',
                border: '1px solid #2A2D3A',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Bar dataKey="cantidad" name="Registros" radius={[0, 4, 4, 0]}>
              {datos.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={coloresMap[entry.raw] || '#3B82F6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
