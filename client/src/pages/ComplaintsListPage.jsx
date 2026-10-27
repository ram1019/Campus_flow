import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { AssignModal } from '../components/AssignModal';
import { ResolutionModal } from '../components/ResolutionModal';
import { FeedbackModal } from '../components/FeedbackModal';
import {
  Search,
  Filter,
  SlidersHorizontal,
  PlusCircle,
  Building,
  Clock,
  ChevronRight,
  RotateCcw,
  AlertTriangle,
  X,
} from 'lucide-react';

export const ComplaintsListPage = () => {
  const { user, isAdmin, isStaff, isStudent } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [isOverdueOnly, setIsOverdueOnly] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  // Modals
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const categories = [
    'Hostel',
    'Classroom',
    'Wi-Fi & Network',
    'Electrical',
    'Plumbing',
    'Housekeeping',
    'Carpentry',
    'Lab & Equipment',
    'Civil & Infrastructure',
    'Other',
  ];

  const statuses = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Submitted', value: 'SUBMITTED' },
    { label: 'Assigned', value: 'ASSIGNED' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Resolved', value: 'RESOLVED' },
    { label: 'Closed', value: 'CLOSED' },
    { label: 'Reopened', value: 'REOPENED' },
  ];

  const departments = [
    'Electrical',
    'Plumbing',
    'IT & Network',
    'Housekeeping',
    'Carpentry',
    'Civil',
    'General Administration',
  ];

  useEffect(() => {
    fetchComplaints();
  }, [
    page,
    selectedStatus,
    selectedCategory,
    selectedPriority,
    selectedDepartment,
    isOverdueOnly,
    sortBy,
    sortOrder,
  ]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
        status: selectedStatus,
        category: selectedCategory,
        priority: selectedPriority,
        department: selectedDepartment,
        isOverdue: isOverdueOnly ? 'true' : 'false',
        sortBy,
        sortOrder,
      };

      if (searchTerm.trim()) {
        params.q = searchTerm.trim();
      }

      const res = await api.getComplaints(params);
      if (res.success) {
        setComplaints(res.complaints || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching complaints list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('ALL');
    setSelectedCategory('ALL');
    setSelectedPriority('ALL');
    setSelectedDepartment('ALL');
    setIsOverdueOnly(false);
    setPage(1);
  };

  const hasActiveFilters =
    selectedStatus !== 'ALL' ||
    selectedCategory !== 'ALL' ||
    selectedPriority !== 'ALL' ||
    selectedDepartment !== 'ALL' ||
    isOverdueOnly ||
    searchTerm.trim() !== '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isStudent ? 'My Campus Complaints' : 'Campus Infrastructure Complaints'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Search, filter, and track complaint state transitions across all facilities
          </p>
        </div>

        <Link
          to="/new-complaint"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-campus-600 hover:bg-campus-700 shadow-sm self-start sm:self-auto transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Issue</span>
        </Link>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ticket #, description, building, or room..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-campus-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs"
          >
            Search
          </button>
        </form>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Status */}
          <div>
            <label className="block font-semibold text-slate-500 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 rounded-lg border border-slate-200 bg-white"
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block font-semibold text-slate-500 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 rounded-lg border border-slate-200 bg-white"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block font-semibold text-slate-500 mb-1">Priority</label>
            <select
              value={selectedPriority}
              onChange={(e) => {
                setSelectedPriority(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 rounded-lg border border-slate-200 bg-white"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block font-semibold text-slate-500 mb-1">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 rounded-lg border border-slate-200 bg-white"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Overdue Checkbox */}
          <div className="flex flex-col justify-end">
            <label className="inline-flex items-center gap-2 p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={isOverdueOnly}
                onChange={(e) => {
                  setIsOverdueOnly(e.target.checked);
                  setPage(1);
                }}
                className="rounded text-rose-600 focus:ring-rose-500"
              />
              <span className="font-semibold text-rose-700 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-500" />
                Overdue Only
              </span>
            </label>
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-500">
              Showing filtered results (<strong>{total}</strong> found)
            </span>
            <button
              onClick={resetFilters}
              className="text-campus-600 hover:text-campus-700 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Complaints List Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-sm text-slate-400">
            Loading complaints...
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No complaints match your filters</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search criteria or resetting filters to see all campus issues.
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-2 text-xs font-bold text-campus-600 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {complaints.map((c) => (
              <div
                key={c._id}
                className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      {c.ticketNumber}
                    </span>
                    <StatusBadge status={c.status} />
                    <PriorityBadge priority={c.priority} />
                    <span className="text-xs text-slate-500 font-medium px-2 py-0.5 rounded bg-slate-50 border border-slate-100">
                      {c.category}
                    </span>
                    {c.isOverdue && (
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        SLA Breached
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/complaints/${c._id}`}
                    className="text-base font-bold text-slate-900 hover:text-campus-600 transition-colors block line-clamp-1"
                  >
                    {c.title}
                  </Link>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {c.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {c.location?.zone} • {c.location?.building} • {c.location?.roomNumber}
                    </span>
                    <span>•</span>
                    <span>Dept: <strong className="text-slate-700">{c.assignedDepartment}</strong></span>
                    {c.assignedTo && (
                      <>
                        <span>•</span>
                        <span>Tech: <strong className="text-slate-700">{c.assignedTo.name}</strong></span>
                      </>
                    )}
                    <span>•</span>
                    <span className="text-slate-400">
                      Logged {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setSelectedComplaint(c);
                        setIsAssignOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                    >
                      {c.assignedTo ? 'Reassign' : 'Assign'}
                    </button>
                  )}

                  <Link
                    to={`/complaints/${c._id}`}
                    className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-campus-50 text-campus-700 hover:bg-campus-100 transition-colors"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

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
            onAssigned={fetchComplaints}
          />

          <ResolutionModal
            isOpen={isResolveOpen}
            onClose={() => {
              setIsResolveOpen(false);
              setSelectedComplaint(null);
            }}
            complaint={selectedComplaint}
            onResolved={fetchComplaints}
          />

          <FeedbackModal
            isOpen={isFeedbackOpen}
            onClose={() => {
              setIsFeedbackOpen(false);
              setSelectedComplaint(null);
            }}
            complaint={selectedComplaint}
            onClosed={fetchComplaints}
          />
        </>
      )}
    </div>
  );
};
