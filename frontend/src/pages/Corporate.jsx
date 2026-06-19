import React, { useState } from 'react';
import PublicLayout from '../components/PublicLayout';
import { Calendar, Building2, Users, FileSpreadsheet, Check, Send, Sparkles } from 'lucide-react';
import Loader from '../components/Loader';

const CORPORATE_PACKAGES = [
  {
    name: "Basic Wellness Screening",
    price: 499,
    minSize: "50+ Employees",
    desc: "Essential health audit covering metabolic and hematology baselines.",
    features: [
      "Complete Blood Count (CBC)",
      "Random Blood Sugar (RBS)",
      "Serum Cholesterol",
      "Urine Routine & Microscopy",
      "Doctor Consultation / Consultation summary"
    ]
  },
  {
    name: "Executive Health Panel",
    price: 999,
    minSize: "20+ Employees",
    desc: "Comprehensive metabolic screening for executives and senior staff.",
    features: [
      "Complete Blood Count (CBC)",
      "Liver Function Test (LFT)",
      "Kidney Function Test (KFT)",
      "Lipid Profile (Fats Panel)",
      "Fasting Blood Sugar (FBS)",
      "HbA1c (3-Month Sugar Average)",
      "Urine Routine & Microscopy"
    ]
  },
  {
    name: "Premium Corporate Care",
    price: 1499,
    minSize: "10+ Employees",
    desc: "Complete wellness panel assessing cardiac risk, vitamins, and organ health.",
    features: [
      "Executive Health Panel (All 7 panels)",
      "Vitamin D (25-Hydroxy)",
      "Thyroid Function Test (T3, T4, TSH)",
      "Serum Calcium & Bone Health",
      "Uric Acid"
    ]
  }
];

