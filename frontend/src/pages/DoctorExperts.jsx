import React, { useState } from 'react';
import PublicLayout from '../components/PublicLayout';
import {
  Award, ShieldCheck, Star, Phone, MessageCircle,
  Microscope, ChevronRight, X, BadgeCheck, BookOpen, Users
} from 'lucide-react';

/* ─────────────────────────────────────────────
   DOCTOR DATA
─────────────────────────────────────────────── */
const DOCTORS = [
  {
    id: 1,
    name: 'Dr. Mohammad Sana',
    designation: 'Founder & Chief Pathologist',
    qualification: 'MBBS, MD (Pathology)',
    registration: 'MCI Reg. No. UP-12345',
    experience: '14+ Years',
    specializations: ['Clinical Pathology', 'Hematology', 'Biochemistry'],
    about: 'Dr. Mohammad Sana is a highly experienced pathologist with over 14 years of expertise in clinical diagnostics. He founded Sana Pathology Lab with a vision to bring world-class diagnostic services to the Sambhal region. Under his leadership, the lab has served over 15,000 patients with precision accuracy.',
    expertise: ['Complete Blood Count Analysis', 'Thyroid Function Interpretation', 'Liver & Kidney Panel Analysis', 'Infectious Disease Diagnostics', 'Antenatal Care (ANC) Profiles'],
    available: 'Mon–Sat: 9 AM – 6 PM',
    verified: true,
    avatar: '👨‍⚕️',
    color: 'from-[#0F6E56] to-[#1D9E75]',
    badge: 'Founder',
  },
  {
    id: 2,
    name: 'Dr. Rabia Siddiqui',
    designation: 'Senior Pathologist',
    qualification: 'MBBS, MD (Pathology), DNB',
    registration: 'MCI Reg. No. UP-23456',
    experience: '10+ Years',
    specializations: ['Immunology', 'Serology', 'Microbiology'],
    about: 'Dr. Rabia Siddiqui specializes in serology and immunology with a decade of hands-on diagnostic experience. She is particularly skilled in interpreting complex infectious disease panels and autoimmune markers, helping patients receive accurate and timely diagnoses.',
    expertise: ['Dengue & Typhoid Serology', 'Rheumatoid Factor & CRP Analysis', 'Malaria Diagnosis', 'Immunological Profiling', 'Widal & Typhidot Tests'],
    available: 'Mon–Fri: 8 AM – 5 PM',
    verified: true,
    avatar: '👩‍⚕️',
    color: 'from-purple-600 to-indigo-600',
    badge: 'Specialist',
  },
  {
    id: 3,
    name: 'Dr. Khalid Mansoor',
    designation: 'Consultant Biochemist',
    qualification: 'MSc (Biochemistry), PhD',
    registration: 'ICMR Reg. No. UC-34567',
    experience: '8+ Years',
    specializations: ['Biochemistry', 'Lipid Profiling', 'Diabetology'],
    about: 'Dr. Khalid Mansoor brings advanced biochemistry expertise to Sana Pathology. His research background in metabolic disorders makes him uniquely qualified to interpret complex biochemical profiles. He is the go-to expert for lipid panel analysis, HbA1c monitoring, and liver function testing.',
    expertise: ['HbA1c & Diabetes Management', 'Lipid Profile & Cardiac Risk', 'Liver Function Tests (LFT)', 'Kidney Function Tests (KFT)', 'Vitamin Deficiency Panels'],
    available: 'Tue–Sat: 10 AM – 5 PM',
    verified: true,
    avatar: '🧑‍🔬',
    color: 'from-amber-500 to-orange-500',
    badge: 'PhD',
  },
];

const STATS = [
  { icon: '👨‍👩‍👧‍👦', value: '15,000+', label: 'Patients Served' },
  { icon: '🏅', value: 'NABL', label: 'Accredited Lab' },
  { icon: '⚕️', value: '3', label: 'Qualified Experts' },
  { icon: '🔬', value: '100+', label: 'Tests Offered' },
];

