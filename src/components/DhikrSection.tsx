import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DhikrSectionProps {
  currentTheme: 'parchment' | 'space';
}

interface DhikrItem {
  id: string;
  arabic: string;
  translit: string;
  translation: string;
}

const DHIKR_ITEMS: DhikrItem[] = [
  {
    id: 'subhanallah',
    arabic: 'سُبْحَانَ ٱللَّٰهِ',
    translit: 'SubhanAllah',
    translation: 'Glory be to Allah'
  },
  {
    id: 'alhamdulillah',
    arabic: 'ٱلْحَمْدُ لِلَّٰهِ',
    translit: 'Alhamdulillah',
    translation: 'Praise be to Allah'
  },
  {
    id: 'allahuakbar',
    arabic: 'اللَّهُ أَكْبَرُ',
    translit: 'Allahu Akbar',
    translation: 'Allah is the greatest'
  },
  {
    id: 'lailahaillallah',
    arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ',
    translit: 'La ilaha illallah',
    translation: 'There is no true god worthy of worship except Allah, alone'
  },
  {
    id: 'astaghfirullah',
    arabic: 'أَسْتَغْفِرُ ٱللَّٰهَ',
    translit: 'Astaghfirullah',
    translation: 'I seek forgiveness from Allah'
  }
];

