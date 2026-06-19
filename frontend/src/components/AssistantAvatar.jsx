import React from 'react';

const AssistantAvatar = ({ size = 48, isSpeaking = false }) => (
  <div
    className="relative"
    style={{ width: size, height: size }}
  >
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Glow effect */}
      <defs>
        <radialGradient id="faceGlow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fff5f0" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#fff5f0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#667eea" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#764ba2" stopOpacity="0.05" />
        </radialGradient>
        <linearGradient id="hairGrad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#2d1b14" />
          <stop offset="100%" stopColor="#4a2c24" />
        </linearGradient>
        <linearGradient id="coatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a5a8c" />
          <stop offset="50%" stopColor="#1e6fa0" />
          <stop offset="100%" stopColor="#1a5a8c" />
        </linearGradient>
        <linearGradient id="stethGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c0c0c0" />
          <stop offset="50%" stopColor="#e8e8e8" />
          <stop offset="100%" stopColor="#a0a0a0" />
        </linearGradient>
        <filter id="shadow1" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
        </filter>
        <filter id="innerGlow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
          <feOffset dx="0" dy="0" />
          <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feFlood floodColor="#ffffff" floodOpacity="0.3" />
          <feComposite operator="in" in2="SourceGraphic" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background circle with gradient */}
      <circle cx="100" cy="100" r="98" fill="url(#bgGlow)" />
      <circle cx="100" cy="100" r="96" fill="white" stroke="url(#coatGrad)" strokeWidth="2.5" filter="url(#shadow1)" />

      {/* Hair - back */}
      <ellipse cx="100" cy="95" rx="45" ry="52" fill="url(#hairGrad)" />

      {/* Hair sides */}
      <ellipse cx="62" cy="100" rx="14" ry="42" fill="url(#hairGrad)" />
      <ellipse cx="138" cy="100" rx="14" ry="42" fill="url(#hairGrad)" />

      {/* Face */}
      <ellipse cx="100" cy="104" rx="34" ry="38" fill="#fce8d6" />

      {/* Blush */}
      <ellipse cx="78" cy="112" rx="8" ry="4" fill="#f5c6b0" opacity="0.4" />
      <ellipse cx="122" cy="112" rx="8" ry="4" fill="#f5c6b0" opacity="0.4" />

      {/* Eyes - more expressive */}
      <g>
        {/* Left eye white */}
        <ellipse cx="86" cy="100" rx="7" ry="6" fill="white" />
        {/* Left iris */}
        <ellipse cx="87" cy="100" rx="4.5" ry="4.5" fill="#2c3e50" />
        {/* Left pupil */}
        <circle cx="87.5" cy="99.5" r="2.5" fill="#1a1a2e" />
        {/* Left highlight */}
        <circle cx="85" cy="98" r="1.8" fill="white" opacity="0.9" />
        {/* Left small highlight */}
        <circle cx="88.5" cy="101.5" r="0.8" fill="white" opacity="0.5" />

        {/* Right eye white */}
        <ellipse cx="114" cy="100" rx="7" ry="6" fill="white" />
        {/* Right iris */}
        <ellipse cx="113" cy="100" rx="4.5" ry="4.5" fill="#2c3e50" />
        {/* Right pupil */}
        <circle cx="112.5" cy="99.5" r="2.5" fill="#1a1a2e" />
        {/* Right highlight */}
        <circle cx="110" cy="98" r="1.8" fill="white" opacity="0.9" />
        {/* Right small highlight */}
        <circle cx="113.5" cy="101.5" r="0.8" fill="white" opacity="0.5" />
      </g>

      {/* Eyebrows */}
      <path d="M78 92 Q86 88 94 91" stroke="#4a2c24" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M106 91 Q114 88 122 92" stroke="#4a2c24" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* Eyelashes upper */}
      <path d="M79 96 L78 94" stroke="#2c1810" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M81 95 L80 93" stroke="#2c1810" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M119 96 L120 94" stroke="#2c1810" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M117 95 L118 93" stroke="#2c1810" strokeWidth="0.8" strokeLinecap="round" />

      {/* Nose */}
      <path d="M98 104 Q100 110 102 104" stroke="#d4a88a" strokeWidth="0.8" fill="none" strokeLinecap="round" />

      {/* Subtle nose shadow */}
      <ellipse cx="100" cy="107" rx="5" ry="2" fill="#d4a88a" opacity="0.15" />

      {/* Smile */}
      <path d="M88 116 Q93 122 100 123 Q107 122 112 116" stroke="#c48773" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M88 116 Q93 120 100 121 Q107 120 112 116" stroke="#e8a090" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* Lab coat collar */}
      <path d="M68 138 Q75 132 82 138 Q88 145 82 154 L75 156 Z" fill="url(#coatGrad)" opacity="0.9" />
      <path d="M132 138 Q125 132 118 138 Q112 145 118 154 L125 156 Z" fill="url(#coatGrad)" opacity="0.9" />

      {/* Lab coat body */}
      <path d="M68 138 Q66 155 66 180 Q66 195 70 200 L130 200 Q134 195 134 180 Q134 155 132 138" fill="url(#coatGrad)" opacity="0.85" />

      {/* Stethoscope */}
      <path
        d="M100 135 Q100 128 105 126 Q110 124 112 128 Q114 132 110 136"
        stroke="url(#stethGrad)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Stethoscope earpieces */}
      <path d="M95 128 Q90 125 88 130" stroke="#c0c0c0" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M107 128 Q112 125 114 130" stroke="#c0c0c0" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Stethoscope chestpiece */}
      <circle cx="110" cy="140" r="4" stroke="#c0c0c0" strokeWidth="1.5" fill="#e8e8e8" />
      <circle cx="110" cy="140" r="1.5" fill="#a0a0a0" />

      {/* Hair - front fringe */}
      <path d="M60 82 Q65 60 80 55 Q95 50 100 52 Q105 50 120 55 Q135 60 140 82" fill="url(#hairGrad)" />
      <path d="M65 80 Q72 62 85 57 Q98 53 100 54" fill="url(#hairGrad)" />
      <path d="M100 54 Q102 53 115 57 Q128 62 135 80" fill="url(#hairGrad)" />

      {/* Hair strands */}
      <path d="M68 78 Q72 58 82 53" stroke="#3d231c" strokeWidth="0.8" fill="none" opacity="0.3" />
      <path d="M82 55 Q88 52 95 51" stroke="#3d231c" strokeWidth="0.8" fill="none" opacity="0.3" />
      <path d="M105 51 Q112 52 118 55" stroke="#3d231c" strokeWidth="0.8" fill="none" opacity="0.3" />
      <path d="M125 58 Q130 62 134 72" stroke="#3d231c" strokeWidth="0.8" fill="none" opacity="0.3" />

      {/* Name badge */}
      <rect x="88" y="168" width="24" height="8" rx="1.5" fill="white" stroke="#c0c0c0" strokeWidth="0.5" />
      <text x="100" y="174" textAnchor="middle" fontSize="5" fill="#1a5a8c" fontWeight="bold" fontFamily="sans-serif">
        SANA
      </text>

      {/* Face glow overlay */}
      <ellipse cx="100" cy="104" rx="34" ry="38" fill="url(#faceGlow)" />

      {/* Speaking animation rings */}
      {isSpeaking && (
        <>
          <circle cx="100" cy="100" r="80" stroke="#667eea" strokeWidth="0.5" fill="none" opacity="0.3">
            <animate attributeName="r" values="80;85;80" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.1;0.3" dur="1.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="100" cy="100" r="80" stroke="#764ba2" strokeWidth="0.5" fill="none" opacity="0.2">
            <animate attributeName="r" values="80;90;80" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0.05;0.2" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </>
      )}
    </svg>
  </div>
);

export default AssistantAvatar;
