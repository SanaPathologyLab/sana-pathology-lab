import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, User, Truck, Droplets, Microscope, FileText, Phone, ArrowLeft, MapPin, Calendar } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const STAGES = [
  { key: 'booking_confirmed', icon: CheckCircle2, labelKey: 'step1Title', defaultLabel: 'Booking Confirmed' },
  { key: 'phlebotomist_assigned', icon: User, labelKey: 'phlebotomist_assigned', defaultLabel: 'Phlebotomist Assigned' },
  { key: 'on_the_way', icon: Truck, labelKey: 'on_the_way', defaultLabel: 'On the Way' },
  { key: 'sample_collected', icon: Droplets, labelKey: 'sampleCollected', defaultLabel: 'Sample Collected' },
  { key: 'processing', icon: Microscope, labelKey: 'processing', defaultLabel: 'Processing' },
  { key: 'report_ready', icon: FileText, labelKey: 'reportReady', defaultLabel: 'Report Ready' },
];

const STATUS_ORDER = {
  booking_confirmed: 0,
  phlebotomist_assigned: 1,
  on_the_way: 2,
  sample_collected: 3,
  processing: 4,
  report_ready: 5,
};

const DEFAULT_LABELS = {
  booking_confirmed: 'Booking Confirmed',
  phlebotomist_assigned: 'Phlebotomist Assigned',
  on_the_way: 'On the Way',
  sample_collected: 'Sample Collected',
  processing: 'Processing',
  report_ready: 'Report Ready',
};

function formatDateTime(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const TrackPhlebotomist = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const winData = window.__PHLEBOTOMIST_TRACKING;
    if (winData && winData.bookingId === bookingId) {
      setData(winData);
      setLoading(false);
      return;
    }
    try {
      const stored = localStorage.getItem(`sana_tracking_${bookingId}`);
      if (stored) {
        setData(JSON.parse(stored));
        setLoading(false);
        return;
      }
    } catch {}
    setLoading(false);
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-emerald-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-emerald-50 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('trackingNotFound') || 'Tracking Not Found'}</h2>
          <p className="text-gray-500 mb-6">
            {t('trackingNotFoundDesc') || 'No tracking information found for this booking. Please contact the lab directly for assistance.'}
          </p>
          <a
            href="https://wa.me/919876543210?text=Hi, I need help tracking my booking"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <Phone className="w-5 h-5" />
            {t('contactLab') || 'Contact Lab'}
          </a>
        </div>
      </div>
    );
  }

  const currentStatusIdx = STATUS_ORDER[data.status] ?? -1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('back') || 'Back'}</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('trackPhlebotomist') || 'Track Phlebotomist'}</h1>
              <p className="text-sm text-gray-500 mt-1">{t('trackingRefId') || 'Booking ID'}: <span className="font-mono font-semibold text-gray-700">{data.bookingId}</span></p>
            </div>
            <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold uppercase">
              {DEFAULT_LABELS[data.status] || data.status}
            </div>
          </div>

          {data.patientName && (
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <User className="w-4 h-4" />
              <span>{data.patientName}</span>
            </div>
          )}
          {data.address && (
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{data.address}</span>
            </div>
          )}
          {data.testName && (
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Droplets className="w-4 h-4" />
              <span>{data.testName}</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('statusTimeline') || 'Status Timeline'}</h2>
          <div className="space-y-0">
            {STAGES.map((stage, idx) => {
              const stageData = data.stages?.[stage.key];
              const isCompleted = currentStatusIdx >= idx;
              const isActive = currentStatusIdx === idx;
              const isFuture = currentStatusIdx < idx;
              const Icon = stage.icon;

              let lineClass = '';
              if (idx < STAGES.length - 1) {
                if (isCompleted && currentStatusIdx > idx) {
                  lineClass = 'bg-emerald-500';
                } else if (isActive || (isCompleted && currentStatusIdx === idx)) {
                  lineClass = 'bg-emerald-500';
                } else {
                  lineClass = 'bg-gray-200';
                }
              }

              return (
                <div key={stage.key} className="relative flex gap-4 pb-8 last:pb-0">
                  {idx < STAGES.length - 1 && (
                    <div className={`absolute left-[18px] top-10 w-0.5 h-[calc(100%-8px)] ${lineClass}`} />
                  )}
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200'
                          : isActive
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      {isCompleted && !isActive ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <h3
                      className={`font-semibold text-sm ${
                        isActive
                          ? 'text-emerald-700'
                          : isCompleted
                          ? 'text-emerald-600'
                          : 'text-gray-400'
                      }`}
                    >
                      {DEFAULT_LABELS[stage.key]}
                    </h3>
                    {stageData?.description && (
                      <p className={`text-xs mt-0.5 ${isFuture ? 'text-gray-300' : 'text-gray-500'}`}>
                        {stageData.description}
                      </p>
                    )}
                    {stageData?.date && (
                      <div className={`flex items-center gap-1.5 mt-1 text-xs ${isFuture ? 'text-gray-200' : 'text-gray-400'}`}>
                        <Calendar className="w-3 h-3" />
                        {formatDateTime(stageData.date)}
                      </div>
                    )}
                    {stageData?.name && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {t('phlebotomistName') || 'Phlebotomist'}: <span className="font-medium">{stageData.name}</span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <a
            href="https://wa.me/919876543210?text=Hi, I have a query regarding my booking"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <Phone className="w-5 h-5" />
            {t('contactLab') || 'Contact Lab'}
          </a>
        </div>
      </div>
    </div>
  );
};

export default TrackPhlebotomist;
