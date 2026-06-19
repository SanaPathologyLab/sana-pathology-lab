import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Home, FileText, MessageCircle, X, Plus, CalendarPlus, Upload } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';

const actions = [
  {
    id: 'whatsapp',
    label: 'WhatsApp Us',
    icon: <WhatsAppIcon className="w-5 h-5" />,
    color: 'bg-[#25D366] hover:bg-[#1da851] shadow-green-500/40',
    href: 'https://wa.me/916396786939?text=Hi%20Sana%20Pathology%2C%20I%20need%20help',
    external: true,
  },
  {
    id: 'call',
    label: 'Call Lab',
    icon: <Phone className="w-5 h-5" />,
    color: 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/40',
    href: 'tel:+916396786939',
    external: true,
  },
  {
    id: 'download',
    label: 'Download Report',
    icon: <FileText className="w-5 h-5" />,
    color: 'bg-purple-500 hover:bg-purple-600 shadow-purple-500/40',
    route: '/report-lookup',
  },
  {
    id: 'prescription',
    label: 'Upload Prescription',
    icon: <Upload className="w-5 h-5" />,
    color: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/40',
    route: '/upload-prescription',
  },
  {
    id: 'book',
    label: 'Book Home Collection',
    icon: <Home className="w-5 h-5" />,
    color: 'bg-[#1D9E75] hover:bg-[#0F6E56] shadow-emerald-500/40',
    route: '/book-appointment',
  },
];

const EmergencyWidget = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [pulsed, setPulsed] = useState(false);

  // Pulse once on mount after 3 seconds to attract attention
  useEffect(() => {
    const t = setTimeout(() => {
      setPulsed(true);
      setTimeout(() => setPulsed(false), 1500);
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  const handleAction = (action) => {
    setOpen(false);
    if (action.external) {
      window.open(action.href, '_blank', 'noopener noreferrer');
    } else if (action.href) {
      window.location.href = action.href;
    } else if (action.route) {
      navigate(action.route);
    }
  };

  return (
    <div className="fixed bottom-6 right-5 z-[999] flex flex-col items-end gap-3">
      {/* Action buttons — slide in when open */}
      {actions.map((action, i) => (
        <div
          key={action.id}
          className={`flex items-center gap-3 transition-all duration-300 ${
            open
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-8 pointer-events-none'
          }`}
          style={{ transitionDelay: open ? `${i * 50}ms` : `${(actions.length - 1 - i) * 30}ms` }}
        >
          <span className="bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-md whitespace-nowrap border border-gray-100">
            {action.label}
          </span>
          <button
            onClick={() => handleAction(action)}
            className={`w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg ${action.color} transition-all duration-200 hover:scale-110 active:scale-95`}
            aria-label={action.label}
          >
            {action.icon}
          </button>
        </div>
      ))}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close quick actions' : 'Open quick actions'}
        className={`relative w-15 h-15 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
          open
            ? 'bg-slate-700 hover:bg-slate-600 rotate-45'
            : 'bg-gradient-to-br from-[#0F6E56] to-[#1D9E75] hover:from-[#1D9E75] hover:to-[#0F6E56]'
        } ${pulsed ? 'ring-4 ring-[#1D9E75]/50 ring-offset-2' : ''}`}
        style={{ width: 60, height: 60 }}
      >
        {open ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <CalendarPlus className="w-6 h-6 text-white" />
            {/* Badge */}
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-white animate-bounce">
              5
            </span>
          </>
        )}
        {/* Pulse ring when closed */}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-[#1D9E75]/30 animate-ping pointer-events-none" />
        )}
      </button>
    </div>
  );
};

export default EmergencyWidget;