const Corporate = () => {
  const [form, setForm] = useState({
    companyName: '',
    contactPerson: '',
    mobile: '',
    noOfEmployees: '',
    preferredDate: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/public/b2b-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to submit inquiry.');
      } else {
        setSuccess(data.message);
        setForm({
          companyName: '',
          contactPerson: '',
          mobile: '',
          noOfEmployees: '',
          preferredDate: '',
          notes: ''
        });
      }
    } catch {
      setError('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="bg-[#F5F7F6]">
        
        {/* Banner Section */}
        <section className="bg-gradient-to-r from-[#085041] to-[#0F6E56] py-16 md:py-24 text-white text-center px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent)]"></div>
          <div className="max-w-4xl mx-auto relative z-10 space-y-4">
            <span className="bg-[#BA7517]/20 text-[#ffb800] text-xs font-black uppercase px-4 py-1.5 rounded-full border border-[#BA7517]/30 tracking-widest inline-block">
              Corporate Health Services
            </span>
            <h1 className="text-3xl md:text-5xl font-black font-heading leading-tight tracking-tight">
              Annual Health Checkup Drives for Organizations
            </h1>
            <p className="text-sm md:text-lg text-emerald-100 max-w-2xl mx-auto leading-relaxed">
              Empower your workforce with convenient, premium diagnostic camps. On-site collection, NABL standards, and secure digital reports.
            </p>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 px-6 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight font-heading">
              Why Choose Sana Pathology for B2B?
            </h2>
            <p className="text-slate-500 text-xs md:text-sm">
              Tailored health packages, structured campaigns, and minimal organizational disruption.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300">
              <div className="bg-[#1D9E75]/10 p-3.5 rounded-2xl text-[#1D9E75] inline-block mb-5">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-3">On-Site Camp Collection</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Our certified phlebotomists set up structured, hygienic collection camps directly at your office or factory premises.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300">
              <div className="bg-[#1D9E75]/10 p-3.5 rounded-2xl text-[#1D9E75] inline-block mb-5">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-3">Bulk Report Delivery</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                All employee reports are generated securely, signed by pathologists, and shared digitally via SMS/WhatsApp within 24 hours.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300">
              <div className="bg-[#1D9E75]/10 p-3.5 rounded-2xl text-[#1D9E75] inline-block mb-5">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-3">Digital MIS Reports</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Management receives a comprehensive, anonymous health statistics MIS excel dashboard showing aggregate trends to design wellness activities.
              </p>
            </div>
          </div>
        </section>

        {/* Corporate Tiers Section */}
        <section className="py-16 bg-white px-6 border-y border-slate-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight font-heading">
                Corporate Package Tiers
              </h2>
              <p className="text-slate-500 text-xs md:text-sm">
                Subsidized pricing tailored for high-volume diagnostic checkup camps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {CORPORATE_PACKAGES.map((pkg, idx) => (
                <div key={idx} className="bg-[#F5F7F6] rounded-3xl p-8 border border-slate-100 flex flex-col justify-between shadow-inner">
                  <div className="space-y-4">
                    <span className="bg-slate-200 text-slate-600 text-[10px] font-black uppercase px-2.5 py-1 rounded">
                      {pkg.minSize}
                    </span>
                    <h3 className="text-xl font-black text-slate-800">{pkg.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{pkg.desc}</p>
                    <div className="text-2xl font-black text-[#1D9E75] pt-2">₹{pkg.price}<span className="text-xs text-slate-400 font-semibold"> / employee</span></div>
                    
                    <ul className="space-y-2.5 pt-4 text-xs sm:text-sm text-slate-600 border-t border-slate-200/50">
                      {pkg.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <Check size={16} className="text-[#1D9E75] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Inquiry Form Section */}
        <section className="py-16 px-6 max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-100/50">
            <div className="text-center mb-8 relative">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1D9E75]/10 rounded-2xl mb-4 border border-[#1D9E75]/10 text-[#1D9E75] shadow-lg shadow-[#1D9E75]/5">
                <Building2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#085041] tracking-tight font-heading">
                Request B2B Quote
              </h2>
              <p className="text-slate-500 mt-2 text-xs md:text-sm max-w-md mx-auto">
                Fill out the inquiry form below, and our corporate partnership manager will reach out with a custom proposal.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="block text-xs font-black uppercase text-slate-500 tracking-wider">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={form.companyName}
                    onChange={e => setForm({...form, companyName: e.target.value})}
                    placeholder="e.g. Sana Pathology Labs Inc"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] bg-slate-50/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-black uppercase text-slate-500 tracking-wider">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={form.contactPerson}
                    onChange={e => setForm({...form, contactPerson: e.target.value})}
                    placeholder="e.g. Mohd. Altamash"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="block text-xs font-black uppercase text-slate-500 tracking-wider">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    pattern="[0-9]{10}"
                    value={form.mobile}
                    onChange={e => setForm({...form, mobile: e.target.value.replace(/\D/g, '')})}
                    placeholder="10-digit number"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] bg-slate-50/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-black uppercase text-slate-500 tracking-wider">No. of Employees *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.noOfEmployees}
                    onChange={e => setForm({...form, noOfEmployees: e.target.value})}
                    placeholder="e.g. 50"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black uppercase text-slate-500 tracking-wider">Preferred Checkup Date *</label>
                <input
                  type="date"
                  required
                  value={form.preferredDate}
                  onChange={e => setForm({...form, preferredDate: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] bg-slate-50/50"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black uppercase text-slate-500 tracking-wider">Additional Requirements (Optional)</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({...form, notes: e.target.value})}
                  placeholder="Specify any custom tests required, multiple site camps, etc."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] bg-slate-50/50"
                />
              </div>

              {success && (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl p-4 text-sm font-bold text-center animate-fade-in">
                  {success}
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-800 border border-red-200 rounded-2xl p-4 text-sm font-bold text-center animate-fade-in">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1D9E75] hover:bg-[#1D9E75]/95 text-white py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#1D9E75]/20 hover:shadow-xl active:scale-[0.98] disabled:opacity-75"
              >
                {loading ? <Loader type="button" className="text-white" /> : <Send size={16} />}
                {loading ? 'Submitting Request...' : 'Submit B2B Inquiry'}
              </button>

            </form>
          </div>
        </section>

      </div>
    </PublicLayout>
  );
};

export default Corporate;