export default function DhikrSection({ currentTheme }: DhikrSectionProps) {
  const isSpace = currentTheme === 'space';
  
  // Timer States
  const [timer, setTimer] = useState(60);
  const [timerActive, setTimerActive] = useState(false);

  // Counters State
  const [counts, setCounts] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('albab_dhikr_counts_v2');
    return saved ? JSON.parse(saved) : {
      subhanallah: 0,
      alhamdulillah: 0,
      allahuakbar: 0,
      lailahaillallah: 0,
      astaghfirullah: 0
    };
  });

  // Persist counts
  useEffect(() => {
    localStorage.setItem('albab_dhikr_counts_v2', JSON.stringify(counts));
  }, [counts]);

  // Handle countdown
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  const handleStartPause = () => {
    setTimerActive(!timerActive);
  };

  const handleReset = () => {
    setTimerActive(false);
    setTimer(60);
  };

  const incrementCount = (id: string) => {
    setCounts(prev => ({
      ...prev,
      [id]: prev[id] + 1
    }));
  };

  const resetAll = () => {
    setCounts({
      subhanallah: 0,
      alhamdulillah: 0,
      allahuakbar: 0,
      lailahaillallah: 0,
      astaghfirullah: 0
    });
  };

  return (
    <section 
      id="dhikr-section" 
      className={`py-20 px-6 md:px-12 border-t relative overflow-hidden transition-colors duration-300
        ${isSpace 
          ? 'bg-[#050920] border-gold/15 text-gold-light' 
          : 'bg-[#FCFAF7] border-stone-200 text-[#0B4628]'
        }
      `}
    >
      {/* Decorative vectors mimicking traditional hanging lanterns */}
      <div className="absolute top-0 left-12 w-12 h-40 opacity-15 hidden md:block">
        <svg viewBox="0 0 50 200" className="w-full h-full stroke-current fill-none">
          <line x1="25" y1="0" x2="25" y2="120" strokeWidth="1" strokeDasharray="3 3" />
          <path d="M15 120 h20 l-10 30 z" fill="currentColor" />
          <circle cx="25" cy="165" r="8" />
        </svg>
      </div>
      <div className="absolute top-0 right-12 w-12 h-40 opacity-15 hidden md:block">
        <svg viewBox="0 0 50 200" className="w-full h-full stroke-current fill-none">
          <line x1="25" y1="0" x2="25" y2="150" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="25" cy="160" r="10" fill="currentColor" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header Title Block */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <h2 className={`font-serif text-3xl sm:text-4xl font-black tracking-tight uppercase ${isSpace ? 'text-white' : 'text-[#0B4628]'}`}>
            1 Minute Dhikr Checklist
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-300 font-serif italic max-w-md mx-auto">
            "Verily, in the remembrance of Allah do hearts find rest." — Surah Ar-Ra'd 13:28
          </p>
          <div className={`w-24 h-0.5 mx-auto ${isSpace ? 'bg-gold/40' : 'bg-[#0B4628]/30'}`} />
        </div>

        {/* 1-Minute Spiritual Timer Bar */}
        <div className={`max-w-md mx-auto mb-12 p-4 rounded-lg border flex items-center justify-between shadow-sm transition-all duration-300
          ${isSpace 
            ? 'bg-[#091035] border-gold/20 text-stone-100' 
            : 'bg-white border-stone-200 text-[#0B4628]'
          }
        `}>
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-full relative flex items-center justify-center
              ${timerActive ? 'animate-pulse' : ''}
              ${isSpace ? 'bg-gold/15 text-gold' : 'bg-[#0B4628]/10 text-[#0B4628]'}
            `}>
              <LucideIcons.Timer className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-bold block">1 Minute Timer</span>
              <span className="text-2xl font-mono font-black tracking-widest text-[#C9933A] dark:text-gold">
                0:{timer < 10 ? `0${timer}` : timer}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartPause}
              className={`px-4 py-2 rounded font-mono text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 transition-all cursor-pointer
                ${timerActive 
                  ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20' 
                  : (isSpace ? 'bg-gold text-space hover:bg-white border border-transparent' : 'bg-[#0B4628] text-white hover:bg-black border border-transparent')
                }
              `}
            >
              {timerActive ? <LucideIcons.Pause className="h-3.5 w-3.5" /> : <LucideIcons.Play className="h-3.5 w-3.5 fill-current" />}
              {timerActive ? 'Pause' : 'Start Timer'}
            </button>
            <button
              onClick={handleReset}
              className={`p-2.5 rounded border transition-colors cursor-pointer
                ${isSpace ? 'border-gold/20 hover:bg-gold/10' : 'border-stone-200 hover:bg-stone-50'}
              `}
              title="Reset Timer"
            >
              <LucideIcons.RotateCcw className="h-4 w-4 text-stone-400" />
            </button>
          </div>
        </div>

        {/* 5-Dhikr Checklist Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-stretch">
          {DHIKR_ITEMS.map((item, index) => {
            const count = counts[item.id] || 0;
            return (
              <motion.div
                key={item.id}
                onClick={() => incrementCount(item.id)}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-6 rounded-lg border flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-300 group overflow-hidden shadow-sm
                  ${isSpace 
                    ? 'bg-[#091035]/60 border-gold/15 hover:border-gold/40 hover:bg-[#091035]' 
                    : 'bg-white border-stone-200 hover:border-[#0B4628]/30 hover:bg-[#FAF8F5]'
                  }
                `}
              >
                {/* Visual Card Accent Decor */}
                <div className="absolute top-0 left-0 w-16 h-16 opacity-[0.015] select-none pointer-events-none arabesque-star bg-current" />

                {/* Speech Bubble Heart (Exactly like image!) */}
                <div className="relative mb-6 flex justify-center">
                  <div className="relative flex items-center justify-center">
                    {/* Pink/Red Heart Bubble */}
                    <div className="bg-[#EF4444] text-white p-2.5 rounded-2xl relative shadow-md flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                      <LucideIcons.Heart className="h-5 w-5 fill-white text-white" />
                      {/* Count Badge overlay */}
                      {count > 0 && (
                        <span className="absolute -top-2 -right-2 bg-black text-white dark:bg-gold dark:text-space text-[9px] font-mono font-black h-5 w-5 rounded-full flex items-center justify-center border border-white dark:border-[#091035]">
                          {count}
                        </span>
                      )}
                      
                      {/* Speech bubble arrow */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#EF4444]" />
                    </div>
                  </div>
                </div>

                {/* Arabic Script */}
                <div className="my-2 min-h-[50px] flex items-center justify-center">
                  <span className={`font-arabic text-xl sm:text-2xl font-bold tracking-wide transition-colors group-hover:text-amber-500 dark:group-hover:text-gold
                    ${isSpace ? 'text-white' : 'text-[#0B4628]'}
                  `}>
                    {item.arabic}
                  </span>
                </div>

                {/* Transliteration & Meaning */}
                <div className="mt-4 space-y-1.5 w-full border-t border-stone-100 dark:border-stone-800/40 pt-4">
                  <p className="text-xs font-serif font-black tracking-tight leading-none">
                    {item.translit}
                  </p>
                  <p className="text-[10.5px] text-stone-500 dark:text-stone-400 leading-tight italic min-h-[32px] flex items-center justify-center">
                    {item.translation}
                  </p>
                </div>

                {/* Plus interaction indicator */}
                <div className={`mt-4 w-full py-1.5 rounded-sm font-mono text-[9px] uppercase tracking-widest font-bold border transition-all flex items-center justify-center gap-1
                  ${isSpace 
                    ? 'border-gold/10 bg-gold/5 text-gold-light group-hover:bg-gold/20' 
                    : 'border-stone-100 bg-stone-50 text-[#0B4628] group-hover:bg-emerald-50'
                  }
                `}>
                  <LucideIcons.Plus className="h-3 w-3" />
                  Tap to Count
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Clear/Reset Controls */}
        <div className="mt-12 text-center">
          <button
            onClick={resetAll}
            className={`px-5 py-2.5 rounded font-mono text-[10px] uppercase tracking-widest font-bold border transition-all cursor-pointer inline-flex items-center gap-2
              ${isSpace 
                ? 'border-gold/20 text-stone-300 hover:text-white hover:border-gold' 
                : 'border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-400'
              }
            `}
          >
            <LucideIcons.RotateCcw className="h-3.5 w-3.5" />
            Reset All Counters
          </button>
        </div>

      </div>
    </section>
  );
}
