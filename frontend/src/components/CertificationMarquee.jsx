import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Award, FlaskConical, Microscope, UserCheck, Clock, Activity, CheckCircle } from 'lucide-react';

const CERT_ITEMS = [
  { icon: <ShieldCheck className="w-5 h-5" />, label: 'NABL Accredited Lab' },
  { icon: <Award className="w-5 h-5" />, label: 'ISO 15189:2012 Certified' },
  { icon: <FlaskConical className="w-5 h-5" />, label: '100% Sterile Vacuum Tubes' },
  { icon: <Microscope className="w-5 h-5" />, label: 'Automated Biochemistry Analyzers' },
  { icon: <UserCheck className="w-5 h-5" />, label: 'MD Pathologists on Panel' },
  { icon: <Clock className="w-5 h-5" />, label: 'Guaranteed 12-24 Hr Reports' },
  { icon: <Activity className="w-5 h-5" />, label: '50+ Quality Audits per Sample' },
  { icon: <CheckCircle className="w-5 h-5" />, label: 'Digital Reports with Blockchain' },
];

const STATS_DATA = [
  { value: '50+', label: 'Quality Audits', sub: 'per sample', icon: <Activity className="w-6 h-6" />, color: 'text-emerald-500' },
  { value: '100%', label: 'Automated', sub: 'imported machinery', icon: <Microscope className="w-6 h-6" />, color: 'text-blue-500' },
  { value: '15+', label: 'MD Pathologists', sub: 'certified specialists', icon: <UserCheck className="w-6 h-6" />, color: 'text-purple-500' },
  { value: '12-24', label: 'Hour Reports', sub: 'fastest turnaround', icon: <Clock className="w-6 h-6" />, color: 'text-amber-500' },
];

const CertificationMarquee = () => {
  const [countersVisible, setCountersVisible] = useState(false);
  const [counterValues, setCounterValues] = useState({ audits: 0, automation: 0, pathologists: 0, hours: 0 });
  const statsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !countersVisible) {
        setCountersVisible(true);
      }
    }, { threshold: 0.3 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [countersVisible]);

  useEffect(() => {
    if (countersVisible) {
      const targets = { audits: 50, automation: 100, pathologists: 15, hours: 24 };
      const duration = 2000;
      const steps = 60;
      const interval = duration / steps;
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        const eased = 1 - Math.pow(1 - progress, 3);
        setCounterValues({
          audits: Math.round(targets.audits * eased),
          automation: Math.round(targets.automation * eased),
          pathologists: Math.round(targets.pathologists * eased),
          hours: Math.round(targets.hours * eased),
        });
        if (step >= steps) clearInterval(timer);
      }, interval);
      return () => clearInterval(timer);
    }
  }, [countersVisible]);

  return (
    <section className="relative overflow-hidden">
      {/* Certification Marquee Ribbon */}
      <div className="bg-gradient-to-r from-primary via-primary-light to-primary-dark py-3 border-y border-white/10">
        <div className="flex overflow-hidden">
          <div className="flex animate-marquee-slow gap-8 items-center whitespace-nowrap">
            {[...CERT_ITEMS, ...CERT_ITEMS, ...CERT_ITEMS].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2 text-white/90 text-sm font-semibold">
                <span className="text-secondary-light">{item.icon}</span>
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Counter Section */}
      <div ref={statsRef} className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-100 p-7 text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                <Activity className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-3xl font-black text-primary">{counterValues.audits}+</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Intensive Quality Audits</p>
              <p className="text-[10px] text-slate-400 font-medium">on every single sample</p>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-100 p-7 text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <Microscope className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-3xl font-black text-primary">{counterValues.automation}%</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Fully Automated</p>
              <p className="text-[10px] text-slate-400 font-medium">high-end imported machinery</p>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-100 p-7 text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-3">
                <UserCheck className="w-6 h-6 text-purple-500" />
              </div>
              <p className="text-3xl font-black text-primary">{counterValues.pathologists}+</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">MD Pathologists</p>
              <p className="text-[10px] text-slate-400 font-medium">certified phlebotomists</p>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-100 p-7 text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
              <p className="text-3xl font-black text-primary">{counterValues.hours} Hrs</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Report Turnaround</p>
              <p className="text-[10px] text-slate-400 font-medium">quickest guaranteed time</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CertificationMarquee;
