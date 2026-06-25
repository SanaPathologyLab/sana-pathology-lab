import React from 'react';
import { X, CheckCircle2, ShoppingCart, Activity, Clock, Droplets, Users, Coffee } from 'lucide-react';
import { TESTS_DATA } from '../data/testsData';

const getTestName = (code) => {
  const test = TESTS_DATA.find(t => t.code === code || t.testCode === code);
  return test ? test.testName : code;
};

const PackageDetailsModal = ({ pkg, onClose, onBookNow, isAdded }) => {
  if (!pkg) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Activity size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">{pkg.name}</h2>
              <p className="text-sm text-slate-500 font-medium">{pkg.parameterCount} Parameters Included</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <p className="text-slate-600 mb-6 leading-relaxed">
            {pkg.desc}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {pkg.fasting && (
              <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-100 flex flex-col items-center text-center">
                <Coffee className="w-5 h-5 text-orange-500 mb-1.5" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Preparation</span>
                <span className="text-xs font-semibold text-slate-700 leading-tight">{pkg.fasting}</span>
              </div>
            )}
            {pkg.reportTime && (
              <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex flex-col items-center text-center">
                <Clock className="w-5 h-5 text-blue-500 mb-1.5" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Report</span>
                <span className="text-xs font-semibold text-slate-700 leading-tight">{pkg.reportTime}</span>
              </div>
            )}
            {pkg.sample && (
              <div className="bg-red-50/50 p-3 rounded-xl border border-red-100 flex flex-col items-center text-center">
                <Droplets className="w-5 h-5 text-red-500 mb-1.5" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Sample</span>
                <span className="text-xs font-semibold text-slate-700 leading-tight">{pkg.sample}</span>
              </div>
            )}
            {pkg.ageGroup && (
              <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100 flex flex-col items-center text-center">
                <Users className="w-5 h-5 text-purple-500 mb-1.5" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Ideal For</span>
                <span className="text-xs font-semibold text-slate-700 leading-tight">{pkg.ageGroup}</span>
              </div>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 font-bold">Package Price</span>
              <span className="bg-[#FFD700]/20 text-yellow-700 text-xs font-black px-2 py-1 rounded">
                {pkg.discount}
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">₹{pkg.price}</span>
              <span className="text-lg font-bold text-slate-400 line-through decoration-slate-300">₹{pkg.originalPrice}</span>
            </div>
          </div>

          <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
            <CheckCircle2 className="text-primary" size={20} />
            Tests Included ({pkg.tests?.length || 0})
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pkg.tests?.map((code, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 rounded-xl border border-slate-100 bg-white shadow-sm">
                <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <span className="text-sm font-semibold text-slate-700 leading-tight">
                  {getTestName(code)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-white flex items-center justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-full font-bold text-slate-500 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
          <button 
            onClick={() => onBookNow(pkg)}
            className={`px-8 py-2.5 rounded-full font-bold text-white shadow-lg transition-all flex items-center gap-2 ${
              isAdded 
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' 
                : 'bg-black hover:bg-slate-800 shadow-black/20'
            }`}
          >
            <ShoppingCart size={18} />
            {isAdded ? 'Book Now (Added)' : 'Book Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackageDetailsModal;
