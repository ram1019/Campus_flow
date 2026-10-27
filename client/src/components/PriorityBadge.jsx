import React from 'react';
import { AlertTriangle, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';

export const PriorityBadge = ({ priority }) => {
  const configs = {
    CRITICAL: {
      label: 'Critical',
      bg: 'bg-red-50 text-red-700 border-red-200',
      icon: AlertTriangle,
    },
    HIGH: {
      label: 'High',
      bg: 'bg-orange-50 text-orange-700 border-orange-200',
      icon: ArrowUp,
    },
    MEDIUM: {
      label: 'Medium',
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: AlertCircle,
    },
    LOW: {
      label: 'Low',
      bg: 'bg-slate-50 text-slate-600 border-slate-200',
      icon: ArrowDown,
    },
  };

  const config = configs[priority] || configs.MEDIUM;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold border ${config.bg}`}
    >
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </span>
  );
};
