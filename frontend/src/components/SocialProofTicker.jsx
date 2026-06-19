import { useState, useEffect, useCallback } from 'react';
import { User, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const BOOKING_EXAMPLES = [
  { firstName: 'Rahul', city: 'Sambhal', test: 'CBC', time: '2 min ago' },
  { firstName: 'Priya', city: 'Chandausi', test: "Women's Package", time: '5 min ago' },
  { firstName: 'Amit', city: 'Bahjoi', test: 'Lipid Profile', time: '8 min ago' },
  { firstName: 'Sana', city: 'Sirsi', test: 'Thyroid Profile', time: '12 min ago' },
  { firstName: 'Vikas', city: 'Bilari', test: 'Full Body Checkup', time: '15 min ago' },
  { firstName: 'Neha', city: 'Sambhal', test: 'HbA1c', time: '18 min ago' },
  { firstName: 'Ravi', city: 'Chandausi', test: 'KFT', time: '22 min ago' },
  { firstName: 'Pooja', city: 'Moradabad', test: 'Vitamin D', time: '25 min ago' },
  { firstName: 'Deepak', city: 'Sambhal', test: 'Dengue Profile', time: '30 min ago' },
  { firstName: 'Anjali', city: 'Amroha', test: 'ANC Profile', time: '35 min ago' },
];

const SocialProofTicker = () => {
  const { language } = useLanguage();
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [bookings] = useState(() => {
    if (typeof window !== 'undefined' && window.__RECENT_BOOKINGS) {
      return window.__RECENT_BOOKINGS;
    }
    return BOOKING_EXAMPLES;
  });

  const advance = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % bookings.length);
      setVisible(true);
    }, 300);
  }, [bookings.length]);

  useEffect(() => {
    const id = setInterval(advance, 4000);
    return () => clearInterval(id);
  }, [advance]);

  if (!bookings.length) return null;

  const current = bookings[index];
  const liveLabel = language === 'hi' ? 'लाइव' : 'Live';

  return (
    <div style={styles.wrapper}>
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.75); }
        }
      `}</style>
      <div style={styles.container}>
        <div style={styles.badge}>
          <span style={styles.pulse} />
          <Zap size={10} style={styles.zapIcon} />
          <span style={styles.badgeText}>{liveLabel}</span>
        </div>
        <User size={14} style={styles.userIcon} />
        <div
          style={{
            ...styles.text,
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
        >
          <strong>{current.firstName}</strong> from <strong>{current.city}</strong> just booked{' '}
          <strong>{current.test}</strong>
          <span style={styles.time}>{current.time}</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    background: 'linear-gradient(90deg, #f0f9ff, #e0f2fe, #f0f9ff)',
    borderBottom: '1px solid #bae6fd',
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 16px',
    fontSize: '13px',
    color: '#1e40af',
    maxWidth: '100%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: '#15803d',
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '9999px',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.5px',
    flexShrink: 0,
  },
  pulse: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#86efac',
    display: 'inline-block',
    animation: 'pulse-dot 1.5s ease-in-out infinite',
  },
  zapIcon: {
    display: 'none',
  },
  badgeText: {
    lineHeight: 1,
  },
  userIcon: {
    flexShrink: 0,
    color: '#2563eb',
  },
  text: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  time: {
    color: '#6b7280',
    fontSize: '11px',
    marginLeft: '6px',
  },
};

export default SocialProofTicker;
