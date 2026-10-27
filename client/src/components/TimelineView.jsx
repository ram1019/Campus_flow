import React from 'react';
import { StatusBadge } from './StatusBadge';
import { CheckCircle2, User, Clock, ArrowRight } from 'lucide-react';

export const TimelineView = ({ timeline = [] }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="text-sm text-slate-500 py-3 italic">
        No transition history recorded yet.
      </div>
    );
  }

  // Format date helper
  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
      {timeline.map((item, idx) => {
        const isLatest = idx === timeline.length - 1;
        return (
          <div key={idx} className="relative group">
            {/* Dot marker */}
            <div
              className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 bg-white transition-all ${
                isLatest
                  ? 'border-campus-600 bg-campus-50 ring-4 ring-campus-100'
                  : 'border-slate-300'
              }`}
            />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
              <div className="flex items-center gap-2">
                <StatusBadge status={item.status} size="sm" />
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-medium text-slate-700 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  {item.changedBy?.name || 'System User'}
                  {item.changedBy?.role && (
                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                      {item.changedBy.role}
                    </span>
                  )}
                </span>
              </div>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(item.timestamp)}
              </span>
            </div>

            {item.note && (
              <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-2.5 mt-1 border border-slate-100 font-normal">
                {item.note}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};
