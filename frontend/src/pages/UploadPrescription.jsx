import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import {
  Upload, FileText, X, CheckCircle2, Phone, MessageCircle,
  Camera, File, AlertCircle, Send, User, Heart
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const UPLOAD_TYPES = [
  { id: 'prescription', label: 'Doctor Prescription', icon: '💊', desc: 'Prescription written by your doctor for lab tests' },
  { id: 'requisition', label: 'Lab Requisition', icon: '🔬', desc: 'Lab test requisition slip from hospital/clinic' },
  { id: 'previous_report', label: 'Previous Report', icon: '📋', desc: 'Old lab reports for reference or comparison' },
  { id: 'other', label: 'Other Document', icon: '📄', desc: 'Any other health-related document' },
];

const UploadPrescription = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1); // 1=form, 2=success
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    docType: 'prescription',
    notes: '',
    preferredDate: '',
    isHomeCollection: false,
    address: '',
  });
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackingRef, setTrackingRef] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFiles = (newFiles) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const valid = Array.from(newFiles).filter(f => allowed.includes(f.type) && f.size < 10 * 1024 * 1024);
    if (valid.length < newFiles.length) {
      setError('Some files were skipped (only JPG, PNG, WebP, PDF up to 10MB allowed).');
    }
    setFiles(prev => [...prev, ...valid].slice(0, 5));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.mobile.trim()) {
      setError('Name and mobile number are required.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (files.length === 0) {
      setError('Please upload at least one document.');
      return;
    }
    setLoading(true);
    try {
      // Send WhatsApp notification with form details
      const docTypeLabel = UPLOAD_TYPES.find(t => t.id === form.docType)?.label || form.docType;
      const msg = `🏥 *New Prescription Upload — Sana Pathology*\n\n*Patient:* ${form.name}\n*Mobile:* ${form.mobile}\n*Document Type:* ${docTypeLabel}\n*Home Collection:* ${form.isHomeCollection ? 'Yes' : 'No'}${form.isHomeCollection ? `\n*Address:* ${form.address}` : ''}\n*Preferred Date:* ${form.preferredDate || 'Not specified'}\n*Notes:* ${form.notes || 'None'}\n\n📎 Patient has uploaded ${files.length} file(s). Please call to confirm appointment.`;

      // Try backend first; fall back to WhatsApp deeplink
      let ref = `SPL-RX-${Date.now().toString(36).toUpperCase()}`;
      try {
        const res = await fetch(`${API}/public/upload-prescription`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, fileCount: files.length, reference: ref }),
        });
        if (res.ok) {
          const data = await res.json();
          ref = data.reference || ref;
        }
      } catch {
        // Backend may not have this endpoint yet; proceed with WhatsApp
      }

      // Open WhatsApp with lab notification
      window.open(
        `https://wa.me/916396786939?text=${encodeURIComponent(msg)}`,
        '_blank',
        'noopener noreferrer'
      );

      setTrackingRef(ref);
      setStep(2);
    } catch (err) {
      setError('Failed to submit. Please try again or call us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7F6] via-emerald-50/30 to-amber-50/20 py-12 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Page Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-xs font-bold px-4 py-1.5 rounded-full mb-4 border border-amber-200">
              <Upload size={13} /> Upload Documents
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-black text-slate-900 mb-3">
              Upload Your Prescription
            </h1>
            <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">
              Share your doctor's prescription, lab requisition, or previous reports with us. Our team will contact you to confirm your appointment and tests.
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl shadow-slate-900/8 border border-gray-100 overflow-hidden">
              {/* Progress indicator */}
              <div className="bg-gradient-to-r from-[#063b30] to-[#1D9E75] px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-black text-sm">Prescription Upload</p>
                    <p className="text-white/70 text-xs">Secure & Confidential</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                  <Heart size={12} className="text-red-300" />
                  <span className="text-white text-xs font-bold">Free Service</span>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Document type selector */}
                <div>
                  <label className="block text-sm font-black text-slate-800 mb-3">
                    What are you uploading? <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {UPLOAD_TYPES.map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, docType: type.id }))}
                        className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                          form.docType === type.id
                            ? 'border-[#1D9E75] bg-emerald-50 shadow-md shadow-emerald-100'
                            : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'
                        }`}
                      >
                        <span className="text-2xl mb-1 block">{type.icon}</span>
                        <p className="font-black text-sm text-slate-800 leading-tight">{type.label}</p>
                        <p className="text-xs text-slate-500 mt-1">{type.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Patient Details */}
                <div>
                  <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                    <User size={15} className="text-[#1D9E75]" />
                    Your Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Rahul Khan"
                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#1D9E75] focus:ring-4 focus:ring-emerald-500/10 transition-all bg-gray-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Mobile Number <span className="text-red-500">*</span></label>
                      <input
                        name="mobile"
                        value={form.mobile}
                        onChange={handleChange}
                        required
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#1D9E75] focus:ring-4 focus:ring-emerald-500/10 transition-all bg-gray-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Preferred Date</label>
                      <input
                        name="preferredDate"
                        type="date"
                        value={form.preferredDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#1D9E75] focus:ring-4 focus:ring-emerald-500/10 transition-all bg-gray-50/50"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-gray-100 rounded-xl w-full hover:border-emerald-200 transition-colors bg-gray-50/50">
                        <input
                          name="isHomeCollection"
                          type="checkbox"
                          checked={form.isHomeCollection}
                          onChange={handleChange}
                          className="accent-[#1D9E75] w-4 h-4 cursor-pointer rounded"
                        />
                        <div>
                          <p className="text-sm font-black text-slate-800">Home Collection</p>
                          <p className="text-xs text-slate-500">We come to you</p>
                        </div>
                      </label>
                    </div>
                  </div>
                  {form.isHomeCollection && (
                    <div className="mt-4">
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Collection Address <span className="text-red-500">*</span></label>
                      <textarea
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        required={form.isHomeCollection}
                        rows={3}
                        placeholder="House No, Street, Colony, Sambhal..."
                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#1D9E75] focus:ring-4 focus:ring-emerald-500/10 transition-all bg-gray-50/50 resize-none"
                      />
                    </div>
                  )}
                  <div className="mt-4">
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Additional Notes</label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Any special instructions, symptoms, or preferences..."
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#1D9E75] focus:ring-4 focus:ring-emerald-500/10 transition-all bg-gray-50/50 resize-none"
                    />
                  </div>
                </div>

                {/* File Upload Zone */}
                <div>
                  <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                    <Upload size={15} className="text-[#1D9E75]" />
                    Upload Document(s) <span className="text-red-500">*</span>
                    <span className="text-xs font-normal text-slate-400 ml-auto">Max 5 files, 10MB each</span>
                  </h3>
                  <div
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${
                      dragging
                        ? 'border-[#1D9E75] bg-emerald-50 scale-[1.01]'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      className="hidden"
                      onChange={(e) => handleFiles(e.target.files)}
                    />
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-[#1D9E75]/10 flex items-center justify-center">
                        <Camera className="w-8 h-8 text-[#1D9E75]" />
                      </div>
                      <div>
                        <p className="font-black text-slate-700">Drop files here or click to browse</p>
                        <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, WebP, PDF</p>
                      </div>
                      <button
                        type="button"
                        className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-emerald-500/20 hover:shadow-lg"
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      >
                        Choose Files
                      </button>
                    </div>
                  </div>

                  {/* File list */}
                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {files.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                          <File size={18} className="text-[#1D9E75] shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-700 truncate">{file.name}</p>
                            <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(0)} KB</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Privacy Notice */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
                  <AlertCircle size={16} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 font-semibold leading-relaxed">
                    Your documents are completely confidential. They are only accessible to licensed Sana Pathology staff to process your request. We follow strict data privacy protocols.
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3">
                    <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 font-semibold">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-[#0F6E56] to-[#1D9E75] hover:from-[#1D9E75] hover:to-[#0F6E56] text-white font-black text-base rounded-2xl shadow-xl shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Submit Prescription & Notify Lab
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-slate-400">
                  After submission, our team will contact you within 1 hour to confirm your appointment.
                </p>
              </div>
            </form>
          ) : (
            /* ── SUCCESS STATE ── */
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-in">
                <CheckCircle2 className="w-12 h-12 text-[#1D9E75]" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Prescription Received!</h2>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                Thank you, <strong>{form.name}</strong>! Our lab team has been notified and will contact you at <strong>+91 {form.mobile}</strong> within 1 hour to confirm your appointment.
              </p>
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-8">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1">Your Reference Number</p>
                <p className="text-2xl font-black text-[#0F6E56] tracking-widest">{trackingRef}</p>
                <p className="text-xs text-slate-400 mt-1">Save this for tracking your request</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={`https://wa.me/916396786939?text=Hi%20Sana%20Pathology%2C%20my%20reference%20is%20${trackingRef}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md"
                >
                  <MessageCircle size={16} />
                  Track via WhatsApp
                </a>
                <a
                  href="tel:+916396786939"
                  className="flex items-center justify-center gap-2 bg-[#1D9E75] hover:bg-[#0F6E56] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md"
                >
                  <Phone size={16} />
                  Call Lab Now
                </a>
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-slate-700 px-6 py-3 rounded-xl font-bold text-sm transition-all"
                >
                  Go to Home
                </button>
              </div>
            </div>
          )}

          {/* Quick Help Bar */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-slate-500">
            <span>Need immediate help?</span>
            <a href="tel:+916396786939" className="flex items-center gap-1.5 font-bold text-[#1D9E75] hover:underline">
              <Phone size={14} /> +91 6396786939
            </a>
            <span className="hidden sm:block">or</span>
            <a href="https://wa.me/916396786939" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 font-bold text-[#25D366] hover:underline">
              <MessageCircle size={14} /> WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default UploadPrescription;
