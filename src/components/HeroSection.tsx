import React from 'react';
import { Sparkles } from 'lucide-react';

interface HeroSectionProps {
  currentTheme: 'parchment' | 'space';
  onApplyNow: () => void;
}

export default function HeroSection({ currentTheme, onApplyNow }: HeroSectionProps) {
  const isSpace = currentTheme === 'space';

  return (
    <section 
      id="hero" 
      className={`relative pt-32 pb-16 flex flex-col justify-center items-center overflow-hidden transition-all duration-700 select-none
        ${isSpace 
          ? 'text-white' 
          : 'bg-gradient-to-b from-[#FAF8F5] via-[#F4EFE6] to-[#FAF8F5] text-charcoal'
        }
      `}
      style={{
        background: isSpace ? 'radial-gradient(ellipse at center, #060D1F 0%, #020509 70%, #000000 100%)' : undefined
      }}
    >
      {/* Editorial Banner */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 justify-center mb-6">
          <span className={`h-[1px] w-8 ${isSpace ? 'bg-gold' : 'bg-crimson'}`} />
          <span className={`text-xs font-bold tracking-[0.3em] uppercase font-mono ${isSpace ? 'text-gold-light' : 'text-crimson'}`}>
            ESTABLISHED 2024
          </span>
          <span className={`h-[1px] w-8 ${isSpace ? 'bg-gold' : 'bg-crimson'}`} />
        </div>

        <h1 className={`font-serif font-black text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-none mb-6
          ${isSpace ? 'text-white' : 'text-[#0B4628]'}
        `}>
          Albab Islamic <br />
          <span className={isSpace ? 'text-gold-light' : 'text-[#0B4628]'}>University</span>
        </h1>

        <p className={`font-serif italic text-xl sm:text-2xl lg:text-3xl mb-6 font-medium
          ${isSpace ? 'text-gold/90' : 'text-stone-500'}
        `}>
          "Where tradition meets deep thought."
        </p>

        <p className={`text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-10 font-sans
          ${isSpace ? 'text-stone-200' : 'text-stone-600'}
        `}>
          A state-of-the-art virtual seminary mapping canonical texts alongside contemporary logic, clinical psychology, and critical philosophy of artificial intelligence.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto justify-center items-center">
          <button 
            onClick={onApplyNow}
            className={`w-full sm:w-auto text-center justify-center text-xs font-bold tracking-widest uppercase py-3.5 px-8 rounded-sm transition-all duration-300 transform active:translate-y-px shadow-md hover:scale-105 cursor-pointer
              ${isSpace 
                ? 'bg-gold hover:bg-white text-space hover:text-space shadow-gold/20' 
                : 'bg-crimson hover:bg-black text-white shadow-crimson/20'
              }
            `}
          >
            Enroll Online
          </button>

          <a 
            href="#scholarly" 
            className={`w-full sm:w-auto text-center justify-center text-xs font-bold tracking-widest uppercase py-3.5 px-8 rounded-sm border transition-all duration-300 hover:scale-105
              ${isSpace 
                ? 'border-gold/40 text-gold-light hover:bg-gold/10' 
                : 'border-crimson/30 text-crimson hover:bg-crimson/5'
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
