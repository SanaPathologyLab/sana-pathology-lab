import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, FileText, UserCircle, ArrowRight, Activity, Microscope, HeartPulse, CheckCircle2, Phone, MapPin, Clock, CalendarCheck, Beaker, ShieldCheck } from 'lucide-react';

const PublicWelcome = () => {
  const navigate = useNavigate();

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 relative font-sans selection:bg-[#00488d] selection:text-white">
      
      {/* Premium Header */}
      <header className="fixed w-full z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="w-12 h-12 bg-gradient-to-br from-[#00488d] to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-black text-2xl">S</span>
            </div>
            <div>
              <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#00488d] to-indigo-800 tracking-tight">
                Sana Pathology
              </h1>
              <p className="text-xs text-indigo-600 font-bold tracking-wide uppercase">Advanced Diagnostic Center</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-sm font-bold text-slate-600 hover:text-[#00488d] transition-colors">Services</a>
            <a href="#packages" className="text-sm font-bold text-slate-600 hover:text-[#00488d] transition-colors">Packages</a>
            <a href="#contact" className="text-sm font-bold text-slate-600 hover:text-[#00488d] transition-colors">Contact</a>
            
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#00488d] transition-all bg-slate-100 hover:bg-blue-50 px-5 py-2.5 rounded-full border border-slate-200"
            >
              <UserCircle size={18} />
              Login / Portals
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Photo Background */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48 overflow-hidden min-h-[85vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-bg.png" 
            alt="Modern Pathology Laboratory" 
            className="w-full h-full object-cover object-center"
          />
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur-md text-blue-200 text-sm font-bold mb-8">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
              </span>
              NABL Certified Laboratory
            </div>
            
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-[1.1]">
              Precision <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Diagnostics</span><br />You Can Trust
            </h2>
            
            <p className="text-lg sm:text-xl text-slate-300 mb-10 leading-relaxed max-w-xl">
              Experience world-class healthcare with 100% accurate reports, advanced technology, and hassle-free home sample collection.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button 
                onClick={() => navigate('/book-appointment')}
                className="group flex items-center justify-center gap-2 bg-[#00488d] hover:bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-blue-900/50 hover:-translate-y-1"
              >
                Book Home Collection
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => navigate('/report-lookup')}
                className="group flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-full font-bold text-lg transition-all hover:-translate-y-1"
              >
                <FileText size={20} />
                Download Report
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => window.open('https://wa.me/916396786939', '_blank')}
                className="flex items-center gap-2 bg-[#25D366]/20 hover:bg-[#25D366]/40 border border-[#25D366]/50 backdrop-blur-md text-green-300 px-5 py-2.5 rounded-full font-semibold text-sm transition-all"
              >
                <Phone size={16} /> WhatsApp Us
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-slate-200 px-5 py-2.5 rounded-full font-semibold text-sm transition-all"
              >
                <UserCircle size={16} /> Patient Login
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-slate-200 px-5 py-2.5 rounded-full font-semibold text-sm transition-all"
              >
                <Stethoscope size={16} /> Doctor Login
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us / Trust Badges */}
      <section className="relative z-20 -mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="flex items-center gap-4 md:px-4">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="text-green-600 w-7 h-7" />
            </div>
            <div>
              <h4 className="text-slate-900 font-black text-lg">100% Accurate</h4>
              <p className="text-slate-500 text-sm font-medium">Automated analyzers</p>
            </div>
          </div>
          <div className="flex items-center gap-4 md:px-4 pt-6 md:pt-0">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Clock className="text-[#00488d] w-7 h-7" />
            </div>
            <div>
              <h4 className="text-slate-900 font-black text-lg">Fast Reports</h4>
              <p className="text-slate-500 text-sm font-medium">Same day digital delivery</p>
            </div>
          </div>
          <div className="flex items-center gap-4 md:px-4 pt-6 md:pt-0">
            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="text-purple-600 w-7 h-7" />
            </div>
            <div>
              <h4 className="text-slate-900 font-black text-lg">Home Collection</h4>
              <p className="text-slate-500 text-sm font-medium">Free sample pickup</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Packages */}
      <section id="packages" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-2">Preventive Care</h3>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">Popular Health Packages</h2>
            <div className="w-24 h-1 bg-[#00488d] mx-auto mt-6 rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Basic Health Checkup', tests: '45+ Tests Included', price: '₹999', old: '₹1500', color: 'blue' },
              { title: 'Comprehensive Full Body', tests: '75+ Tests Included', price: '₹1999', old: '₹3500', color: 'indigo', popular: true },
              { title: 'Senior Citizen Package', tests: '60+ Tests Included', price: '₹1499', old: '₹2500', color: 'cyan' },
            ].map((pkg, idx) => (
              <div key={idx} className={`relative bg-white rounded-3xl p-8 border ${pkg.popular ? 'border-indigo-500 shadow-xl shadow-indigo-100 scale-105 z-10' : 'border-slate-200 shadow-sm'} flex flex-col`}>
                {pkg.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-[#00488d] text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-wide">Most Popular</div>}
                
                <h3 className="text-2xl font-black text-slate-900 mb-2">{pkg.title}</h3>
                <p className="text-slate-500 font-medium mb-6">{pkg.tests} • Blood & Urine</p>
                
                <div className="mb-8">
                  <span className="text-4xl font-black text-[#00488d]">{pkg.price}</span>
                  <span className="text-slate-400 line-through ml-3 font-bold">{pkg.old}</span>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {['Lipid Profile', 'Liver Function Test', 'Kidney Function Test', 'Complete Blood Count (CBC)', 'Blood Sugar (Fasting)'].map((t, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700 font-medium text-sm">
                      <CheckCircle2 className={`w-5 h-5 ${pkg.popular ? 'text-indigo-500' : 'text-blue-500'}`} /> {t}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => navigate('/book-appointment')}
                  className={`w-full py-4 rounded-xl font-bold transition-all ${pkg.popular ? 'bg-[#00488d] hover:bg-blue-800 text-white shadow-lg' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'}`}
                >
                  Book Package
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-2">Our Expertise</h3>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">Advanced Diagnostic Services</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                We utilize state-of-the-art fully automated analyzers and follow strict quality control protocols to ensure every report is highly accurate and reliable.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { icon: Beaker, title: 'Biochemistry', desc: 'Liver, Kidney, Lipid profiles' },
                  { icon: Activity, title: 'Hematology', desc: 'CBC, Blood Grouping, ESR' },
                  { icon: Microscope, title: 'Clinical Pathology', desc: 'Urine & Stool Examination' },
                  { icon: Stethoscope, title: 'Serology & Immunology', desc: 'Infectious diseases, Hormones' }
                ].map((Svc, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Svc.icon className="text-[#00488d] w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-slate-900 font-bold">{Svc.title}</h4>
                      <p className="text-slate-500 text-sm mt-1">{Svc.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-50 p-8 flex flex-col justify-center items-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
                
                <HeartPulse size={80} className="text-[#00488d] mb-6 relative z-10" />
                <h3 className="text-3xl font-black text-slate-900 mb-4 relative z-10">Need a Home Visit?</h3>
                <p className="text-slate-600 mb-8 max-w-sm relative z-10 font-medium">
                  Our expert phlebotomists will visit your home safely and collect samples at your preferred time.
                </p>
                <button 
                  onClick={() => navigate('/book-appointment')}
                  className="bg-[#00488d] hover:bg-blue-800 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg relative z-10"
                >
                  Schedule Pickup
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Location */}
      <section id="contact" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/hero-bg.png')] bg-cover bg-center opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-6">Visit Sana Pathology Lab</h2>
              <p className="text-slate-400 text-lg mb-12">Dedicated to providing precise diagnostics with unparalleled patient care.</p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-blue-400 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Laboratory Location</h4>
                    <p className="text-slate-400 leading-relaxed">Datawali Road, Near Aara Machine<br />Hayat Nagar, Distt. Sambhal-244303 (U.P)</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="text-blue-400 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Contact Numbers</h4>
                    <p className="text-slate-400">+91 6396786939<br />+91 6397240575</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="text-blue-400 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Working Hours</h4>
                    <p className="text-slate-400">Monday - Sunday<br />8:00 AM - 8:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 lg:p-12 text-center flex flex-col justify-center">
              <CalendarCheck className="w-16 h-16 text-blue-400 mx-auto mb-6" />
              <h3 className="text-2xl font-black mb-4">Ready to test?</h3>
              <p className="text-slate-400 mb-8">Access your digital reports instantly via your mobile number, or walk in for a physical copy.</p>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => navigate('/report-lookup')}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl font-bold transition-all"
                >
                  Download Report
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full bg-transparent hover:bg-white/10 border border-white/20 text-white py-4 rounded-xl font-bold transition-all"
                >
                  Staff Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-8 border-t border-white/10 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-slate-500 text-sm font-medium">
            © {new Date().getFullYear()} Sana Pathology Lab. All rights reserved. <br className="sm:hidden"/> 
            Designed for Accuracy & Care.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicWelcome;
