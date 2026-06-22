import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  MapPin, Phone, Clock, Mail, MessageCircle, Heart, ShieldCheck,
  ArrowRight, Navigation, Star, Users, Award
} from 'lucide-react';
import PublicHomeHeader from '../components/PublicHomeHeader';
import EmergencyWidget from '../components/EmergencyWidget';
import LiveChatWidget from '../components/LiveChatWidget';

const ContactPage = () => {
  const { t, language } = useLanguage();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-bg font-sans text-slate-800">
      <PublicHomeHeader />

      {/* Hero */}
      <section className="relative pt-24 pb-28 overflow-hidden bg-gradient-to-br from-[#063b30] via-[#085041] to-[#0b6b55]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-emerald-200 text-xs font-bold tracking-wider uppercase mb-6 backdrop-blur-md border border-white/20">
            <MapPin size={14} className="text-[#F1C40F]" />
            {t('locationContact')}
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-black text-white leading-tight mb-4">
            {t('locationContact')}
          </h1>
          <p className="text-lg md:text-xl text-emerald-100/80 max-w-2xl mx-auto font-medium">
            {t('contactDesc')}
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left - Contact Info */}
          <div className="space-y-6">
            {/* Quick Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-slate-800 mb-1">{t('contactNumber')}</h3>
                <a href="tel:+916396786939" className="text-lg font-black text-primary hover:text-primary-light transition-colors">+91 63967 86939</a>
                <p className="text-xs text-slate-400 mt-1 font-semibold">Also: +91 63972 40575</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-800 mb-1">WhatsApp</h3>
                <a href="https://wa.me/916396786939" target="_blank" rel="noopener noreferrer"
                  className="text-lg font-black text-emerald-600 hover:text-emerald-700 transition-colors">
                  Chat Now
                </a>
                <p className="text-xs text-slate-400 mt-1 font-semibold">Quick replies within minutes</p>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">{t('address')}</h3>
                  <p className="text-slate-600 font-semibold leading-relaxed">
                    Datawali Road, Near Aara Machine,<br />
                    Hayat Nagar, Sambhal,<br />
                    Uttar Pradesh – 244303
                  </p>
                  <a
                    href="https://www.google.com/maps?q=28.5466795,78.5773542"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-sm font-bold text-primary hover:text-primary-light transition-colors"
                  >
                    <Navigation size={14} /> Get Directions
                  </a>
                </div>
              </div>
            </div>

            {/* Hours Card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 mb-3">{t('openingHours')}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-slate-600">Monday – Saturday</span>
                      <span className="text-sm font-bold text-slate-800">7:00 AM – 8:00 PM</span>
                    </div>
                    <div className="border-t border-slate-50 pt-2 flex justify-between items-center">
                      <span className="text-sm font-semibold text-slate-600">Sunday</span>
                      <span className="text-sm font-bold text-primary">8:00 AM – 1:00 PM</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-xs font-semibold text-emerald-800">Same-day home collection available if booked before 11 AM</p>
              </div>
            </div>
          </div>

          {/* Right - Map */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-[400px] md:h-[500px]">
              <iframe
                title="Sana Pathology Lab Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1000!2d78.5773542!3d28.5466795!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjnCsDMyJzQ4LjEiTiA3OMKwMzQnMzguNSJF!5e1!3m2!1sen!2sin!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
              />
            </div>

            {/* Trust Strip */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h3 className="font-black text-slate-800 mb-4 text-center">Why Visit Sana Pathology?</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { icon: Award, label: 'NABL Accredited', sub: 'ISO Standards' },
                  { icon: Users, label: '15K+ Patients', sub: 'Trusted Care' },
                  { icon: Star, label: 'Expert Team', sub: 'MD Pathologists' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="p-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-800">{item.label}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{item.sub}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Action */}
            <div className="bg-gradient-to-r from-primary to-primary-light rounded-2xl p-6 text-white shadow-lg text-center">
              <h3 className="font-black text-xl mb-2">Book Home Collection</h3>
              <p className="text-emerald-100 text-sm font-medium mb-4">Free home collection within city limits</p>
              <div className="flex gap-3 justify-center">
                <a href="tel:+916396786939"
                  className="flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/20 px-6 py-3 rounded-xl font-bold text-sm hover:bg-white/30 transition-all">
                  <Phone size={16} /> Call Now
                </a>
                <a href="/book-online"
                  className="flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-bold text-sm hover:shadow-lg transition-all">
                  Book Online <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Areas We Serve */}
      <section className="py-16 bg-white border-t border-slate-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-4">Areas We Serve</h2>
          <p className="text-slate-500 font-semibold mb-8">We provide home collection services across the Sambhal district</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Sambhal', desc: 'Main city & surrounding areas' },
              { name: 'Chandausi', desc: 'Full coverage with 24hr delivery' },
              { name: 'Bahjoi', desc: 'Daily collection routes' },
              { name: 'Sirsi', desc: 'Weekly scheduled visits' },
            ].map((area) => (
              <div key={area.name} className="bg-slate-50 rounded-2xl border border-slate-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-bold text-slate-800">{area.name}</h4>
                <p className="text-xs text-slate-500 font-semibold mt-1">{area.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <EmergencyWidget />
      <LiveChatWidget />
    </div>
  );
};

export default ContactPage;
