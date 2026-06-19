import React, { useState, useRef } from 'react';
import { Calendar, Upload, FileText, Phone, MapPin, Clock, CheckCircle2, X, Loader2, ArrowRight } from 'lucide-react';

const TriplePathHub = ({ scrollToSection, t, language }) => {
  const [activeModal, setActiveModal] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [visitId, setVisitId] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleSendOtp = () => {
    if (visitId.trim() || mobileNo.trim()) {
      setOtpSent(true);
    }
  };

  const handleVerifyOtp = () => {
    if (otpValue.length >= 4) {
      window.open('/#/report-lookup', '_self');
    }
  };

  const actions = [
    {
      id: 'booking',
      icon: <Calendar className="w-8 h-8 text-white" />,
      title: 'Book Home Collection',
      desc: 'Schedule a free home sample collection at your convenience',
      gradient: 'from-secondary to-secondary-light',
      shadow: 'shadow-secondary/30',
      modalTitle: 'Book Home Collection',
    },
    {
      id: 'upload',
      icon: <Upload className="w-8 h-8 text-white" />,
      title: 'Upload Prescription',
      desc: 'Upload your doctor\'s prescription and we\'ll set up your tests',
      gradient: 'from-cta to-cta-light',
      shadow: 'shadow-cta/30',
      modalTitle: 'Upload Prescription',
    },
    {
      id: 'reports',
      icon: <FileText className="w-8 h-8 text-white" />,
      title: 'Download Reports',
      desc: 'Access your diagnostic reports instantly online',
      gradient: 'from-primary to-primary-light',
      shadow: 'shadow-primary/30',
      modalTitle: 'Retrieve Your Report',
    },
  ];

  return (
    <>
      <div className="max-w-5xl mx-auto -mt-16 relative z-30 px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {actions.map((action, i) => (
            <button
              key={action.id}
              onClick={() => setActiveModal(action.id)}
              className="group relative bg-white rounded-2xl p-6 md:p-7 shadow-xl border border-slate-100 hover:border-secondary/20 transition-all duration-300 hover:-translate-y-2 active:scale-[0.98] text-left"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 shadow-lg ${action.shadow} group-hover:scale-110 transition-transform duration-300`}>
                {action.icon}
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-1.5 group-hover:text-primary transition-colors">{action.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{action.desc}</p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-secondary group-hover:gap-2.5 transition-all">
                <span>Get Started</span>
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {activeModal === 'booking' && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="bg-gradient-to-r from-secondary to-secondary-light p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Calendar className="w-7 h-7" />
                <h3 className="text-xl font-black">Book Home Collection</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-start gap-2.5 bg-secondary-pale rounded-xl p-3.5 border border-secondary/20">
                <Clock size={18} className="text-secondary shrink-0 mt-0.5" />
                <p className="text-xs text-slate-700 font-semibold">Fill in your details below and our team will confirm your collection slot within 30 minutes.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name</label>
                  <input type="text" placeholder="Enter your name" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold focus:border-secondary focus:ring-2 focus:ring-secondary/10 outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Mobile Number</label>
                  <input type="tel" placeholder="10-digit number" maxLength="10" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold focus:border-secondary focus:ring-2 focus:ring-secondary/10 outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">City / Area</label>
                  <input type="text" placeholder="e.g. Sambhal" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold focus:border-secondary focus:ring-2 focus:ring-secondary/10 outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Preferred Date</label>
                  <input type="date" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold focus:border-secondary focus:ring-2 focus:ring-secondary/10 outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Address</label>
                <textarea rows="3" placeholder="House/Flat no., Street, Landmark" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold focus:border-secondary focus:ring-2 focus:ring-secondary/10 outline-none transition-all resize-none"></textarea>
              </div>
              <button onClick={() => { setActiveModal(null); scrollToSection('booking'); }} className="w-full py-3.5 bg-gradient-to-r from-secondary to-secondary-light text-white rounded-xl font-bold text-base shadow-lg shadow-secondary/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                <Calendar size={18} />
                <span>Request Home Collection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Prescription Modal */}
      {activeModal === 'upload' && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="bg-gradient-to-r from-cta to-cta-light p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Upload className="w-7 h-7" />
                <h3 className="text-xl font-black">Upload Prescription</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${dragActive ? 'drop-zone-active bg-secondary-pale/30' : uploadedFile ? 'border-secondary bg-secondary-pale/20' : 'border-slate-200 hover:border-secondary/40 bg-slate-50/50'}`}
                onClick={() => inputRef.current?.click()}
              >
                <input ref={inputRef} type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                {uploadedFile ? (
                  <div className="space-y-2">
                    <CheckCircle2 className="w-12 h-12 text-secondary mx-auto" />
                    <p className="font-bold text-slate-700">{uploadedFile.name}</p>
                    <p className="text-xs text-slate-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }} className="text-xs font-bold text-cta hover:text-cta-light underline">Remove</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-12 h-12 text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-600">Drop your prescription here or <span className="text-secondary underline">browse</span></p>
                    <p className="text-xs text-slate-400">Supports: JPG, PNG, PDF (max 10MB)</p>
                  </div>
                )}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5">
                <Clock size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 font-semibold">Our medical coordinators will transcribe your prescription and pre-load your testing cart within 15 minutes.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Mobile Number</label>
                  <input type="tel" placeholder="10-digit number" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold focus:border-cta focus:ring-2 focus:ring-cta/10 outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Patient Name</label>
                  <input type="text" placeholder="Full name" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold focus:border-cta focus:ring-2 focus:ring-cta/10 outline-none transition-all" />
                </div>
              </div>
              <button disabled={!uploadedFile} className="w-full py-3.5 bg-gradient-to-r from-cta to-cta-light disabled:opacity-40 text-white rounded-xl font-bold text-base shadow-lg shadow-cta/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                <Upload size={18} />
                <span>Upload Prescription</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Reports Modal */}
      {activeModal === 'reports' && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="bg-gradient-to-r from-primary to-primary-light p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FileText className="w-7 h-7" />
                <h3 className="text-xl font-black">Download Reports</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Visit ID / Mobile Number</label>
                  <input
                    type="text"
                    value={visitId || mobileNo}
                    onChange={(e) => { setVisitId(e.target.value); setMobileNo(e.target.value); }}
                    placeholder="Enter Visit ID or registered mobile number"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                  />
                </div>
              </div>

              {!otpSent ? (
                <button onClick={handleSendOtp} disabled={!visitId && !mobileNo} className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-light disabled:opacity-40 text-white rounded-xl font-bold text-base shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                  <span>Send OTP</span>
                  <ArrowRight size={18} />
                </button>
              ) : (
                <div className="space-y-4 animate-fade-in-up">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Enter OTP</label>
                    <input
                      type="text"
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="_ _ _ _ _ _"
                      maxLength="6"
                      className="otp-input w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-center tracking-[8px]"
                    />
                  </div>
                  <button onClick={handleVerifyOtp} disabled={otpValue.length < 4} className="w-full py-3.5 bg-gradient-to-r from-secondary to-secondary-light disabled:opacity-40 text-white rounded-xl font-bold text-base shadow-lg shadow-secondary/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                    <FileText size={18} />
                    <span>View & Download Report</span>
                  </button>
                  <button onClick={() => { setOtpSent(false); setOtpValue(''); }} className="text-xs font-bold text-slate-500 hover:text-primary text-center w-full underline">Change ID / Resend OTP</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TriplePathHub;
