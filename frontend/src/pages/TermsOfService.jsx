import React from 'react';
import PublicLayout from '../components/PublicLayout';

const TermsOfService = () => {
  return (
    <PublicLayout>
      <div className="bg-gradient-to-br from-slate-50 to-white py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-100/50">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#085041] tracking-tight font-heading mb-6 border-b border-slate-100 pb-4">
              Terms of Service
            </h1>
            
            <p className="text-slate-400 text-xs font-semibold mb-8">
              Effective Date: June 15, 2026
            </p>

            <div className="space-y-8 text-sm md:text-base text-slate-700 leading-relaxed">
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-slate-800">1. Acceptance of Terms</h2>
                <p>
                  By accessing the Sana Pathology Lab online booking portal, scheduling a home collection, or requesting laboratory testing services, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please refrain from using our online booking platform.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-slate-800">2. Service Description</h2>
                <p>
                  Sana Pathology Lab is a medical diagnostics laboratory offering sample collection, clinical pathology analysis, and digital report delivery. The services provided are for clinical diagnostic screening purposes and must be interpreted by a registered, qualified medical practitioner.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-slate-800">3. Booking, Rescheduling & Cancellation</h2>
                <p>
                  Online test bookings are scheduled requests. Home collection phlebotomy visits depend on slot availability, transit distance, and correct patient-provided location details. Cancellation or rescheduling of a home sample collection can be done free of charge up to 2 hours before the selected time slot by calling our laboratory coordinator.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-slate-800">4. Report Accuracy & Medical Disclaimer</h2>
                <p>
                  We adhere to rigorous quality control guidelines. However, minor variations in diagnostic results can occur due to physiological status, diet, fasting compliance, sample transit temperature, or intake of medications. Our AI explanations are for reference only and do not constitute a medical diagnosis. All reports must be verified by a physician.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-slate-800">5. Limitation of Liability</h2>
                <p>
                  Sana Pathology Lab and its directors, officers, and technicians shall not be liable for any direct or indirect consequences arising from delays in report delivery due to instrument maintenance, natural disasters, or network outages.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-slate-800">6. Governing Law</h2>
                <p>
                  These Terms of Service are governed by and construed in accordance with the laws of Uttar Pradesh, India. Any legal disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts located in Sambhal district, UP.
                </p>
              </section>
            </div>

          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default TermsOfService;
