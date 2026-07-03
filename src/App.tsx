import React, { useState, useEffect } from 'react';
import { GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import GlobeSection from './components/GlobeSection';
import EditorialSection from './components/EditorialSection';
import CurriculumInspector from './components/CurriculumInspector';
import DashboardPortal from './components/DashboardPortal';
import HadithDisplay from './components/HadithDisplay';
import PropheticHadiths from './components/PropheticHadiths';
import AdmissionPortal from './components/AdmissionPortal';
import Footer from './components/Footer';
import FloatingContacts from './components/FloatingContacts';
import DebateArena from './components/DebateArena';
import QuranExplorer from './components/QuranExplorer';
import FiqhRuling from './components/FiqhRuling';
import CognitiveLabs from './components/CognitiveLabs';
import WaswasClinic from './components/WaswasClinic';
import MantiqTutor from './components/MantiqTutor';
import FallacyScanner from './components/FallacyScanner';
import NafsAssessmentScreen from './components/NafsAssessmentScreen';
import MaqasidAnalyzer from './components/MaqasidAnalyzer';
import AqeedahFirewall from './components/AqeedahFirewall';
import RuyaInterpreter from './components/RuyaInterpreter';
import AcademicWorld from './components/AcademicWorld';
import FivePillarsSection from './components/FivePillarsSection';
import DhikrSection from './components/DhikrSection';
import MobileQuickNav from './components/MobileQuickNav';
import ScrollSpyIndicator from './components/ScrollSpyIndicator';
import { Language } from './i18n';
import { Course } from './types';
import { COURSES } from './data';
import ScholasticQuiz from './components/ScholasticQuiz';

export default function App() {
  const [currentTheme, setCurrentTheme] = useState<'parchment' | 'space'>('parchment');
  const [isThemeTransitioning, setIsThemeTransitioning] = useState<boolean>(false);
  const [previousTheme, setPreviousTheme] = useState<'parchment' | 'space' | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('quran');
  const [searchText, setSearchText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [admissionOpen, setAdmissionOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [currentSection, setCurrentSection] = useState<'landing' | 'academic-world' | 'portal' | 'debate' | 'quran-explorer' | 'fiqh-ruling' | 'cognitive-labs' | 'waswas-clinic' | 'mantiq-tutor' | 'nafs-assessment' | 'maqasid-analyzer' | 'aqeedah-firewall' | 'ruya-interpreter' | 'hadith' | 'scholastic-quiz'>(() => {
    if (window.location.hash === '#academic-world' || window.location.pathname === '/academic-world') {
      return 'academic-world';
    }
    if (window.location.hash === '#hadith' || window.location.pathname === '/hadith') {
      return 'hadith';
    }
    if (window.location.hash === '#waswas-clinic' || window.location.pathname === '/waswas-clinic') {
      return 'waswas-clinic';
    }
    if (window.location.hash === '#aqeedah-firewall' || window.location.pathname === '/aqeedah-firewall') {
      return 'aqeedah-firewall';
    }
    if (window.location.hash === '#ruya-interpreter' || window.location.pathname === '/ruya-interpreter') {
      return 'ruya-interpreter';
    }
    if (window.location.hash === '#maqasid-analyzer' || window.location.pathname === '/maqasid-analyzer') {
      return 'maqasid-analyzer';
    }
    if (window.location.hash === '#mantiq-tutor' || window.location.pathname === '/mantiq-tutor') {
      return 'mantiq-tutor';
    }
    if (window.location.hash === '#nafs-assessment' || window.location.pathname === '/nafs-assessment') {
      return 'nafs-assessment';
    }
    if (window.location.hash === '#scholastic-quiz' || window.location.pathname === '/scholastic-quiz') {
      return 'scholastic-quiz';
    }
    return 'landing';
  });

  // Multi-Language State (English, Arabic, Urdu)
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('albab_language');
    return (saved as Language) || 'en';
  });

  // Track bookmarked Qur'an Verses
  const [bookmarkedKeys, setBookmarkedKeys] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('albab_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Mouse position for subtle parallax effect across the portal
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });

  // Splash Screen and Islamic Greeting States
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [splashSeconds, setSplashSeconds] = useState<number>(8); // Count down from 8 seconds as requested

  // Helper to determine the dynamic contextual Islamic greeting
  const getGreetingData = () => {
    const hour = new Date().getHours();
    
    if (hour >= 4 && hour < 12) {
      return {
        arabic: "أَسْقَاكَ اللهُ صَبَاحَ الْخَيْرِ",
        salutation: "Sabah al-Khair",
        subtext: "May your morning be filled with Fajr barakah & pure scholastic clarity.",
        label: "Subh (Morning) Blessing",
        icon: "☀️"
      };
    } else if (hour >= 12 && hour < 18) {
      return {
        arabic: "أَسْعَدَ اللهُ مَسَاءَكُمْ",
        salutation: "Masa' al-Khair",
        subtext: "May your afternoon be guided by divine focus, peace & sacred knowledge.",
        label: "Asr (Afternoon) Guidance",
        icon: "✨"
      };
    } else {
      return {
        arabic: "طَابَتْ لَيْلَتُكُمْ بِالْخَيْرِ",
        salutation: "Tabat Lailatukum",
        subtext: "May your night be wrapped in silent contemplation, peace & wisdom.",
        label: "Layl (Night) Reflection",
        icon: "🌙"
      };
    }
  };

  const greetingData = getGreetingData();

  // Splash countdown effect
  useEffect(() => {
    if (!showSplash) return;
    const interval = setInterval(() => {
      setSplashSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowSplash(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showSplash]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalise coordinates between -1 and 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMouseCoords({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleAddBookmark = (key: string, label: string) => {
    setBookmarkedKeys(prev => {
      const next = prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key];
      localStorage.setItem('albab_bookmarks', JSON.stringify(next));
      return next;
    });
  };

  // Synchronize hash / path navigation change
  useEffect(() => {
    const handleUrlChange = () => {
      if (window.location.hash === '#academic-world' || window.location.pathname === '/academic-world') {
         setCurrentSection('academic-world');
      } else if (window.location.hash === '#waswas-clinic' || window.location.pathname === '/waswas-clinic') {
         setCurrentSection('waswas-clinic');
      } else if (window.location.hash === '#aqeedah-firewall' || window.location.pathname === '/aqeedah-firewall') {
         setCurrentSection('aqeedah-firewall');
      } else if (window.location.hash === '#ruya-interpreter' || window.location.pathname === '/ruya-interpreter') {
         setCurrentSection('ruya-interpreter');
      } else if (window.location.hash === '#maqasid-analyzer' || window.location.pathname === '/maqasid-analyzer') {
         setCurrentSection('maqasid-analyzer');
      } else if (window.location.hash === '#mantiq-tutor' || window.location.pathname === '/mantiq-tutor') {
         setCurrentSection('mantiq-tutor');
      } else if (window.location.hash === '#nafs-assessment' || window.location.pathname === '/nafs-assessment') {
         setCurrentSection('nafs-assessment');
      } else if (window.location.hash === '#hadith' || window.location.pathname === '/hadith') {
         setCurrentSection('hadith');
      }
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Sync language selection direction attributes with HTML root body
  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem('albab_language', language);
    if (language === 'ar' || language === 'ur') {
      root.setAttribute('dir', 'rtl');
    } else {
      root.setAttribute('dir', 'ltr');
    }
  }, [language]);

  // Scroll to top upon section changes
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [currentSection]);

  // Sync theme with root HTML class for scrollbar/theme color compliance
  useEffect(() => {
    const root = document.documentElement;
    if (currentTheme === 'space') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [currentTheme]);

  const handleToggleTheme = () => {
    setPreviousTheme(currentTheme);
    setIsThemeTransitioning(true);
    setCurrentTheme(prev => (prev === 'parchment' ? 'space' : 'parchment'));
  };

  const handleSelectCourse = (courseOrId: Course | string) => {
    const rawId = typeof courseOrId === 'string' ? courseOrId : courseOrId.id;
    // Map section/tool IDs to corresponding canonical course IDs in data.ts
    const sectionToCourseMap: Record<string, string> = {
      'quran-explorer': 'quran',
      'hadith': 'hadith',
      'debate': 'challenges',
      'fiqh-ruling': 'fiqh',
      'aqeedah-firewall': 'islamic-studies',
      'mantiq-tutor': 'logic',
      'fallacy-scanner': 'logic',
      'waswas-clinic': 'psychology',
      'dhikr-rx': 'psychology',
      'nafs-assessment': 'psychology',
      'ruya-interpreter': 'psychology',
      'maqasid-analyzer': 'fiqh',
      'portal': 'economic-studies'
    };

    const courseId = sectionToCourseMap[rawId] || rawId;
    setSelectedCourseId(courseId);
    setCurrentSection('landing');
    setActiveTab('curriculum');
    setTimeout(() => {
      const el = document.getElementById('canonical-inspector-viewport');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 80);
  };

  const handleNavigateToSection = (section: string) => {
    const landingSections = ['landing', 'curriculum', 'islamic-pillars', 'dhikr-section'];
    setActiveTab(section);
    
    if (landingSections.includes(section)) {
      if (currentSection !== 'landing') {
        setCurrentSection('landing');
        // Wait for page transition / state render to complete, then scroll smoothly
        setTimeout(() => {
          const targetId = section === 'landing' ? 'hero' : section;
          const element = document.getElementById(targetId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 150);
      } else {
        const targetId = section === 'landing' ? 'hero' : section;
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    } else {
      setCurrentSection(section as any);
    }
  };

  // Sync activeTab state with currentSection for external navigation flows
  useEffect(() => {
    const landingSubSections = ['curriculum', 'islamic-pillars', 'dhikr-section'];
    if (!landingSubSections.includes(activeTab)) {
      setActiveTab(currentSection);
    } else if (currentSection !== 'landing') {
      setActiveTab(currentSection);
    }
  }, [currentSection]);

  const handleSearch = (term: string) => {
    setSearchText(term);
    // If we're searching, reset to landing page first then scroll cleanly down to scientific curriculum inspector sector!
    if (term) {
      setCurrentSection('landing');
      setTimeout(() => {
        const el = document.getElementById('canonical-inspector-viewport');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    }
  };

  return (
    <div 
      className={`min-h-screen font-sans transition-all duration-700 overflow-x-hidden relative
        ${currentTheme === 'space' 
          ? 'theme-dark bg-space futuristic-islamic-grid-space text-white/90' 
          : 'theme-light bg-[#FAF6EF] futuristic-islamic-grid-parchment text-charcoal'
        }
      `}
    >
      {/* AUTHENTIC ISLAMIC ARABESQUE PATTERN WATERMARK COVERING THE ENTIRE WEBSITE */}
      <div 
        className="absolute inset-0 opacity-[0.06] dark:opacity-[0.10] bg-repeat arabesque-grid pointer-events-none z-0 transition-transform duration-300 ease-out" 
        style={{
          transform: `translate(${mouseCoords.x * 10}px, ${mouseCoords.y * 10}px)`,
        }}
      />
      {/* AUTHENTIC SACRED ISLAMIC CALLIGRAPHY ART FLOATING WATERMARK */}
      <div 
        className="absolute inset-0 opacity-[0.08] dark:opacity-[0.15] bg-repeat calligraphy-grid pointer-events-none z-0 transition-transform duration-500 ease-out" 
        style={{
          transform: `translate(${mouseCoords.x * -16}px, ${mouseCoords.y * -16}px) scale(1.02)`,
        }}
      />
      
      {/* FULL-SCREEN OVERLAY FOR CHROMATIC THEMATIC CROSS-FADE TRANSITION */}
      <AnimatePresence>
        {isThemeTransitioning && previousTheme && (
          <motion.div
            key={`theme-transition-${previousTheme}`}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            onAnimationComplete={() => {
              setIsThemeTransitioning(false);
              setPreviousTheme(null);
            }}
            className={`fixed inset-0 z-[9999] pointer-events-none transition-colors duration-200 ${
              previousTheme === 'space' ? 'bg-[#020509]' : 'bg-[#FAF6EF]'
            }`}
          />
        )}
      </AnimatePresence>

      {/* DYNAMIC HIGH-END CONTEXTUAL GREETING SPLASH SCREEN OVERLAY */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[20000] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#FCFAF6] via-[#F4EFE6] to-[#FCFAF6] text-stone-900 px-6 select-none"
          >
            {/* Spiritual Geometric & Calligraphy Background Canvas */}
            <div className="absolute inset-0 opacity-[0.08] bg-repeat arabesque-grid pointer-events-none scale-110 animate-spin-slow" />
            <div className="absolute inset-0 opacity-[0.09] bg-repeat calligraphy-grid pointer-events-none scale-105" />

            {/* Ambient gold radiant radial glow behind the center content */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(196,163,90,0.12)_0%,transparent_70%)] pointer-events-none blur-3xl" />
            
            {/* Ambient vignette shadow overlay to darken the edges and draw eyes to the center */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(244,239,230,0.7)_95%)] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center max-w-2xl w-full text-center px-4">
              {/* Islamic Architectural Mihrab Arch Design with Star Rosette */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.4, ease: "easeOut" }}
                className="mb-6 relative flex items-center justify-center"
              >
                {/* Mihrab Arch silhouette overlaying the star rosette */}
                <svg className="w-32 h-32 md:w-36 md:h-36 stroke-[#0B4628] fill-[#0B4628]/5 text-[#0B4628] drop-shadow-[0_4px_25px_rgba(11,70,40,0.12)]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M20,85 L20,48 C20,24 38,14 50,5 C62,14 80,24 80,48 L80,85 Z" className="stroke-[#0B4628]" />
                  <path d="M26,85 L26,50 C26,28 39,18 50,10 C61,18 74,28 74,50 L74,85" strokeWidth="0.8" className="stroke-[#C4A35A]" strokeDasharray="3 3" />
                  
                  {/* Concentric 12-pointed star rosette in rich gold */}
                  <g transform="translate(50, 48) scale(0.35)">
                    <rect x="-25" y="-25" width="50" height="50" transform="rotate(0)" className="stroke-[#C4A35A] fill-[#C4A35A]/10" strokeWidth="1.5" />
                    <rect x="-25" y="-25" width="50" height="50" transform="rotate(30)" className="stroke-[#C4A35A] fill-[#C4A35A]/10" strokeWidth="1.5" />
                    <rect x="-25" y="-25" width="50" height="50" transform="rotate(60)" className="stroke-[#C4A35A] fill-[#C4A35A]/10" strokeWidth="1.5" />
                    <circle cx="0" cy="0" r="15" strokeWidth="1" className="stroke-[#C4A35A]/50" />
                    <circle cx="0" cy="0" r="5" className="fill-[#C4A35A]" />
                  </g>
                </svg>
                {/* Floating Cap Icon in center of Mihrab */}
                <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <GraduationCap className="w-8 h-8 text-[#C4A35A] animate-pulse" />
                </div>
              </motion.div>

              {/* MUSEUM-GRADE EMBELLISHED GLASS PLAQUE CONTAINER FOR OPTIMAL READABILITY */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 1.0 }}
                className="w-full relative overflow-hidden p-6 md:p-8 rounded-2xl border-2 border-[#0B4628]/25 bg-white/95 backdrop-blur-xl shadow-[0_25px_60px_rgba(11,70,40,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] flex flex-col items-center gap-4"
              >
                {/* Subtle ornamental gold corner brackets on plaque */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#C4A35A]" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#C4A35A]" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#C4A35A]" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#C4A35A]" />

                {/* Main Full Sacred Salam in Arabic calligraphy text in GREEN FONT */}
                <h1 className="font-serif text-3xl sm:text-4xl md:text-[2.65rem] font-extrabold text-[#0B4628] tracking-wide font-amiri leading-normal drop-shadow-[0_1px_2px_rgba(11,70,40,0.1)] select-text">
                  السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ
                </h1>

                {/* Transliteration of Full Salam in GOLDEN FONT */}
                <p className="text-xs sm:text-sm font-mono tracking-wider font-extrabold text-[#C4A35A] uppercase text-center max-w-lg">
                  As-salamu alaykum wa rahmatullahi wa barakatuh
                </p>

                {/* Translation of Full Salam in deep grey/black font */}
                <p className="text-xs sm:text-sm text-stone-600 font-serif font-medium italic text-center leading-relaxed">
                  "Peace, Mercy, and Blessings of Allah be upon you"
                </p>

                {/* Elegant separator line with Green & Gold */}
                <div className="flex items-center gap-3 w-40 justify-center my-1">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#0B4628]/30" />
                  <span className="text-[#C4A35A] text-[10px] font-bold">✦</span>
                  <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#0B4628]/30" />
                </div>

                {/* Contextual Greeting Section (Subh/Asr/Layl) */}
                <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-[#0B4628]/5 border border-[#0B4628]/10 w-full max-w-md">
                  {/* Greeting Label Pill */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C4A35A]/15 border border-[#C4A35A]/30">
                    <span className="text-xs animate-bounce" style={{ animationDuration: '3s' }}>{greetingData.icon}</span>
                    <span className="text-[9px] font-mono tracking-[0.2em] uppercase font-black text-[#0B4628]">
                      {greetingData.label}
                    </span>
                  </div>

                  {/* Contextual Arabic Greeting */}
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#C4A35A] font-amiri leading-none">
                    {greetingData.arabic}
                  </h2>

                  {/* Transliteration and Blessing Message */}
                  <p className="text-[10px] font-mono tracking-widest font-black text-stone-500">
                    {greetingData.salutation}
                  </p>
                  <p className="text-xs text-stone-600 font-serif italic text-center max-w-[340px]">
                    "{greetingData.subtext}"
                  </p>
                </div>

                {/* Loading Status Indicator and Timeline */}
                <div className="w-full pt-2 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0B4628] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0B4628]"></span>
                    </span>
                    <span className="text-[10px] font-mono text-[#0B4628] font-bold tracking-wider">
                      Initiating Islamic Scholastic Portal...
                    </span>
                  </div>
                  
                  {/* Countdown Loading Progress Bar in White & Green background with GOLD indicator */}
                  <div className="w-64 max-w-xs h-[5px] bg-stone-100 rounded-full overflow-hidden relative border border-[#0B4628]/20 shadow-sm">
                    <motion.div 
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 8, ease: "linear" }}
                      className="h-full bg-gradient-to-r from-[#C4A35A]/60 via-[#E8B86D] to-[#C4A35A]"
                    />
                  </div>

                  {/* Elegant Tactile Skip button with GOLDEN FONT on White & Green border */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    onClick={() => setShowSplash(false)}
                    className="mt-1 px-6 py-2 border-2 border-[#0B4628]/30 hover:border-[#C4A35A] bg-[#0B4628]/5 hover:bg-[#0B4628]/10 rounded-full text-[10px] font-mono uppercase tracking-[0.2em] text-[#0B4628] font-black transition-all duration-300 hover:scale-[1.03] active:scale-95 cursor-pointer shadow-md"
                  >
                    Enter Portal ({splashSeconds}s)
                  </motion.button>
                </div>
              </motion.div>
            </div>

            {/* Large Outer Geometric Ornamental Border Corners of viewport */}
            <div className="absolute top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-gold/20 pointer-events-none rounded-tl" />
            <div className="absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-gold/20 pointer-events-none rounded-tr" />
            <div className="absolute bottom-6 left-6 w-16 h-16 border-b-2 border-l-2 border-gold/20 pointer-events-none rounded-bl" />
            <div className="absolute bottom-6 right-6 w-16 h-16 border-b-2 border-r-2 border-gold/20 pointer-events-none rounded-br" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* EXQUISITE NAV HEADER */}
      <Header 
        currentTheme={currentTheme}
        onToggleTheme={handleToggleTheme}
        onSearch={handleSearch}
        onOpenAdmission={() => setAdmissionOpen(true)}
        onOpenPortal={() => handleNavigateToSection('portal')}
        onGoToLanding={() => handleNavigateToSection('landing')}
        activeTab={activeTab}
        onTabChange={handleNavigateToSection}
        language={language}
        onLanguageChange={setLanguage}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {currentSection === 'academic-world' && (
        <div className="pt-36 sm:pt-40 pb-12 min-h-[82vh] transition-all duration-500 animate-fade-in">
          <AcademicWorld 
            currentTheme={currentTheme}
            onNavigateToSection={(sec) => {
              setCurrentSection(sec as any);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            language={language}
          />
        </div>
      )}

      {currentSection === 'portal' && (
        <div className="pt-32 sm:pt-36 min-h-[85vh] transition-all duration-500 animate-fade-in">
          {/* SECURE STUDENT AND ADMINISTRATION PORTAL SECTION */}
          <DashboardPortal 
            currentTheme={currentTheme} 
            onBackToLanding={() => setCurrentSection('academic-world')}
          />
        </div>
      )}

      {currentSection === 'debate' && (
        <div className="pt-36 sm:pt-40 pb-16 min-h-[80vh] animate-fade-in">
          <DebateArena currentTheme={currentTheme} />
          <div className="text-center mt-8">
            <button
              onClick={() => setCurrentSection('academic-world')}
              className="font-mono text-xs uppercase px-5 py-2.5 border border-stone-300 dark:border-zinc-800 rounded hover:bg-stone-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer font-bold"
            >
              &larr; Back to Scholastic Universe
            </button>
          </div>
        </div>
      )}

      {currentSection === 'quran-explorer' && (
        <div className="pt-36 sm:pt-40 pb-16 min-h-[80vh] animate-fade-in">
          <QuranExplorer 
            currentTheme={currentTheme} 
            onBookmarkAdd={handleAddBookmark} 
            bookmarkedKeys={bookmarkedKeys} 
          />
          <div className="text-center mt-8">
            <button
              onClick={() => setCurrentSection('academic-world')}
              className="font-mono text-xs uppercase px-5 py-2.5 border border-stone-300 dark:border-zinc-800 rounded hover:bg-stone-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer font-bold"
            >
              &larr; Back to Scholastic Universe
            </button>
          </div>
        </div>
      )}

      {currentSection === 'fiqh-ruling' && (
        <div className="pt-36 sm:pt-40 pb-16 min-h-[80vh] animate-fade-in">
          <FiqhRuling currentTheme={currentTheme} />
          <div className="text-center mt-8">
            <button
              onClick={() => setCurrentSection('academic-world')}
              className="font-mono text-xs uppercase px-5 py-2.5 border border-stone-300 dark:border-zinc-800 rounded hover:bg-stone-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer font-bold"
            >
              &larr; Back to Scholastic Universe
            </button>
          </div>
        </div>
      )}

      {currentSection === 'cognitive-labs' && (
        <div className="pt-36 sm:pt-40 pb-16 min-h-[80vh] animate-fade-in">
          <CognitiveLabs 
            currentTheme={currentTheme} 
            onNavigateToPortal={() => setCurrentSection('portal')}
            onNavigateToSection={(sec) => setCurrentSection(sec as any)}
          />
        </div>
      )}

      {currentSection === 'waswas-clinic' && (
        <div className="animate-fade-in">
          <WaswasClinic 
            currentTheme={currentTheme}
            onBackToLanding={() => setCurrentSection('academic-world')}
          />
        </div>
      )}

      {currentSection === 'mantiq-tutor' && (
        <div className="animate-fade-in">
          <MantiqTutor 
            currentTheme={currentTheme}
            onBackToLanding={() => setCurrentSection('academic-world')}
          />
        </div>
      )}

      {currentSection === 'nafs-assessment' && (
        <div className="pt-36 sm:pt-40 pb-16 min-h-[80vh] animate-fade-in">
          <NafsAssessmentScreen 
            currentTheme={currentTheme}
            onBackToLanding={() => setCurrentSection('academic-world')}
          />
        </div>
      )}

      {currentSection === 'maqasid-analyzer' && (
        <div className="animate-fade-in">
          <MaqasidAnalyzer 
            currentTheme={currentTheme}
            onBackToLanding={() => setCurrentSection('academic-world')}
          />
        </div>
      )}

      {currentSection === 'aqeedah-firewall' && (
        <div className="animate-fade-in">
          <AqeedahFirewall 
            currentTheme={currentTheme}
            onBackToLanding={() => setCurrentSection('academic-world')}
          />
        </div>
      )}

      {currentSection === 'ruya-interpreter' && (
        <div className="animate-fade-in">
          <RuyaInterpreter 
            currentTheme={currentTheme}
            onBackToLanding={() => setCurrentSection('academic-world')}
          />
        </div>
      )}

      {currentSection === 'hadith' && (
        <div className="pt-36 sm:pt-40 pb-16 min-h-[80vh] animate-fade-in">
          <HadithDisplay currentTheme={currentTheme} />
          <div className="text-center mt-8">
            <button
              onClick={() => setCurrentSection('academic-world')}
              className="font-mono text-xs uppercase px-5 py-2.5 border border-stone-300 dark:border-zinc-800 rounded hover:bg-stone-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer font-bold"
            >
              &larr; Back to Scholastic Universe
            </button>
          </div>
        </div>
      )}

      {currentSection === 'scholastic-quiz' && (
        <div className="pt-36 sm:pt-40 pb-16 min-h-[80vh] animate-fade-in">
          <ScholasticQuiz 
            currentTheme={currentTheme} 
            language={language}
            onBackToLanding={() => setCurrentSection('academic-world')}
          />
        </div>
      )}

      <AnimatePresence mode="wait">
        {currentSection === 'landing' && (
          <motion.div
            key="landing-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="transition-all duration-500"
          >
          {/* EDITORIAL BANNER SECTION */}
          <HeroSection 
            currentTheme={currentTheme}
            onApplyNow={() => setAdmissionOpen(true)}
            mouseCoords={mouseCoords}
          />

          {/* SPACE CELESTIAL EARTH & 8 FLOATING ORBITS DISPATCHER */}
          <GlobeSection 
            currentTheme={currentTheme}
            selectedCourseId={selectedCourseId}
            onSelectCourse={handleSelectCourse}
          />

          {/* ARABESQUE & MINIMALIST EDITORIAL CONTENT OVERVIEW SHEET */}
          <EditorialSection 
            currentTheme={currentTheme}
            onFindMore={() => {
              const el = document.getElementById('canonical-inspector-viewport');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
          />

          {/* DETAILED INTERACTIVE CURRICULUM SEARCH & LIST INSPECTOR */}
          <CurriculumInspector 
            currentTheme={currentTheme}
            selectedCourseId={selectedCourseId}
            onSelectCourse={handleSelectCourse}
            searchText={searchText}
          />

          {/* DYNAMIC INTERACTIVE FIVE PILLARS OF ISLAM FOUNDATION */}
          <FivePillarsSection currentTheme={currentTheme} />

          {/* DYNAMIC 1 MINUTE DHIKR CHECKLIST */}
          <DhikrSection currentTheme={currentTheme} />

          {/* CAMPUS HUB SECTORS CALL-TO-ACTION CARDS */}
          <section className="py-24 px-6 md:px-12 border-t border-b relative overflow-hidden text-center transition-all duration-700 bg-gradient-to-br from-[#052112] via-[#0B4628] to-[#031c0e] border-gold/25 text-white shadow-[inset_0_4px_30px_rgba(0,0,0,0.5)] islamic-dark-green-section">
            {/* Background Islamic Star pattern specifically for this green section */}
            <div className="absolute inset-0 opacity-[0.04] bg-repeat arabesque-grid pointer-events-none" />

            {/* Ambient Islamic Architectural Geometry Background Elements (No basic shapes!) */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.035] flex items-center justify-between px-12 z-0 text-gold select-none">
              <div className="w-64 h-64 md:w-96 md:h-96 animate-slow-rotate">
                <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.25">
                  <circle cx="50" cy="50" r="48" strokeDasharray="1 1" />
                  <circle cx="50" cy="50" r="42" />
                  <polygon points="50,2 62,20 80,12 70,30 88,38 74,50 88,62 70,70 80,88 62,80 50,98 38,80 20,88 30,70 12,62 26,50 12,38 30,30 20,12 38,20" />
                  <rect x="20" y="20" width="60" height="60" transform="rotate(15 50 50)" />
                  <rect x="20" y="20" width="60" height="60" transform="rotate(30 50 50)" />
                  <rect x="20" y="20" width="60" height="60" transform="rotate(45 50 50)" />
                  <rect x="20" y="20" width="60" height="60" transform="rotate(60 50 50)" />
                  <rect x="20" y="20" width="60" height="60" transform="rotate(75 50 50)" />
                </svg>
              </div>
              <div className="w-64 h-64 md:w-96 md:h-96 animate-slow-rotate hidden md:block" style={{ animationDirection: 'reverse' }}>
                <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.25">
                  <circle cx="50" cy="50" r="48" strokeDasharray="1 1" />
                  <circle cx="50" cy="50" r="42" />
                  <polygon points="50,2 62,20 80,12 70,30 88,38 74,50 88,62 70,70 80,88 62,80 50,98 38,80 20,88 30,70 12,62 26,50 12,38 30,30 20,12 38,20" />
                  <rect x="20" y="20" width="60" height="60" transform="rotate(15 50 50)" />
                  <rect x="20" y="20" width="60" height="60" transform="rotate(30 50 50)" />
                  <rect x="20" y="20" width="60" height="60" transform="rotate(45 50 50)" />
                  <rect x="20" y="20" width="60" height="60" transform="rotate(60 50 50)" />
                  <rect x="20" y="20" width="60" height="60" transform="rotate(75 50 50)" />
                </svg>
              </div>
            </div>
            
            <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gold/10 blur-3xl pointer-events-none opacity-50 z-0" />
            <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#0B4628]/10 blur-3xl pointer-events-none opacity-50 z-0" />
 
            <div className="max-w-4xl mx-auto space-y-6 relative z-10 py-4">
              <div className="inline-flex items-center gap-2 mb-1 px-3.5 py-1.5 rounded-full border text-[11px] font-mono tracking-[0.2em] uppercase font-bold border-gold/30 bg-gold/10 text-gold-light">
                <GraduationCap className="h-4 w-4 animate-pulse text-gold" />
                Scholastic Campus Hub
              </div>
              
              <h2 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl tracking-wide max-w-2xl mx-auto text-white">
                University Portals Gate
              </h2>
              
              <p className="text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-serif text-stone-150">
                Access your official student covenant progress maps, download certificates, submit critique theses, or log into the administrative scribes audit panel.
              </p>
 
              <div className="flex flex-wrap justify-center gap-4 pt-6">
                <button
                  onClick={() => setCurrentSection('portal')}
                  className="font-mono text-xs uppercase border font-bold tracking-widest px-8 py-4 rounded-sm shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 bg-gold text-[#020509] hover:bg-white hover:text-[#0B4628] border-transparent"
                >
                  Enter Scholar Student Portal
                </button>
                
                <button
                  onClick={() => setCurrentSection('portal')}
                  className="font-mono text-xs uppercase border font-bold tracking-widest px-8 py-4 rounded-sm transition-all duration-300 cursor-pointer hover:scale-105 bg-transparent hover:bg-white/10 text-gold-light border-gold/40 hover:border-white"
                >
                  Access Scribes Audits
                </button>
              </div>
            </div>
          </section>

          {/* SHIELDED HADITH EXPLETIVES ACCENTS */}
          <PropheticHadiths currentTheme={currentTheme} />

          {/* ALUMNI & ASSOCIATE SCHOLASTIC FOOTER FOOTPRINTS */}
          <Footer currentTheme={currentTheme} />
        </motion.div>
      )}
    </AnimatePresence>

      {/* SECURE SCHOLAR INSCRIPTION PORTAL MODAL */}
      {admissionOpen && (
        <AdmissionPortal 
          currentTheme={currentTheme}
          onClose={() => setAdmissionOpen(false)}
        />
      )}

      {/* SCROLL SPY ACTIVE SECTION INDICATOR */}
      <ScrollSpyIndicator currentTheme={currentTheme} currentSection={currentSection} />

      {/* FLOATING SOCIAL & DIRECT ADMISSIONS CHANNELS */}
      <FloatingContacts currentTheme={currentTheme} />

      {/* SECURE MOBILE SCREEN MENU TOGGLE & PERSISTENT QUICK NAVIGATION */}
      <MobileQuickNav 
        currentTheme={currentTheme}
        currentSection={activeTab}
        onNavigate={handleNavigateToSection}
        language={language}
        isOpen={mobileMenuOpen}
        setIsOpen={setMobileMenuOpen}
        onOpenAdmission={() => setAdmissionOpen(true)}
      />
    </div>
  );
}
