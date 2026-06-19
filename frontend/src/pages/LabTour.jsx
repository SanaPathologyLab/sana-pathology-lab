import React, { useState } from 'react';
import PublicLayout from '../components/PublicLayout';
import {
  Microscope, Shield, CheckCircle2, Phone, MessageCircle, X,
  ChevronLeft, ChevronRight, Star, Clock, Award
} from 'lucide-react';

/* ─── LAB SECTIONS DATA ─── */
const LAB_SECTIONS = [
  {
    id: 'reception',
    name: 'Welcome Reception',
    emoji: '🏥',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-100',
    desc: 'Modern, air-conditioned reception with comfortable waiting area. Our trained staff greet every patient with warmth and assist with registration and queries.',
    highlights: ['Digital Queue System', 'Air Conditioned', 'Privacy Screens at Counters', 'Wheelchair Accessible'],
    image_desc: 'Bright, welcoming reception with marble floors and comfortable seating for patients.'
  },
  {
    id: 'collection',
    name: 'Sample Collection',
    emoji: '💉',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-100',
    desc: 'Sterile, dedicated sample collection cubicles with privacy curtains. All phlebotomists are trained and use single-use, sterile needles and vacutainers for every patient.',
    highlights: ['Single-Use Sterile Needles', 'Private Cubicles', 'Trained Phlebotomists', 'Bio-Hazard Disposal'],
    image_desc: 'Clean collection room with sterile equipment and private cubicles for comfortable blood draw.'
  },
  {
    id: 'hematology',
    name: 'Hematology Section',
    emoji: '🩸',
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-100',
    desc: 'Dedicated to blood analysis using fully automated 5-part differential cell counters (CBC). All blood counts are verified by our pathologist before report release.',
    highlights: ['5-Part Auto Analyzer', 'QC Run Every Shift', 'Pathologist Verified', 'Same Day Results'],
    image_desc: 'Modern hematology lab with automated CBC analyzers processing blood samples.'
  },
  {
    id: 'biochemistry',
    name: 'Biochemistry Section',
    emoji: '⚗️',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-100',
    desc: 'State-of-the-art fully automatic biochemistry analyzers for accurate liver, kidney, sugar, lipid, and thyroid testing. Equipped with built-in QC protocols for every run.',
    highlights: ['Auto Biochemistry Analyzer', 'Lipid, LFT, KFT, Sugar', 'Internal QC Controls', '6-Hour Turnaround'],
    image_desc: 'High-throughput biochemistry section with automated analyzers for metabolic panels.'
  },
  {
    id: 'serology',
    name: 'Serology & Immunology',
    emoji: '🛡️',
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-100',
    desc: 'Specialized section for infectious disease and immunological testing, including Dengue, Typhoid, Malaria, CRP, RF, and pregnancy tests. All tests use premium imported kits.',
    highlights: ['Dengue NS1 & IgG/IgM', 'Widal & Typhidot', 'Malaria ELISA', 'ANC Profiles'],
    image_desc: 'Serology section equipped with ELISA readers and rapid test platforms.'
  },
  {
    id: 'microscopy',
    name: 'Microscopy Room',
    emoji: '🔬',
    color: 'from-cyan-500 to-sky-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-100',
    desc: 'High-powered microscopy for manual blood film analysis, urine microscopy, semen analysis, and malaria parasite identification. All slides are reviewed by our pathologist.',
    highlights: ['40x–1000x Magnification', 'Digital Image Capture', 'Pathologist Review', 'Malaria Parasite ID'],
    image_desc: 'Microscopy lab with advanced binocular microscopes and digital imaging system.'
  },
];

