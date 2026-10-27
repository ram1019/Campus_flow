import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { X, UserCheck, AlertCircle } from 'lucide-react';

export const AssignModal = ({ isOpen, onClose, complaint, onAssigned }) => {
  const [departments] = useState([
    'Electrical',
    'Plumbing',
    'IT & Network',
    'Housekeeping',
    'Carpentry',
    'Civil',
    'General Administration',
  ]);
  const [selectedDept, setSelectedDept] = useState(complaint?.assignedDepartment || 'General Administration');
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(complaint?.assignedTo?._id || '');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedDept(complaint?.assignedDepartment || 'General Administration');
      setSelectedStaff(complaint?.assignedTo?._id || '');
      setNote('');
      setError('');
      loadStaff();
    }
  }, [isOpen, complaint]);

  const loadStaff = async () => {
    try {
      const res = await api.getStaff();
      if (res.success) {
        setStaffList(res.staff || []);
      }
    } catch (err) {
      console.error('Failed to load staff:', err);
    }
  };

  // Filter staff by selected department (or show all if general)
  const filteredStaff = staffList.filter(
    (s) => !selectedDept || s.department === selectedDept || s.department === 'General Administration'
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.assignComplaint(complaint._id, {
        assignedDepartment: selectedDept,
        assignedTo: selectedStaff || null,
        note: note.trim() || `Assigned to department: ${selectedDept}`,
      });

      if (res.success) {
        onAssigned(res.complaint);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to assign complaint');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-campus-50 flex items-center justify-center text-campus-600">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Assign Ticket & Department</h3>
              <p className="text-xs text-slate-500">{complaint.ticketNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Designated Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setSelectedStaff('');
              }}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-campus-500 bg-white"
              required
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Assign Specific Staff / Technician (Optional)
            </label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-campus-500 bg-white"
            >
              <option value="">-- Auto-dispatch / Unassigned --</option>
              {filteredStaff.map((staff) => (
                <option key={staff._id} value={staff._id}>
                  {staff.name} ({staff.department} {staff.phone ? `• ${staff.phone}` : ''})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Showing staff eligible for {selectedDept}.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Assignment Note / Instructions
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="e.g., Please prioritize capacitor check before 4 PM..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-campus-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-campus-600 hover:bg-campus-700 disabled:opacity-50 rounded-xl shadow-sm transition-all"
            >
              {loading ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
