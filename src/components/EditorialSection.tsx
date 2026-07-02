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
      className="py-24 px-6 md:px-12 select-none border-b border-gold/25 relative overflow-hidden transition-all duration-700 bg-gradient-to-br from-[#052112] via-[#0B4628] to-[#031c0e] text-white shadow-[inset_0_4px_30px_rgba(0,0,0,0.5)] islamic-dark-green-section"
    >
      {/* Background Islamic Star pattern specifically for this green section */}
      <div className="absolute inset-0 opacity-[0.05] bg-repeat arabesque-grid pointer-events-none" />
      
      {/* Soft warm gold glow in the center */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gold/15 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        
        {/* Geometric Scholarly Dividers */}
        <div className="flex justify-center items-center gap-3 mb-10">
          <span className="w-3.5 h-3.5 rounded-xs transform rotate-12 bg-gold" />
          <span className="w-3.5 h-3.5 rounded-full bg-white/70" />
          <span className="w-3.5 h-3.5 border-2 transform rotate-45 border-gold-light" />
        </div>

        {/* Core Mission Statement in display markup */}
        <p className="font-serif italic text-xl sm:text-2xl lg:text-3xl leading-relaxed text-stone-100 mb-10 text-shadow-sm font-medium">
          "At Albab, our mission is to illuminate every facet of the Islamic tradition with clarity, depth, and accessibility, empowering our students to map the deen for the modern age."
        </p>

        {/* Central emblem / Shield logo */}
        <div className="my-14 relative flex justify-center">
          <div className="absolute w-36 h-36 rounded-full blur-2xl opacity-20 bg-gold" />
          <AlbabLogo className="h-40 w-40 relative filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)] transition-all duration-500 hover:scale-105 cursor-pointer" />
        </div>

        {/* Subsection with vertical transition indicator */}
        <div className="flex flex-col items-center mb-10">
          <h3 className="font-serif text-3xl font-black mb-6 tracking-tight text-gold-light">
            Mapping the Deen
          </h3>
          <div className="w-0.5 h-20 bg-gradient-to-b from-gold to-transparent" />
        </div>

        {/* Editorial Narrative */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-stone-200 leading-loose mb-12 font-sans text-center font-medium">
          Our institute blends time-honored Islamic sciences with contemporary thought and learning methods, making sacred knowledge relevant and transformative for today's intellectual climate. We cultivate critical thinkers who are grounded in revelation yet conversant with modern psychology, economic capitalism, and absolute technological ethics of deep thought.
        </p>

        <button 
          onClick={onFindMore}
          className="font-mono text-xs font-bold tracking-[0.3em] uppercase py-4 px-10 rounded-sm transition-all duration-300 border border-gold/40 text-gold-light hover:text-white bg-[#0B4628]/40 hover:bg-gold/15 hover:border-gold hover:shadow-[0_0_15px_rgba(232,184,109,0.2)] cursor-pointer"
        >
          Explore Sectors ↓
        </button>

        {/* STRATEGIC PARTNERS BADGE MATRIX */}
        <div id="partners" className="mt-28 border-t border-gold/20 pt-16 text-left">
          <span className="text-[10px] uppercase font-mono tracking-[0.3em] text-gold-light/80 block mb-8 text-center sm:text-left font-black">
            Our Strategic Partners
          </span>
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center sm:justify-start gap-12 sm:gap-24 opacity-85 hover:opacity-100 transition-opacity duration-300">
            {PARTNERS.map((partner, pid) => (
              <div 
                key={pid}
                className="flex items-center gap-3 group relative cursor-help"
                title={`${partner.name}: ${partner.description}`}
              >
                {renderShape(partner.shape)}
                <span className="font-serif text-xl font-bold tracking-wide transition-colors duration-300 text-stone-100 group-hover:text-gold-light">
                  {partner.name}
                </span>

                {/* Micro tooltip detail helper */}
                <div className="absolute top-full left-0 mt-2 p-3 text-[11px] rounded border w-48 shadow-lg max-h-0 opacity-0 overflow-hidden group-hover:max-h-28 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-30 font-sans leading-relaxed bg-[#052112] border-gold/30 text-stone-200">
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
