import React from 'react';
import PublicLayout from '../components/PublicLayout';
import { ShieldCheck, Award, Heart, Shield, Activity, Sparkles } from 'lucide-react';

const AboutUs = () => {
  return (
    <PublicLayout>
      <div className="bg-[#F5F7F6]">
        
        {/* Banner Section */}
        <section className="bg-gradient-to-r from-[#085041] to-[#0F6E56] py-16 md:py-24 text-white text-center px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent)]"></div>
          <div className="max-w-4xl mx-auto relative z-10 space-y-4">
            <span className="bg-[#ffb800]/20 text-[#ffb800] text-xs font-black uppercase px-4 py-1.5 rounded-full border border-[#ffb800]/30 tracking-widest inline-block">
              Our Legacy of Care
            </span>
            <h1 className="text-3xl md:text-5xl font-black font-heading leading-tight tracking-tight">
              About Sana Pathology Lab
            </h1>
            <p className="text-sm md:text-lg text-emerald-100 max-w-2xl mx-auto leading-relaxed">
              Equipped with state-of-the-art fully computerized diagnostic machinery, providing accurate clinical test findings in Sambhal.
            </p>
          </div>
        </section>

        {/* Doctor Bio Section */}
        <section className="py-16 px-6 max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 flex flex-col items-center text-center">
              <div className="w-40 h-40 md:w-52 md:h-52 rounded-full border-4 border-[#1D9E75]/20 p-2 shadow-lg mb-6 bg-slate-50 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#1D9E75] to-[#085041] flex items-center justify-center text-white text-5xl font-black">
                  DS
                </div>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-slate-800">Dr. Sana, M.D.</h2>
              <p className="text-xs text-[#1D9E75] font-extrabold uppercase tracking-widest mt-1">Chief Pathologist & Director</p>
              <p className="text-slate-400 text-xs mt-0.5">Reg No. UP-1029384</p>
            </div>
            
            <div className="lg:col-span-8 space-y-6 text-slate-700">
              <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                <Sparkles className="text-[#ffb800] fill-[#ffb800] w-5 h-5 animate-pulse-soft" />
                Director's Vision
              </h3>
              <p className="text-sm md:text-base leading-relaxed">
                Founded with a mission to deliver world-class medical diagnostics at accessible rates for the local population of Sambhal, Sana Pathology has evolved into a premier diagnostic center. Under the supervision of <strong>Dr. Sana</strong>, the laboratory follows stringent quality control practices that minimize human errors.
              </p>
              <p className="text-sm md:text-base leading-relaxed">
                "Our priority is absolute patient trust. By leveraging computerized clinical analyzers and barcoded sample validation workflows, we ensure that every single test result is precise, reliable, and verified by certified medical pathologists."
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Specialization</p>
                  <p className="text-sm font-black text-slate-700 mt-0.5">Hematology & Cytopathology</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Experience</p>
                  <p className="text-sm font-black text-slate-700 mt-0.5">15+ Years Clinical Pathology</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Infrastructure & Quality Section */}
        <section className="bg-white py-16 px-6 border-y border-slate-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight font-heading">
                Diagnostic Infrastructure & Quality
              </h2>
              <p className="text-slate-500 text-xs md:text-sm">
                How we achieve zero human mix-ups and high-fidelity testing standards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="bg-[#F5F7F6] p-8 rounded-2xl border border-slate-100/50 shadow-inner hover:shadow-md transition-shadow duration-300">
                <div className="bg-[#1D9E75]/10 p-3.5 rounded-2xl text-[#1D9E75] inline-block mb-5">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">ISO 9001:2015 Certified</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Our diagnostics processes and laboratory management software satisfy global quality standards, ensuring structured workflows and documentation audits.
                </p>
              </div>

              <div className="bg-[#F5F7F6] p-8 rounded-2xl border border-slate-100/50 shadow-inner hover:shadow-md transition-shadow duration-300">
                <div className="bg-[#1D9E75]/10 p-3.5 rounded-2xl text-[#1D9E75] inline-block mb-5">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">Barcoded Safety Controls</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Every vial is barcoded immediately during sample collection. This avoids human label errors, securing sample routing inside the lab.
                </p>
              </div>

              <div className="bg-[#F5F7F6] p-8 rounded-2xl border border-slate-100/50 shadow-inner hover:shadow-md transition-shadow duration-300">
                <div className="bg-[#1D9E75]/10 p-3.5 rounded-2xl text-[#1D9E75] inline-block mb-5">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">Computerized Analyzers</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Using high-speed, automated biochemistry and immunology analyzers. Results are directly synced to patient reports, bypassing manual keying errors.
                </p>
              </div>

            </div>
          </div>
        </section>

      </div>
    </PublicLayout>
  );
};

export default AboutUs;
