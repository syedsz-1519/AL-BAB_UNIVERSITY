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
  
  // Mobile Widget Selected State
  const [activeDhikrIndex, setActiveDhikrIndex] = useState(0);
  
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

  // Sync state from window event
  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('albab_dhikr_counts_v2');
      if (saved) {
        try {
          setCounts(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse synchronized counts', e);
        }
      }
    };
    window.addEventListener('dhikr_sync', handleSync);
    return () => {
      window.removeEventListener('dhikr_sync', handleSync);
    };
  }, []);

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
    setCounts(prev => {
      const updated = {
        ...prev,
        [id]: prev[id] + 1
      };
      localStorage.setItem('albab_dhikr_counts_v2', JSON.stringify(updated));
      return updated;
    });
    // Dispatch event to sync FloatingDhikrBubble
    setTimeout(() => {
      window.dispatchEvent(new Event('dhikr_sync'));
    }, 0);
  };

  const resetAll = () => {
    const resetCounts = {
      subhanallah: 0,
      alhamdulillah: 0,
      allahuakbar: 0,
      lailahaillallah: 0,
      astaghfirullah: 0
    };
    setCounts(resetCounts);
    localStorage.setItem('albab_dhikr_counts_v2', JSON.stringify(resetCounts));
    // Dispatch event to sync FloatingDhikrBubble
    setTimeout(() => {
      window.dispatchEvent(new Event('dhikr_sync'));
    }, 0);
  };

  return (
    <section 
      id="dhikr-section" 
      className={`scroll-mt-28 py-20 px-6 md:px-12 border-t relative overflow-hidden transition-colors duration-300
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

        {/* Mobile View: Highly Minimalist 'Dhikr Mini-Widget' */}
        <div className="block sm:hidden max-w-sm mx-auto mb-6">
          <div className={`p-6 rounded-2xl flex flex-col items-center justify-between text-center transition-all duration-300 relative overflow-hidden
            ${isSpace 
              ? 'skeuo-card-space border-gold/30' 
              : 'skeuo-card-parchment border-[#0B4628]/20'
            }
          `}>
            {/* Background design accents */}
            <div className="absolute top-0 left-0 w-16 h-16 opacity-[0.08] select-none pointer-events-none arabesque-star bg-current" />
            
            {/* Header selection with left/right arrows */}
            <div className="flex items-center justify-between w-full mb-4">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDhikrIndex(prev => (prev - 1 + DHIKR_ITEMS.length) % DHIKR_ITEMS.length);
                }}
                className={`p-2.5 rounded-full cursor-pointer transition-all active:scale-90 ${isSpace ? 'hover:bg-white/10 text-stone-300' : 'hover:bg-black/5 text-stone-700'}`}
                title="Previous Dhikr"
              >
                <LucideIcons.ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="text-center px-2 flex-1">
                <span className={`block font-arabic text-lg font-bold transition-colors ${isSpace ? 'text-white' : 'text-[#0B4628]'}`}>
                  {DHIKR_ITEMS[activeDhikrIndex].arabic}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold block mt-0.5">
                  {DHIKR_ITEMS[activeDhikrIndex].translit}
                </span>
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDhikrIndex(prev => (prev + 1) % DHIKR_ITEMS.length);
                }}
                className={`p-2.5 rounded-full cursor-pointer transition-all active:scale-90 ${isSpace ? 'hover:bg-white/10 text-stone-300' : 'hover:bg-black/5 text-stone-700'}`}
                title="Next Dhikr"
              >
                <LucideIcons.ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Tap Target: Heart Button */}
            <div className="my-6 relative flex justify-center">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => incrementCount(DHIKR_ITEMS[activeDhikrIndex].id)}
                className="relative p-6 rounded-full bg-[#EF4444] text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/40 flex items-center justify-center cursor-pointer transition-transform duration-200"
              >
                <LucideIcons.Heart className="h-8 w-8 fill-white text-white" />
                {/* Count bubble */}
                <span className="absolute -top-1.5 -right-1.5 bg-black text-white dark:bg-gold dark:text-space text-xs font-mono font-black h-6.5 w-6.5 rounded-full flex items-center justify-center border-2 border-white dark:border-[#091035]">
                  {counts[DHIKR_ITEMS[activeDhikrIndex].id] || 0}
                </span>
              </motion.button>
            </div>

            {/* Translation description */}
            <p className="text-[10.5px] text-stone-500 dark:text-stone-400 italic mb-4 min-h-[30px] flex items-center justify-center px-4">
              "{DHIKR_ITEMS[activeDhikrIndex].translation}"
            </p>

            {/* Single-tap Progress Bar */}
            <div className="w-full space-y-1.5 mt-2 bg-black/5 dark:bg-white/5 p-3 rounded-lg border border-stone-200/40 dark:border-white/5">
              <div className="flex justify-between text-[9px] font-mono text-stone-400 font-bold tracking-wider">
                <span>TASBIH PROGRESS</span>
                <span>{(counts[DHIKR_ITEMS[activeDhikrIndex].id] || 0)} / 33</span>
              </div>
              <div className={`w-full h-2.5 rounded-full overflow-hidden ${isSpace ? 'bg-zinc-800' : 'bg-stone-200'}`}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${Math.min(((counts[DHIKR_ITEMS[activeDhikrIndex].id] || 0) / 33) * 100, 100)}%` 
                  }}
                  transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                  className={`h-full rounded-full ${isSpace ? 'bg-gradient-to-r from-amber-500 to-gold' : 'bg-gradient-to-r from-[#0B4628] to-[#127242]'}`}
                />
              </div>
            </div>
            
            {/* Quick helper controls */}
            <div className="mt-4 flex items-center justify-between w-full px-2 text-[9px] font-mono text-stone-400 uppercase tracking-widest">
              <span>Tap Heart to Count</span>
              <button 
                onClick={() => {
                  setCounts(prev => ({
                    ...prev,
                    [DHIKR_ITEMS[activeDhikrIndex].id]: 0
                  }));
                }}
                className="underline hover:text-rose-500 transition-colors cursor-pointer font-bold"
              >
                Reset current
              </button>
            </div>
          </div>
        </div>

        {/* Desktop View: Full 5-Dhikr Checklist Stack (Vertical in line) */}
        <div className="hidden sm:flex flex-col gap-4 max-w-3xl mx-auto">
          {DHIKR_ITEMS.map((item, index) => {
            const count = counts[item.id] || 0;
            return (
              <motion.div
                key={item.id}
                onClick={() => incrementCount(item.id)}
                whileHover={{ x: 6, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`relative p-5 rounded-xl flex items-center justify-between gap-6 cursor-pointer border transition-all duration-300 overflow-hidden select-none
                  ${isSpace 
                    ? 'skeuo-card-space hover:border-gold/40 hover:bg-gold/5' 
                    : 'skeuo-card-parchment hover:border-[#0B4628]/30 hover:bg-emerald-50/20'
                  }
                `}
              >
                {/* Visual Card Accent Decor */}
                <div className="absolute top-0 left-0 w-16 h-16 opacity-[0.08] select-none pointer-events-none arabesque-star bg-current" />

                {/* Left side: Pink/Red Heart Bubble */}
                <div className="flex items-center gap-5 shrink-0">
                  <div className="relative flex items-center justify-center">
                    {/* Pink/Red Heart Bubble */}
                    <div className="bg-[#EF4444] text-white p-3 rounded-2xl relative shadow-md flex items-center justify-center transition-transform duration-300">
                      <LucideIcons.Heart className="h-5 w-5 fill-white text-white animate-pulse" style={{ animationDuration: '3s' }} />
                      
                      {/* Count Badge overlay */}
                      {count > 0 && (
                        <span className="absolute -top-2 -right-2 bg-black text-white dark:bg-gold dark:text-space text-[9px] font-mono font-black h-5 w-5 rounded-full flex items-center justify-center border border-white dark:border-[#091035]">
                          {count}
                        </span>
                      )}
                      
                      {/* Speech bubble arrow to the right */}
                      <div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-[#EF4444]" />
                    </div>
                  </div>
                  
                  {/* Arabic text */}
                  <div className="min-w-[140px] text-left">
                    <span className={`font-arabic text-xl sm:text-2xl font-bold tracking-wide transition-colors
                      ${isSpace ? 'text-white' : 'text-[#0B4628]'}
                    `}>
                      {item.arabic}
                    </span>
                  </div>
                </div>

                {/* Center: Transliteration & English Meaning */}
                <div className="flex-1 px-4 text-left border-l border-r border-stone-200/40 dark:border-stone-800/40">
                  <p className="text-xs font-serif font-black tracking-tight">
                    {item.translit}
                  </p>
                  <p className="text-[10.5px] text-stone-500 dark:text-stone-400 italic mt-0.5 max-w-sm">
                    "{item.translation}"
                  </p>
                </div>

                {/* Right side: Progress Bar & Tap target */}
                <div className="w-40 shrink-0 text-right space-y-1">
                  <div className="flex justify-between items-center text-[9px] font-mono text-stone-400 font-bold tracking-wider">
                    <span>PROGRESS</span>
                    <span>{count} / 33</span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${isSpace ? 'bg-zinc-800' : 'bg-stone-200'}`}>
                    <div 
                      style={{ width: `${Math.min((count / 33) * 100, 100)}%` }}
                      className={`h-full rounded-full transition-all duration-300 ${isSpace ? 'bg-gold' : 'bg-[#0B4628]'}`}
                    />
                  </div>
                  <p className="text-[8px] font-mono opacity-50 uppercase tracking-widest pt-1">
                    Click card to count
                  </p>
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
