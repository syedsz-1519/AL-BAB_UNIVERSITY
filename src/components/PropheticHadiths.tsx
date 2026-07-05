import React, { useState } from 'react';
import { MessageSquareQuote, RotateCw } from 'lucide-react';
import { HADITHS } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import AlbabLogo from './AlbabLogo';

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
    >
      {/* Background arabesque-grid overlay for rich Islamic art atmosphere */}
      <div className="absolute inset-0 opacity-[0.025] bg-repeat arabesque-grid pointer-events-none" />

      {/* Decorative Traditional Arabic Motifs in Corners */}
      <div className="absolute top-0 left-0 w-32 h-32 opacity-[0.03] select-none pointer-events-none arabesque-star bg-current" />
      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-[0.03] select-none pointer-events-none arabesque-star bg-current" />
      <div className="max-w-4xl mx-auto relative z-10 text-center">
        
        {/* SECTION HEADER BLOCK */}
        <div className="mb-10 flex flex-col items-center">
          <div className="relative group mb-4 cursor-pointer">
            <div className={`absolute -inset-1.5 blur-md rounded-full opacity-35 group-hover:opacity-80 transition duration-300
              ${isSpace ? 'bg-gold' : 'bg-[#0B4628]'}
            `}></div>
            <AlbabLogo className="relative h-16 w-16 sm:h-20 sm:w-20 transform group-hover:scale-110 transition-transform duration-300" />
          </div>

          <h2 className={`font-eb font-bold text-3xl sm:text-4xl tracking-tight leading-tight mb-2
            ${isSpace ? 'text-white' : 'text-[#0B4628]'}
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
                borderLeft: isSpace ? '4px solid #C4A35A' : '4px solid #0B4628'
              }}
            >
              {/* ARABIC TEXT */}
              <div 
                className={`font-arabic text-3xl sm:text-4xl text-center select-none font-bold leading-normal mb-6
                  ${isSpace ? 'text-gold-light' : 'text-[#0B4628]'}
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
                    : 'bg-crimson/5 border-[#0B4628]/25 text-[#0B4628]'
                  }
                `}>
                  {currentHadith.source}
                </span>
              </div>

              {/* CONTEXT BLOCK */}
              <p className="text-xs text-stone-500 dark:text-zinc-450 max-w-2xl mx-auto leading-relaxed font-sans font-medium">
                <span className={`font-black uppercase tracking-wider mr-1.5 ${isSpace ? 'text-gold' : 'text-[#0B4628]'}`}>
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
                : 'bg-[#0B4628] border-[#0B4628] text-[#FAF6EE] hover:bg-black hover:text-white'
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
