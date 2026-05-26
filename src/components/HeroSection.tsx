import React from 'react';

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

        <h1 className="font-serif font-black text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-none mb-6">
          Albab Islamic <br />
          <span className={isSpace ? 'text-gold' : 'text-crimson'}>University</span>
        </h1>

        <p className="font-serif italic text-xl sm:text-2xl lg:text-3xl text-stone-500 mb-6 font-medium">
          "Where tradition meets deep thought."
        </p>

        <p className="text-base md:text-lg leading-relaxed text-stone-600 dark:text-stone-300 max-w-2xl mx-auto mb-10 font-sans">
          A state-of-the-art virtual seminary mapping canonical texts alongside contemporary logic, clinical psychology, and critical philosophy of artificial intelligence.
        </p>

        <div className="flex flex-wrap gap-4 justify-center items-center">
          <button 
            onClick={onApplyNow}
            className={`text-xs font-bold tracking-widest uppercase py-3.5 px-10 rounded-sm transition-all duration-300 transform active:translate-y-px shadow-md hover:scale-105
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
            className={`text-xs font-bold tracking-widest uppercase py-3.5 px-10 rounded-sm border transition-all duration-300 hover:scale-105
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
