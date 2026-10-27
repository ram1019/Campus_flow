import React, { useState } from 'react';
import { api } from '../services/api';
import { X, Star, Lock, AlertCircle, RotateCcw } from 'lucide-react';

export const FeedbackModal = ({ isOpen, onClose, complaint, onClosed }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isReopening, setIsReopening] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCloseTicket = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.updateStatus(complaint._id, {
        targetStatus: 'CLOSED',
        rating: rating,
        feedbackComment: comment.trim(),
        note: `Ticket closed by student. Rated ${rating}/5 stars. Feedback: "${comment.trim() || 'No feedback'}"`,
      });

      if (res.success) {
        onClosed(res.complaint);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to close ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleReopenTicket = async (e) => {
    e.preventDefault();
    if (!reopenReason.trim()) {
      setError('Please explain why the issue is still not resolved.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.updateStatus(complaint._id, {
        targetStatus: 'REOPENED',
        reopenReason: reopenReason.trim(),
        note: `Issue reopened by student: "${reopenReason.trim()}"`,
      });

      if (res.success) {
        onClosed(res.complaint);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to reopen ticket');
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
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isReopening ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-700'
            }`}>
              {isReopening ? <RotateCcw className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-800">
                {isReopening ? 'Reopen Complaint' : 'Confirm Resolution & Close'}
              </h3>
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

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!isReopening ? (
          <form onSubmit={handleCloseTicket} className="p-6 space-y-4">
            <div className="text-center py-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                How satisfied are you with the resolution?
              </p>
              <div className="flex items-center justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-slate-300 transition-colors hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        (hoverRating || rating) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-transparent text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs font-medium text-slate-600 mt-1">
                {rating === 5 && 'Outstanding & Swift'}
                {rating === 4 && 'Very Good'}
                {rating === 3 && 'Satisfactory'}
                {rating === 2 && 'Needs Improvement'}
                {rating === 1 && 'Unsatisfactory'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Feedback & Comments (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Share your experience or thank the technician..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-campus-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsReopening(true)}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold underline"
              >
                Issue not fixed? Reopen ticket
              </button>

              <div className="flex items-center gap-2">
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
                  className="px-5 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl shadow-sm transition-all"
                >
                  {loading ? 'Closing...' : 'Confirm & Close'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleReopenTicket} className="p-6 space-y-4">
            <p className="text-xs text-slate-600 bg-rose-50 border border-rose-100 rounded-xl p-3">
              Reopening will alert the facility administrator and technician that the issue requires further intervention.
            </p>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Why are you reopening this complaint? *
              </label>
              <textarea
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                rows={4}
                placeholder="Describe what is still not working or happened again..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsReopening(false)}
                className="text-xs text-slate-500 hover:text-slate-700 font-medium"
              >
                ← Back to Close
              </button>

              <div className="flex items-center gap-2">
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
                  className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-all"
                >
                  {loading ? 'Reopening...' : 'Confirm Reopen'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
