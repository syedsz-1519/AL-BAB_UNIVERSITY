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
  const distance = Math.sqrt(x * x + y * y);

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
        className={`absolute inset-0 opacity-[0.12] pointer-events-none bg-repeat arabesque-grid transition-transform duration-300 ease-out`}
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

      {/* LAYER 4: DETAILED SVG-BASED ISLAMIC GEOMETRIC PATTERN MANDALA WITH OPACITY PULSE & SLOW ROTATION */}
      <motion.div
        className="absolute pointer-events-none select-none z-0"
        style={{
          width: '580px',
          height: '580px',
          top: '50%',
          left: '50%',
          x: '-50%',
          y: '-50%',
          transform: `translate(calc(-50% + ${x * -12}px), calc(-50% + ${y * -12}px))`,
        }}
        animate={{
          rotate: [0, 360],
          opacity: isSpace ? [0.07, 0.16, 0.07] : [0.06, 0.13, 0.06]
        }}
        transition={{
          rotate: {
            repeat: Infinity,
            duration: 150,
            ease: "linear"
          },
          opacity: {
            repeat: Infinity,
            duration: 10,
            ease: "easeInOut"
          }
        }}
      >
        <svg 
          viewBox="0 0 100 100" 
          className={`w-full h-full ${isSpace ? 'text-gold' : 'text-[#0B4628]'}`}
          fill="none" 
          stroke="currentColor" 
          strokeWidth="0.25"
        >
          {/* Detailed concentric configurations */}
          <circle cx="50" cy="50" r="48" strokeDasharray="1 1" />
          <circle cx="50" cy="50" r="44" />
          <circle cx="50" cy="50" r="36" strokeDasharray="1.5 1.5" />
          <circle cx="50" cy="50" r="28" />
          <circle cx="50" cy="50" r="12" />
          <polygon points="50,2 62,20 80,12 70,30 88,38 74,50 88,62 70,70 80,88 62,80 50,98 38,80 20,88 30,70 12,62 26,50 12,38 30,30 20,12 38,20" />
          <polygon points="50,10 59,25 75,20 66,34 80,41 68,50 80,59 66,66 75,80 59,75 50,90 41,75 25,80 34,66 20,59 32,50 20,41 34,34 25,20 41,25" />
          <path d="M50,2 L50,98 M2,50 L98,50 M16,16 L84,84 M16,84 L84,16" strokeDasharray="0.5 1" />
          <rect x="25" y="25" width="50" height="50" transform="rotate(15 50 50)" />
          <rect x="25" y="25" width="50" height="50" transform="rotate(30 50 50)" />
          <rect x="25" y="25" width="50" height="50" transform="rotate(45 50 50)" />
          <rect x="25" y="25" width="50" height="50" transform="rotate(60 50 50)" />
          <rect x="25" y="25" width="50" height="50" transform="rotate(75 50 50)" />
        </svg>
      </motion.div>

      {/* AL BAB (THE GATE OF KNOWLEDGE) 3D ANIMATED BACKGROUND EXPERIENCE */}
      <div 
        style={{ perspective: '2000px' }} 
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
      >
        {/* Glow of Sacred Knowledge (Positioned directly behind the doors - with dynamic depth of field blur) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: isSpace ? [0.35, 0.7, 0.35] : [0.25, 0.55, 0.25],
            scale: [0.95, 1.05, 0.95],
          }}
          style={{
            x: x * -55, // Parallax depth effect
            y: y * -55,
            filter: `blur(${40 + distance * 45}px)`, // Depth-of-field shift based on mouse distance
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`absolute w-[320px] sm:w-[480px] h-[320px] sm:h-[480px] rounded-full mix-blend-screen pointer-events-none
            ${isSpace ? 'bg-gradient-to-r from-gold/45 via-[#0B4628]/50 to-gold/45' : 'bg-gradient-to-r from-gold/30 via-[#1b6b3e]/35 to-gold/30'}
          `}
        />

        {/* Light Beam Shaft projecting outwards */}
        <motion.div 
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 0.12, scaleY: 1 }}
          style={{
            x: x * -35,
            y: y * -35,
            filter: `blur(${20 + distance * 15}px)`,
          }}
          transition={{ delay: 1.2, duration: 2 }}
          className="absolute w-[240px] sm:w-[360px] h-[600px] bg-gradient-to-b from-gold/30 to-transparent blur-xl origin-top rounded-b-full pointer-events-none"
        />

        {/* Floating knowledge glyphs/sparkles from the Gate */}
        <motion.div 
          style={{
            x: x * -20,
            y: y * -20,
          }}
          className="absolute w-[280px] sm:w-[400px] h-[400px] overflow-hidden pointer-events-none"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full ${isSpace ? 'bg-gold-light' : 'bg-[#0B4628]'}`}
              initial={{ 
                x: '50%', 
                y: '60%', 
                opacity: 0,
                scale: 0.2
              }}
              animate={{ 
                x: `${30 + Math.random() * 40}%`, 
                y: `${10 + Math.random() * 40}%`, 
                opacity: [0, 0.8, 0],
                scale: [0.2, 1.2, 0.2]
              }}
              transition={{
                duration: 4 + Math.random() * 5,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeOut"
              }}
              style={{
                left: '0px',
                top: '0px',
              }}
            />
          ))}
        </motion.div>

        {/* Animated doors removed to provide a cleaner, more focused, and non-distracting background atmosphere */}
      </div>

      {/* Decorative Top-Bottom Frame Arches for Academic Majesty */}
      <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-r from-gold via-[#0B4628] to-gold opacity-40" />
      <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      {/* Editorial Content Banner */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center flex flex-col items-center justify-center">

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
