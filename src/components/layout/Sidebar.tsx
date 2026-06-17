/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutDashboard, Activity, FileSpreadsheet, AlertOctagon, RefreshCw, LogOut } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { dbSimulada } from '../../utils/simulatedDb';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  selectedLine: 'L1' | 'L2';
  setSelectedLine: (line: 'L1' | 'L2') => void;
}

export default function Sidebar({ currentPage, setCurrentPage, selectedLine, setSelectedLine }: SidebarProps) {
  const { role, user, logout, switchRole } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Monitor Principal', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'lineas', label: 'Detalle de Líneas', icon: <Activity className="w-4 h-4" /> },
    { id: 'pedidos', label: 'Pedidos y Despacho', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'alarmas', label: 'Alarmas Activas', icon: <AlertOctagon className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-60 bg-[#1A1D27] border-r border-[#2A2D3A] flex flex-col h-screen overflow-y-auto">
      {/* Logotipo Industrial */}
      <div className="p-6 border-b border-[#2A2D3A]">
        <h1 className="text-[#3B82F6] font-bold text-lg tracking-tight uppercase">Alimentos Valle</h1>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Manufacturing Suite v2.5</p>
      </div>

      {/* Navegación Principal */}
      <nav className="flex-1 p-4 space-y-2">
        <span className="text-[9px] font-mono uppercase tracking-widest text-[#6B7280] block px-3 mb-2">MONITORIZACIÓN</span>
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-xs font-medium tracking-wide font-sans transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#2A2D3A] text-[#3B82F6]'
                  : 'text-gray-400 hover:bg-[#2A2D3A] hover:text-gray-200'
              }`}
            >
              <div className={`w-2 h-2 rounded-full transition-all ${
                isActive ? 'bg-[#3B82F6]' : 'border border-gray-600'
              }`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {currentPage === 'lineas' && (
          <div className="pl-6 mt-3 pt-2 border-l-2 border-[#2A2D3A] space-y-1">
            <button
              onClick={() => setSelectedLine('L1')}
              className={`w-full text-left px-3 py-1.5 rounded text-[11px] font-mono transition-all block ${
                selectedLine === 'L1' ? 'text-[#3B82F6] font-bold bg-[#2A2D3A]' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Línea L1 — Mezclado
            </button>
            <button
              onClick={() => setSelectedLine('L2')}
              className={`w-full text-left px-3 py-1.5 rounded text-[11px] font-mono transition-all block ${
                selectedLine === 'L2' ? 'text-[#3B82F6] font-bold bg-[#2A2D3A]' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Línea L2 — Pasteurizado
            </button>
          </div>
        )}
      </nav>

      {/* Conmutador de Roles y Datos de Sesión */}
      <div className="p-4 border-t border-[#2A2D3A]">
        {/* Claims de Seguridad HMI */}
        <div className="mb-3">
          <span className="text-[9px] uppercase font-mono tracking-widest text-[#6B7280] block mb-1.5 px-1">
            Claims de Seguridad (HMI)
          </span>
          <div className="grid grid-cols-3 gap-1">
            {(['operador', 'supervisor', 'gerente'] as const).map(r => (
              <button
                key={r}
                onClick={() => switchRole(r)}
                className={`py-1 px-0.5 text-[9px] rounded font-mono border transition-all cursor-pointer capitalize text-center ${
                  role === r
                    ? 'bg-[#3B82F6]/10 border-[#3B82F6]/30 text-[#3B82F6]'
                    : 'bg-[#1A1D27] border-[#2A2D3A] text-gray-500 hover:text-gray-300'
                }`}
                title={`Simular rol ${r}`}
              >
                {r.slice(0, 4)}..
              </button>
            ))}
          </div>
        </div>

        {/* Tarjeta de Usuario exact de Design HTML */}
        <div className="bg-[#2A2D3A] p-3 rounded-lg flex items-center justify-between">
          <div className="min-w-0 flex-1 mr-1">
            <p className="text-[10px] text-gray-400 font-medium uppercase">Usuario</p>
            <p className="text-xs text-white truncate font-medium font-sans" title={user?.displayName || 'Ing. Carlos Ruiz'}>
              {user?.displayName || 'Ing. Carlos Ruiz'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="bg-[#A78BFA] text-[#0F1117] text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
              {role}
            </span>
            <button
              onClick={() => dbSimulada.reiniciarDatosSemilla()}
              className="p-1 text-gray-400 hover:text-amber-400 transition-all cursor-pointer"
              title="Reiniciar base de datos a semilla estándar"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
