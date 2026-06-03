import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, FileText, UserCircle, ArrowRight } from 'lucide-react';

const PublicWelcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00488d] rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#00488d] tracking-tight">Sana Pathology</h1>
              <p className="text-xs text-blue-600 font-medium">Advanced Diagnostic Center</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#00488d] transition-colors bg-blue-50 px-4 py-2 rounded-lg"
          >
            <UserCircle size={18} />
            Staff Login
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 sm:py-20 flex flex-col items-center text-center">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-8 animate-fade-in-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Open Today till 8:00 PM
        </div>

        <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Your Health, <span className="text-[#00488d]">Our Priority</span>
        </h2>
        
        <p className="text-lg text-slate-600 mb-12 max-w-2xl leading-relaxed">
          Get accurate, fast, and reliable diagnostic services from the comfort of your home. 
          What would you like to do today?
        </p>

        {/* Action Cards */}
        <div className="grid sm:grid-cols-2 gap-6 w-full max-w-3xl">
          
          {/* Book Appointment Card */}
          <button 
            onClick={() => navigate('/book-appointment')}
            className="group relative flex flex-col items-start p-8 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,72,141,0.12)] border border-slate-100 hover:border-blue-200 transition-all duration-300 text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
              <Stethoscope size={100} className="text-[#00488d]" />
            </div>
            
            <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-[#00488d] group-hover:text-white text-[#00488d] transition-colors duration-300">
              <Stethoscope size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Book Appointment</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Schedule a home collection or clinic visit for your tests easily.
            </p>
            <div className="mt-auto flex items-center gap-2 text-[#00488d] font-semibold text-sm group-hover:translate-x-1 transition-transform">
              Book Now <ArrowRight size={16} />
            </div>
          </button>

          {/* View Report Card */}
          <button 
            onClick={() => navigate('/report-lookup')}
            className="group relative flex flex-col items-start p-8 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,72,141,0.12)] border border-slate-100 hover:border-blue-200 transition-all duration-300 text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
              <FileText size={100} className="text-[#00488d]" />
            </div>

            <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white text-indigo-600 transition-colors duration-300">
              <FileText size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">View Reports</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Download and view your test results using your mobile number.
            </p>
            <div className="mt-auto flex items-center gap-2 text-indigo-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
              Check Results <ArrowRight size={16} />
            </div>
          </button>

        </div>

        {/* Mobile Login Option */}
        <button 
          onClick={() => navigate('/login')}
          className="mt-12 sm:hidden flex items-center gap-2 text-slate-500 hover:text-[#00488d] font-medium"
        >
          <UserCircle size={20} />
          Staff & Doctor Login
        </button>

      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full p-4 text-center text-xs text-slate-400 font-medium">
        © {new Date().getFullYear()} Sana Pathology Lab. All rights reserved.
      </footer>
    </div>
  );
};

export default PublicWelcome;
