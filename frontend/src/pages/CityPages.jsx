import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import {
  MapPin, Phone, MessageCircle, Clock, CheckCircle2,
  Star, Home, FlaskConical, ArrowRight, Shield
} from 'lucide-react';

/* ─── CITY DATA ─── */
const CITY_DATA = {
  sambhal: {
    name: 'Sambhal',
    nameHi: 'संभल',
    district: 'Sambhal, Uttar Pradesh',
    pincode: '244302',
    heroLine: 'Best Pathology Lab in Sambhal',
    subLine: 'NABL-accredited diagnostic services with home collection across all of Sambhal city.',
    faqs: [
      { q: 'Is home collection available in Sambhal?', a: 'Yes! We offer free home collection across all localities in Sambhal including Civil Lines, Hayat Nagar, Nakhasa, Sadar Bazar, and surrounding areas for bookings above ₹500.' },
      { q: 'How quickly are reports available in Sambhal?', a: 'Most routine tests (CBC, Sugar, LFT) are ready within 6-12 hours. You can track your report online or via WhatsApp.' },
      { q: 'What is the nearest Sana Pathology centre to Sambhal?', a: 'Our main lab is located at Datawali Road, Hayat Nagar, Sambhal – just 5 minutes from the main Sambhal market.' },
      { q: 'Do you accept home collection bookings on Sundays?', a: 'Yes, home collection is available on Sundays from 8 AM to 12 PM.' },
    ],
    areas: ['Civil Lines', 'Hayat Nagar', 'Nakhasa', 'Sadar Bazar', 'Chandausi Road', 'Lakhnawali', 'Rajpura', 'Sambhal Sadar'],
  },
  chandausi: {
    name: 'Chandausi',
    nameHi: 'चंदौसी',
    district: 'Sambhal, Uttar Pradesh',
    pincode: '244412',
    heroLine: 'Home Collection Blood Test in Chandausi',
    subLine: 'Quality lab tests from Sana Pathology delivered to your doorstep in Chandausi.',
    faqs: [
      { q: 'Does Sana Pathology cover Chandausi for home collection?', a: 'Yes! We cover all major areas of Chandausi including Nai Basti, Civil Lines, Railway Colony, and surrounding localities.' },
      { q: 'What tests are available via home collection in Chandausi?', a: 'All standard tests are available – CBC, Sugar, Thyroid, Lipid Profile, Dengue, Malaria, Typhoid, ANC Profile, and much more.' },
      { q: 'Is there any extra charge for home collection in Chandausi?', a: 'Home collection is free within city limits for orders above ₹500. A nominal fee may apply for remote areas.' },
      { q: 'How do I book home collection in Chandausi?', a: 'Simply call +91 6396786939 or WhatsApp us with your name, address, and required tests. Our phlebotomist will visit at your preferred time.' },
    ],
    areas: ['Nai Basti', 'Civil Lines', 'Railway Colony', 'Kotwali Area', 'Chandausi Market', 'Transport Nagar', 'Old Mandi'],
  },
  bahjoi: {
    name: 'Bahjoi',
    nameHi: 'बहजोई',
    district: 'Sambhal, Uttar Pradesh',
    pincode: '244501',
    heroLine: 'Affordable Blood Test in Bahjoi',
    subLine: 'Accurate, affordable diagnostic tests available in Bahjoi with fast home collection.',
    faqs: [
      { q: 'Is blood test home collection available in Bahjoi?', a: 'Yes, we provide home collection services in Bahjoi and surrounding villages on booking above ₹500.' },
      { q: 'How long does it take to get reports for tests in Bahjoi?', a: 'Reports are shared digitally via WhatsApp within 6-24 hours of sample collection.' },
      { q: 'Can I download my report from Bahjoi?', a: 'Yes! After your test, you will receive a link via WhatsApp to download your digital report anytime.' },
      { q: 'What are your rates for CBC, Sugar, and Thyroid test in Bahjoi?', a: 'CBC ₹200, Blood Sugar ₹100, Thyroid Function ₹450. Prices are inclusive with no hidden charges.' },
    ],
    areas: ['Bahjoi Town', 'Kothi Area', 'New Market', 'Jama Masjid Road', 'Hospital Road', 'Railway Station Area'],
  },
  sirsi: {
    name: 'Sirsi',
    nameHi: 'सिरसी',
    district: 'Sambhal, Uttar Pradesh',
    pincode: '244302',
    heroLine: 'Blood Test Collection in Sirsi',
    subLine: 'Convenient home sample collection for Sirsi residents by Sana Pathology Lab.',
    faqs: [
      { q: 'Do you provide services in Sirsi?', a: 'Yes, Sana Pathology provides home collection in Sirsi village and surrounding areas. Call us to confirm your area.' },
      { q: 'What is the minimum order for free home collection in Sirsi?', a: 'Tests totalling ₹500 or more qualify for free home collection within Sirsi limits.' },
      { q: 'How do I book in Sirsi?', a: 'Call +91 6396786939 or WhatsApp to book. Our phlebotomist will visit you at a time of your choice.' },
      { q: 'Which tests are available for home collection in Sirsi?', a: 'All tests available at our Sambhal lab — CBC, Sugar, Thyroid, Dengue, Malaria, Lipid, LFT, KFT, ANC and many more.' },
    ],
    areas: ['Sirsi Village', 'Main Bazar', 'Gram Panchayat Area', 'Sirsi Colony'],
  },
  'home-collection': {
    name: 'Sambhal Home Collection',
    nameHi: 'होम कलेक्शन संभल',
    district: 'Sambhal, Uttar Pradesh',
    pincode: '244302',
    heroLine: 'Free Home Blood Collection in Sambhal',
    subLine: 'Book a qualified phlebotomist to collect your blood sample from the comfort of your home.',
    faqs: [
      { q: 'Is home collection free?', a: 'Yes! Home collection is completely free for orders above ₹500 within Sambhal city. No hidden charges.' },
      { q: 'How quickly does the phlebotomist arrive?', a: 'Our phlebotomist arrives within 1-2 hours of your confirmed booking, Monday to Sunday.' },
      { q: 'Is fasting required for home collection?', a: 'Depends on the test. For Lipid Profile and Fasting Sugar, please fast 10-12 hours. For CBC, Thyroid, Dengue – no fasting needed. We will guide you when you book.' },
      { q: 'Will I get my report on WhatsApp?', a: 'Yes! You will receive a PDF report on your registered WhatsApp number within 6-24 hours.' },
    ],
    areas: ['All of Sambhal City', 'Hayat Nagar', 'Civil Lines', 'Nakhasa', 'Sadar Bazar', 'Chandausi Road'],
  },
};

