import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { AssignModal } from '../components/AssignModal';
import { ResolutionModal } from '../components/ResolutionModal';
import { FeedbackModal } from '../components/FeedbackModal';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  ArrowRight,
  TrendingUp,
  Building,
  User,
  Shield,
  Star,
  Activity,
  Layers,
  ChevronRight,
  Zap,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user, isAdmin, isStaff, isStudent } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    resolved: 0,
    overdue: 0,
  });
  const [analyticsSummary, setAnalyticsSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load complaints
      const complaintsRes = await api.getComplaints({ limit: 15 });
      if (complaintsRes.success) {
        setComplaints(complaintsRes.complaints || []);
        setStats({
          total: complaintsRes.total || 0,
          active: complaintsRes.complaints.filter(
            (c) => !['RESOLVED', 'CLOSED'].includes(c.status)
          ).length,
          resolved: complaintsRes.complaints.filter((c) =>
            ['RESOLVED', 'CLOSED'].includes(c.status)
          ).length,
          overdue: complaintsRes.complaints.filter((c) => c.isOverdue).length,
        });
      }

      // If Admin, load analytics summary
      if (user?.role === 'admin') {
        const analyticsRes = await api.getAnalytics();
        if (analyticsRes.success) {
          setAnalyticsSummary(analyticsRes);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWork = async (complaint) => {
    try {
      const res = await api.updateStatus(complaint._id, {
        targetStatus: 'IN_PROGRESS',
        note: `Technician ${user.name} started work on site.`,
      });
      if (res.success) {
        loadDashboardData();
      }
    } catch (err) {
      alert(err.message || 'Failed to start work');
    }
  };

  // Find resolved complaints awaiting student confirmation
  const resolvedWaitingConfirmation = complaints.filter(
    (c) => c.status === 'RESOLVED' && c.createdBy?._id === user?._id
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Role Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-campus-900 via-campus-800 to-campus-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-campus-200 mb-3 border border-white/10">
              {isAdmin && <Shield className="w-3.5 h-3.5 text-purple-300" />}
              {isStaff && <Wrench className="w-3.5 h-3.5 text-blue-300" />}
              {isStudent && <User className="w-3.5 h-3.5 text-emerald-300" />}
              <span>{user?.role?.toUpperCase()} PORTAL • {user?.department || 'CAMPUS HUB'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}
            </h1>
            <p className="mt-1 text-campus-100 text-sm max-w-xl">
              {isAdmin && 'Campus-wide infrastructure monitor, staff dispatching, and department SLA tracking.'}
              {isStaff && `Assigned to ${user?.department} Department. Track, progress, and resolve campus maintenance tickets.`}
              {isStudent && 'Quickly report hostel, classroom, and campus Wi-Fi/infrastructure problems and track their resolution.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/new-complaint"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-white text-campus-900 hover:bg-campus-50 shadow-md hover:scale-102 transition-all"
            >
              <PlusCircle className="w-4 h-4 text-campus-600" />
              <span>Report New Issue</span>
            </Link>

            <Link
              to="/complaints"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all"
            >
              <span>Browse All Tickets</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Ambient background decorative circles */}
        <div className="absolute right-0 -bottom-10 w-96 h-96 bg-campus-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Student Action Banner: Waiting for Confirmation */}
      {isStudent && resolvedWaitingConfirmation.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-900">
                  {resolvedWaitingConfirmation.length} of your tickets marked resolved!
                </h3>
                <p className="text-xs text-emerald-700">
                  Please verify that the technician resolved the issue, leave your rating, and close the complaint.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedComplaint(resolvedWaitingConfirmation[0]);
                setIsFeedbackOpen(true);
              }}
              className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Review & Rate Resolution
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Managed
            </span>
            <div className="w-8 h-8 rounded-lg bg-campus-50 text-campus-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              {analyticsSummary ? analyticsSummary.summary.totalComplaints : stats.total}
            </div>
            <div className="text-xs text-slate-500 mt-1">Campus tickets logged</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              In Progress / Active
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              {analyticsSummary ? analyticsSummary.summary.activeComplaints : stats.active}
            </div>
            <div className="text-xs text-amber-600 font-medium mt-1">Currently being handled</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Resolved & Closed
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              {analyticsSummary ? analyticsSummary.summary.resolvedComplaints : stats.resolved}
            </div>
            <div className="text-xs text-emerald-600 font-medium mt-1">Successfully fixed</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isAdmin ? 'SLA Compliance' : 'Overdue Tickets'}
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              (analyticsSummary?.summary.overdueCount || stats.overdue) > 0
                ? 'bg-rose-50 text-rose-600'
                : 'bg-emerald-50 text-emerald-600'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              {isAdmin
                ? `${analyticsSummary?.summary.slaComplianceRate ?? 100}%`
                : stats.overdue}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {isAdmin ? 'Target resolution met' : 'Requiring immediate action'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Section: Recent Complaints Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isAdmin && 'Campus Complaints Management Queue'}
              {isStaff && `Department & Assigned Tickets (${user?.department})`}
              {isStudent && 'My Submitted Complaints & Status Tracking'}
            </h2>
            <p className="text-xs text-slate-500">
              State machine verified tickets and live progress
            </p>
          </div>

          <Link
            to="/complaints"
            className="text-xs font-semibold text-campus-600 hover:text-campus-700 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View Full Filterable List</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400">
            Loading campus workflow queue...
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No active complaints</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Great news! There are no unresolved complaints matching your scope.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {complaints.map((c) => (
              <div
                key={c._id}
                className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="hidden sm:flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-slate-100 text-slate-700 font-mono text-xs font-bold shrink-0">
                    <span className="text-[10px] text-slate-400 font-sans">ZONE</span>
                    {c.location?.zone?.split(' ')[0] || 'CAMP'}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {c.ticketNumber}
                      </span>
                      <StatusBadge status={c.status} size="sm" />
                      <PriorityBadge priority={c.priority} />
                      <span className="text-xs text-slate-400 font-medium">
                        {c.category}
                      </span>
                      {c.isOverdue && (
                        <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          SLA Breached
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/complaints/${c._id}`}
                      className="font-bold text-slate-900 text-sm hover:text-campus-600 line-clamp-1 block"
                    >
                      {c.title}
                    </Link>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {c.location?.building} • {c.location?.roomNumber}
                      </span>
                      <span>•</span>
                      <span>Dept: <strong className="text-slate-700">{c.assignedDepartment}</strong></span>
                      {c.assignedTo && (
                        <>
                          <span>•</span>
                          <span>Tech: <strong className="text-slate-700">{c.assignedTo.name}</strong></span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Role-based contextual action buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {/* Admin: Assign Modal */}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setSelectedComplaint(c);
                        setIsAssignOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                    >
                      {c.assignedTo ? 'Reassign' : 'Assign Staff'}
                    </button>
                  )}

                  {/* Staff: Progress or Resolve */}
                  {isStaff && c.status === 'ASSIGNED' && (
                    <button
                      onClick={() => handleStartWork(c)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs"
                    >
                      Start Work
                    </button>
                  )}

                  {isStaff && c.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => {
                        setSelectedComplaint(c);
                        setIsResolveOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
                    >
                      Mark Resolved
                    </button>
                  )}

                  {/* Student: Verify & Close if Resolved */}
                  {isStudent && c.status === 'RESOLVED' && (
                    <button
                      onClick={() => {
                        setSelectedComplaint(c);
                        setIsFeedbackOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs flex items-center gap-1"
                    >
                      <Star className="w-3 h-3" />
                      Close & Rate
                    </button>
                  )}

                  <Link
                    to={`/complaints/${c._id}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="View details"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Extra Section: Department SLA and Response Breakdown */}
      {isAdmin && analyticsSummary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <Building className="w-4 h-4 text-campus-600" />
              Department Workload & Performance
            </h3>
            <div className="space-y-3">
              {analyticsSummary.byDepartment?.map((dept, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                    <span>{dept.department}</span>
                    <span className="text-slate-500 font-normal">
                      {dept.active} active • {dept.resolved} resolved
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{
                        width: `${dept.total > 0 ? (dept.resolved / dept.total) * 100 : 0}%`,
                      }}
                      title="Resolved"
                    />
                    <div
                      className="bg-amber-400 h-full"
                      style={{
                        width: `${dept.total > 0 ? (dept.active / dept.total) * 100 : 0}%`,
                      }}
                      title="Active"
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>Avg Resolution: {dept.avgHours} hrs</span>
                    <span>Total: {dept.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Issue Categories Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-campus-600" />
              Campus Issues by Category
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {analyticsSummary.byCategory?.map((cat, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between"
                >
                  <span className="text-xs font-medium text-slate-700 truncate mr-2">
                    {cat.name}
                  </span>
                  <span className="text-xs font-extrabold text-slate-900 px-2 py-0.5 rounded-full bg-white border border-slate-200">
                    {cat.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedComplaint && (
        <>
          <AssignModal
            isOpen={isAssignOpen}
            onClose={() => {
              setIsAssignOpen(false);
              setSelectedComplaint(null);
            }}
            complaint={selectedComplaint}
            onAssigned={loadDashboardData}
          />

          <ResolutionModal
            isOpen={isResolveOpen}
            onClose={() => {
              setIsResolveOpen(false);
              setSelectedComplaint(null);
            }}
            complaint={selectedComplaint}
            onResolved={loadDashboardData}
          />

          <FeedbackModal
            isOpen={isFeedbackOpen}
            onClose={() => {
              setIsFeedbackOpen(false);
              setSelectedComplaint(null);
            }}
            complaint={selectedComplaint}
            onClosed={loadDashboardData}
          />
        </>
      )}
    </div>
  );
};
