import { useLanguage } from '../context/LanguageContext';
import { Clock, Sun, Moon } from 'lucide-react';

const LiveAvailabilityIndicator = ({ className = '' }) => {
  const { t } = useLanguage();

  const now = new Date();
  const day = now.getDay();
  const totalMinutes = now.getHours() * 60 + now.getMinutes();

  const SEVEN_AM = 7 * 60;
  const ELEVEN_AM = 11 * 60;
  const EIGHT_AM = 8 * 60;
  const ONE_PM = 13 * 60;

  let status;

  if (day === 0) {
    if (totalMinutes < EIGHT_AM) {
      status = 'sundayPreOpen';
    } else if (totalMinutes < ONE_PM) {
      status = 'sundayOpen';
    } else {
      status = 'nextDay';
    }
  } else {
    if (totalMinutes < SEVEN_AM) {
      status = 'preOpen';
    } else if (totalMinutes < ELEVEN_AM) {
      status = 'available';
    } else {
      status = 'nextDay';
    }
  }

  const config = {
    available: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      pulse: true,
      Icon: Clock,
      label: `${t('slotsAvailableToday')} — ${t('bookBefore11')}`,
    },
    nextDay: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      pulse: false,
      Icon: Moon,
      label: t('nextAvailableTomorrow'),
    },
    preOpen: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      pulse: false,
      Icon: Sun,
      label: `${t('opensAt7Today')} — ${t('preBookNow')}`,
    },
    sundayPreOpen: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      pulse: false,
      Icon: Sun,
      label: t('opensAt8Today'),
    },
    sundayOpen: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      pulse: false,
      Icon: Clock,
      label: t('sundayTiming'),
    },
  };

  const { bg, border, text, pulse, Icon, label } = config[status];

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium ${bg} ${border} ${text} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inset-0 rounded-full bg-green-500 opacity-75 animate-ping" />
          <span className="relative rounded-full h-2 w-2 bg-green-500" />
        </span>
      )}
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </div>
  );
};

export default LiveAvailabilityIndicator;