/* ─── SCHEMA HELPER ─── */
const LocalBusinessSchema = ({ city }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": `Sana Pathology Lab - ${city.name}`,
    "url": "https://sanapathology.com",
    "telephone": "+91-6396786939",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Datawali Road, Hayat Nagar",
      "addressLocality": city.name,
      "addressRegion": "Uttar Pradesh",
      "postalCode": city.pincode,
      "addressCountry": "IN"
    },
    "geo": { "@type": "GeoCoordinates", "latitude": "28.5835", "longitude": "78.5539" },
    "openingHours": ["Mo-Sa 07:00-20:00", "Su 08:00-13:00"],
    "priceRange": "₹50–₹2000",
    "medicalSpecialty": "PathologyLaboratory",
    "description": city.subLine
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
};

/* ─── POPULAR TESTS ─── */
const POPULAR_TESTS = [
  { name: 'Complete Blood Count (CBC)', code: 'CBC', price: 200, cat: 'Hematology' },
  { name: 'Blood Sugar (RBS)', code: 'GLU-01', price: 100, cat: 'Biochemistry' },
  { name: 'Thyroid Function (TFT)', code: 'TFT', price: 450, cat: 'Endocrinology' },
  { name: 'Lipid Profile', code: 'LIPID', price: 650, cat: 'Biochemistry' },
  { name: 'Dengue Profile', code: 'DENGUE-01', price: 1200, cat: 'Serology' },
  { name: 'ANC Profile', code: 'ANC-01', price: 1200, cat: 'Antenatal' },
  { name: 'HbA1c', code: 'HBA1C', price: 400, cat: 'Diabetology' },
  { name: 'Liver Function (LFT)', code: 'LFT', price: 500, cat: 'Biochemistry' },
];