/* ─── MACHINES DATA ─── */
const MACHINES = [
  {
    name: 'Sysmex 5-Part CBC Analyzer',
    category: 'Hematology',
    emoji: '🩸',
    color: 'bg-red-100 text-red-700',
    desc: 'Japan-imported fully automatic complete blood count machine with 5-part white cell differentiation. Processes 60 samples/hour with ±2% accuracy.',
    benefit: 'Delivers accurate CBC in under 5 minutes — no manual counting errors.',
    parameters: 'CBC, HGB, WBC, RBC, PLT, Differential Count',
  },
  {
    name: 'Mindray Biochemistry Analyzer',
    category: 'Biochemistry',
    emoji: '⚗️',
    color: 'bg-amber-100 text-amber-700',
    desc: 'High-throughput automated biochemistry system with built-in photometric detection. Handles 400 tests/hour across liver, kidney, lipid, and glucose panels.',
    benefit: 'Simultaneous testing of 20+ parameters from a single blood sample.',
    parameters: 'LFT, KFT, Lipid Profile, Sugar, Uric Acid, Calcium',
  },
  {
    name: 'ELISA Reader & Washer',
    category: 'Serology',
    emoji: '🛡️',
    color: 'bg-purple-100 text-purple-700',
    desc: 'Automated enzyme-linked immunosorbent assay (ELISA) system for highly sensitive antibody and antigen detection in infectious disease screening.',
    benefit: 'Detects minute levels of Dengue, Typhoid, and Malaria markers.',
    parameters: 'Dengue Profile, Typhidot, Hepatitis B & C, HIV Screening',
  },
  {
    name: 'Thyroid Analyzer (CLIA)',
    category: 'Immunology',
    emoji: '🦋',
    color: 'bg-blue-100 text-blue-700',
    desc: 'Chemiluminescence immunoassay analyzer for ultra-sensitive thyroid hormone detection. Gold standard for TSH, T3, T4 measurement with CV <5%.',
    benefit: 'Detects even borderline thyroid abnormalities that basic methods miss.',
    parameters: 'TSH, T3, T4, Free T4, Anti-TPO',
  },
  {
    name: 'Digital Binocular Microscope',
    category: 'Microscopy',
    emoji: '🔬',
    color: 'bg-cyan-100 text-cyan-700',
    desc: 'Carl Zeiss-standard binocular research microscope with integrated 5MP camera for digital slide capture and remote pathologist review.',
    benefit: 'Every slide is digitally archived — ensuring second opinions are always possible.',
    parameters: 'Blood Films, Urine Analysis, Semen Analysis, Parasite ID',
  },
];

