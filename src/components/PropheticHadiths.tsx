import React from 'react';
import { BookOpen, MessageSquareQuote, Compass, Award } from 'lucide-react';
import { HADITHS } from '../data';

interface PropheticHadithsProps {
  currentTheme: 'parchment' | 'space';
}

export default function PropheticHadiths({ currentTheme }: PropheticHadithsProps) {
  const isSpace = currentTheme === 'space';

  // Help map icons to cards
  const icons = [BookOpen, Compass, Award, MessageSquareQuote];

  return (
    <section 
      id="prophetic-hadiths-ilm"
      className={`py-20 px-6 md:px-12 border-t relative overflow-hidden transition-all duration-700
        ${isSpace 
          ? 'bg-[#020509] border-gold/10 text-white' 
          : 'bg-[#FAF8F5] border-stone-200 text-stone-900'
        }
      `}
      style={{
        backgroundImage: isSpace 
          ? 'radial-gradient(circle, rgba(196,163,90,0.04) 1.5px, transparent 1.5px)' 
          : 'radial-gradient(circle, rgba(139,26,26,0.03) 1.5px, transparent 1.5px)',
        backgroundSize: '32px 32px'
      }}
    >
      <div className="max-w-7xl mx-auto relative z-10 text-center">
        
        {/* SECTION HEADER BLOCK */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full border text-[10px] font-mono tracking-[0.25em] uppercase
            dark:border-gold/20 dark:bg-gold/5 dark:text-gold-light border-crimson/15 bg-crimson/5 text-crimson
          ">
            <MessageSquareQuote className="h-3.5 w-3.5 animate-pulse" />
            Prophetic Guidance on Seeking Wisdom
          </div>
          
          <span 
            className="font-arabic text-3xl sm:text-4xl text-[#C4A35A] block mb-3 font-semibold select-none"
            style={{ fontFamily: 'Amiri, Georgia, serif' }}
          >
            أَحَادِيثُ نَبَوِيَّةٌ فِي طَلَبِ الْعِلْمِ
          </span>
          
          <h2 className={`font-serif font-black text-3xl sm:text-4xl tracking-tight leading-none mb-4
            ${isSpace ? 'text-white' : 'text-[#8B1A1A]'}
          `}>
            Prophetic Hadiths on Gathering Knowledge
          </h2>
          
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed font-serif italic">
            "The seeking of holy comprehension is a continuous celestial ascension, paving pathways through the intellect to divine proximity."
          </p>
        </div>

        {/* 4 AUTHENTIC HADITHS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {HADITHS.map((hadith, index) => {
            const IconComponent = icons[index % icons.length];
            return (
              <div 
                key={hadith.id}
                className={`relative p-6 border-2 rounded-sm text-left flex flex-col justify-between shadow-sm transition-all duration-350 hover:scale-[1.01] hover:shadow-md
                  ${isSpace 
                    ? 'bg-[#060c16]/90 border-gold/15 text-white hover:border-gold/35' 
                    : 'bg-white border-stone-200 text-stone-900 hover:border-[#8B1A1A]/40'
                  }
                `}
              >
                {/* Accent corner tag */}
                <div className={`absolute top-0 right-0 w-8 h-8 rounded-tr-sm pointer-events-none overflow-hidden flex items-center justify-center`}>
                  <div className={`absolute rotate-45 w-12 h-4 text-center text-[8px] font-mono font-black py-0.5 text-white
                    ${isSpace ? 'bg-[#C4A35A]' : 'bg-[#8B1A1A]'}
                  `}>
                    #{index + 1}
                  </div>
                </div>

                <div>
                  {/* Hadith Icon */}
                  <div className="mb-5 flex items-center gap-3">
                    <div className={`p-2 rounded-sm border
                      ${isSpace 
                        ? 'bg-gold/10 border-gold/25 text-gold' 
                        : 'bg-crimson/5 border-crimson/15 text-[#8B1A1A]'
                      }
                    `}>
                      <IconComponent className="h-4.5 w-4.5" />
                    </div>
                  </div>

                  {/* ARABIC TEXT (Styled in precise golden color) */}
                  <div 
                    className="text-right font-arabic select-all font-black text-lg sm:text-xl leading-relaxed sm:leading-loose text-[#C4A35A] dark:text-gold-light mb-5"
                    style={{ fontFamily: 'Amiri, Georgia, serif' }}
                  >
                    {hadith.arabic}
                  </div>

                  {/* ENGLISH TRANSLATION */}
                  <p className="font-serif italic text-sm leading-relaxed text-stone-600 dark:text-stone-300 mb-5">
                    "{hadith.translation}"
                  </p>
                </div>

                <div>
                  {/* SCHOLARLY CONTEXT & COMMENTARY */}
                  <div className={`p-3 rounded-xs border text-[11px] leading-relaxed mb-4
                    ${isSpace 
                      ? 'bg-black/40 border-gold/10 text-stone-350' 
                      : 'bg-[#FAF8F5] border-stone-200 text-stone-600'
                    }
                  `}>
                    <strong className={`font-mono text-[9px] uppercase tracking-wider block mb-1
                      ${isSpace ? 'text-gold' : 'text-[#8B1A1A]'}
                    `}>
                      Scholarly Exegesis:
                    </strong>
                    {hadith.context}
                  </div>

                  {/* CITATION RECORD KEY */}
                  <div className="border-t border-stone-200/50 dark:border-zinc-800/65 pt-3 mt-1 text-[10px] select-none font-mono text-stone-400 dark:text-stone-500 font-bold">
                    {hadith.source}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
