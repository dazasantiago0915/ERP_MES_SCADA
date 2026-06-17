/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { OrdenProduccion } from '../../types';
import { useAuth } from '../../auth/useAuth';
import { dbSimulada } from '../../utils/simulatedDb';
import { Play, CheckCircle2, AlertCircle } from 'lucide-react';

interface TablaOrdenesProps {
  ordenes: OrdenProduccion[];
}

export default function TablaOrdenes({ ordenes }: TablaOrdenesProps) {
  const { role } = useAuth();

  const handleCompletar = (id: string) => {
    dbSimulada.completarOrden(id);
  };

  const autorizadosEscribir = ['operador', 'supervisor', 'gerente'].includes(role);

  return (
    <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-5 shadow-lg overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block font-bold">
            ÓRDENES DE MANUFACTURA EN EJECUCIÓN (SENSORES PLC)
          </span>
          <span className="text-[11px] font-mono text-[#6B7280]">
            Monitoreo en tiempo real de lotes y velocidades reales de bardeado
          </span>
        </div>
      </div>

      <table className="w-full text-left border-collapse text-xs font-mono">
        <thead>
          <tr className="border-b border-[#2A2D3A] text-gray-400">
            <th className="py-2.5 font-semibold">Cód Orden</th>
            <th className="py-2.5 font-semibold">Producto</th>
            <th className="py-2.5 font-semibold">Línea</th>
            <th className="py-2.5 font-semibold text-right">Planificado</th>
            <th className="py-2.5 font-semibold text-right">Producido</th>
            <th className="py-2.5 font-semibold text-center">Estado</th>
            <th className="py-2.5 font-semibold text-right">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#2A2D3A]/50 text-gray-300">
          {ordenes.slice(0, 10).map((o) => {
            let statusBadge = <span className="text-gray-400">Pendiente</span>;
            if (o.estadoOrden === 'completada') {
              statusBadge = (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/15 font-semibold">
                  Completada
                </span>
              );
            } else if (o.estadoOrden === 'en_curso') {
              statusBadge = (
                <span className="inline-flex items-center gap-1 text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/15 animate-pulse font-semibold">
                  En Curso
                </span>
              );
            } else {
              statusBadge = (
                <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 bg-[#202432] px-2 py-0.5 rounded-full border border-[#2D313F]">
                  Pendiente
                </span>
              );
            }

            return (
              <tr key={o.id} className="hover:bg-[#202432]/30 transition-colors">
                <td className="py-3 font-semibold text-slate-300">{o.id}</td>
                <td className="py-3 font-sans max-w-[150px] truncate" title={o.nombreProducto}>{o.nombreProducto}</td>
                <td className="py-3 text-center">{o.lineaId}</td>
                <td className="py-3 text-right">{o.cantidadPlanificada.toLocaleString()}</td>
                <td className="py-3 text-right font-semibold">{o.cantidadProducida.toLocaleString()}</td>
                <td className="py-3 text-center">{statusBadge}</td>
                <td className="py-3 text-right">
                  {o.estadoOrden !== 'completada' ? (
                    autorizadosEscribir ? (
                      <button
                        onClick={() => handleCompletar(o.id)}
                        className="bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-400 py-1 px-2 rounded border border-emerald-500/20 text-[10px] font-sans font-bold flex items-center gap-1.5 ml-auto cursor-pointer transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Finalizar
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-500 italic block font-sans">Sólo lectura</span>
                    )
                  ) : (
                    <span className="text-[10px] text-gray-500 block font-sans text-right pr-2">Listo</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
