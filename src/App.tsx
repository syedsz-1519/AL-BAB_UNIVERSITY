import React, { useState, useEffect } from 'react';
import { GraduationCap } from 'lucide-react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import GlobeSection from './components/GlobeSection';
import EditorialSection from './components/EditorialSection';
import CurriculumInspector from './components/CurriculumInspector';
import DashboardPortal from './components/DashboardPortal';
import HadithDisplay from './components/HadithDisplay';
import AdmissionPortal from './components/AdmissionPortal';
import Footer from './components/Footer';
import FloatingContacts from './components/FloatingContacts';
import DebateArena from './components/DebateArena';
import QuranExplorer from './components/QuranExplorer';
import FiqhRuling from './components/FiqhRuling';
import CognitiveLabs from './components/CognitiveLabs';
import WaswasClinic from './components/WaswasClinic';
import MantiqTutor from './components/MantiqTutor';
import { Language } from './i18n';
import { Course } from './types';
import { COURSES } from './data';

export default function App() {
  const [currentTheme, setCurrentTheme] = useState<'parchment' | 'space'>('parchment');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('quran');
  const [searchText, setSearchText] = useState<string>('');
  const [admissionOpen, setAdmissionOpen] = useState<boolean>(false);
  const [currentSection, setCurrentSection] = useState<'landing' | 'portal' | 'debate' | 'quran-explorer' | 'fiqh-ruling' | 'cognitive-labs' | 'waswas-clinic' | 'mantiq-tutor'>(() => {
    if (window.location.hash === '#waswas-clinic' || window.location.pathname === '/waswas-clinic') {
      return 'waswas-clinic';
    }
    if (window.location.hash === '#mantiq-tutor' || window.location.pathname === '/mantiq-tutor') {
      return 'mantiq-tutor';
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
      if (window.location.hash === '#waswas-clinic' || window.location.pathname === '/waswas-clinic') {
        setCurrentSection('waswas-clinic');
      } else if (window.location.hash === '#mantiq-tutor' || window.location.pathname === '/mantiq-tutor') {
        setCurrentSection('mantiq-tutor');
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
    setCurrentTheme(prev => (prev === 'parchment' ? 'space' : 'parchment'));
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourseId(course.id);
  };

  const handleSearch = (term: string) => {
    setSearchText(term);
    // If we're searching, reset to landing page first then scroll cleanly down to scientific curriculum inspector sector!
    if (term) {
      setCurrentSection('landing');
      setTimeout(() => {
        const el = document.getElementById('curriculum');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    }
  };

  return (
    <div 
      className={`min-h-screen font-sans transition-all duration-700 overflow-x-hidden
        ${currentTheme === 'space' 
          ? 'theme-dark bg-space text-white/90' 
          : 'theme-light bg-[#FAF6EF] text-charcoal'
        }
      `}
    >
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
      />

      {currentSection === 'portal' && (
        <div className="pt-24 min-h-[85vh] transition-all duration-500 animate-fade-in">
          {/* SECURE STUDENT AND ADMINISTRATION PORTAL SECTION */}
          <DashboardPortal 
            currentTheme={currentTheme} 
            onBackToLanding={() => setCurrentSection('landing')}
          />
        </div>
      )}

      {currentSection === 'debate' && (
        <div className="pt-28 pb-16 min-h-[80vh] animate-fade-in">
          <DebateArena currentTheme={currentTheme} />
        </div>
      )}

      {currentSection === 'quran-explorer' && (
        <div className="pt-28 pb-16 min-h-[80vh] animate-fade-in">
          <QuranExplorer 
            currentTheme={currentTheme} 
            onBookmarkAdd={handleAddBookmark} 
            bookmarkedKeys={bookmarkedKeys} 
          />
        </div>
      )}

      {currentSection === 'fiqh-ruling' && (
        <div className="pt-28 pb-16 min-h-[80vh] animate-fade-in">
          <FiqhRuling currentTheme={currentTheme} />
        </div>
      )}

      {currentSection === 'cognitive-labs' && (
        <div className="pt-28 pb-16 min-h-[80vh] animate-fade-in">
          <CognitiveLabs 
            currentTheme={currentTheme} 
            onNavigateToPortal={() => setCurrentSection('portal')}
          />
        </div>
      )}

      {currentSection === 'waswas-clinic' && (
        <div className="animate-fade-in">
          <WaswasClinic 
            currentTheme={currentTheme}
            onBackToLanding={() => setCurrentSection('landing')}
          />
        </div>
      )}

      {currentSection === 'mantiq-tutor' && (
        <div className="animate-fade-in">
          <MantiqTutor 
            currentTheme={currentTheme}
            onBackToLanding={() => setCurrentSection('landing')}
          />
        </div>
      )}

      {currentSection === 'landing' && (
        <div className="transition-all duration-500 animate-fade-in">
          {/* EDITORIAL BANNER SECTION */}
          <HeroSection 
            currentTheme={currentTheme}
            onApplyNow={() => setAdmissionOpen(true)}
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
              const el = document.getElementById('curriculum');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* DETAILED INTERACTIVE CURRICULUM SEARCH & LIST INSPECTOR */}
          <CurriculumInspector 
            currentTheme={currentTheme}
            selectedCourseId={selectedCourseId}
            onSelectCourse={handleSelectCourse}
            searchText={searchText}
          />

          {/* AI COGNITIVE LABS SECTION UNDER CURRICULUM DESIGN */}
          <CognitiveLabs 
            currentTheme={currentTheme} 
            onNavigateToPortal={() => setCurrentSection('portal')}
          />

          {/* CAMPUS HUB SECTORS CALL-TO-ACTION CARDS */}
          <section className={`py-16 px-6 md:px-12 border-t relative overflow-hidden text-center
            ${currentTheme === 'space' 
              ? 'bg-space-dark/20 border-gold/10 text-gold-light' 
              : 'bg-white border-stone-200 text-charcoal'
            }
          `}>
            <div className="max-w-4xl mx-auto space-y-6 relative z-10 py-4">
              <div className="inline-flex items-center gap-2 mb-1 px-3 py-1 rounded-full border text-[10px] font-mono tracking-[0.2em] uppercase
                dark:border-gold/20 dark:bg-gold/5 dark:text-gold-light border-crimson/15 bg-crimson/5 text-crimson
              ">
                <GraduationCap className="h-3.5 w-3.5 animate-pulse" />
                Scholastic Campus Hub
              </div>
              
              <h2 className="font-serif font-black text-2xl sm:text-3xl md:text-4xl tracking-wide max-w-2xl mx-auto">
                University Portals Gate
              </h2>
              
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-xl mx-auto leading-relaxed font-serif">
                Access your official student covenant progress maps, download certificates, submit critique theses, or log into the administrative scribes audit panel.
              </p>

              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <button
                  onClick={() => setCurrentSection('portal')}
                  className="font-mono text-xs uppercase bg-crimson dark:bg-gold text-white dark:text-space hover:bg-black hover:text-gold dark:hover:bg-white dark:hover:text-[#8B0000] border border-transparent font-bold tracking-widest px-6 py-3 rounded-sm shadow-md transition-all duration-300 cursor-pointer hover:scale-[1.01]"
                >
                  Enter Scholar Student Portal
                </button>
                
                <button
                  onClick={() => setCurrentSection('portal')}
                  className="font-mono text-xs uppercase bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-stone-700 dark:text-gold-light border border-stone-300 dark:border-gold/30 font-bold tracking-widest px-6 py-3 rounded-sm transition-all duration-300 cursor-pointer hover:border-crimson dark:hover:border-gold"
                >
                  Access Scribes Audits
                </button>
              </div>
            </div>
          </section>

          {/* SHIELDED HADITH EXPLETIVES ACCENTS */}
          <HadithDisplay currentTheme={currentTheme} />

          {/* ALUMNI & ASSOCIATE SCHOLASTIC FOOTER FOOTPRINTS */}
          <Footer currentTheme={currentTheme} />
        </div>
      )}

      {/* SECURE SCHOLAR INSCRIPTION PORTAL MODAL */}
      {admissionOpen && (
        <AdmissionPortal 
          currentTheme={currentTheme}
          onClose={() => setAdmissionOpen(false)}
        />
      )}

      {/* FLOATING SOCIAL & DIRECT ADMISSIONS CHANNELS */}
      <FloatingContacts currentTheme={currentTheme} />
    </div>
  );
}
