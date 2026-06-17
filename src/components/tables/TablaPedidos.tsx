/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Pedido } from '../../types';
import { useAuth } from '../../auth/useAuth';
import { dbSimulada } from '../../utils/simulatedDb';
import { Truck, CheckCircle, AlertTriangle, Play } from 'lucide-react';

interface TablaPedidosProps {
  pedidos: Pedido[];
}

export default function TablaPedidos({ pedidos }: TablaPedidosProps) {
  const { role } = useAuth();
  const [despachandoId, setDespachandoId] = useState<string | null>(null);
  const [cantidadEntregada, setCantidadEntregada] = useState<number>(0);

  const abrirDespacho = (p: Pedido) => {
    setDespachandoId(p.id);
    setCantidadEntregada(p.cantidadSolicitada); // Valor por defecto
  };

  const ejecutarDespacho = () => {
    if (despachandoId) {
      dbSimulada.despacharPedido(despachandoId, cantidadEntregada);
      setDespachandoId(null);
    }
  };

  // Filtrar pedidos en riesgo OTIF o listarlos todos de forma prioritaria
  const autorizadosEscribir = ['supervisor', 'gerente'].includes(role);

  return (
    <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-5 shadow-lg overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block font-bold">
            ÓRDENES DE PEDIDO Y DESPACHO DE CARTERA
          </span>
          <span className="text-[11px] font-mono text-[#6B7280]">
            Control de cumplimiento contractual de despachos (OTIF)
          </span>
        </div>
      </div>

      <table className="w-full text-left border-collapse text-xs font-mono">
        <thead>
          <tr className="border-b border-[#2A2D3A] text-gray-400">
            <th className="py-2.5 font-semibold">Cód Pedido</th>
            <th className="py-2.5 font-semibold">Cliente</th>
            <th className="py-2.5 font-semibold text-right">Solicitado</th>
            <th className="py-2.5 font-semibold text-right">Entregado</th>
            <th className="py-2.5 font-semibold">F. Compromiso</th>
            <th className="py-2.5 font-semibold text-center">OTIF</th>
            <th className="py-2.5 font-semibold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#2A2D3A]/50 text-gray-300">
          {pedidos.slice(0, 10).map((p) => {
            const fechaComp = p.fechaCompromiso instanceof Date ? p.fechaCompromiso : new Date((p.fechaCompromiso as any).seconds * 1000);
            
            // Determinar status estético para OTIF
            let badgeOtif = <span className="text-gray-500">—</span>;
            if (p.estadoPedido === 'completada') {
              if (p.otif) {
                badgeOtif = (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/15">
                    Cumple
                  </span>
                );
              } else {
                badgeOtif = (
                  <span className="inline-flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/15" title={`On-Time: ${p.onTime ? 'Sí' : 'No'} | In-Full: ${p.inFull ? 'Sí' : 'No'}`}>
                    Fallo
                  </span>
                );
              }
            } else {
              badgeOtif = (
                <span className="inline-flex items-center gap-1 text-[10px] text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded-full border border-amber-500/10">
                  Pendiente
                </span>
              );
            }

            return (
              <tr key={p.id} className="hover:bg-[#202432]/30 transition-colors">
                <td className="py-3 font-semibold text-slate-300">{p.id}</td>
                <td className="py-3 font-sans max-w-[120px] truncate" title={p.clienteNombre}>{p.clienteNombre}</td>
                <td className="py-3 text-right">{p.cantidadSolicitada.toLocaleString()}</td>
                <td className="py-3 text-right">{p.cantidadEntregada > 0 ? p.cantidadEntregada.toLocaleString() : '—'}</td>
                <td className="py-3 text-slate-400">{fechaComp.toLocaleDateString()}</td>
                <td className="py-3 text-center">{badgeOtif}</td>
                <td className="py-3 text-right">
                  {p.estadoPedido !== 'completada' ? (
                    autorizadosEscribir ? (
                      <button
                        onClick={() => abrirDespacho(p)}
                        className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 py-1 px-2.5 rounded border border-blue-500/20 text-[10px] font-sans font-bold flex items-center gap-1.5 ml-auto cursor-pointer transition-all"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        Despachar
                      </button>
                    ) : (
                      <span className="text-[9px] text-gray-500 block font-sans">Bloqueado rol</span>
                    )
                  ) : (
                    <span className="text-[10px] text-gray-500 flex items-center justify-end gap-1 font-sans">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      Enviado
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Modal / Dialog de Despacho manual */}
      {despachandoId && (
        <div className="fixed inset-0 bg-[#000]/60 flex items-center justify-center p-4 z-50 animate-fade-in font-mono">
          <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-400" />
              DESPACHO DE MERCANCÍA: {despachandoId}
            </h3>
            
            <p className="text-[11px] text-gray-400 mb-4 font-sans leading-relaxed">
              Ingrese la cantidad despachada final para recalcular los factores de cumplimiento. Un despacho menor al 98% de lo solicitado anulará el componente <strong className="text-slate-300">In Full</strong> del OTIF.
            </p>

            <div className="space-y-3 mb-6">
              <div>
                <label className="text-[10px] uppercase text-[#6B7280] block mb-1">Cantidad Entregada (Unidades)</label>
                <input
                  type="number"
                  value={cantidadEntregada}
                  onChange={(e) => setCantidadEntregada(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-[#11131E] border border-[#2A2D3A] rounded-md py-2 px-3 text-slate-200 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end text-xs">
              <button
                onClick={() => setDespachandoId(null)}
                className="bg-[#202432] text-slate-400 py-1.5 px-3.5 rounded hover:text-gray-200 cursor-pointer border border-[#2D313F]"
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarDespacho}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-4 rounded cursor-pointer transition-colors shadow-lg"
              >
                Confirmar Despacho
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
