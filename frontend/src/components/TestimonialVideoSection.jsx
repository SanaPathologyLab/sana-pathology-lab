import { useState } from 'react';
import { Play, X, Star, MapPin, Quote, Video } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const TESTIMONIALS = [
  {
    id: 1,
    patientName: 'Rahul Sharma',
    patientNameHi: 'राहुल शर्मा',
    location: 'Sambhal',
    test: 'Full Body Checkup',
    testHi: 'पूर्ण शारीरिक जांच',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailBg: 'from-blue-400 to-purple-500',
  },
  {
    id: 2,
    patientName: 'Priya Patel',
    patientNameHi: 'प्रिया पटेल',
    location: 'Chandausi',
    test: 'Women Health Package',
    testHi: 'महिला स्वास्थ्य पैकेज',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailBg: 'from-pink-400 to-rose-500',
  },
  {
    id: 3,
    patientName: 'Amit Kumar',
    patientNameHi: 'अमित कुमार',
    location: 'Bahjoi',
    test: 'Diabetes Checkup',
    testHi: 'मधुमेह जांच',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailBg: 'from-emerald-400 to-teal-500',
  },
  {
    id: 4,
    patientName: 'Sana Begum',
    patientNameHi: 'सना बेगम',
    location: 'Sirsi',
    test: 'Thyroid Profile',
    testHi: 'थायराइड प्रोफाइल',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailBg: 'from-amber-400 to-orange-500',
  },
];

const VideoModal = ({ testimonial, onClose }) => {
  const { language } = useLanguage();

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <div
        className="relative w-full max-w-3xl bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-black/50 text-white/80 hover:bg-black/70 hover:text-white transition-all"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative aspect-video bg-black">
          <iframe
            src={testimonial.videoUrl + '?autoplay=1&rel=0'}
            title={testimonial.patientName}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="p-5 bg-white/95">
          <h3 className="text-lg font-bold text-gray-900">
            {language === 'hi' ? testimonial.patientNameHi : testimonial.patientName}
          </h3>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <span className="inline-flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="w-3.5 h-3.5" />
              {testimonial.location}
            </span>
            <span className="inline-flex items-center gap-1 text-sm text-gray-500">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              {language === 'hi' ? testimonial.testHi : testimonial.test}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const TestimonialVideoSection = () => {
  const { language, t } = useLanguage();
  const [selectedVideo, setSelectedVideo] = useState(null);

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Video className="w-4 h-4" />
            {t('patientTestimonials')}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            {language === 'hi' ? 'हमारे मरीज़ क्या कहते हैं' : 'What Our Patients Say'}
          </h2>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto text-sm md:text-base">
            {language === 'hi'
              ? 'सुनें कि हमारे मरीज़ हमारी सेवाओं और देखभाल के बारे में क्या कहते हैं'
              : 'Hear directly from our patients about their experience with our services and care'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          {TESTIMONIALS.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedVideo(item)}
              className="group relative rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 text-left focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <div
                className={`relative aspect-video bg-gradient-to-br ${item.thumbnailBg} flex items-center justify-center`}
              >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />

                <div className="relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/90 shadow-lg group-hover:scale-110 group-hover:bg-white transition-all duration-300">
                  <div className="absolute inset-0 rounded-full animate-ping bg-white/40 group-hover:animate-none" />
                  <Play className="w-7 h-7 md:w-8 md:h-8 text-primary fill-primary ml-0.5" />
                </div>

                <div className="absolute top-3 left-3">
                  <Quote className="w-5 h-5 text-white/50" />
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  {language === 'hi' ? item.patientNameHi : item.patientName}
                </h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {language === 'hi' ? item.testHi : item.test}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedVideo && (
        <VideoModal
          testimonial={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </section>
  );
};

export default TestimonialVideoSection;
