import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, Sparkles, BookOpen, Award, Shield, Heart, ArrowUp
} from 'lucide-react';

interface ScrollSpyIndicatorProps {
  currentTheme: 'parchment' | 'space';
  currentSection: string;
}

interface SectionItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

const SECTIONS: SectionItem[] = [
  { id: 'hero', label: 'Intro Banner', icon: Compass },
  { id: 'scholarly', label: 'Celestial Globe', icon: Sparkles },
  { id: 'editorial-mission', label: 'Scholarly Mission', icon: BookOpen },
  { id: 'curriculum', label: 'Curriculum Search', icon: Award },
  { id: 'islamic-pillars', label: 'Five Pillars', icon: Shield },
  { id: 'dhikr-section', label: 'Dhikr Devotions', icon: Heart }
];

export default function ScrollSpyIndicator({ currentTheme, currentSection }: ScrollSpyIndicatorProps) {
  const isSpace = currentTheme === 'space';
  const [activeSection, setActiveSection] = useState('hero');
  const [scrollPercent, setScrollPercent] = useState(0);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  useEffect(() => {
    if (currentSection !== 'landing') return;

    const handleScroll = () => {
      // 1. Calculate overall scroll percentage
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percentage = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
      setScrollPercent(percentage);

      // 2. Determine active section via viewport position
      let currentActive = 'hero';
      let maxVisibleHeight = 0;

      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Calculate how much of the section is visible in the viewport
          const visibleTop = Math.max(0, rect.top);
          const visibleBottom = Math.min(window.innerHeight, rect.bottom);
          const visibleHeight = Math.max(0, visibleBottom - visibleTop);

          if (visibleHeight > maxVisibleHeight) {
            maxVisibleHeight = visibleHeight;
            currentActive = section.id;
          }
        }
      }

      // Fallback for top of page
      if (scrollTop < 120) {
        currentActive = 'hero';
      }

      setActiveSection(currentActive);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Trigger once on mount
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentSection]);

  if (currentSection !== 'landing') return null;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // SVG Circular progress properties
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollPercent / 100) * circumference;

  return (
    <div className="fixed right-3 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-6 select-none pointer-events-auto">
      {/* Master Circular Scroll Progress Widget */}
      <motion.div 
        className={`relative w-12 h-12 rounded-full flex items-center justify-center border shadow-lg cursor-pointer transition-all duration-300 group
          ${isSpace 
            ? 'bg-[#030712]/90 border-gold/35 text-gold hover:border-gold hover:shadow-[0_0_12px_rgba(232,184,109,0.35)]' 
            : 'bg-white/95 border-crimson/20 text-[#0B4628] hover:border-crimson hover:shadow-[0_4px_12px_rgba(11,70,40,0.12)]'
          }
        `}
        onClick={scrollToTop}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Scroll to Top"
      >
        {/* Progress Circle SVG */}
        <svg className="absolute inset-0 -rotate-90 w-full h-full p-0.5">
          <circle
            cx="24"
            cy="24"
            r={radius}
            className={isSpace ? 'stroke-zinc-800' : 'stroke-stone-100'}
            strokeWidth="2.5"
            fill="transparent"
          />
          <motion.circle
            cx="24"
            cy="24"
            r={radius}
            className={isSpace ? 'stroke-gold' : 'stroke-crimson'}
            strokeWidth="2.5"
            fill="transparent"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ type: 'spring', damping: 20, stiffness: 80 }}
          />
        </svg>

        {/* Arrow / Center Value */}
        <div className="relative flex flex-col items-center justify-center">
          <ArrowUp className="h-3.5 w-3.5 animate-pulse" />
          <span className="text-[8px] font-mono font-bold leading-none mt-0.5">
            {Math.round(scrollPercent)}%
          </span>
        </div>
      </motion.div>

      {/* Decorative Track Line */}
      <div className={`relative w-[2px] h-32 md:h-40 rounded-full flex flex-col justify-between items-center py-1
        ${isSpace ? 'bg-zinc-800/80' : 'bg-stone-200/80'}
      `}>
        {SECTIONS.map((section, idx) => {
          const isActive = activeSection === section.id;
          const isHovered = hoveredSection === section.id;
          const IconComponent = section.icon;

          return (
            <div 
              key={section.id}
              className="relative flex items-center justify-center w-8 h-8 -my-1"
              onMouseEnter={() => setHoveredSection(section.id)}
              onMouseLeave={() => setHoveredSection(null)}
            >
              {/* Actual interactive dot with 44px touch container */}
              <button
                onClick={() => scrollToSection(section.id)}
                className="absolute inset-0 w-full h-full rounded-full flex items-center justify-center cursor-pointer group focus:outline-none"
                aria-label={`Scroll to ${section.label}`}
              >
                {/* Visual Dot */}
                <motion.div
                  animate={{
                    scale: isActive ? 1.4 : isHovered ? 1.2 : 1,
                    backgroundColor: isActive 
                      ? isSpace ? '#E8B86D' : '#9B1C1C' // Gold vs Crimson
                      : isHovered
                        ? isSpace ? '#C4A35A' : '#0B4628' // Light Gold vs Dark Green
                        : isSpace ? '#3F3F46' : '#D6D3D1' // Muted Zinc vs Stone
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`w-2.5 h-2.5 rounded-full shadow-sm
                    ${isActive && isSpace ? 'shadow-[0_0_8px_#E8B86D]' : ''}
                    ${isActive && !isSpace ? 'shadow-[0_0_8px_rgba(155,28,28,0.4)]' : ''}
                  `}
                />
              </button>

              {/* Tooltip & Icon slideout */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: 20, scale: 0.9 }}
                    animate={{ opacity: 1, x: -12, scale: 1 }}
                    exit={{ opacity: 0, x: 15, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className={`absolute right-full mr-2 py-1.5 px-3 rounded-md flex items-center gap-2 shadow-md border pointer-events-none whitespace-nowrap
                      ${isSpace 
                        ? 'bg-[#090D1A]/95 border-gold/25 text-white' 
                        : 'bg-white/95 border-stone-200 text-charcoal'
                      }
                    `}
                  >
                    <IconComponent className={`h-3.5 w-3.5
                      ${isActive 
                        ? isSpace ? 'text-gold' : 'text-crimson'
                        : isSpace ? 'text-zinc-400' : 'text-[#0B4628]'
                      }
                    `} />
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
                      {section.label}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
