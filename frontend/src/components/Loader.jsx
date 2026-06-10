import React from 'react';

const Loader = ({ type = 'page', className = '', size = 'md' }) => {
  // Sizes mapping
  const sizeMap = {
    sm: 'w-5 h-5',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  if (type === 'button') {
    return (
      <div className={`flex items-center justify-center space-x-1 ${className}`}>
        <div className="w-1.5 h-1.5 bg-current rounded-full animate-[bounce_1s_infinite_0ms]"></div>
        <div className="w-1.5 h-1.5 bg-current rounded-full animate-[bounce_1s_infinite_200ms]"></div>
        <div className="w-1.5 h-1.5 bg-current rounded-full animate-[bounce_1s_infinite_400ms]"></div>
      </div>
    );
  }

  // Modern attractive glowing ring with pulse for page loader
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`relative ${currentSize}`}>
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#00488d] border-r-[#00a8e8] animate-spin"></div>
        {/* Inner reverse spinning ring */}
        <div className="absolute inset-1.5 rounded-full border-[3px] border-transparent border-b-[#e03a3c] border-l-[#7a28cb] animate-[spin_1.5s_linear_infinite_reverse]"></div>
        {/* Center glowing pulse */}
        <div className="absolute inset-3.5 bg-gradient-to-tr from-[#00488d] to-[#00a8e8] rounded-full blur-[2px] animate-pulse opacity-60"></div>
        <div className="absolute inset-3.5 bg-white rounded-full flex items-center justify-center shadow-inner">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00488d] animate-ping"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
