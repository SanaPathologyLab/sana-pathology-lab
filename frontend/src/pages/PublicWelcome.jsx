import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Phone, MapPin, Clock, CheckCircle2, Activity, Microscope, 
  UserCircle, Star, ChevronDown, ChevronUp, MessageCircle, ShieldCheck,
  Search, FileText
} from 'lucide-react';
import Logo from '../components/Logo';

const PublicWelcome = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchType, setSearchType] = useState('mobile');
  const [searchQuery, setSearchQuery] = useState('');
  const slides = ['/slide1.png', '/slide2.png', '/slide3.png'];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (searchType === 'mobile') {
      navigate(`/report-lookup?mobile=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(`/report-lookup?reportNumber=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Background slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleFaq = (index) => {
    if (openFaq === index) setOpenFaq(null);
    else setOpenFaq(index);
  };

  const services = [
    { name: 'Complete Blood Count (CBC)', price: '₹300', time: '6 Hours', icon: <Activity className="w-8 h-8 text-primary" /> },
    { name: 'Fasting Blood Sugar', price: '₹150', time: '4 Hours', icon: <Activity className="w-8 h-8 text-primary" /> },
    { name: 'Lipid Profile', price: '₹400', time: '12 Hours', icon: <Activity className="w-8 h-8 text-primary" /> },
    { name: 'Thyroid Profile (T3/T4/TSH)', price: '₹550', time: '12 Hours', icon: <Microscope className="w-8 h-8 text-primary" /> },
    { name: 'Urine Routine', price: '₹200', time: '4 Hours', icon: <Microscope className="w-8 h-8 text-primary" /> },
    { name: 'Liver Function Test (LFT)', price: '₹600', time: '12 Hours', icon: <Activity className="w-8 h-8 text-primary" /> },
    { name: 'Kidney Function Test (KFT)', price: '₹600', time: '12 Hours', icon: <Activity className="w-8 h-8 text-primary" /> },
    { name: 'Vitamin D (25-OH)', price: '₹800', time: '24 Hours', icon: <Microscope className="w-8 h-8 text-primary" /> },
  ];

  const faqs = [
    { q: "Do I need to fast before a blood test?", a: "It depends on the test. Tests like Fasting Blood Sugar and Lipid Profile require 8-12 hours of fasting. Please check with our lab when booking." },
    { q: "Do you offer home sample collection?", a: "Yes, we provide free home sample collection within city limits for bookings above ₹500." },
    { q: "How will I receive my reports?", a: "You will receive a digital copy of your report via WhatsApp and Email within the promised turnaround time. You can also log into our website to download past reports." },
    { q: "What are the payment options?", a: "We accept Cash, UPI (Google Pay, PhonePe, Paytm), and major Credit/Debit cards at our lab and during home collection." },
    { q: "What is your turnaround time for reports?", a: "Most routine tests (like CBC, Sugar) are delivered within 6-12 hours. Specialized tests may take 24 hours." },
  ];

  return (
    <div className="min-h-screen bg-bg relative font-sans text-slate-800">
      
      {/* Header */}
      <header className="sticky top-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <Logo className="w-12 h-12 md:w-14 md:h-14 drop-shadow-md" />
            <div>
              <h1 className="text-2xl font-heading text-primary tracking-tight leading-none">
                Sana Pathology
              </h1>
              <p className="text-xs text-primary-light font-bold tracking-wide uppercase mt-1">Diagnostic Center</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-8 mr-4">
              <a href="#services" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Services</a>
              <a href="#faq" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">FAQ</a>
              <a href="#contact" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Contact</a>
            </div>
            
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 text-sm font-bold text-white bg-primary hover:bg-primary-light transition-all px-4 py-2 md:px-6 md:py-2.5 rounded-full shadow-lg shadow-primary/30 ring-2 ring-primary/40 ring-offset-2 ring-offset-white"
            >
              <UserCircle size={18} className="hidden sm:block" />
              <span>Login</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 lg:pt-32 lg:pb-40 overflow-hidden bg-[#085041]">
        {/* Sliding Background Images */}
        {slides.map((slide, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            <img src={slide} alt="Lab background" className="w-full h-full object-cover" />
          </div>
        ))}
        {/* Dark Teal Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#085041]/95 to-[#1D9E75]/85"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-heading text-white mb-6 leading-tight max-w-4xl mx-auto">
            Trusted Pathology Lab in Your City
          </h2>
          
          <p className="text-lg md:text-xl text-primary-pale mb-10 max-w-2xl mx-auto">
            Accurate reports. Fast results. Home collection available.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button 
              onClick={() => navigate('/book-appointment')}
              className="w-full sm:w-auto min-h-[44px] bg-accent hover:bg-amber-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-accent/30 hover:-translate-y-1"
            >
              Book a Test
            </button>
            <a 
              href="tel:+916396786939"
              className="w-full sm:w-auto min-h-[44px] border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 rounded-full font-bold text-lg transition-all"
            >
              Call Now
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 lg:gap-12 text-white">
            <div className="flex items-center gap-2"><CheckCircle2 className="text-accent" size={20} /><span className="font-medium">10,000+ Patients</span></div>
            <div className="flex items-center gap-2"><Clock className="text-accent" size={20} /><span className="font-medium">24hr Reports</span></div>
            <div className="flex items-center gap-2"><Phone className="text-accent" size={20} /><span className="font-medium">Home Collection</span></div>
            <div className="flex items-center gap-2"><ShieldCheck className="text-accent" size={20} /><span className="font-medium">NABL Accredited</span></div>
          </div>
        </div>
      </section>

      {/* Floating Lab Result Search Card */}
      <section className="relative z-20 -mt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary-pale p-3 rounded-xl text-primary">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Check Your Lab Results</h3>
              <p className="text-slate-500 text-sm mt-1">Enter your details below to instantly view or download your reports</p>
            </div>
          </div>
          
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex bg-slate-100 p-1 rounded-xl md:w-64 shrink-0">
              <button
                type="button"
                onClick={() => setSearchType('mobile')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  searchType === 'mobile' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Mobile No
              </button>
              <button
                type="button"
                onClick={() => setSearchType('report')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  searchType === 'report' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Report No
              </button>
            </div>
            <div className="relative flex-1">
              <input
                type={searchType === 'mobile' ? 'tel' : 'text'}
                placeholder={searchType === 'mobile' ? 'Enter Mobile Number...' : 'e.g. RPT-000001'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-full min-h-[48px] pl-4 pr-4 border-2 border-slate-200 rounded-xl focus:border-primary focus:ring-0 outline-none transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-primary hover:bg-primary-light text-white px-8 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Find Report
            </button>
          </form>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-bg px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading text-primary">Why Choose Us</h2>
            <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'NABL Accredited', desc: 'Highest standard of testing quality and lab practices.' },
              { title: 'Home Sample Collection', desc: 'Free and safe blood collection at your doorstep.' },
              { title: 'Digital Reports in 24hrs', desc: 'Get accurate reports quickly via WhatsApp & Email.' },
              { title: '15+ Years Experience', desc: 'Trusted by thousands of doctors and patients.' },
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border-t-4 border-primary hover:shadow-md transition-shadow">
                <CheckCircle2 className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2 text-slate-800">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section id="services" className="py-20 bg-primary-pale px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading text-primary">Our Services</h2>
            <p className="text-slate-600 mt-4 max-w-2xl mx-auto">Book individual tests directly with guaranteed fast turnaround times.</p>
            <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((svc, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center text-center border border-slate-100">
                <div className="w-16 h-16 bg-primary-pale rounded-full flex items-center justify-center mb-4">
                  {svc.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{svc.name}</h3>
                <div className="mt-auto w-full">
                  <div className="flex justify-between items-center mb-4 text-sm text-slate-600 border-t border-slate-100 pt-4 mt-2">
                    <span className="font-semibold text-primary">{svc.price}</span>
                    <span>{svc.time}</span>
                  </div>
                  <button onClick={() => navigate('/book-appointment')} className="w-full min-h-[44px] bg-primary-pale text-primary hover:bg-primary hover:text-white font-bold py-2 rounded-xl transition-colors">
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Patient Testimonials */}
      <section className="py-20 bg-bg px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading text-primary">Patient Testimonials</h2>
            <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Rahul Sharma', review: 'Very professional staff and timely reports. The home collection was seamless and painless.' },
              { name: 'Priya Patel', review: 'Highly accurate results. My doctor specifically recommended Sana Pathology for the thyroid tests.' },
              { name: 'Amit Kumar', review: 'Excellent service. Received my reports on WhatsApp within 6 hours as promised. Very convenient!' },
            ].map((t, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-5 h-5 fill-accent text-accent" />)}
                </div>
                <p className="text-slate-600 mb-6 italic">"{t.review}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-heading text-xl">
                    {t.name[0]}
                  </div>
                  <h4 className="font-bold text-slate-800">{t.name}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-primary-pale px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading text-primary">Frequently Asked Questions</h2>
            <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
                <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  {faq.q}
                  {openFaq === i ? <ChevronUp className="text-primary flex-shrink-0" /> : <ChevronDown className="text-primary flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-slate-600">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location & Contact */}
      <section id="contact" className="py-20 bg-bg px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-heading text-primary mb-6">Location & Contact</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">Visit our state-of-the-art laboratory for a comfortable and hygienic testing experience, or give us a call to book a home collection.</p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-pale rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Address</h4>
                  <p className="text-slate-600">Datawali Road, Near Aara Machine,<br/>Hayat Nagar, Distt. Sambhal-244303 (U.P)</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-pale rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Opening Hours</h4>
                  <p className="text-slate-600">Monday - Saturday: 7:00 AM - 8:00 PM<br/>Sunday: 8:00 AM - 1:00 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-pale rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Contact Number</h4>
                  <p className="text-slate-600">+91 6396786939</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="h-[400px] bg-slate-200 rounded-3xl overflow-hidden shadow-sm border border-slate-300 relative flex items-center justify-center">
            <iframe 
              title="Sana Pathology Lab Location"
              src="https://www.google.com/maps?q=28.5466795,78.5773542&z=16&output=embed"
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#085041] pt-16 pb-8 px-4 sm:px-6 lg:px-8 text-primary-pale">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-1">
            <h3 className="text-2xl font-heading text-white mb-4">Sana Pathology</h3>
            <p className="text-sm opacity-80 leading-relaxed mb-6">Providing high-quality diagnostic services with unparalleled accuracy and fast turnaround times.</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><a href="#services" className="hover:text-white transition-colors">Our Services</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              <li><button onClick={() => navigate('/book-appointment')} className="hover:text-white transition-colors">Book Home Collection</button></li>
              <li><button onClick={() => navigate('/login')} className="hover:text-white transition-colors">Patient Portal</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Contact Info</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>+91 6396786939</li>
              <li>support@sanapathology.com</li>
              <li>Datawali Road, Sambhal</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Certifications</h4>
            <div className="inline-block bg-white/10 px-4 py-2 rounded-lg border border-white/20">
              <span className="font-bold tracking-widest">NABL ACCREDITED</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto text-center border-t border-white/10 pt-8 text-sm opacity-60">
          &copy; {new Date().getFullYear()} Sana Pathology Lab. All rights reserved.
        </div>
      </footer>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <a 
          href="tel:+916396786939"
          className="flex items-center justify-center w-14 h-14 bg-primary text-white rounded-full shadow-xl shadow-primary/30 hover:scale-110 transition-transform"
          aria-label="Call Us"
        >
          <Phone className="w-6 h-6" />
        </a>
        <a 
          href="https://wa.me/916396786939?text=Hi,%20I%20want%20to%20book%20a%20test%20at%20Sana%20Pathology%20Lab"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-[#25D366] text-white px-5 h-14 rounded-full shadow-xl shadow-green-900/20 hover:scale-105 transition-transform group"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="font-bold whitespace-nowrap hidden group-hover:block transition-all">Book Test</span>
        </a>
      </div>

    </div>
  );
};

export default PublicWelcome;
