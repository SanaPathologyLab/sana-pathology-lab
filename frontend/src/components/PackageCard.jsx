import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, User, HeartPulse, Activity, Award } from 'lucide-react';

const imageMap = {
  'family': '/assets/packages/family.png',
  'couple': '/assets/packages/couple.png',
  'family-large': '/assets/packages/family-large.png',
  'family-extended': '/assets/packages/family-extended.png',
  'group': '/assets/packages/group.png',
  'female': '/assets/packages/female.png',
  'female-professional': '/assets/packages/female-professional.png',
  'couple-active': '/assets/packages/couple-active.png'
};

const defaultImage = '/assets/packages/family.png';

const iconMap = {
  'family': { Icon: Users, color: 'from-blue-500 to-cyan-500' },
  'couple': { Icon: HeartPulse, color: 'from-rose-400 to-pink-500' },
  'family-large': { Icon: Users, color: 'from-emerald-500 to-teal-500' },
  'family-extended': { Icon: Users, color: 'from-violet-500 to-purple-500' },
  'group': { Icon: Users, color: 'from-amber-500 to-orange-500' },
  'female': { Icon: User, color: 'from-fuchsia-500 to-purple-500' },
  'female-professional': { Icon: Award, color: 'from-indigo-500 to-blue-500' },
  'couple-active': { Icon: Activity, color: 'from-orange-500 to-red-500' }
};

const defaultIcon = { Icon: Award, color: 'from-slate-400 to-slate-500' };

const PackageCard = ({ pkg, onAdd, isAdded, onWhatsApp, onKnowMore, onBookNow }) => {
  const navigate = useNavigate();
  const [imageFailed, setImageFailed] = React.useState(false);

  const imageUrl = imageMap[pkg.imageType] || defaultImage;
  const iconConfig = iconMap[pkg.imageType] || defaultIcon;
  const Icon = iconConfig.Icon;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      
      {/* Header Image/Icon Area */}
      {imageFailed ? (
        <div className={`relative h-44 w-full overflow-hidden bg-gradient-to-br ${iconConfig.color} flex items-center justify-center`}>
          <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
          <Icon className="w-20 h-20 text-white/90 drop-shadow-md relative z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-white/90 via-transparent to-transparent z-20"></div>
        </div>
      ) : (
        <div className="relative h-44 bg-slate-50 w-full overflow-hidden">
          <img 
            src={imageUrl} 
            alt={pkg.name} 
            className="w-full h-full object-cover mix-blend-multiply opacity-90 transition-opacity duration-500"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
          <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-white/90 via-transparent to-transparent z-20"></div>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col">
        {/* Title & Subtitle */}
        <h3 className="font-bold text-slate-900 text-[15px] leading-snug tracking-tight mb-1 uppercase">
          {pkg.name}
        </h3>
        <p className="text-[13px] text-slate-500 mb-4">
          {pkg.parameterCount} Parameters Included
        </p>

        {/* Pricing Dotted Box */}
        <div className="border-[1.5px] border-dashed border-slate-300 rounded-lg p-3 flex items-center gap-3 mb-5">
          <span className="text-red-500 font-medium text-sm line-through decoration-red-500/50">
            ₹{pkg.originalPrice}
          </span>
          <span className="text-black font-extrabold text-lg">
            ₹{pkg.price}
          </span>
          <span className="bg-[#FFD700] text-black text-[11px] font-bold px-2.5 py-0.5 rounded ml-auto">
            {pkg.discount}
          </span>
        </div>

        <div className="mt-auto"></div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-1">
          <button
            onClick={() => {
              if (onKnowMore) {
                onKnowMore(pkg);
              } else {
                navigate(`/health-packages`);
                window.scrollTo(0, 0);
              }
            }}
            className="flex-1 bg-[#FFD700] hover:bg-[#F2C800] text-black py-2.5 rounded-full font-bold text-sm transition-colors text-center"
          >
            Know More
          </button>
          
          <button
            onClick={() => {
              if (onBookNow) {
                onBookNow(pkg);
              } else if (onAdd) {
                onAdd(pkg);
              } else if (onWhatsApp) {
                onWhatsApp(`Hi, I want to book ${pkg.name} for ₹${pkg.price}`);
              } else {
                 navigate(`/health-packages`);
              }
            }}
            className={`flex-1 py-2.5 rounded-full font-bold text-sm transition-colors text-center ${
              isAdded 
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {isAdded ? 'Added ✓' : 'Book Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;
