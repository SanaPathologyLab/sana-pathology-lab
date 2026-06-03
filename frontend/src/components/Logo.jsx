import React from 'react';

const Logo = ({ className = "w-10 h-10" }) => {
  return (
    <img src="/app-icon.png" className={className} alt="Sana Pathology Lab Logo" />
  );
};

export default Logo;
