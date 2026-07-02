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
import { Language } from './i18n';
import { Course } from './types';
import { COURSES } from './data';

export default function App() {
  const [currentTheme, setCurrentTheme] = useState<'parchment' | 'space'>('parchment');
  const [isThemeTransitioning, setIsThemeTransitioning] = useState<boolean>(false);
  const [previousTheme, setPreviousTheme] = useState<'parchment' | 'space' | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('quran');
  const [searchText, setSearchText] = useState<string>('');
  const [admissionOpen, setAdmissionOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [currentSection, setCurrentSection] = useState<'landing' | 'academic-world' | 'portal' | 'debate' | 'quran-explorer' | 'fiqh-ruling' | 'cognitive-labs' | 'waswas-clinic' | 'mantiq-tutor' | 'nafs-assessment' | 'maqasid-analyzer' | 'aqeedah-firewall' | 'ruya-interpreter' | 'hadith'>(() => {
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
    setTimeout(() => {
      const el = document.getElementById('canonical-inspector-viewport');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 80);
  };

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
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.05] bg-repeat arabesque-grid pointer-events-none z-0 transition-transform duration-300 ease-out" 
        style={{
          transform: `translate(${mouseCoords.x * 12}px, ${mouseCoords.y * 12}px)`,
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

      {/* EXQUISITE NAV HEADER */}
      <Header 
        currentTheme={currentTheme}
        onToggleTheme={handleToggleTheme}
        onSearch={handleSearch}
        onOpenAdmission={() => setAdmissionOpen(true)}
        onOpenPortal={() => setCurrentSection('portal')}
        onGoToLanding={() => setCurrentSection('landing')}
        activeTab={currentSection}
        onTabChange={(tab) => setCurrentSection(tab as any)}
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

            {/* Ambient Background Elements */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.05] flex items-center justify-between px-12 z-0 text-gold-light">
              <svg className="w-64 h-64 md:w-96 md:h-96" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                <circle cx="50" cy="50" r="45" strokeWidth="0.5" strokeDasharray="2 2" />
                <circle cx="50" cy="50" r="35" strokeWidth="0.5" />
                <rect x="25" y="25" width="50" height="50" strokeWidth="0.5" transform="rotate(15 50 50)" />
                <rect x="25" y="25" width="50" height="50" strokeWidth="0.5" transform="rotate(30 50 50)" />
                <rect x="25" y="25" width="50" height="50" strokeWidth="0.5" transform="rotate(45 50 50)" />
                <rect x="25" y="25" width="50" height="50" strokeWidth="0.5" transform="rotate(60 50 50)" />
                <rect x="25" y="25" width="50" height="50" strokeWidth="0.5" transform="rotate(75 50 50)" />
                <polygon points="50,5 95,50 50,95 5,50" strokeWidth="0.5" />
              </svg>
              <svg className="w-64 h-64 md:w-96 md:h-96 hidden md:block" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                <circle cx="50" cy="50" r="45" strokeWidth="0.5" strokeDasharray="2 2" />
                <circle cx="50" cy="50" r="35" strokeWidth="0.5" />
                <rect x="25" y="25" width="50" height="50" strokeWidth="0.5" transform="rotate(15 50 50)" />
                <rect x="25" y="25" width="50" height="50" strokeWidth="0.5" transform="rotate(30 50 50)" />
                <rect x="25" y="25" width="50" height="50" strokeWidth="0.5" transform="rotate(45 50 50)" />
                <rect x="25" y="25" width="50" height="50" strokeWidth="0.5" transform="rotate(60 50 50)" />
                <rect x="25" y="25" width="50" height="50" strokeWidth="0.5" transform="rotate(75 50 50)" />
                <polygon points="50,5 95,50 50,95 5,50" strokeWidth="0.5" />
              </svg>
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

      {/* FLOATING SOCIAL & DIRECT ADMISSIONS CHANNELS */}
      <FloatingContacts currentTheme={currentTheme} />

      {/* SECURE MOBILE SCREEN MENU TOGGLE & PERSISTENT QUICK NAVIGATION */}
      <MobileQuickNav 
        currentTheme={currentTheme}
        currentSection={currentSection}
        onNavigate={(sec) => setCurrentSection(sec as any)}
        language={language}
        isOpen={mobileMenuOpen}
        setIsOpen={setMobileMenuOpen}
        onOpenAdmission={() => setAdmissionOpen(true)}
      />
    </div>
  );
}
