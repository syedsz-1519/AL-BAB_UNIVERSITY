import React, { useState } from 'react';
import { HADITHS } from '../data';
import { Sparkles, MessageSquareQuote } from 'lucide-react';

interface HadithDisplayProps {
  currentTheme: 'parchment' | 'space';
}

export default function HadithDisplay({ currentTheme }: HadithDisplayProps) {
  const isSpace = currentTheme === 'space';
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeHadith = HADITHS[currentIndex];

  const handleNextHadith = () => {
    setCurrentIndex((prev) => (prev + 1) % HADITHS.length);
  };

  return (
    <section 
      id="hadith-explorer"
      className={`py-24 px-6 md:px-12 select-none border-b transition-colors duration-700
        ${isSpace 
          ? 'bg-space border-gold/15 text-white' 
          : 'bg-[#FAF6EF] border-crimson/10 text-charcoal'
        }
      `}
    >
      <div className="max-w-4xl mx-auto">
        
        {/* SECTION HEADER DETAILS */}
        <div className="text-center mb-10">
          <MessageSquareQuote className={`h-8 w-8 mx-auto mb-2 opacity-85
            ${isSpace ? 'text-gold' : 'text-crimson'}
          `} />
          <h3 className="font-serif font-black text-2xl tracking-wide mb-1">Authentic Prophetic Hadiths</h3>
          <span className="text-[10px] font-mono tracking-widest text-stone-400 dark:text-stone-500 uppercase font-black">
            On Knowledge & Understanding — Ulul Albab
          </span>
        </div>

        {/* CUSTOM DECORATIVE SHIELD HADITH BLOCK */}
        <div className={`relative p-8 sm:p-12 border rounded-sm md:rounded-md transition-all duration-500 shadow-lg border-l-4
          ${isSpace 
            ? 'bg-[#0a0f1d] border-l-gold border-t-gold/10 border-r-gold/10 border-b-gold/10 text-white shadow-gold/5' 
            : 'bg-[#FFF9F0] border-l-crimson border-stone-200 text-charcoal shadow-crimson/5'
          }
        `}>
          {/* ARABIC TEXT (RTL) */}
          <div className="text-center mb-6 select-all font-semibold font-arabic text-xl sm:text-3xl leading-relaxed sm:leading-loose tracking-wide
            text-gold dark:text-gold-light
          ">
            {activeHadith.arabic}
          </div>

          {/* ENGLISH TRANSLATION */}
          <p className="font-serif italic text-base sm:text-lg leading-relaxed text-stone-600 dark:text-stone-300 text-center max-w-2xl mx-auto mb-6">
            "{activeHadith.translation}"
          </p>

          {/* SOURCE & CERTIFICATION BADGE */}
          <div className="text-center">
            <span className={`inline-block text-[10px] md:text-xs font-mono font-bold tracking-wider py-1 px-3 border rounded-xs select-none
              ${isSpace 
                ? 'bg-gold/10 border-gold/30 text-gold-light' 
                : 'bg-crimson/5 border-crimson/25 text-crimson-light'
              }
            `}>
              {activeHadith.source}
            </span>
          </div>

          {/* Context Explainer Bubble */}
          {activeHadith.context && (
            <div className="mt-8 pt-6 border-t border-stone-200/10 text-center">
              <p className="text-xs md:text-sm text-stone-400 dark:text-stone-500 max-w-xl mx-auto leading-relaxed">
                <span className="font-semibold uppercase tracking-wider font-mono text-[9px] mr-1">Context:</span>
                {activeHadith.context}
              </p>
            </div>
          )}
        </div>

        {/* COMPILER ACTION CONTROLS */}
        <div className="mt-8 flex justify-center">
          <button 
            onClick={handleNextHadith}
            className={`flex items-center gap-2 text-xs font-bold tracking-[0.25em] uppercase py-3 px-8 rounded-sm border transition-all duration-300 active:scale-95 shadow-sm
              ${isSpace 
                ? 'border-gold/30 text-gold-light hover:border-gold hover:bg-gold/10' 
                : 'border-crimson/30 text-crimson hover:bg-crimson/5'
              }
            `}
          >
            <Sparkles className="h-4 w-4" />
            Cycle Core Wisdom
          </button>
        </div>

      </div>
    </section>
  );
}
