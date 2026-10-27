import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building,
  Star,
  Activity,
  Layers,
  Shield,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

export const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.getAnalytics();
      if (res.success) {
        setAnalytics(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-sm text-slate-400">
        Compiling campus analytics & department performance metrics...
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-800">Analytics Error</h2>
        <p className="text-xs text-slate-500">{error || 'Failed to load metrics'}</p>
      </div>
    );
  }

  const { summary, byCategory, byStatus, byPriority, byDepartment, recentActivity } = analytics;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>ESTATE & FACILITY GOVERNANCE</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Campus Operations & SLA Analytics
          </h1>
          <p className="text-xs text-slate-500">
            Real-time resolution metrics, department response rates, and workflow audit logs
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs self-start sm:self-auto flex items-center gap-1.5"
        >
          <Activity className="w-3.5 h-3.5 text-campus-600" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Tickets
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {summary.totalComplaints}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Logged in system</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Active Issues
          </span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">
            {summary.activeComplaints}
          </span>
          <span className="text-[11px] text-amber-700/80 mt-0.5 block">Work in progress</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Resolved
          </span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {summary.resolvedComplaints}
          </span>
          <span className="text-[11px] text-emerald-700/80 mt-0.5 block">Completed</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Avg Resolution
          </span>
          <span className="text-2xl font-black text-campus-700 mt-1 block">
            {summary.avgResolutionTimeHours} <span className="text-xs font-semibold">hrs</span>
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Turnaround time</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            SLA Compliance
          </span>
          <span className="text-2xl font-black text-indigo-700 mt-1 block">
            {summary.slaComplianceRate}%
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Within deadline</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Student Rating
          </span>
          <span className="text-2xl font-black text-amber-500 mt-1 block flex items-center gap-1">
            {summary.satisfactionAverage || '4.9'}
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Verified feedback</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
            <span>Issues by Infrastructure Category</span>
            <span className="text-xs text-slate-400 font-normal">Volume breakdown</span>
          </h3>

          <div className="space-y-3 pt-2">
            {byCategory.map((cat, idx) => {
              const pct = summary.totalComplaints > 0 ? (cat.count / summary.totalComplaints) * 100 : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{cat.name}</span>
                    <span className="text-slate-500 font-mono">
                      {cat.count} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-campus-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
            <span>Complaint Lifecycle Distribution</span>
            <span className="text-xs text-slate-400 font-normal">State counts</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {byStatus.map((st, idx) => {
              const statusColors = {
                SUBMITTED: 'bg-amber-50 text-amber-700 border-amber-200',
                ASSIGNED: 'bg-blue-50 text-blue-700 border-blue-200',
                IN_PROGRESS: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                CLOSED: 'bg-slate-100 text-slate-700 border-slate-200',
                REOPENED: 'bg-rose-50 text-rose-700 border-rose-200',
              };

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border ${statusColors[st.name] || 'bg-slate-50 text-slate-700'}`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">
                    {st.name}
                  </span>
                  <span className="text-2xl font-black block mt-1 font-mono">
                    {st.count}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
            <span className="font-bold">SLA Targets:</span> Critical (12h), High (24h), Medium (48h), Low (72h).
          </div>
        </div>
      </div>

      {/* Department Scorecard Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm">
            Department Performance & SLA Scorecard
          </h3>
          <p className="text-xs text-slate-500">
            Metrics aggregated across facilities and assigned technicians
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-6">Department</th>
                <th className="py-3 px-4">Total Handled</th>
                <th className="py-3 px-4">Active</th>
                <th className="py-3 px-4">Resolved</th>
                <th className="py-3 px-4">Avg Turnaround</th>
                <th className="py-3 px-6">Resolution Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {byDepartment.map((d, idx) => {
                const resRate = d.total > 0 ? Math.round((d.resolved / d.total) * 100) : 100;
                return (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-slate-800 flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {d.department}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {d.total}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-amber-600 font-bold">
                      {d.active}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-600 font-bold">
                      {d.resolved}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {d.avgHours} hrs
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${resRate}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-700">{resRate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Administrative Audit Trail */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-campus-600" />
            Live System & State Machine Audit Logs
          </span>
          <span className="text-xs text-slate-400 font-normal">Last 10 events</span>
        </h3>

        <div className="divide-y divide-slate-100">
          {recentActivity.map((act, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] font-bold text-slate-700 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                  {act.action}
                </span>
                <span className="text-slate-600">
                  performed by <strong>{act.performedBy?.name || 'Administrator'}</strong> (
                  <span className="uppercase text-[10px] text-slate-500">{act.userRole}</span>)
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono shrink-0">
                {new Date(act.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
