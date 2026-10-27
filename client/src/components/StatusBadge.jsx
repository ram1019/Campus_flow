import React from 'react';
import {
  Clock,
  UserCheck,
  Wrench,
  CheckCircle2,
  Lock,
  RotateCcw,
} from 'lucide-react';

export const StatusBadge = ({ status, size = 'md' }) => {
  const configs = {
    SUBMITTED: {
      label: 'Submitted',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Clock,
      dot: 'bg-amber-500',
    },
    ASSIGNED: {
      label: 'Assigned',
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: UserCheck,
      dot: 'bg-blue-500',
    },
    IN_PROGRESS: {
      label: 'In Progress',
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: Wrench,
      dot: 'bg-indigo-500 animate-pulse',
    },
    RESOLVED: {
      label: 'Resolved',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      dot: 'bg-emerald-500',
    },
    CLOSED: {
      label: 'Closed',
      bg: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: Lock,
      dot: 'bg-slate-400',
    },
    REOPENED: {
      label: 'Reopened',
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: RotateCcw,
      dot: 'bg-rose-500',
    },
  };

  const config = configs[status] || {
    label: status,
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Clock,
    dot: 'bg-slate-400',
  };

  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ${config.bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
};
