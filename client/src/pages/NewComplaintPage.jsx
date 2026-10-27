import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  PlusCircle,
  Upload,
  Building,
  AlertTriangle,
  Clock,
  ArrowLeft,
  X,
  CheckCircle2,
  Layers,
  Sparkles,
} from 'lucide-react';

export const NewComplaintPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Hostel',
    zone: 'Hostel Block',
    building: user?.hostelOrRoom?.split('-')[0]?.trim() || '',
    roomNumber: user?.hostelOrRoom?.split('-')[1]?.trim() || '',
    priority: 'MEDIUM',
  });

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { id: 'Hostel', label: 'Hostel & Residential' },
    { id: 'Classroom', label: 'Classroom & Lecturing' },
    { id: 'Wi-Fi & Network', label: 'Wi-Fi & Campus Internet' },
    { id: 'Electrical', label: 'Electrical & Fans/AC' },
    { id: 'Plumbing', label: 'Plumbing & Water Supply' },
    { id: 'Housekeeping', label: 'Housekeeping & Sanitation' },
    { id: 'Carpentry', label: 'Carpentry & Furniture' },
    { id: 'Lab & Equipment', label: 'Lab & AV Equipment' },
    { id: 'Civil & Infrastructure', label: 'Civil & Roads' },
    { id: 'Other', label: 'Other Facility Concern' },
  ];

  const priorities = [
    { id: 'LOW', label: 'Low', hours: '72h target', color: 'border-slate-200 text-slate-700' },
    { id: 'MEDIUM', label: 'Medium', hours: '48h target', color: 'border-blue-200 text-blue-700 bg-blue-50/50' },
    { id: 'HIGH', label: 'High', hours: '24h target', color: 'border-orange-200 text-orange-700 bg-orange-50/50' },
    { id: 'CRITICAL', label: 'Critical / Hazard', hours: '12h target', color: 'border-red-200 text-red-700 bg-red-50/50' },
  ];

  const zones = [
    'Hostel Block',
    'Academic Block',
    'Central Campus',
    'Library Complex',
    'Sports Complex',
    'Tech Park & Laboratories',
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      setError('You can upload a maximum of 5 images per complaint.');
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      data.append('category', formData.category);
      data.append('zone', formData.zone);
      data.append('building', formData.building.trim());
      data.append('roomNumber', formData.roomNumber.trim());
      data.append('priority', formData.priority);

      images.forEach((img) => {
        data.append('images', img);
      });

      const res = await api.createComplaint(data);
      if (res.success && res.complaint) {
        navigate(`/complaints/${res.complaint._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/complaints"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Cancel & Back to Complaints</span>
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-campus-50 text-campus-600 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Report Campus Issue
              </h1>
              <p className="text-xs text-slate-500">
                Log a maintenance request with automatic routing to the relevant facility department
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl flex items-center gap-2 border border-red-200">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Issue Category Grid */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Select Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {categories.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setFormData({ ...formData, category: c.id })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    formData.category === c.id
                      ? 'border-campus-600 bg-campus-50/70 text-campus-900 ring-2 ring-campus-500/20 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 font-medium'
                  }`}
                >
                  <span className="text-xs block line-clamp-2">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Issue Title / Headline *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Wi-Fi router rebooting frequently in reading hall"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-campus-500"
              required
            />
          </div>

          {/* Priority Matrix */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Urgency / Priority Level *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {priorities.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setFormData({ ...formData, priority: p.id })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    formData.priority === p.id
                      ? `${p.color} ring-2 ring-current font-bold shadow-xs`
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div className="text-xs font-bold">{p.label}</div>
                  <div className="text-[11px] opacity-75 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{p.hours}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Location Breakdown */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-campus-600" />
              <span>Campus Location</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Zone
                </label>
                <select
                  name="zone"
                  value={formData.zone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-campus-500"
                >
                  {zones.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Building / Hostel *
                </label>
                <input
                  type="text"
                  name="building"
                  value={formData.building}
                  onChange={handleInputChange}
                  placeholder="e.g., Hostel Block B"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-campus-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Room / Lab / Spot *
                </label>
                <input
                  type="text"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., Room 204 or Lab 3"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-campus-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Detailed Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Describe what is broken, symptoms, when it occurs, and exact spot in the room..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-campus-500"
              required
            />
          </div>

          {/* Photo Upload with Previews */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Attach Photos (Optional - Max 5)
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-campus-400 transition-colors bg-white">
              <label className="cursor-pointer flex flex-col items-center">
                <Upload className="w-8 h-8 text-campus-500 mb-2" />
                <span className="text-sm font-semibold text-slate-700">
                  Click to select photos from device
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  PNG, JPG, JPEG, WEBP up to 5MB each
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={images.length >= 5}
                />
              </label>

              {/* Previews */}
              {previews.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-3 justify-center">
                  {previews.map((preview, idx) => (
                    <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                      <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-white hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Link
              to="/complaints"
              className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-bold text-white bg-campus-600 hover:bg-campus-700 disabled:opacity-50 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>{loading ? 'Submitting Ticket...' : 'Submit Campus Complaint'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
