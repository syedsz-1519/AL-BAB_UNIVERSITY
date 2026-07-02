import React from 'react';
import { Sparkles, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroSectionProps {
  currentTheme: 'parchment' | 'space';
  onApplyNow: () => void;
  mouseCoords?: { x: number; y: number };
}

export default function HeroSection({ currentTheme, onApplyNow, mouseCoords = { x: 0, y: 0 } }: HeroSectionProps) {
  const isSpace = currentTheme === 'space';

  // Destructure with default fallbacks
  const { x, y } = mouseCoords;

  return (
    <section 
      id="hero" 
      className={`relative pt-36 pb-24 flex flex-col justify-center items-center overflow-hidden transition-all duration-700 select-none min-h-[90vh] md:min-h-[92vh]
        ${isSpace 
          ? 'text-white' 
          : 'bg-gradient-to-b from-[#FAF8F5] via-[#E8F3EC]/40 to-[#FAF8F5] text-charcoal'
        }
      `}
      style={{
        background: isSpace 
          ? 'radial-gradient(ellipse at center, #021a0d 0%, #031008 50%, #000000 100%)' 
          : undefined
      }}
    >
      {/* LAYER 1: PARALLAX BACKGROUND WATERMARK ARABESQUE PATTERN */}
      <div 
        className={`absolute inset-0 opacity-[0.06] pointer-events-none bg-repeat arabesque-grid transition-transform duration-300 ease-out`}
        style={{
          transform: `translate(${x * 16}px, ${y * 16}px) scale(1.03)`,
        }}
      />

      {/* LAYER 2: PARALLAX AMBIENT GLOWING ORBS (GREEN & GOLD) */}
      <div 
        className="absolute inset-0 pointer-events-none overflow-hidden transition-transform duration-500 ease-out"
        style={{
          transform: `translate(${x * -20}px, ${y * -20}px)`,
        }}
      >
        {/* Deep Emerald Orb */}
        <div 
          className={`absolute -left-1/4 top-1/4 w-[450px] h-[450px] rounded-full blur-[140px] opacity-25 mix-blend-screen transition-colors duration-700
            ${isSpace ? 'bg-[#0B4628]' : 'bg-[#1b6b3e]/20'}
          `}
        />
        {/* Soft Gold Orb */}
        <div 
          className={`absolute -right-1/4 bottom-1/4 w-[400px] h-[400px] rounded-full blur-[130px] opacity-20 mix-blend-screen transition-colors duration-700
            ${isSpace ? 'bg-gold' : 'bg-[#eec584]/25'}
          `}
        />
      </div>

      {/* LAYER 3: PARALLAX FLOATING CELESTIAL STARS / GEOMETRIC PARTICLES */}
      <div 
        className="absolute inset-0 pointer-events-none overflow-hidden transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${x * -35}px, ${y * -35}px)`,
        }}
      >
        {/* Floating Islamic Geometric Accent Stars */}
        <div className="absolute top-1/3 left-10 md:left-24 w-4 h-4 opacity-25 text-gold animate-pulse">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12,0 15,9 24,12 15,15 12,24 9,15 0,12 9,9" />
          </svg>
        </div>
        <div className="absolute bottom-1/4 right-10 md:right-32 w-6 h-6 opacity-30 text-gold-light animate-spin" style={{ animationDuration: '20s' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="5" y="5" width="14" height="14" transform="rotate(45 12 12)" />
            <rect x="5" y="5" width="14" height="14" />
          </svg>
        </div>
        <div className="absolute top-1/4 right-1/4 w-3 h-3 opacity-20 text-[#0B4628] dark:text-[#E8B86D] animate-ping" style={{ animationDuration: '3s' }}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
      </div>

      {/* Decorative Top-Bottom Frame Arches for Academic Majesty */}
      <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-r from-gold via-[#0B4628] to-gold opacity-40" />
      <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      {/* Editorial Content Banner */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center flex flex-col items-center justify-center">
        
        {/* Floating Scholastic Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`inline-flex items-center gap-2 mb-8 px-4.5 py-2.5 rounded-full border text-[11px] font-mono tracking-[0.25em] uppercase font-black shadow-sm transition-all duration-500
            ${isSpace 
              ? 'border-gold/30 bg-[#021c0e] text-gold-light hover:border-gold' 
              : 'border-[#0B4628]/30 bg-[#0B4628]/5 text-[#0B4628] hover:bg-[#0B4628]/10'
            }
          `}
        >
          <GraduationCap className={`h-4.5 w-4.5 animate-pulse ${isSpace ? 'text-gold' : 'text-[#0B4628]'}`} />
          Albab Islamic University
        </motion.div>

        {/* Elegant established line */}
        <div className="inline-flex items-center gap-3 justify-center mb-6">
          <span className={`h-[1.5px] w-12 ${isSpace ? 'bg-gold/40' : 'bg-[#0B4628]/30'}`} />
          <span className={`text-[11px] font-black tracking-[0.35em] uppercase font-mono ${isSpace ? 'text-gold-light' : 'text-[#0B4628]'}`}>
            ESTABLISHED 2024
          </span>
          <span className={`h-[1.5px] w-12 ${isSpace ? 'bg-gold/40' : 'bg-[#0B4628]/30'}`} />
        </div>

        {/* Main Title with Emerald Green accents */}
        <motion.h1 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className={`font-serif font-black text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-none mb-6 drop-shadow-sm
            ${isSpace ? 'text-white' : 'text-[#04331A]'}
          `}
        >
          Albab Islamic <br />
          <span className={`relative inline-block mt-2 ${isSpace ? 'text-gold-light' : 'text-[#0B4628]'}`}>
            University
            {/* Elegant organic gold or green underline swoosh/trim */}
            <span className={`absolute bottom-0 left-0 w-full h-[3px] rounded-full
              ${isSpace ? 'bg-gradient-to-r from-transparent via-gold to-transparent' : 'bg-gradient-to-r from-transparent via-[#0B4628] to-transparent'}
            `} />
          </span>
        </motion.h1>

        {/* Traditional wisdom sub-heading */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className={`font-serif italic text-xl sm:text-2xl lg:text-3xl mb-8 font-medium
            ${isSpace ? 'text-gold/90 text-shadow-sm' : 'text-[#0B4628]/80'}
          `}
        >
          "Where tradition meets deep thought."
        </motion.p>

        {/* Detailed description */}
        <p className={`text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-12 font-sans font-medium transition-all duration-300
          ${isSpace ? 'text-stone-150' : 'text-stone-700'}
        `}>
          A state-of-the-art virtual seminary mapping canonical texts alongside contemporary logic, clinical psychology, and critical philosophy of artificial intelligence.
        </p>

        {/* Interactive action controls */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto justify-center items-center relative z-20">
          <button 
            onClick={onApplyNow}
            className={`w-full sm:w-auto text-center justify-center text-xs font-bold tracking-widest uppercase py-4 px-10 rounded-sm transition-all duration-300 transform active:translate-y-px shadow-lg hover:scale-105 cursor-pointer
              ${isSpace 
                ? 'bg-gold hover:bg-white text-[#031008] hover:shadow-gold/20 shadow-[0_4px_14px_rgba(196,163,90,0.35)]' 
                : 'bg-[#0B4628] hover:bg-stone-900 text-white shadow-[0_4px_14px_rgba(11,70,40,0.3)]'
              }
            `}
          >
            Enroll Online
          </button>

          <a 
            href="#scholarly" 
            className={`w-full sm:w-auto text-center justify-center text-xs font-bold tracking-widest uppercase py-4 px-10 rounded-sm border transition-all duration-300 hover:scale-105
              ${isSpace 
                ? 'border-gold/40 text-gold-light hover:bg-gold/10 hover:border-gold' 
                : 'border-[#0B4628]/40 text-[#0B4628] hover:bg-[#0B4628]/5 hover:border-[#0B4628]'
              }
            `}
          >
            Explore Sectors
          </a>
        </div>
      </div>
    </section>
  );
}
