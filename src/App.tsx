import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import GlobeSection from './components/GlobeSection';
import EditorialSection from './components/EditorialSection';
import CurriculumInspector from './components/CurriculumInspector';
import HadithDisplay from './components/HadithDisplay';
import AdmissionPortal from './components/AdmissionPortal';
import Footer from './components/Footer';
import { Course } from './types';
import { COURSES } from './data';

export default function App() {
  const [currentTheme, setCurrentTheme] = useState<'parchment' | 'space'>('parchment');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('quran');
  const [searchText, setSearchText] = useState<string>('');
  const [admissionOpen, setAdmissionOpen] = useState<boolean>(false);

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
    // If we're searching, also scroll cleanly down to scientific curriculum inspector sector!
    if (term) {
      const el = document.getElementById('curriculum');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
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
      />

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

      {/* SHIELDED HADITH EXPLETIVES ACCENTS */}
      <HadithDisplay currentTheme={currentTheme} />

      {/* SECURE SCHOLAR INSCRIPTION PORTAL MODAL */}
      {admissionOpen && (
        <AdmissionPortal 
          currentTheme={currentTheme}
          onClose={() => setAdmissionOpen(false)}
        />
      )}

      {/* ALUMNI & ASSOCIATE SCHOLASTIC FOOTER FOOTPRINTS */}
      <Footer currentTheme={currentTheme} />
    </div>
  );
}
