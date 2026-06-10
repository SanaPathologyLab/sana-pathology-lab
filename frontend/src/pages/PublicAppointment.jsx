import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Calendar, User, Phone, MapPin, Clock } from 'lucide-react';
import Loader from '../components/Loader';

const PublicAppointment = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    gender: 'MALE',
    address: '',
    preferredDate: '',
    preferredTime: '',
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const testName = params.get('test');
    const packageName = params.get('package');
    if (testName) {
      setFormData(prev => ({ ...prev, notes: `Booking Test: ${testName}` }));
    } else if (packageName) {
      setFormData(prev => ({ ...prev, notes: `Booking Package: ${packageName}` }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/public/book-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setSuccess(true);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to book appointment. Please try again.');
      }
    } catch (err) {
      setError('Network error. Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Request Received!</h2>
          <p className="text-slate-600 mb-8">
            Thank you, {formData.name}. We have received your appointment request. Please alert us on WhatsApp so we can process it immediately.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                const msg = `*New Appointment Request*\n\n*Name:* ${formData.name}\n*Mobile:* ${formData.mobile}\n*Gender:* ${formData.gender}\n*Date:* ${formData.preferredDate}\n*Time:* ${formData.preferredTime}\n*Address:* ${formData.address}\n*Notes:* ${formData.notes || 'None'}`;
                // Hardcoding lab phone since settings might not be available in this public view context, but we found it in Settings.jsx
                const labPhone = "916396786939"; 
                window.open(`https://wa.me/${labPhone}?text=${encodeURIComponent(msg)}`, '_blank');
              }}
              className="w-full bg-[#25D366] text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-green-200 hover:bg-[#128C7E] transition-all flex items-center justify-center gap-2"
            >
              Alert Lab via WhatsApp
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-200 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-slate-800">Book Home Collection / Clinic Visit</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Patient Details</h2>
              <p className="text-slate-500">Please fill out the form below to request a test.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <User size={16} className="text-slate-400" /> Patient Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#00488d] focus:border-transparent outline-none transition-all"
                  />
                </div>

                {/* Mobile */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Phone size={16} className="text-slate-400" /> Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    required
                    maxLength="10"
                    pattern="[0-9]{10}"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="10-digit number"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#00488d] focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Gender *</label>
                <div className="flex gap-4">
                  {['MALE', 'FEMALE', 'OTHER'].map(g => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="gender" 
                        value={g} 
                        checked={formData.gender === g}
                        onChange={handleChange}
                        className="w-4 h-4 text-[#00488d] focus:ring-[#00488d]"
                      />
                      <span className="text-slate-700">{g === 'MALE' ? 'Male' : g === 'FEMALE' ? 'Female' : 'Other'}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <MapPin size={16} className="text-slate-400" /> Collection Address (For Home Collection)
                </label>
                <textarea
                  name="address"
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter full address with landmark"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#00488d] focus:border-transparent outline-none transition-all resize-none"
                ></textarea>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {/* Date */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Calendar size={16} className="text-slate-400" /> Preferred Date *
                  </label>
                  <input
                    type="date"
                    name="preferredDate"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.preferredDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#00488d] focus:border-transparent outline-none transition-all"
                  />
                </div>

                {/* Time */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Clock size={16} className="text-slate-400" /> Preferred Time *
                  </label>
                  <input
                    type="time"
                    name="preferredTime"
                    required
                    value={formData.preferredTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#00488d] focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Tests Required / Notes (Optional)</label>
                <textarea
                  name="notes"
                  rows="2"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="e.g. CBC, LFT, or Fasting required"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#00488d] focus:border-transparent outline-none transition-all resize-none"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00488d] hover:bg-blue-800 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader type="button" className="text-white" />
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublicAppointment;
