import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { TimelineView } from '../components/TimelineView';
import { AssignModal } from '../components/AssignModal';
import { ResolutionModal } from '../components/ResolutionModal';
import { FeedbackModal } from '../components/FeedbackModal';
import {
  ArrowLeft,
  Building,
  User,
  Clock,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Star,
  Shield,
  Layers,
  Calendar,
  Lock,
} from 'lucide-react';

export const ComplaintDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isStaff, isStudent } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    loadComplaint();
  }, [id]);

  const loadComplaint = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getComplaint(id);
      if (res.success) {
        setComplaint(res.complaint);
      }
    } catch (err) {
      setError(err.message || 'Failed to load complaint');
    } finally {
      setLoading(false);
    }
  };

  const handleStartWork = async () => {
    try {
      const res = await api.updateStatus(complaint._id, {
        targetStatus: 'IN_PROGRESS',
        note: `Technician ${user.name} acknowledged and started work on site.`,
      });
      if (res.success) {
        loadComplaint();
      }
    } catch (err) {
      alert(err.message || 'Transition rejected by state machine.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-sm text-slate-400">
        Loading complaint details...
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Error Loading Ticket</h2>
        <p className="text-sm text-slate-500">{error || 'Ticket not found or unauthorized'}</p>
        <Link
          to="/complaints"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-campus-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complaints List</span>
        </Link>
      </div>
    );
  }

  const isCreator =
    complaint.createdBy?._id === user?._id || complaint.createdBy === user?._id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/complaints"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complaints</span>
        </Link>

        <span className="font-mono text-xs font-bold text-slate-400">
          ID: {complaint._id}
        </span>
      </div>

      {/* Ticket Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-sm font-extrabold text-campus-800 bg-campus-50 border border-campus-200 px-3 py-1 rounded-xl">
                {complaint.ticketNumber}
              </span>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
              {complaint.isOverdue && (
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  SLA Breached
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              {complaint.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1 text-slate-700 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Submitted by {complaint.createdBy?.name || 'Student'}
                {complaint.createdBy?.studentId && ` (${complaint.createdBy.studentId})`}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(complaint.createdAt).toLocaleString()}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-700 font-medium">
                <Clock className="w-3.5 h-3.5" />
                SLA Target: {new Date(complaint.slaDeadline).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Dynamic State Machine Action Panel */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            {/* Admin: Assign Modal */}
            {isAdmin && (
              <button
                onClick={() => setIsAssignOpen(true)}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 transition-colors shadow-xs"
              >
                {complaint.assignedTo ? 'Reassign Staff' : 'Assign Department / Staff'}
              </button>
            )}

            {/* Staff: Start Work */}
            {(isStaff || isAdmin) && complaint.status === 'ASSIGNED' && (
              <button
                onClick={handleStartWork}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Start Work on Site</span>
              </button>
            )}

            {/* Staff: Mark Resolved */}
            {(isStaff || isAdmin) && complaint.status === 'IN_PROGRESS' && (
              <button
                onClick={() => setIsResolveOpen(true)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark as Resolved</span>
              </button>
            )}

            {/* Student or Admin: Confirm Resolution & Close */}
            {(isCreator || isAdmin) && complaint.status === 'RESOLVED' && (
              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs flex items-center gap-1.5 animate-bounce"
              >
                <Star className="w-3.5 h-3.5" />
                <span>Confirm Resolution & Close</span>
              </button>
            )}

            {/* Reopen if closed or resolved */}
            {(isCreator || isAdmin) &&
              ['CLOSED', 'RESOLVED'].includes(complaint.status) && (
                <button
                  onClick={() => setIsFeedbackOpen(true)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 transition-colors"
                >
                  Reopen Issue
                </button>
              )}
          </div>
        </div>

        {/* State Machine Transition Notice */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-campus-600" />
            <span>
              <strong>Backend FSM Active:</strong> Role <em>{user?.role}</em>. Illegal state transitions are strictly blocked by the server state machine.
            </span>
          </div>
          <span className="font-mono text-[11px] font-bold text-slate-600 uppercase">
            {complaint.status}
          </span>
        </div>
      </div>

      {/* Main Grid: Details (Left 7 Cols) + Timeline & Assignee (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Complaint Details & Media */}
        <div className="lg:col-span-7 space-y-6">
          {/* Description Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Problem Description
            </h3>
            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {complaint.description}
            </p>

            {/* Attached Images */}
            {complaint.images && complaint.images.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Attached Photos ({complaint.images.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {complaint.images.map((img, idx) => (
                    <a
                      key={idx}
                      href={img}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200"
                    >
                      <img
                        src={img}
                        alt={`Attachment ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Location & Facility Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Location & Facility Details
            </h3>
            <div className="grid grid-cols-3 gap-4 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Campus Zone
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {complaint.location?.zone || 'Campus'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Building / Hostel
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {complaint.location?.building}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Room / Spot
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {complaint.location?.roomNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Resolution Card (if resolved or closed) */}
          {complaint.resolution && complaint.resolution.resolvedAt && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm">Resolution Report</h3>
              </div>

              <p className="text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-emerald-100 whitespace-pre-line">
                {complaint.resolution.notes}
              </p>

              {complaint.resolution.proofImage && (
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 block mb-1">
                    Proof Photo:
                  </span>
                  <a
                    href={complaint.resolution.proofImage}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={complaint.resolution.proofImage}
                      alt="Resolution Proof"
                      className="max-h-48 rounded-xl border border-emerald-200 object-contain shadow-xs"
                    />
                  </a>
                </div>
              )}

              <div className="text-[11px] text-emerald-700 flex justify-between pt-1">
                <span>Resolved by: {complaint.resolution.resolvedBy?.name || 'Technician'}</span>
                <span>{new Date(complaint.resolution.resolvedAt).toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Feedback & Satisfaction Card (if closed) */}
          {complaint.feedback && complaint.feedback.rating && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Student Verification & Rating
                </h3>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= complaint.feedback.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {complaint.feedback.comment && (
                <p className="text-xs text-slate-700 italic bg-white p-3 rounded-xl border border-amber-100">
                  "{complaint.feedback.comment}"
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Assigned Staff & Audit Timeline */}
        <div className="lg:col-span-5 space-y-6">
          {/* Department & Staff Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Department & Assignee</span>
              {isAdmin && (
                <button
                  onClick={() => setIsAssignOpen(true)}
                  className="text-campus-600 hover:underline normal-case font-semibold"
                >
                  Edit
                </button>
              )}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Department</span>
                <span className="font-bold text-slate-800">
                  {complaint.assignedDepartment}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Assigned Staff</span>
                  <span className="font-bold text-slate-800">
                    {complaint.assignedTo?.name || 'Unassigned (General Pool)'}
                  </span>
                </div>
                {complaint.assignedTo?.phone && (
                  <div className="text-[11px] text-slate-400 mt-1">
                    Phone: {complaint.assignedTo.phone}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Audit Timeline Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              State Transition Audit Trail
            </h3>
            <TimelineView timeline={complaint.timeline} />
          </div>
        </div>
      </div>

      {/* Modals */}
      <AssignModal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        complaint={complaint}
        onAssigned={loadComplaint}
      />

      <ResolutionModal
        isOpen={isResolveOpen}
        onClose={() => setIsResolveOpen(false)}
        complaint={complaint}
        onResolved={loadComplaint}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        complaint={complaint}
        onClosed={loadComplaint}
      />
    </div>
  );
};
