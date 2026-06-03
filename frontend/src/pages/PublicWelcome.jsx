import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, FileText, UserCircle, ArrowRight, Activity, Microscope, HeartPulse, CheckCircle2 } from 'lucide-react';

const PublicWelcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
      {/* Background Animated Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* Floating Decorative Icons */}
      <div className="absolute top-32 left-10 text-blue-200/40 animate-float">
        <Microscope size={120} />
      </div>
      <div className="absolute bottom-40 right-10 text-indigo-200/40 animate-float-delayed">
        <Activity size={150} />
      </div>
      
      {/* Header */}
      <header className="relative z-10 bg-white/70 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00488d] to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-black text-2xl">S</span>
            </div>
            <div>
              <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#00488d] to-indigo-800 tracking-tight">
                Sana Pathology
              </h1>
              <p className="text-xs text-indigo-600 font-bold tracking-wide uppercase">Advanced Diagnostic Center</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="hidden sm:flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-white transition-all bg-white hover:bg-[#00488d] px-5 py-2.5 rounded-full border border-slate-200 hover:border-transparent shadow-sm hover:shadow-md"
          >
            <UserCircle size={18} />
            Staff Login
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-16 sm:py-24 flex flex-col items-center text-center">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-blue-100 shadow-sm text-[#00488d] text-sm font-bold mb-10 animate-fade-in-up">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00488d]"></span>
          </span>
          Open Today till 8:00 PM
        </div>

        <h2 className="text-5xl sm:text-6xl font-black text-slate-900 mb-6 tracking-tight animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          Your Health, <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00488d] to-cyan-600">Our Priority</span>
        </h2>
        
        <p className="text-lg sm:text-xl text-slate-600 mb-16 max-w-2xl leading-relaxed font-medium animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          Experience world-class diagnostics with guaranteed accuracy. Book a home collection or view your secure digital reports instantly.
        </p>

        {/* Action Cards */}
        <div className="grid sm:grid-cols-2 gap-8 w-full max-w-4xl animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          
          {/* Book Appointment Card */}
          <button 
            onClick={() => navigate('/book-appointment')}
            className="group relative flex flex-col items-start p-10 bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,72,141,0.15)] border border-white hover:border-blue-300 transition-all duration-500 hover:-translate-y-2 text-left overflow-hidden"
          >
            {/* Hover Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="absolute -top-10 -right-10 p-4 opacity-5 transform group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700">
              <Stethoscope size={180} className="text-[#00488d]" />
            </div>
            
            <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner">
              <HeartPulse size={32} className="text-[#00488d]" />
            </div>
            
            <h3 className="relative z-10 text-2xl font-black text-slate-900 mb-3 group-hover:text-[#00488d] transition-colors">Book Appointment</h3>
            <p className="relative z-10 text-slate-500 text-base mb-8 leading-relaxed font-medium">
              Schedule a fast, painless home sample collection or a priority clinic visit.
            </p>
            
            <div className="relative z-10 mt-auto inline-flex items-center gap-2 bg-[#00488d] text-white px-6 py-3 rounded-full font-bold text-sm group-hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20">
              Book Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* View Report Card */}
          <button 
            onClick={() => navigate('/report-lookup')}
            className="group relative flex flex-col items-start p-10 bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(79,70,229,0.15)] border border-white hover:border-indigo-300 transition-all duration-500 hover:-translate-y-2 text-left overflow-hidden"
          >
            {/* Hover Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="absolute -top-10 -right-10 p-4 opacity-5 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
              <FileText size={180} className="text-indigo-600" />
            </div>

            <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner">
              <FileText size={32} className="text-indigo-600" />
            </div>
            
            <h3 className="relative z-10 text-2xl font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">View Reports</h3>
            <p className="relative z-10 text-slate-500 text-base mb-8 leading-relaxed font-medium">
              Securely download and view your highly accurate test results online.
            </p>
            
            <div className="relative z-10 mt-auto inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full font-bold text-sm group-hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-900/20">
              Check Results <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

        </div>

        {/* Trust Badges */}
        <div className="mt-20 flex flex-wrap justify-center gap-8 sm:gap-16 opacity-70 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
            <CheckCircle2 size={20} className="text-green-500" /> NABL Compliant Standards
          </div>
          <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
            <CheckCircle2 size={20} className="text-green-500" /> 100% Accurate Reports
          </div>
          <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
            <CheckCircle2 size={20} className="text-green-500" /> ISO Certified Lab
          </div>
        </div>

        {/* Mobile Login Option */}
        <button 
          onClick={() => navigate('/login')}
          className="mt-16 sm:hidden flex items-center gap-2 text-slate-500 hover:text-[#00488d] font-bold bg-white px-6 py-3 rounded-full shadow-sm border border-slate-200"
        >
          <UserCircle size={20} />
          Staff Login
        </button>

      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto w-full p-6 text-center text-sm text-slate-400 font-bold">
        © {new Date().getFullYear()} Sana Pathology Lab. All rights reserved.
      </footer>
    </div>
  );
};

export default PublicWelcome;
