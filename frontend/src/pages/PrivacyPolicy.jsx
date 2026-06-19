import React from 'react';
import PublicLayout from '../components/PublicLayout';

const PrivacyPolicy = () => {
  return (
    <PublicLayout>
      <div className="bg-gradient-to-br from-slate-50 to-white py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-100/50">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#085041] tracking-tight font-heading mb-6 border-b border-slate-100 pb-4">
              Privacy Policy
            </h1>
            
            <p className="text-slate-400 text-xs font-semibold mb-8">
              Last Updated: June 15, 2026
            </p>

            <div className="space-y-8 text-sm md:text-base text-slate-700 leading-relaxed">
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-slate-800">1. Introduction</h2>
                <p>
                  At Sana Pathology Lab, we respect your privacy and are committed to protecting the personal and medical data you share with us. This Privacy Policy details how we collect, store, access, and protect your information when you use our website, online booking portal, and laboratory services.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-slate-800">2. Information We Collect</h2>
                <p>We collect information necessary to perform medical diagnostic testing and schedule collections:</p>
                <ul className="list-disc pl-6 space-y-1.5 text-slate-600">
                  <li><strong>Personal Identifier Info:</strong> Full name, date of birth, age, gender, and Aadhaar card (optional, for verification).</li>
                  <li><strong>Contact Details:</strong> Mobile number, alternate phone number, email address, and home/office collection address.</li>
                  <li><strong>Health & Clinical Data:</strong> Prescribed tests, referring doctor details, clinical history (e.g., diabetes or hypertension symptoms provided to AI), and final test results/reports.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-slate-800">3. Storage & Protection of Data</h2>
                <p>
                  Your diagnostic records and personal data are stored in secure, encrypted cloud databases. We utilize industry-standard TLS encryption for transmitting data and rest-encryption for databases. Access is limited strict-level to authorized medical technicians, certified pathologists, and the referring doctor.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-slate-800">4. Retention Policy</h2>
                <p>
                  Sana Pathology Lab retains medical diagnostic records for a minimum of 3 years under NABL guidelines. This ensures patients and doctors have historical records for trend lines and wellness comparisons. Non-medical information is archived when no longer required for active operations.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-slate-800">5. Access Rights & Data Deletion</h2>
                <p>
                  Patients have the right to request a digital export of their entire diagnostic history, or ask for account anonymization by providing physical proof of identity at our main diagnostic center in Sambhal. Data deletion requests are evaluated in compliance with NABL guidelines.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-slate-800">6. Contact for Privacy Inquiries</h2>
                <p>
                  For any requests, corrections, or privacy-related complaints, please reach out to our privacy compliance officer:
                </p>
                <div className="bg-[#1D9E75]/5 border border-[#1D9E75]/10 rounded-2xl p-5 text-sm space-y-1 mt-2">
                  <p className="font-bold text-slate-800">Sana Pathology Compliance Cell</p>
                  <p>📍 Datawali Road, Near Aara Machine, Hayat Nagar, Sambhal-244303</p>
                  <p>📞 Phone: +91 6396786939</p>
                  <p>✉️ Email: support@sanapathology.com</p>
                </div>
              </section>
            </div>

          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default PrivacyPolicy;
