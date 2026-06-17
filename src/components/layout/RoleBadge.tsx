/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserRole } from '../../types';
import { Shield, Hammer, Eye, KeyRound } from 'lucide-react';

interface RoleBadgeProps {
  role: UserRole;
}

export default function RoleBadge({ role }: RoleBadgeProps) {
  const getBadgeStyle = () => {
    switch (role) {
      case 'gerente':
        return {
          bg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
          icon: <Shield className="w-3.5 h-3.5" />,
          label: 'Gerente Generales (MES/ERP)'
        };
      case 'supervisor':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          icon: <KeyRound className="w-3.5 h-3.5" />,
          label: 'Supervisor de Planta'
        };
      case 'operador':
      default:
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          icon: <Hammer className="w-3.5 h-3.5" />,
          label: 'Operador de Línea'
        };
    }
  };

  const config = getBadgeStyle();

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono ${config.bg}`}>
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
}
