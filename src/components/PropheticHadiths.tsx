import React, { useState } from 'react';
import { MessageSquareQuote, RotateCw } from 'lucide-react';
import { HADITHS } from '../data';
import { motion, AnimatePresence } from 'motion/react';

interface PropheticHadithsProps {
  currentTheme: 'parchment' | 'space';
}

export default function PropheticHadiths({ currentTheme }: PropheticHadithsProps) {
  const isSpace = currentTheme === 'space';
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % HADITHS.length);
  };

  const currentHadith = HADITHS[currentIndex];

  return (
    <section 
      id="prophetic-hadiths-ilm"
      className={`py-20 px-6 md:px-12 border-t relative overflow-hidden transition-all duration-700
        ${isSpace 
          ? 'bg-[#020509] border-t border-gold/10 text-white' 
          : 'bg-[#FAF8F5] border-t border-stone-200 text-stone-900'
        }
      `}
      style={{
        backgroundImage: isSpace 
          ? 'radial-gradient(circle, rgba(196,163,90,0.04) 1.5px, transparent 1.5px)' 
          : 'radial-gradient(circle, rgba(139,26,26,0.03) 1.5px, transparent 1.5px)',
        backgroundSize: '32px 32px'
      }}
    >
      <div className="max-w-4xl mx-auto relative z-10 text-center">
        
        {/* SECTION HEADER BLOCK */}
        <div className="mb-10 flex flex-col items-center">
          <div className={`p-3 rounded-md mb-4 border
            ${isSpace 
              ? 'bg-gold/10 border-gold/25 text-gold' 
              : 'bg-crimson/5 border-[#8B1A1A]/15 text-[#8B1A1A]'
            }
          `}>
            <MessageSquareQuote className="h-6 w-6" />
          </div>

          <h2 className={`font-eb font-bold text-3xl sm:text-4xl tracking-tight leading-tight mb-2
            ${isSpace ? 'text-white' : 'text-[#8B1A1A]'}
          `}>
            Authentic Prophetic Hadiths
          </h2>
          
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-stone-500 dark:text-zinc-400">
            ON KNOWLEDGE & UNDERSTANDING — ULUL ALBAB
          </p>
        </div>

        {/* SINGLE SEAMLESS HADITH CARD WITH ANIMATION */}
        <div className="relative min-h-[300px] flex items-center justify-center mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className={`w-full p-8 sm:p-12 rounded-sm border relative shadow-md text-center flex flex-col justify-center
                ${isSpace 
                  ? 'bg-[#060c16]/90 border-gold/15 text-white' 
                  : 'bg-white border-stone-200 text-stone-900'
                }
              `}
              style={{
                borderLeft: isSpace ? '4px solid #C4A35A' : '4px solid #8B1A1A'
              }}
            >
              {/* ARABIC TEXT */}
              <div 
                className={`font-arabic text-3xl sm:text-4xl text-center select-none font-bold leading-normal mb-6
                  ${isSpace ? 'text-gold-light' : 'text-[#8B1A1A]'}
                `}
                dir="rtl"
                style={{ fontFamily: 'Amiri, Georgia, serif' }}
              >
                {currentHadith.arabic}
              </div>

              {/* ENGLISH TRANSLATION */}
              <p className="font-serif italic text-lg sm:text-xl text-stone-700 dark:text-stone-350 max-w-3xl mx-auto mb-6 leading-relaxed">
                "{currentHadith.translation}"
              </p>

              {/* CITATION PILL */}
              <div className="mb-6 flex justify-center">
                <span className={`px-4 py-1.5 rounded-sm text-[11px] font-mono tracking-wide uppercase border font-bold
                  ${isSpace 
                    ? 'bg-black/40 border-gold/20 text-gold-light' 
                    : 'bg-crimson/5 border-[#8B1A1A]/25 text-[#8B1A1A]'
                  }
                `}>
                  {currentHadith.source}
                </span>
              </div>

              {/* CONTEXT BLOCK */}
              <p className="text-xs text-stone-500 dark:text-zinc-450 max-w-2xl mx-auto leading-relaxed font-sans font-medium">
                <span className={`font-black uppercase tracking-wider mr-1.5 ${isSpace ? 'text-gold' : 'text-[#8B1A1A]'}`}>
                  Context:
                </span>
                {currentHadith.context}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* CYCLE CORE WISDOM BTN */}
        <div className="flex justify-center">
          <button
            onClick={handleNext}
            className={`px-6 py-3.5 rounded-sm text-xs font-mono font-bold uppercase tracking-widest border transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98]
              ${isSpace 
                ? 'bg-gold border-gold text-space hover:bg-white hover:text-space' 
                : 'bg-[#8B1A1A] border-[#8B1A1A] text-[#FAF6EE] hover:bg-black hover:text-white'
              }
            `}
          >
            <RotateCw className="h-4 w-4" />
            <span>Cycle Core Wisdom</span>
          </button>
        </div>

      </div>
    </section>
  );
}
