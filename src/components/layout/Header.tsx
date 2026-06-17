/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/useAuth';
import RoleBadge from './RoleBadge';
import { Radio, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAlarmas } from '../../hooks/useAlarmas';

export default function Header() {
  const { user, role } = useAuth();
  const { alarmasActivas } = useAlarmas();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const criticasCount = alarmasActivas.filter(a => a.nivel === 'critica').length;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formattedDate = `${time.getFullYear()}-${pad(time.getMonth() + 1)}-${pad(time.getDate())}`;
  const formattedTime = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;

  return (
    <header className="h-16 bg-[#1A1D27] border-b border-[#2A2D3A] flex items-center justify-between px-8 text-gray-200">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-xs text-gray-400 uppercase tracking-widest font-mono">Sistemas Real-Time OK</span>
        </div>
        <div className="h-4 w-px bg-[#2A2D3A]"></div>
        <span className="text-xs text-gray-300 font-mono uppercase">Turno Actual: 06:00 - 14:00</span>
        {criticasCount > 0 && (
          <>
            <div className="h-4 w-px bg-[#2A2D3A]"></div>
            <div className="bg-red-500/10 border border-red-500/20 rounded px-2 py-0.5 text-[11px] font-mono text-red-400 flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              <span>{criticasCount} CRÍTICAS</span>
            </div>
          </>
        )}
      </div>

      <div className="text-right text-xs text-gray-400 font-mono">
        {formattedDate} | {formattedTime}
      </div>
    </header>
  );
}
