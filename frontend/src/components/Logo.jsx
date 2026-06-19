import React from 'react';

const Logo = ({ className = 'w-10 h-10', style = {} }) => (
  <svg
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <defs>
      {/* Right wing – vivid scarlet → deep violet */}
      <linearGradient id="logoGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#ff2a2a" stopOpacity="1" />
        <stop offset="45%"  stopColor="#d91e6e" stopOpacity="1" />
        <stop offset="100%" stopColor="#7b15d9" stopOpacity="1" />
      </linearGradient>
      {/* Left wing – electric cyan → deep navy */}
      <linearGradient id="logoGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#00d9ff" stopOpacity="1" />
        <stop offset="100%" stopColor="#0044b3" stopOpacity="1" />
      </linearGradient>
      {/* Radial glow overlay for depth */}
      <radialGradient id="logoGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.22" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0"    />
      </radialGradient>
    </defs>

    {/* Right wing */}
    <path
      d="M50,10 C75,10 90,30 90,50 C90,75 70,90 50,90 C50,90 80,80 80,50 C80,25 50,20 50,20 Z"
      fill="url(#logoGradRight)"
    />
    {/* Left wing */}
    <path
      d="M50,90 C25,90 10,70 10,50 C10,25 30,10 50,10 C50,10 20,20 20,50 C20,75 50,80 50,80 Z"
      fill="url(#logoGradLeft)"
    />
    {/* Glow overlay */}
    <circle cx="50" cy="50" r="42" fill="url(#logoGlow)" />

    {/* Pathology instrument icon – dark navy so it pops on both wings */}
    <g transform="translate(30,30) scale(0.4)" fill="#002f70">
      <path d="M48.2,35.6l-3.3-3.3L37.1,40c-0.2,0.2-0.5,0.4-0.8,0.5c0,0-2.8,0.7-3.9-0.4L25,32.8
        c-1.1-1.1-0.4-3.9-0.4-3.9c0.1-0.3,0.3-0.6,0.5-0.8l7.8-7.8l-3.3-3.3c-1.1-1.1-2.8-1.1-3.9,0
        L9.4,33.3c-1.1,1.1-1.1,2.8,0,3.9l3.3,3.3l-2.4,2.4C7.9,45.3,6.5,49,6.5,52.4
        c0,3.4,1.4,7.1,3.8,9.5l1.6,1.6c0.5,0.5,1.2,0.8,1.9,0.8h30.6c0.7,0,1.4-0.3,1.9-0.8l5.2-5.2
        C52.5,57.3,52.5,55.7,51.5,54.6z M27.8,30l6.2,6.2l-6,6l-6.2-6.2L27.8,30z
        M44.6,60H13.8c-0.4,0-0.7-0.1-1-0.4l-1.6-1.6c-2.1-2.1-3.1-4.8-3.1-7.5
        c0-2.8,1.1-5.5,3.1-7.5l0.8-0.8l11.4,11.4c1.1,1.1,2.8,1.1,3.9,0l6.2-6.2
        c0.5-0.5,0.8-1.2,0.8-1.9c0-0.7-0.3-1.4-0.8-1.9L22,12.2l5.8-5.8c0.4-0.4,1-0.4,1.4,0
        l3.3,3.3l15.7-15.7c0.4-0.4,1-0.4,1.4,0l6.6,6.6c0.4,0.4,0.4,1,0,1.4
        L40.5,17.7l3.3,3.3c0.4,0.4,0.4,1,0,1.4l-1.1,1.1c5.9-0.8,12,0.7,16.7,4.3
        l3.6-3.6c0.5-0.5,1.4-0.5,1.9,0l3.6,3.6c0.5,0.5,0.5,1.4,0,1.9l-3.6,3.6
        c-4.4,4.4-11,5.3-16.1,2.7l-4.5,4.5l1.8,1.8C45.6,58.7,45.6,59.5,44.6,60z" />
      <path d="M78.6,80H21.4C19,80,17,82,17,84.4v7.2C17,94,19,96,21.4,96h57.2
        C81,96,83,94,83,91.6v-7.2C83,82,81,80,78.6,80z" />
      <path d="M57.6,76H42.4c-2.4,0-4.4-2-4.4-4.4V56c0-2.4,2-4.4,4.4-4.4h15.2
        c2.4,0,4.4,2,4.4,4.4v15.6C62,74,60,76,57.6,76z" />
    </g>
  </svg>
);

export default Logo;
