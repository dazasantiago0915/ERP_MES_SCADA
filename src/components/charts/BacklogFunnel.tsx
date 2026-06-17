/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { OrdenProduccion } from '../../types';
import { Layers } from 'lucide-react';

interface BacklogFunnelProps {
  ordenes: OrdenProduccion[];
}

export default function BacklogFunnel({ ordenes }: BacklogFunnelProps) {
  // Filtrar órdenes pendientes y en curso
  const activas = ordenes.filter(o => ['pendiente', 'en_curso'].includes(o.estadoOrden));

  // Agrupar backlog por producto
  const backlogPorProducto: Record<string, { planificada: number; producida: number; backlog: number }> = {
    'Salsa de tomate 500 g': { planificada: 0, producida: 0, backlog: 0 },
    'Jugo de naranja 1 L': { planificada: 0, producida: 0, backlog: 0 }
  };

  activas.forEach(o => {
    const prod = o.nombreProducto;
    if (backlogPorProducto[prod]) {
      backlogPorProducto[prod].planificada += o.cantidadPlanificada;
      backlogPorProducto[prod].producida += o.cantidadProducida;
      backlogPorProducto[prod].backlog += (o.cantidadPlanificada - o.cantidadProducida);
    } else {
      backlogPorProducto[prod] = {
        planificada: o.cantidadPlanificada,
        producida: o.cantidadProducida,
        backlog: (o.cantidadPlanificada - o.cantidadProducida)
      };
    }
  });

  return (
    <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-5 shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start">
          <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block font-bold">
            BACKLOG DE ORDENES DE MANUFACTURA
          </span>
          <Layers className="w-4 h-4 text-slate-400" />
        </div>
        <span className="text-[11px] font-mono text-[#6B7280]">
          Contraste de volumen solicitado vs volumen en proceso
        </span>
      </div>

      <div className="space-y-4 my-4">
        {Object.entries(backlogPorProducto).map(([nombre, metrics]) => {
          const totalPlan = Math.max(1, metrics.planificada);
          const rodPct = Math.round((metrics.producida / totalPlan) * 100);
          const backlogPct = 100 - rodPct;

          return (
            <div key={nombre} className="border border-[#2D313F] bg-[#14161F] rounded-lg p-4 font-mono">
              <div className="flex justify-between text-xs mb-2">
                <span className="font-sans font-semibold text-slate-200">{nombre}</span>
                <span className="text-[#3B82F6]">Backlog: {metrics.backlog.toLocaleString()} ud</span>
              </div>

              {/* Progress complex bar */}
              <div className="w-full h-4 bg-[#232635] rounded-full overflow-hidden flex text-[9px] font-bold text-center leading-4">
                <div 
                  className="bg-emerald-500 text-white h-full transition-all duration-1000" 
                  style={{ width: `${rodPct}%` }}
                  title={`Producido: ${metrics.producida.toLocaleString()} unidades (${rodPct}%)`}
                >
                  {rodPct > 15 ? `${rodPct}% prod` : ''}
                </div>
                <div 
                  className="bg-amber-500 text-black h-full transition-all duration-1000" 
                  style={{ width: `${backlogPct}%` }}
                  title={`Pendiente: ${metrics.backlog.toLocaleString()} unidades (${backlogPct}%)`}
                >
                  {backlogPct > 15 ? `${backlogPct}% rest` : ''}
                </div>
              </div>

              <div className="flex justify-between text-[10px] text-[#6B7280] mt-2 pt-1">
                <span>Planificado: <strong>{metrics.planificada.toLocaleString()}</strong></span>
                <span>Producido: <strong>{metrics.producida.toLocaleString()}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
