import React, { useMemo, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { COURSES, HADITHS } from '../data';
import { Course } from '../types';

interface GlobeSectionProps {
  currentTheme: 'parchment' | 'space';
  selectedCourseId: string;
  onSelectCourse: (course: Course) => void;
}

// Generate stars once to prevent re-rendering flicker in space mode
const generateStars = () => {
  const list = [];
  for (let i = 0; i < 180; i++) {
    list.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.8 + 0.6,
      delay: Math.random() * 4,
      duration: Math.random() * 3 + 2,
    });
  }
  return list;
};

export default function GlobeSection({ currentTheme, selectedCourseId, onSelectCourse }: GlobeSectionProps) {
  const starsList = useMemo(() => generateStars(), []);
  const isSpace = currentTheme === 'space';

  // Interactive Hadith overlay state
  const [showHadithModal, setShowHadithModal] = useState(false);
  const [hadithIndex, setHadithIndex] = useState(0);

  const activeHadith = HADITHS[hadithIndex];

  const handleNextHadith = () => {
    setHadithIndex((prev) => (prev + 1) % HADITHS.length);
  };

  const triggerHadithPopup = () => {
    // Select a random Hadith to show first or recycle
    setHadithIndex(Math.floor(Math.random() * HADITHS.length));
    setShowHadithModal(true);
  };

  // Helper to map string to Lucid Icon
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen': return <LucideIcons.BookOpen className="h-5 w-5" />;
      case 'MessageSquareText': return <LucideIcons.MessageSquareText className="h-5 w-5" />;
      case 'Scale': return <LucideIcons.Scale className="h-5 w-5" />;
      case 'Binary': return <LucideIcons.Binary className="h-5 w-5" />;
      case 'Compass': return <LucideIcons.Compass className="h-5 w-5" />;
      case 'Brain': return <LucideIcons.Brain className="h-5 w-5" />;
      case 'TriangleAlert': return <LucideIcons.TriangleAlert className="h-5 w-5" />;
      case 'Globe': return <LucideIcons.Globe className="h-5 w-5" />;
      default: return <LucideIcons.BookOpen className="h-5 w-5" />;
    }
  };

  // Positions on clock for the 8 cards (around a circular perimeter centered in the view)
  // Highly balanced, symmetrical coordinates
  const cardPositions = [
    { name: "Qur'an", top: '5%', left: '50%' },         // 12 o'clock
    { name: 'Hadith', top: '18%', left: '82%' },       // 1:30
    { name: 'Fiqh', top: '50%', left: '92%' },          // 3 o'clock
    { name: 'Logic', top: '82%', left: '82%' },         // 4:30
    { name: 'Philosophy', top: '95%', left: '50%' },   // 6 o'clock
    { name: 'Psychology', top: '82%', left: '18%' },     // 7:30
    { name: 'Challenges', top: '50%', left: '8%' },    // 9 o'clock
    { name: 'Modernity', top: '18%', left: '18%' },      // 10:30
  ];

  return (
    <section 
      id="scholarly"
      className={`relative py-20 flex flex-col justify-center items-center overflow-hidden transition-all duration-700 select-none border-b
        ${isSpace 
          ? 'text-white border-gold/15' 
          : 'bg-gradient-to-b from-[#FAF8F5] via-[#FCFAF7] to-[#FAF8F5] text-charcoal border-stone-200'
        }
      `}
      style={{
        background: isSpace ? 'radial-gradient(ellipse at center, #060D1F 0%, #020509 80%, #000000 100%)' : undefined
      }}
    >
      {/* 180+ Twinkling Stars (visible in both themes but glows more in space mode) */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${isSpace ? 'opacity-100' : 'opacity-25'}`}>
        {starsList.map((star) => (
          <div 
            key={star.id}
            className="absolute rounded-full bg-white animate-twinkle shadow-sm"
            style={{
              top: `${star.y}%`,
              left: `${star.x}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Milky Way Band Overlay */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 mix-blend-screen
          ${isSpace ? 'opacity-80' : 'opacity-10'}
        `}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0) 20%, rgba(201,147,58,0.04) 45%, rgba(139,0,0,0.03) 55%, rgba(255,255,255,0) 80%)'
        }}
      />

      {/* Nebula Glow Patches */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[160px] opacity-15 mix-blend-screen"
          style={{ background: 'radial-gradient(circle, rgba(201,147,58,0.25) 0%, rgba(0,0,0,0) 70%)' }}
        />
        <div 
          className="absolute -top-10 left-10 w-[450px] h-[450px] rounded-full blur-[140px] opacity-20 mix-blend-screen"
          style={{ background: 'radial-gradient(circle, rgba(139,0,0,0.2) 0%, rgba(0,0,0,0) 70%)' }}
        />
      </div>

      {/* Section Header Text detailing Globe function */}
      <div className="relative z-10 w-full max-w-2xl text-center px-6 mb-8">
        <h2 className="font-serif font-black text-2xl sm:text-3xl tracking-tight mb-2">
          Cosmos of Learning
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
          Hover over fields to preview scholastic branches. Click <strong className="text-gold font-medium dark:text-gold-light pointer-events-auto cursor-pointer underline" onClick={triggerHadithPopup}>Hadith</strong> or the <strong className="font-medium">Globe Center</strong> to query authentic prophetic wisdom.
        </p>
      </div>

      {/* CENTRALIZED EARTH GLOBE ORBIT DISPLAY */}
      <div className="relative w-full max-w-5xl h-[550px] sm:h-[650px] flex justify-center items-center select-none">
        
        {/* Concentric Orbit Rings (Desktop only) */}
        <div className="absolute inset-0 pointer-events-none hidden md:block">
          {/* Ring 1 - Outer */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-gold/15 animate-slow-rotate" style={{ transformStyle: 'preserve-3d', transform: 'translate(-50%, -50%) rotateX(15deg) rotateY(10deg)' }}>
            <div className="absolute top-0 left-1/2 -ml-1 w-2.5 h-2.5 rounded-full bg-gold/80 animate-pulse duration-700" />
          </div>
          
          {/* Ring 2 with Crescent Moon traveling */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] rounded-full border border-gold/25 animate-slow-rotate" style={{ animationDirection: 'reverse', transformStyle: 'preserve-3d', transform: 'translate(-50%, -50%) rotateX(-25deg) rotateY(20deg)', animationDuration: '24s' }}>
            <div className="absolute -top-1.5 left-1/2 -ml-2 text-gold font-sans text-xs select-none">🌙</div>
          </div>

          {/* Ring 3 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[660px] h-[660px] rounded-full border border-crimson/10 animate-slow-rotate" style={{ transformStyle: 'preserve-3d', transform: 'translate(-50%, -50%) rotateX(45deg) rotateY(-15deg)', animationDuration: '32s' }} />
        </div>

        {/* Central HTML 3D Globe with Click Handler for Hadith */}
        <div 
          onClick={triggerHadithPopup}
          className={`relative w-64 h-64 sm:w-80 sm:h-80 rounded-full flex justify-center items-center overflow-hidden border border-gold/40 z-20 cursor-pointer shadow-2xl transition-all duration-500 hover:scale-105 active:scale-95 group/globe ${!isSpace ? 'bg-[#0F1E36] glow-halo' : ''}`}
          style={{
            background: isSpace ? 'radial-gradient(circle at 30% 30%, #2D6A4F 0%, #1A6B9A 40%, #060D1F 100%)' : undefined,
            boxShadow: isSpace ? 'inset -20px -20px 50px rgba(0,0,0,0.8), 0 0 60px 15px rgba(232,184,109,0.15)' : undefined
          }}
          title="Click to receive Prophetic Wisdom in center"
        >
          {/* Specular Highlight glare */}
          <div 
            className="absolute top-2 left-6 w-36 h-20 rounded-full pointer-events-none z-35 opacity-70"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 80%)',
              transform: 'rotate(-25deg)'
            }}
          />

          {/* Map Continent Vector Layer 1 (Realistic world map scrolling seamlessly) */}
          <div className="absolute w-[200%] h-full flex flex-row pointer-events-none animate-map-scroll">
            <svg className="w-1/2 h-full fill-emerald-800/80 stroke-gold/10" viewBox="0 0 400 200" preserveAspectRatio="none">
              <path d="M 0,185 Q 200,180 400,185 L 400,195 L 0,195 Z" />
              <path d="M 30,35 C 45,38 60,32 75,48 C 80,58 70,72 65,82 C 55,87 40,84 35,72 C 25,62 15,52 15,42 C 15,34 25,30 30,35 Z" />
              <path d="M 100,22 C 110,20 120,24 118,37 C 110,47 95,42 92,32 C 92,27 96,24 100,22 Z" />
              <path d="M 65,88 C 75,93 82,103 80,118 C 75,133 68,148 60,168 C 55,163 52,151 56,133 C 60,118 55,103 58,98 C 60,95 63,91 65,88 Z" />
              <path d="M 170,78 C 185,76 210,83 215,98 C 218,113 210,128 205,138 C 198,153 190,163 184,158 C 178,143 174,131 171,121 C 165,111 160,103 160,93 C 160,85 165,80 170,78 Z" />
              <path d="M 150,42 C 160,32 200,27 240,27 C 280,27 320,32 330,44 C 320,62 300,77 285,82 C 270,77 250,72 230,87 C 210,90 190,84 180,77 C 170,72 155,57 150,42 Z" />
              <path d="M 290,128 C 310,125 325,133 322,145 C 315,155 295,153 285,143 C 280,138 285,131 290,128 Z" />
              <path d="M 235,70 C 242,77 248,87 245,92 C 240,94 235,82 230,84 C 228,77 232,72 235,70 Z" />
              <path d="M 260,87 C 265,92 270,107 268,112 C 262,112 258,100 258,92 Z" />
            </svg>
            <svg className="w-1/2 h-full fill-emerald-800/80 stroke-gold/10" viewBox="0 0 400 200" preserveAspectRatio="none">
              <path d="M 0,185 Q 200,180 400,185 L 400,195 L 0,195 Z" />
              <path d="M 30,35 C 45,38 60,32 75,48 C 80,58 70,72 65,82 C 55,87 40,84 35,72 C 25,62 15,52 15,42 C 15,34 25,30 30,35 Z" />
              <path d="M 100,22 C 110,20 120,24 118,37 C 110,47 95,42 92,32 C 92,27 96,24 100,22 Z" />
              <path d="M 65,88 C 75,93 82,103 80,118 C 75,133 68,148 60,168 C 55,163 52,151 56,133 C 60,118 55,103 58,98 C 60,95 63,91 65,88 Z" />
              <path d="M 170,78 C 185,76 210,83 215,98 C 218,113 210,128 205,138 C 198,153 190,163 184,158 C 178,143 174,131 171,121 C 165,111 160,103 160,93 C 160,85 165,80 170,78 Z" />
              <path d="M 150,42 C 160,32 200,27 240,27 C 280,27 320,32 330,44 C 320,62 300,77 285,82 C 270,77 250,72 230,87 C 210,90 190,84 180,77 C 170,72 155,57 150,42 Z" />
              <path d="M 290,128 C 310,125 325,133 322,145 C 315,155 295,153 285,143 C 280,138 285,131 290,128 Z" />
              <path d="M 235,70 C 242,77 248,87 245,92 C 240,94 235,82 230,84 C 228,77 232,72 235,70 Z" />
              <path d="M 260,87 C 265,92 270,107 268,112 C 262,112 258,100 258,92 Z" />
            </svg>
          </div>

          {/* Latitude and Longitude Graticule grid overlay */}
          <svg className="absolute inset-0 w-full h-full stroke-white/10 fill-none pointer-events-none z-15" viewBox="0 0 100 100" preserveAspectRatio="none">
            <ellipse cx="50" cy="50" rx="46" ry="12" />
            <ellipse cx="50" cy="50" rx="48" ry="26" />
            <ellipse cx="50" cy="50" rx="49" ry="38" />
            <line x1="2" y1="50" x2="98" y2="50" />
            <ellipse cx="50" cy="50" rx="14" ry="49" />
            <ellipse cx="50" cy="50" rx="31" ry="49" />
          </svg>

          {/* Clouds Overlay revolving slightly faster */}
          <div className="absolute w-[200%] h-full flex flex-row pointer-events-none animate-cloud-scroll opacity-25 z-10">
            <svg className="w-1/2 h-full fill-white" viewBox="0 0 400 200" preserveAspectRatio="none">
              <ellipse cx="60" cy="50" rx="40" ry="12" />
              <ellipse cx="180" cy="90" rx="60" ry="16" />
              <ellipse cx="280" cy="140" rx="70" ry="24" />
              <ellipse cx="320" cy="40" rx="35" ry="10" />
              <ellipse cx="110" cy="150" rx="45" ry="14" />
            </svg>
            <svg className="w-1/2 h-full fill-white" viewBox="0 0 400 200" preserveAspectRatio="none">
              <ellipse cx="60" cy="50" rx="40" ry="12" />
              <ellipse cx="180" cy="90" rx="60" ry="16" />
              <ellipse cx="280" cy="140" rx="70" ry="24" />
              <ellipse cx="320" cy="40" rx="35" ry="10" />
              <ellipse cx="110" cy="150" rx="45" ry="14" />
            </svg>
          </div>

          {/* Globe Atmosphere Shadow Gradients */}
          <div className="absolute inset-0 z-20 pointer-events-none rounded-full" style={{ boxShadow: 'inset -25px -25px 50px rgba(0,0,0,0.85), inset 15px 15px 35px rgba(255,255,255,0.1)' }} />
          
          {/* Center Arabic Text Watermark */}
          <div className="absolute z-20 flex flex-col justify-center items-center pointer-events-none text-center">
            <span className="font-arabic text-gold text-2xl group-hover/globe:text-gold-light group-hover/globe:scale-110 transition-all duration-300 select-none font-bold">الْبَاب</span>
            <span className="text-[9px] tracking-[0.2em] text-white/55 font-mono select-none group-hover/globe:text-white/80 transition-all duration-300">ALBAB</span>
            <span className="text-[8px] tracking-widest text-[#E8B86D] font-sans opacity-0 group-hover/globe:opacity-100 transition-all duration-300 mt-1 uppercase">Get Hadith</span>
          </div>
        </div>

        {/* DESKTOP: 8 Centered Floating Course Cards */}
        <div className="absolute inset-0 pointer-events-none hidden md:block">
          {COURSES.map((course, idx) => {
            const pos = cardPositions[idx];
            const isSelected = selectedCourseId === course.id;

            const handleCardClick = (e: React.MouseEvent) => {
              e.stopPropagation();
              // If Hadith card itself is clicked, trigger the popup
              if (course.id === 'hadith') {
                triggerHadithPopup();
              } else {
                onSelectCourse(course);
              }
            };

            return (
              <div 
                key={course.id}
                className="absolute cursor-pointer pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 animate-float-card"
                style={{ 
                  top: pos.top, 
                  left: pos.left,
                  animationDelay: `${idx * 0.45}s`
                }}
                onClick={handleCardClick}
              >
                <div className={`relative px-4 py-3 rounded border w-44 backdrop-blur-md transition-all duration-300
                  ${isSpace 
                    ? 'bg-space/85 border-gold/30 hover:border-gold hover:shadow-[0_0_15px_rgba(201,147,58,0.4)]' 
                    : 'bg-white/95 border-crimson/25 hover:border-crimson hover:shadow-[0_10px_20px_rgba(139,0,0,0.1)]'
                  }
                  ${isSelected ? (isSpace ? 'border-amber-400 bg-amber-950/20 scale-105' : 'border-crimson bg-crimson/5 scale-105') : ''}
                `}>
                  {/* Tiny Crimson corner line indicators */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-gold/40 rounded-tl-xs" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-gold/40 rounded-br-xs" />

                  <div className="flex items-center gap-2">
                    <span className={isSpace ? 'text-gold' : 'text-crimson'}>
                      {getIcon(course.icon)}
                    </span>
                    <div>
                      <h4 className="font-serif font-black text-sm tracking-wide leading-none">{course.name}</h4>
                      <span className="text-[9px] text-stone-400 dark:text-stone-500 font-mono tracking-wider">{course.count}</span>
                    </div>
                  </div>

                  {/* Smooth sliding sub-branches listed on hover */}
                  <div className="max-h-0 overflow-hidden group-hover:max-h-24 group-hover:mt-2 transition-all duration-500 ease-in-out">
                    <div className="border-t border-stone-200/20 pt-1.5 flex flex-col gap-0.5 select-none pointer-events-none">
                      {course.branches.slice(0, 3).map((branch, bid) => (
                        <span key={bid} className="text-[10px] text-stone-500 italic block font-serif leading-none truncate font-semibold">
                          ✦ {branch}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MOBILE COLLAPSED: 2x4 Grid Below Globe */}
      <div className="w-full max-w-lg mx-auto px-6 mt-1 md:hidden flex flex-col select-none relative z-10">
        <h3 className="text-center font-serif italic text-stone-400 dark:text-stone-500 text-xs mb-4">
          — Select field to explore scholarly branches —
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {COURSES.map((course) => {
            const isSelected = selectedCourseId === course.id;
            const handleMobileCardClick = () => {
              if (course.id === 'hadith') {
                triggerHadithPopup();
              } else {
                onSelectCourse(course);
              }
            };

            return (
              <button 
                key={course.id}
                onClick={handleMobileCardClick}
                className={`flex items-center gap-2.5 p-3.5 border rounded-sm transition-all duration-300 text-left active:scale-95
                  ${isSpace 
                    ? 'bg-space/85 border-gold/20 text-white' 
                    : 'bg-white border-crimson/15 text-charcoal'
                  }
                  ${isSelected ? (isSpace ? 'border-gold bg-gold/15' : 'border-crimson bg-crimson/5') : ''}
                `}
              >
                <span className={isSpace ? 'text-gold' : 'text-crimson'}>
                  {getIcon(course.icon)}
                </span>
                <div className="leading-none">
                  <h4 className="font-serif font-black text-sm tracking-wide">{course.name}</h4>
                  <p className="text-[9px] text-stone-400 dark:text-stone-500 font-mono mt-0.5">{course.count}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* INTERACTIVE WISDOM HADITH POPUP (STUNNING CENTERED MODAL OVERLAY) */}
      {showHadithModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div 
            className={`relative max-w-2xl w-full p-8 md:p-12 border rounded-sm md:rounded-md shadow-2xl transition-all duration-500 border-l-4 animate-scale-up
              ${isSpace 
                ? 'bg-[#0a0f1d] border-l-gold border-t-gold/10 border-r-gold/10 border-b-gold/10 text-white' 
                : 'bg-[#FFF9F0] border-l-crimson border-stone-200 text-charcoal'
              }
            `}
          >
            {/* Close Button Button */}
            <button 
              onClick={() => setShowHadithModal(false)}
              className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300
                ${isSpace 
                  ? 'text-stone-400 hover:text-white hover:bg-white/5' 
                  : 'text-stone-500 hover:text-charcoal hover:bg-black/5'
                }
              `}
              title="Close modal"
            >
              <LucideIcons.X className="w-5 h-5" />
            </button>

            {/* Icon Header */}
            <div className="text-center mb-6">
              <LucideIcons.MessageSquareQuote className={`h-8 w-8 mx-auto mb-2 opacity-85
                ${isSpace ? 'text-gold' : 'text-crimson'}
              `} />
              <h3 className="font-serif font-black text-xl tracking-wide mb-1">Celestial Wisdom</h3>
              <span className="text-[9px] font-mono tracking-widest text-stone-400 dark:text-stone-500 uppercase font-black">
                Featured Prophetic Hadith
              </span>
            </div>

            {/* ARABIC TEXT */}
            <div className="text-center mb-6 select-all font-semibold font-arabic text-xl sm:text-2xl leading-relaxed sm:leading-loose tracking-wide text-gold dark:text-gold-light">
              {activeHadith.arabic}
            </div>

            {/* ENGLISH TRANSLATION */}
            <p className="font-serif italic text-base sm:text-lg leading-relaxed text-stone-600 dark:text-stone-300 text-center max-w-2xl mx-auto mb-6">
              "{activeHadith.translation}"
            </p>

            {/* SOURCE BUTTON BADGE */}
            <div className="text-center mb-6">
              <span className={`inline-block text-[10px] md:text-xs font-mono font-bold tracking-wider py-1 px-3 border rounded-xs select-none
                ${isSpace 
                  ? 'bg-gold/10 border-gold/30 text-gold-light' 
                  : 'bg-crimson/5 border-crimson/25 text-crimson-light'
                }
              `}>
                {activeHadith.source}
              </span>
            </div>

            {/* CONTEXT ACCENT */}
            {activeHadith.context && (
              <div className="mt-6 pt-6 border-t border-stone-200/10 text-center">
                <p className="text-xs text-stone-400 dark:text-stone-500 max-w-xl mx-auto leading-relaxed">
                  <span className="font-semibold uppercase tracking-wider font-mono text-[9px] mr-1">Context:</span>
                  {activeHadith.context}
                </p>
              </div>
            )}

            {/* CYCLER BUTTON & CLOSE BUTTONS */}
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <button 
                onClick={handleNextHadith}
                className={`flex items-center gap-2 text-[10px] font-bold tracking-[0.25em] uppercase py-2.5 px-6 rounded-sm border transition-all duration-300 active:scale-95 shadow-sm
                  ${isSpace 
                    ? 'border-gold/30 text-gold-light hover:border-gold hover:bg-gold/10' 
                    : 'border-crimson/30 text-crimson hover:bg-crimson/5'
                  }
                `}
              >
                <LucideIcons.Sparkles className="h-3.5 w-3.5 animate-spin-slow" />
                Next Hadith
              </button>
              <button 
                onClick={() => setShowHadithModal(false)}
                className={`text-[10px] font-bold tracking-[0.25em] uppercase py-2.5 px-6 rounded-sm transition-all duration-300 active:scale-95
                  ${isSpace 
                    ? 'bg-stone-800 hover:bg-stone-700 text-white' 
                    : 'bg-stone-200 hover:bg-stone-300 text-charcoal'
                  }
                `}
              >
                Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
