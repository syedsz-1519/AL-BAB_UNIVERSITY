import React from 'react';

interface AlbabLogoProps {
  className?: string;
  size?: number;
}

export default function AlbabLogo({ className = 'h-12 w-12', size }: AlbabLogoProps) {
  // We construct a high-fidelity SVG that represents the exact design uploaded by the user:
  // Circular emerald green and gold seal with crescent star, triple arch mihrab, central globe, open book, and elegant typography.
  
  return (
    <svg 
      viewBox="0 0 500 500" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} filter drop-shadow-md select-none`}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        {/* Luxurious Gold Gradients */}
        <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF2D4" />
          <stop offset="30%" stopColor="#D4AF37" />
          <stop offset="70%" stopColor="#AA7C11" />
          <stop offset="100%" stopColor="#F3E5AB" />
        </linearGradient>
        
        <linearGradient id="gold-light-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#AA7C11" />
          <stop offset="50%" stopColor="#F5D061" />
          <stop offset="100%" stopColor="#FDF5E6" />
        </linearGradient>

        {/* Deep Forest Green Leather/Matte Texture Gradient */}
        <radialGradient id="emerald-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0E3E26" />
          <stop offset="75%" stopColor="#062214" />
          <stop offset="100%" stopColor="#03140B" />
        </radialGradient>

        <linearGradient id="globe-land" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE094" />
          <stop offset="100%" stopColor="#AA7C11" />
        </linearGradient>

        {/* Drop shadow for text & arches */}
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* 1. Outer Embossed Gold Ring */}
      <circle cx="250" cy="250" r="236" fill="url(#gold-grad)" />
      
      {/* 2. Inner Deep Shadow Ring */}
      <circle cx="250" cy="250" r="230" fill="#03140B" />
      
      {/* 3. Main Emerald Green Textured Background */}
      <circle cx="250" cy="250" r="224" fill="url(#emerald-grad)" />

      {/* Decorative Beading (Tiny dots around outer circle for numismatic/seal feel) */}
      <circle cx="250" cy="250" r="218" stroke="url(#gold-light-grad)" strokeWidth="1" strokeDasharray="3 4" opacity="0.6" />

      {/* 4. Inside Gold Border Ring */}
      <circle cx="250" cy="250" r="212" stroke="url(#gold-grad)" strokeWidth="3" opacity="0.95" />

      {/* Group for elements with shadow to pop */}
      <g filter="url(#shadow)">
        
        {/* 5. Crescent and Star (Top) */}
        <path 
          d="M 250 56 A 16 16 0 1 0 274 81 A 13 13 0 1 1 250 56 Z" 
          fill="url(#gold-grad)" 
          transform="translate(-6, 12)" 
        />
        {/* Star */}
        <polygon 
          points="252,65 254,71 260,71 255,75 257,81 252,77 247,81 249,75 244,71 250,71" 
          fill="url(#gold-grad)" 
          transform="translate(-4, 11)" 
        />

        {/* 6. Triple-Nested Mihrab Arches (Gold lines) */}
        {/* Arch 1 (Outer) */}
        <path 
          d="M 175 260 L 175 180 C 175 130, 210 105, 250 105 C 290 105, 325 130, 325 180 L 325 260" 
          stroke="url(#gold-grad)" 
          strokeWidth="6" 
          strokeLinecap="round" 
          fill="none" 
        />
        {/* Arch 2 (Middle) */}
        <path 
          d="M 189 260 L 189 190 C 189 148, 215 124, 250 124 C 285 148, 311 124, 311 190 L 311 260" 
          stroke="url(#gold-grad)" 
          strokeWidth="4" 
          strokeLinecap="round" 
          fill="none" 
          transform="scale(0.94) translate(16, 16)" 
        />
        {/* Arch 3 (Inner) */}
        <path 
          d="M 203 260 L 203 200 C 203 166, 220 143, 250 143 C 280 143, 297 166, 297 200 L 297 260" 
          stroke="url(#gold-grad)" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          fill="none" 
          transform="scale(0.88) translate(34, 34)" 
        />

        {/* 7. Central Globe nestled inside arch */}
        <circle cx="250" cy="210" r="38" fill="#0E3E26" stroke="url(#gold-grad)" strokeWidth="3" />
        
        {/* World Continents vectors drawn beautifully in Gold inside the 38px radius circle */}
        <g opacity="0.95">
          {/* Clip path for globe content */}
          <clipPath id="globe-clip">
            <circle cx="250" cy="210" r="36.5" />
          </clipPath>
          
          <g clipPath="url(#globe-clip)">
            {/* Africa */}
            <path d="M 235 200 C 238 215, 230 225, 245 235 C 255 240, 260 225, 258 215 C 256 205, 245 205, 235 200 Z" fill="url(#globe-land)" />
            {/* Europe */}
            <path d="M 230 185 C 240 185, 242 195, 235 200 C 230 195, 228 190, 230 185 Z" fill="url(#globe-land)" />
            {/* Asia & Middle East */}
            <path d="M 245 190 C 260 180, 285 195, 280 215 C 275 225, 265 215, 255 210 C 245 208, 244 195, 245 190 Z" fill="url(#globe-land)" />
            {/* Lat/Long Grid overlay */}
            <ellipse cx="250" cy="210" rx="20" ry="36.5" stroke="url(#gold-light-grad)" strokeWidth="0.75" fill="none" opacity="0.4" />
            <ellipse cx="250" cy="210" rx="36.5" ry="12" stroke="url(#gold-light-grad)" strokeWidth="0.75" fill="none" opacity="0.4" />
          </g>
        </g>

        {/* 8. Open Book (Quran) underneath arch & globe */}
        {/* Left Page */}
        <path 
          d="M 250 285 Q 210 260 145 285 L 125 320 Q 195 295 250 320 Z" 
          fill="url(#gold-grad)" 
          stroke="#062214" 
          strokeWidth="1.5" 
        />
        {/* Left page lines (simulated text) */}
        <path d="M 155 292 Q 195 277 235 292 M 150 299 Q 195 284 240 299 M 145 306 Q 195 291 242 306" stroke="#0E3E26" strokeWidth="1.5" opacity="0.6" />

        {/* Right Page */}
        <path 
          d="M 250 285 Q 290 260 355 285 L 375 320 Q 305 295 250 320 Z" 
          fill="url(#gold-grad)" 
          stroke="#062214" 
          strokeWidth="1.5" 
        />
        {/* Right page lines (simulated text) */}
        <path d="M 265 292 Q 305 277 345 292 M 260 299 Q 305 284 350 299 M 258 306 Q 305 291 355 306" stroke="#0E3E26" strokeWidth="1.5" opacity="0.6" />

        {/* Center fold/spine marker */}
        <path d="M 250 280 L 250 324" stroke="#AA7C11" strokeWidth="3.5" strokeLinecap="round" />

        {/* 9. Typography "ALBAB" & "ISLAMIC UNIVERSITY" */}
        {/* ALBAB */}
        <text 
          x="250" 
          y="370" 
          fill="url(#gold-grad)" 
          fontSize="44" 
          fontWeight="bold" 
          fontFamily="Cormorant Garamond, Georgia, serif" 
          textAnchor="middle" 
          letterSpacing="11"
        >
          ALBAB
        </text>

        {/* ISLAMIC UNIVERSITY */}
        <text 
          x="250" 
          y="402" 
          fill="url(#gold-light-grad)" 
          fontSize="17.5" 
          fontWeight="bold" 
          fontFamily="Inter, ui-sans-serif, system-ui, sans-serif" 
          textAnchor="middle" 
          letterSpacing="5"
        >
          ISLAMIC UNIVERSITY
        </text>

        {/* 10. Bottom Geometric Ornament */}
        {/* Horizontal dividing lines with diamond terminal */}
        <line x1="130" y1="430" x2="210" y2="430" stroke="url(#gold-light-grad)" strokeWidth="1.5" />
        <polygon points="125,430 130,427 135,430 130,433" fill="url(#gold-light-grad)" />

        <line x1="290" y1="430" x2="370" y2="430" stroke="url(#gold-light-grad)" strokeWidth="1.5" />
        <polygon points="375,430 370,427 365,430 370,433" fill="url(#gold-light-grad)" />

        {/* Little gold diamonds on the lines */}
        <polygon points="200,430 204,426 208,430 204,434" fill="url(#gold-light-grad)" />
        <polygon points="300,430 296,426 292,430 296,434" fill="url(#gold-light-grad)" />

        {/* 8-pointed Islamic geometric star symbol at the very bottom center */}
        <g transform="translate(250, 430) scale(1.1)">
          {/* First square rotated */}
          <rect x="-8" y="-8" width="16" height="16" stroke="url(#gold-grad)" strokeWidth="1.5" fill="none" />
          <rect x="-8" y="-8" width="16" height="16" stroke="url(#gold-grad)" strokeWidth="1.5" fill="none" transform="rotate(45)" />
          {/* Inner bead */}
          <circle cx="0" cy="0" r="2.5" fill="url(#gold-light-grad)" />
        </g>

      </g>
    </svg>
  );
}
