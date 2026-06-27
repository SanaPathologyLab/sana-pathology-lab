import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Phone } from 'lucide-react';

const LAB_PHONE = '916396786939';

const QUICK_MESSAGES = [
  { label: '📋 Book a Test', msg: 'Hi Sana Pathology Lab! I want to book a blood test. Please help me.' },
  { label: '🏠 Home Collection', msg: 'Hi! I need free home sample collection. Please confirm if available in my area.' },
  { label: '📦 Health Package', msg: 'Hi Sana Pathology! I want to know about your Health Packages and pricing.' },
  { label: '📄 Check Report', msg: 'Hi! I want to check the status of my lab report. Patient mobile: ' },
];

const StickyWhatsAppBook = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMessage = (msg) => {
    window.open(`https://wa.me/${LAB_PHONE}?text=${encodeURIComponent(msg)}`, '_blank');
    setIsOpen(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* FAB + Menu */}
      <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-3">
        {/* Quick action menu */}
        {isOpen && (
          <div className="flex flex-col gap-2 items-end animate-in slide-in-from-bottom-4 duration-200">
            {/* Direct call button */}
            <a
              href="tel:+916396786939"
              className="flex items-center gap-2.5 bg-white shadow-xl rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-700 border border-slate-100 hover:shadow-2xl transition-all hover:-translate-y-0.5 whitespace-nowrap"
            >
              <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                <Phone size={15} className="text-blue-600" />
              </div>
              Call +91 63967 86939
            </a>

            {QUICK_MESSAGES.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleMessage(item.msg)}
                className="flex items-center gap-2.5 bg-white shadow-xl rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-700 border border-slate-100 hover:shadow-2xl transition-all hover:-translate-y-0.5 whitespace-nowrap"
              >
                <div className="w-8 h-8 bg-[#25D366]/10 rounded-full flex items-center justify-center shrink-0">
                  <MessageCircle size={14} className="text-[#25D366]" />
                </div>
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Main FAB */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group relative flex items-center gap-2 shadow-2xl rounded-full font-bold text-white transition-all duration-300 ${
            isOpen
              ? 'bg-slate-700 hover:bg-slate-800 px-4 py-3.5'
              : 'bg-[#25D366] hover:bg-[#1ebe5d] px-5 py-3.5'
          }`}
          aria-label="WhatsApp"
        >
          {/* Pulse ring (only when closed) */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25 pointer-events-none" />
          )}

          {isOpen ? (
            <>
              <X size={18} />
              <span className="text-sm">Close</span>
            </>
          ) : (
            <>
              {/* WhatsApp SVG Icon */}
              <svg viewBox="0 0 32 32" className="w-5 h-5 fill-white shrink-0" aria-hidden>
                <path d="M16 3C8.8 3 3 8.8 3 16c0 2.3.6 4.5 1.7 6.4L3 29l6.8-1.7C11.5 28.4 13.7 29 16 29c7.2 0 13-5.8 13-13S23.2 3 16 3zm0 23.7c-2.1 0-4.1-.6-5.8-1.7l-.4-.2-4 1 1-3.9-.3-.4A10.7 10.7 0 1 1 16 26.7zm5.9-8.1c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-.9 1.2-.4.2-.7.1a8.4 8.4 0 0 1-2.5-1.5 9.4 9.4 0 0 1-1.7-2.1c-.2-.3 0-.5.1-.7l.5-.6.3-.5v-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3a10 10 0 0 0 4.2 3.6c.6.2 1 .4 1.4.5.6.2 1.1.2 1.5.1.5-.1 1.5-.6 1.7-1.2.2-.5.2-1 .1-1.2z" />
              </svg>
              <span className="text-sm">Book via WhatsApp</span>
            </>
          )}
        </button>
      </div>
    </>
  );
};

export default StickyWhatsAppBook;