/* ─── GALLERY MODAL ─── */
const SectionModal = ({ section, onClose }) => {
  if (!section) return null;
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className={`bg-gradient-to-br ${section.color} p-8 relative`}>
          <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full p-2 text-white">
            <X size={18} />
          </button>
          <div className="text-6xl mb-4">{section.emoji}</div>
          <h3 className="text-2xl font-black text-white">{section.name}</h3>
        </div>
        <div className="p-8">
          {/* Placeholder image */}
          <div className="w-full h-48 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-6 border border-slate-200">
            <div className="text-center text-slate-400">
              <div className="text-5xl mb-2">{section.emoji}</div>
              <p className="text-sm font-semibold italic">{section.image_desc}</p>
            </div>
          </div>
          <p className="text-slate-600 font-medium leading-relaxed mb-6">{section.desc}</p>
          <div className="grid grid-cols-2 gap-2">
            {section.highlights.map(h => (
              <div key={h} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5">
                <CheckCircle2 size={14} className="text-[#1D9E75] shrink-0" />
                <span className="text-xs font-bold text-slate-700">{h}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── MAIN PAGE ─── */
const LabTour = () => {
  const [selectedSection, setSelectedSection] = useState(null);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#063b30] via-[#085041] to-[#0d7a60] py-20 px-4 overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white/5 animate-float-p2" style={{
              width: `${40 + (i * 30) % 80}px`, height: `${40 + (i * 30) % 80}px`,
              top: `${(i * 19) % 90}%`, left: `${(i * 17) % 90}%`,
              animationDelay: `${i * 1.2}s`
            }} />
          ))}
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-bold px-4 py-1.5 rounded-full mb-5 border border-white/20">
            <Microscope size={13} /> Virtual Lab Tour
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-4">
            Inside <span className="text-[#F1C40F]">Sana Pathology</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto font-medium">
            Take a virtual tour of our state-of-the-art diagnostic facility. See the technology, cleanliness, and care that goes into every test we perform.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {[{ icon: '🏅', text: 'NABL Accredited' }, { icon: '🧼', text: 'Bio-Safe Environment' }, { icon: '⚡', text: 'Same Day Results' }, { icon: '🔬', text: 'Modern Equipment' }].map(b => (
              <span key={b.text} className="flex items-center gap-1.5 bg-white/10 border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-full">
                {b.icon} {b.text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Lab Sections Gallery */}
      <section className="py-16 px-4 bg-[#F5F7F6]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-black text-slate-900 mb-3">Explore Our Lab Sections</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Click on any section to see a detailed view of our facilities and the technology we use.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {LAB_SECTIONS.map((section) => (
              <div
                key={section.id}
                onClick={() => setSelectedSection(section)}
                className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden cursor-pointer group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Visual */}
                <div className={`h-44 bg-gradient-to-br ${section.color} relative overflow-hidden flex items-center justify-center`}>
                  <div className="absolute inset-0 opacity-20">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="absolute rounded-full bg-white" style={{
                        width: `${30 + i * 20}px`, height: `${30 + i * 20}px`,
                        top: `${20 + i * 20}%`, left: `${10 + i * 25}%`, opacity: 0.3
                      }} />
                    ))}
                  </div>
                  <div className="text-7xl relative z-10 group-hover:scale-110 transition-transform duration-300">
                    {section.emoji}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1.5 rounded-full border border-white/30">
                    View Details →
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-black text-slate-900 text-base mb-2">{section.name}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed mb-4 line-clamp-2">{section.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {section.highlights.slice(0, 2).map(h => (
                      <span key={h} className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${section.bgColor} ${section.borderColor} border`}>
                        ✓ {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Machine Showcase */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-xs font-bold px-4 py-1.5 rounded-full mb-4 border border-amber-200">
              ⚙️ Technology Showcase
            </div>
            <h2 className="text-3xl font-heading font-black text-slate-900 mb-3">Our Diagnostic Equipment</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              We invest in world-class medical equipment to ensure every test result is accurate, reliable, and reproducible.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MACHINES.map((machine) => (
              <div key={machine.name} className="bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:bg-white hover:shadow-xl hover:border-slate-200 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl ${machine.color.split(' ')[0]} flex items-center justify-center text-3xl`}>
                    {machine.emoji}
                  </div>
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${machine.color}`}>
                    {machine.category}
                  </span>
                </div>
                <h3 className="font-black text-slate-900 text-base mb-2 group-hover:text-[#0F6E56] transition-colors">
                  {machine.name}
                </h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-4">{machine.desc}</p>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-4">
                  <p className="text-xs font-black text-emerald-700">💡 Patient Benefit:</p>
                  <p className="text-xs text-emerald-600 font-medium mt-0.5">{machine.benefit}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Tests Covered:</p>
                  <p className="text-xs text-slate-500 font-semibold">{machine.parameters}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality & Safety Banner */}
      <section className="bg-[#063b30] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: '🧼', title: 'Bio-Safe Environment', desc: 'All surfaces disinfected hourly. Biohazard waste segregated per NABH/NABL protocol.' },
              { icon: '📋', title: 'Quality Control Every Shift', desc: 'Internal quality controls (IQC) run before every batch to ensure analyser accuracy.' },
              { icon: '🔐', title: 'Patient Privacy First', desc: 'Reports shared only via secure digital channels. No third-party data sharing ever.' },
            ].map(item => (
              <div key={item.title} className="text-white">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h4 className="font-black text-lg mb-2">{item.title}</h4>
                <p className="text-white/60 text-sm font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 bg-[#F5F7F6]">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-heading font-black text-slate-900 mb-3">Ready to Book Your Test?</h3>
          <p className="text-slate-500 mb-6">Experience the Sana Pathology difference. Book online or visit us in Sambhal.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="tel:+916396786939" className="flex items-center justify-center gap-2 bg-[#1D9E75] hover:bg-[#0F6E56] text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/30">
              <Phone size={16} /> Book Now: +91 6396786939
            </a>
            <a href="https://wa.me/916396786939" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg">
              <MessageCircle size={16} /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* Modal */}
      <SectionModal section={selectedSection} onClose={() => setSelectedSection(null)} />
    </PublicLayout>
  );
};

export default LabTour;