/* ─────────────────────────────────────────────
   DOCTOR CARD COMPONENT
─────────────────────────────────────────────── */
const DoctorCard = ({ doctor, onView }) => (
  <div className="bg-white rounded-3xl shadow-lg shadow-slate-900/8 border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-slate-900/12 transition-all duration-300 group hover:-translate-y-1">
    {/* Header gradient */}
    <div className={`bg-gradient-to-br ${doctor.color} p-8 relative overflow-hidden`}>
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 flex items-start justify-between">
        {/* Avatar */}
        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-5xl border border-white/30 shadow-lg">
          {doctor.avatar}
        </div>
        {/* Badge */}
        {doctor.verified && (
          <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30">
            <BadgeCheck size={12} />
            {doctor.badge}
          </div>
        )}
      </div>

      <div className="relative z-10 mt-5">
        <h3 className="text-xl font-black text-white leading-tight">{doctor.name}</h3>
        <p className="text-white/80 text-sm font-semibold mt-0.5">{doctor.designation}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {doctor.specializations.slice(0, 2).map(s => (
            <span key={s} className="bg-white/15 text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/20">
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>

    {/* Body */}
    <div className="p-6">
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Qualification</p>
          <p className="text-sm font-black text-slate-800 leading-tight">{doctor.qualification}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Experience</p>
          <p className="text-sm font-black text-slate-800">{doctor.experience}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 col-span-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Registration</p>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-[#1D9E75] shrink-0" />
            <p className="text-sm font-black text-slate-800">{doctor.registration}</p>
          </div>
        </div>
      </div>

      {/* Available */}
      <div className="flex items-center gap-2 mb-5">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-bold text-slate-600">Available: {doctor.available}</span>
      </div>

      <button
        onClick={() => onView(doctor)}
        className="w-full py-3 bg-gradient-to-r from-[#0F6E56] to-[#1D9E75] hover:from-[#1D9E75] hover:to-[#0F6E56] text-white font-bold text-sm rounded-2xl transition-all shadow-md shadow-emerald-500/20 hover:shadow-lg flex items-center justify-center gap-2 group-hover:gap-3"
      >
        View Full Profile
        <ChevronRight size={16} />
      </button>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   PROFILE MODAL
─────────────────────────────────────────────── */
const DoctorModal = ({ doctor, onClose }) => {
  if (!doctor) return null;
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-br ${doctor.color} p-8 relative`}>
          <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full p-2 text-white transition-colors">
            <X size={18} />
          </button>
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center text-6xl border border-white/30 shadow-xl">
              {doctor.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {doctor.verified && (
                  <span className="flex items-center gap-1 bg-white/20 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                    <BadgeCheck size={11} /> Verified Expert
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black text-white">{doctor.name}</h2>
              <p className="text-white/80 font-semibold">{doctor.designation}</p>
              <p className="text-white/60 text-sm mt-1">{doctor.qualification}</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-2xl p-4 text-center">
              <p className="text-2xl font-black text-[#1D9E75]">{doctor.experience}</p>
              <p className="text-xs font-bold text-slate-500 mt-1">Experience</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 text-center col-span-2">
              <div className="flex items-center gap-1.5 justify-center">
                <ShieldCheck size={14} className="text-[#1D9E75]" />
                <p className="text-sm font-black text-slate-800">{doctor.registration}</p>
              </div>
              <p className="text-xs font-bold text-slate-500 mt-1">Medical Registration</p>
            </div>
          </div>

          {/* About */}
          <div>
            <h4 className="flex items-center gap-2 font-black text-slate-800 mb-3 text-sm uppercase tracking-wide">
              <BookOpen size={14} className="text-[#1D9E75]" />
              About
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">{doctor.about}</p>
          </div>

          {/* Specializations */}
          <div>
            <h4 className="flex items-center gap-2 font-black text-slate-800 mb-3 text-sm uppercase tracking-wide">
              <Microscope size={14} className="text-[#1D9E75]" />
              Specializations
            </h4>
            <div className="flex flex-wrap gap-2">
              {doctor.specializations.map(s => (
                <span key={s} className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-full">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Expertise */}
          <div>
            <h4 className="flex items-center gap-2 font-black text-slate-800 mb-3 text-sm uppercase tracking-wide">
              <Award size={14} className="text-[#1D9E75]" />
              Areas of Expertise
            </h4>
            <ul className="space-y-2">
              {doctor.expertise.map(exp => (
                <li key={exp} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                  <span className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                    <ShieldCheck size={11} className="text-[#1D9E75]" />
                  </span>
                  {exp}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <a
              href="tel:+916396786939"
              className="flex items-center justify-center gap-2 bg-[#1D9E75] hover:bg-[#0F6E56] text-white py-3 px-4 rounded-2xl font-bold text-sm transition-all shadow-md shadow-emerald-500/20"
            >
              <Phone size={15} /> Book Consultation
            </a>
            <a
              href={`https://wa.me/916396786939?text=Hi%2C%20I'd%20like%20to%20consult%20${encodeURIComponent(doctor.name)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white py-3 px-4 rounded-2xl font-bold text-sm transition-all shadow-md"
            >
              <MessageCircle size={15} /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN PAGE
─────────────────────────────────────────────── */
const DoctorExperts = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  return (
    <PublicLayout>
      {/* JSON-LD Person Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": DOCTORS.map((d, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "item": {
            "@type": "Person",
            "name": d.name,
            "jobTitle": d.designation,
            "affiliation": { "@type": "Organization", "name": "Sana Pathology Lab, Sambhal" },
          }
        }))
      })}} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#063b30] via-[#085041] to-[#0F6E56] py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white animate-float-p1" style={{
              width: `${20 + (i * 15) % 40}px`, height: `${20 + (i * 15) % 40}px`,
              top: `${(i * 17) % 90}%`, left: `${(i * 13) % 90}%`,
              animationDelay: `${i * 0.7}s`
            }} />
          ))}
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-bold px-4 py-1.5 rounded-full mb-5 border border-white/20">
            <Users size={13} /> Expert Medical Team
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-4">
            Meet Our <span className="text-[#F1C40F]">Expert Pathologists</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto font-medium">
            Board-certified, NABL-recognized pathologists with decades of combined experience. Every report is reviewed and validated by a qualified expert.
          </p>
        </div>
      </section>

      {/* Stats row */}
      <div className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl mb-1">{stat.icon}</p>
                <p className="text-2xl font-black text-[#0F6E56]">{stat.value}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Doctor Cards */}
      <section className="py-16 px-4 bg-[#F5F7F6]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-black text-slate-900 mb-3">Our Verified Experts</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Every pathologist at Sana Lab holds a valid medical council registration and is verified by NABL.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {DOCTORS.map(doc => (
              <DoctorCard key={doc.id} doctor={doc} onView={setSelectedDoctor} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="bg-[#063b30] py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-heading font-black text-white mb-3">
            Reports Signed by Qualified Pathologists Only
          </h3>
          <p className="text-white/60 mb-6 max-w-xl mx-auto">
            Unlike many local labs, every Sana Pathology report carries the digital signature and NABL-certified stamp of our qualified pathologists.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {['NABL Accredited', 'Govt. Registered', 'MD Pathologist', 'Digital Reports', '14+ Years Experience'].map(b => (
              <span key={b} className="flex items-center gap-1.5 bg-white/10 border border-white/20 text-white/80 text-xs font-bold px-4 py-2 rounded-full">
                <ShieldCheck size={12} className="text-emerald-400" /> {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Doctor Modal */}
      <DoctorModal doctor={selectedDoctor} onClose={() => setSelectedDoctor(null)} />
    </PublicLayout>
  );
};

export default DoctorExperts;
