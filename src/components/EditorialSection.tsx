import React from 'react';
import { PARTNERS } from '../data';
import AlbabLogo from './AlbabLogo';

interface EditorialSectionProps {
  currentTheme: 'parchment' | 'space';
  onFindMore: () => void;
}

export default function EditorialSection({ currentTheme, onFindMore }: EditorialSectionProps) {
  const isSpace = currentTheme === 'space';

  // Helper to render partner shape vectors
  const renderShape = (shape: 'square' | 'circle' | 'triangle') => {
    const isSpace = currentTheme === 'space';
    const colorClass = isSpace ? 'fill-gold stroke-gold-light' : 'fill-crimson stroke-crimson-light';

    switch (shape) {
      case 'square':
        return (
          <svg className="w-5 h-5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="1" className={colorClass} fillOpacity="0.15" />
          </svg>
        );
      case 'circle':
        return (
          <svg className="w-5 h-5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" className={colorClass} fillOpacity="0.15" />
          </svg>
        );
      case 'triangle':
        return (
          <svg className="w-5 h-5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12,3 21,20 3,20" className={colorClass} fillOpacity="0.15" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <section 
      id="scholarly"
      className={`py-24 px-6 md:px-12 select-none border-b transition-colors duration-700
        ${isSpace 
          ? 'bg-space border-gold/15 text-white' 
          : 'bg-[#FAF8F5] border-crimson/10 text-charcoal'
        }
      `}
    >
      <div className="max-w-4xl mx-auto text-center">
        
        {/* Geometric Scholarly Dividers */}
        <div className="flex justify-center items-center gap-3 mb-10">
          <span className={`w-3.5 h-3.5 rounded-xs transform rotate-12 ${isSpace ? 'bg-gold' : 'bg-crimson'}`} />
          <span className={`w-3.5 h-3.5 rounded-full ${isSpace ? 'bg-white/70' : 'bg-charcoal'}`} />
          <span className={`w-3.5 h-3.5 border-2 transform rotate-45 ${isSpace ? 'border-gold-light' : 'border-charcoal'}`} />
        </div>

        {/* Core Mission Statement in display markup */}
        <p className="font-serif italic text-xl sm:text-2xl lg:text-3xl leading-relaxed text-stone-600 dark:text-stone-300 mb-10">
          "At Albab, our mission is to illuminate every facet of the Islamic tradition with clarity, depth, and accessibility, empowering our students to map the deen for the modern age."
        </p>

        {/* Central emblem / Shield logo */}
        <div className="my-14 relative flex justify-center">
          <div className={`absolute w-36 h-36 rounded-full blur-2xl opacity-15 ${isSpace ? 'bg-gold' : 'bg-[#0B4628]'}`} />
          <AlbabLogo className="h-40 w-40 relative filter drop-shadow-xl transition-all duration-500 hover:scale-110 cursor-pointer" />
        </div>

        {/* Subsection with vertical transition indicator */}
        <div className="flex flex-col items-center mb-10">
          <h3 className={`font-serif text-3xl font-bold mb-6 tracking-tight ${isSpace ? 'text-gold-light' : 'text-crimson'}`}>
            Mapping the Deen
          </h3>
          <div className={`w-0.5 h-20 bg-gradient-to-b ${isSpace ? 'from-gold to-transparent' : 'from-crimson to-transparent'}`} />
        </div>

        {/* Editorial Narrative */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-stone-500 dark:text-stone-400 leading-loose mb-12 font-sans text-center">
          Our institute blends time-honored Islamic sciences with contemporary thought and learning methods, making sacred knowledge relevant and transformative for today's intellectual climate. We cultivate critical thinkers who are grounded in revelation yet conversant with modern psychology, economic capitalism, and absolute technological ethics of deep thought.
        </p>

        <button 
          onClick={onFindMore}
          className={`font-mono text-xs font-bold tracking-[0.3em] uppercase py-4 px-10 rounded-sm transition-all duration-300 border shadow-sm
            ${isSpace 
              ? 'bg-space border-gold/30 hover:border-gold text-gold-gold hover:bg-gold/10 hover:shadow-gold/10' 
              : 'bg-charcoal border-charcoal hover:bg-crimson hover:border-crimson text-white hover:shadow-crimson/10'
            }
          `}
        >
          Explore Sectors ↓
        </button>

        {/* STRATEGIC PARTNERS BADGE MATRIX */}
        <div id="partners" className="mt-28 border-t border-stone-200/10 pt-16 text-left">
          <span className="text-[10px] uppercase font-mono tracking-[0.3em] text-stone-400 dark:text-stone-500 block mb-8 text-center sm:text-left">
            Our Strategic Partners
          </span>
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center sm:justify-start gap-12 sm:gap-24 opacity-75 hover:opacity-100 transition-opacity duration-300">
            {PARTNERS.map((partner, pid) => (
              <div 
                key={pid}
                className="flex items-center gap-3 group relative cursor-help"
                title={`${partner.name}: ${partner.description}`}
              >
                {renderShape(partner.shape)}
                <span className={`font-serif text-xl font-bold tracking-wide transition-colors duration-300
                  ${isSpace ? 'text-stone-300 group-hover:text-gold' : 'text-stone-700 group-hover:text-crimson'}
                `}>
                  {partner.name}
                </span>

                {/* Micro tooltip detail helper */}
                <div className={`absolute top-full left-0 mt-2 p-3 text-[11px] rounded border w-48 shadow-lg max-h-0 opacity-0 overflow-hidden group-hover:max-h-24 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-30 font-sans leading-relaxed
                  ${isSpace 
                    ? 'bg-space border-gold/20 text-stone-300' 
                    : 'bg-white border-crimson/15 text-stone-600'
                  }
                `}>
                  {partner.description}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