/* ─── MAIN COMPONENT ─── */
const CityPages = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine city from pathname
  const path = location.pathname; // e.g. /blood-test-sambhal or /home-collection-sambhal
  let cityKey = 'sambhal';
  if (path.includes('chandausi')) cityKey = 'chandausi';
  else if (path.includes('bahjoi')) cityKey = 'bahjoi';
  else if (path.includes('sirsi')) cityKey = 'sirsi';
  else if (path.includes('home-collection')) cityKey = 'home-collection';

  const data = CITY_DATA[cityKey] || CITY_DATA['sambhal'];

  return (
    <PublicLayout>
      <LocalBusinessSchema city={data} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#063b30] via-[#085041] to-[#0d7a60] py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white animate-float-p1" style={{
              width: `${50 + i * 30}px`, height: `${50 + i * 30}px`,
              top: `${(i * 21) % 90}%`, left: `${(i * 17) % 90}%`,
              animationDelay: `${i * 0.9}s`
            }} />
          ))}
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-bold px-4 py-1.5 rounded-full mb-5 border border-white/20">
            <MapPin size={13} /> {data.district}
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-4">
            {data.heroLine}
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto font-medium mb-8">
            {data.subLine}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="tel:+916396786939" className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#BA7517] to-[#d68f23] text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl hover:-translate-y-0.5 transition-all">
              <Phone size={18} /> Book Home Collection — FREE
            </a>
            <a href={`https://wa.me/916396786939?text=Hi%20Sana%20Pathology%2C%20I%20need%20home%20collection%20in%20${data.name}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl hover:-translate-y-0.5 transition-all">
              <MessageCircle size={18} /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <div className="bg-white py-6 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center gap-5">
          {[
            { icon: '🏅', text: 'NABL Accredited' },
            { icon: '🚑', text: 'Same Day Collection' },
            { icon: '💊', text: '100+ Tests' },
            { icon: '📄', text: 'Report on WhatsApp' },
            { icon: '⭐', text: '15,000+ Patients' },
          ].map(b => (
            <div key={b.text} className="flex items-center gap-2 text-slate-700 font-bold text-sm">
              <span className="text-lg">{b.icon}</span> {b.text}
            </div>
          ))}
        </div>
      </div>

      {/* Areas covered */}
      <section className="py-14 px-4 bg-[#F5F7F6]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Areas */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-xl font-heading font-black text-slate-900 mb-5 flex items-center gap-2">
                <MapPin size={18} className="text-[#1D9E75]" /> Areas We Serve in {data.name}
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {data.areas.map(area => (
                  <div key={area} className="flex items-center gap-2 py-2 px-3 bg-emerald-50 rounded-xl">
                    <CheckCircle2 size={13} className="text-[#1D9E75] shrink-0" />
                    <span className="text-sm font-semibold text-slate-700">{area}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-4 font-medium">
                * Don't see your area? Call us — we'll confirm coverage within minutes.
              </p>
            </div>

            {/* How it works */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-xl font-heading font-black text-slate-900 mb-5 flex items-center gap-2">
                <Home size={18} className="text-[#1D9E75]" /> How Home Collection Works
              </h2>
              <div className="space-y-4">
                {[
                  { step: '1', title: 'Call or WhatsApp', desc: 'Tell us your name, mobile, address, and tests needed.' },
                  { step: '2', title: 'Confirm Appointment', desc: 'Our staff confirms your preferred time slot (morning preferred).' },
                  { step: '3', title: 'Phlebotomist Visits', desc: 'Our trained professional arrives at your door with all sterile equipment.' },
                  { step: '4', title: 'Receive Report on WhatsApp', desc: 'Your digital report arrives in 6-12 hours via WhatsApp and Email.' },
                ].map(s => (
                  <div key={s.step} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#1D9E75] text-white font-black text-sm flex items-center justify-center shrink-0">
                      {s.step}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-sm">{s.title}</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Tests in this city */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-heading font-black text-slate-900 mb-2">
              Most Popular Tests in {data.name}
            </h2>
            <p className="text-slate-500 text-sm">Available with home collection. All prices are transparent — no hidden charges.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {POPULAR_TESTS.map(test => (
              <div
                key={test.code}
                onClick={() => navigate('/book-appointment')}
                className="bg-slate-50 hover:bg-emerald-50 border border-gray-100 hover:border-emerald-200 rounded-2xl p-4 cursor-pointer transition-all group"
              >
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">{test.cat}</p>
                <p className="font-black text-slate-800 text-sm leading-tight mb-2 group-hover:text-[#0F6E56]">{test.name}</p>
                <p className="text-lg font-black text-[#1D9E75]">₹{test.price}</p>
                <div className="flex items-center gap-1 mt-2 text-[#1D9E75] text-[11px] font-bold">
                  Book Now <ArrowRight size={10} />
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/tests-catalog" className="inline-flex items-center gap-2 text-[#1D9E75] font-bold text-sm hover:underline">
              View All 100+ Tests <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-14 px-4 bg-[#F5F7F6]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-heading font-black text-slate-900 mb-2">
              Frequently Asked Questions — {data.name}
            </h2>
          </div>
          <div className="space-y-4">
            {data.faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-black text-slate-800 mb-2 flex items-start gap-2">
                  <span className="text-[#1D9E75] shrink-0">Q.</span> {faq.q}
                </h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed pl-5">
                  <span className="text-amber-600 font-black">A.</span> {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#063b30] py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-heading font-black text-white mb-3">
            Book Your Test in {data.name} Today
          </h3>
          <p className="text-white/60 mb-6">Free home collection · Digital reports · NABL quality</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="tel:+916396786939" className="flex items-center justify-center gap-2 bg-[#1D9E75] hover:bg-[#0F6E56] text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg">
              <Phone size={16} /> +91 6396786939
            </a>
            <a href={`https://wa.me/916396786939?text=Hi%20Sana%20Pathology%2C%20I%20need%20blood%20test%20home%20collection%20in%20${data.name}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg">
              <MessageCircle size={16} /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default CityPages;
