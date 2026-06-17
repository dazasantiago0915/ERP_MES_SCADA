/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuth } from './useAuth';
import { Shield, Radio, Flame, Cpu, Eye } from 'lucide-react';

export default function LoginPage() {
  const { loginConGoogle, switchRole, role } = useAuth();

  return (
    <div className="min-h-screen bg-[#0F1117] text-gray-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Elementos decorativos de fondo (Estilo HMI Industrial) */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[radial-gradient(#3B82F6_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      {/* Brillo ambiental */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#1A1D27] border border-[#2A2D3A] rounded-xl shadow-2xl p-8 relative z-10">
        {/* Cabecera del terminal */}
        <div className="flex items-center gap-3 border-b border-[#2A2D3A] pb-6 mb-6">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] tracking-widest text-[#6B7280] font-mono block">SCADA / MES / ERP COUPLING</span>
            <h1 className="text-xl font-semibold tracking-tight text-white font-sans">Alimentos del Valle S.A.S.</h1>
          </div>
        </div>

        {/* Panel de Instrucciones */}
        <div className="p-4 bg-yellow-500/5 rounded-lg border border-yellow-500/15 mb-6 text-xs text-yellow-300 flex items-start gap-3">
          <Shield className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-400" />
          <div>
            <p className="font-semibold mb-1">ACCESO RESTRINGIDO — HMI TERMINAL</p>
            <p className="leading-relaxed">El sistema valida roles de acceso mediante Claims personalizados. El simulador local permite alternar roles para auditar flujos de seguridad.</p>
          </div>
        </div>

        {/* Botón de Autenticación Principal */}
        <button
          id="btn_login_google"
          onClick={() => loginConGoogle()}
          className="w-full py-3 px-4 bg-[#3B82F6] hover:bg-blue-600 active:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-[0_4px_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2 cursor-pointer border border-blue-400/20 group"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M21.35 11.1h-9.17v2.73h6.51c-.3 1.56-1.25 2.85-2.65 3.74v3.1h4.29c2.51-2.3 3.96-5.69 3.96-9.57 0-.7-.06-1.37-.16-2H21.35z" />
            <path d="M12.18 21.43c2.75 0 5.06-.91 6.75-2.46l-4.29-3.1c-1.2.8-2.73 1.28-4.46 1.28-3.43 0-6.34-2.31-7.38-5.43H.41v3.2a11.99 11.99 0 0011.77 6.51z" />
            <path d="M4.8 11.72c-.27-.8-.42-1.66-.42-2.54s.15-1.74.42-2.54V3.44H.41a11.99 11.99 0 000 11.48l4.39-3.2z" />
            <path d="M12.18 4.39c1.5 0 2.85.51 3.91 1.52l2.93-2.93C17.23 1.34 14.93.57 12.18.57 7.42.57 3.4 3.25.41 7.18l4.39 3.2c1.04-3.12 3.95-5.43 7.38-5.43z" />
          </svg>
          Autenticarse con Google Workspace
        </button>

        {/* Simulador de Claims de Gestión */}
        <div className="mt-8 pt-6 border-t border-[#2A2D3A]">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#6B7280] block mb-3">
            SECTOR DE AUDITORÍA — SELECCIÓN DE ROL
          </span>
          <div className="grid grid-cols-3 gap-2">
            {(['operador', 'supervisor', 'gerente'] as const).map(r => (
              <button
                key={r}
                id={`btn_role_${r}`}
                onClick={() => switchRole(r)}
                className={`py-2 px-1 text-xs rounded-md font-mono border font-medium capitalize transition-all cursor-pointer ${
                  role === r
                    ? 'bg-blue-500/10 border-blue-500/40 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                    : 'bg-[#151821] border-[#2A2D3A] text-[#6B7280] hover:text-gray-300 hover:border-[#3B82F6]/30'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Panel Inferior de Estado de Red */}
        <div className="mt-6 flex justify-between items-center bg-[#151821] rounded-md px-3 py-2 border border-[#2A2D3A] text-[10px] font-mono text-gray-400">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>SISTEMA ONLINE (MOCK-UP RX)</span>
          </div>
          <div className="flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-400" />
            <span>ALB-01 / ALB-02</span>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-[10.5px] text-[#6B7280] font-mono tracking-wide">
        DISEÑADO PARA TABLETA (1024px) Y ESCRITORIO (1440px+) · SOPORTE ISO 9001
      </div>
    </div>
  );
}
