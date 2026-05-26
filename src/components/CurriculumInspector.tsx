import React, { useState, useEffect } from 'react';
import { COURSES } from '../data';
import { Course } from '../types';
import * as LucideIcons from 'lucide-react';

interface CurriculumInspectorProps {
  currentTheme: 'parchment' | 'space';
  selectedCourseId: string;
  onSelectCourse: (course: Course) => void;
  searchText: string;
}

export default function CurriculumInspector({ currentTheme, selectedCourseId, onSelectCourse, searchText }: CurriculumInspectorProps) {
  const isSpace = currentTheme === 'space';
  const [internalSearch, setInternalSearch] = useState('');
  
  // Combine props search and component's internal index search
  const activeSearch = searchText || internalSearch;

  // Helper to map string to Lucid Icon
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen': return <LucideIcons.BookOpen className="h-7 w-7" />;
      case 'MessageSquareText': return <LucideIcons.MessageSquareText className="h-7 w-7" />;
      case 'Scale': return <LucideIcons.Scale className="h-7 w-7" />;
      case 'Binary': return <LucideIcons.Binary className="h-7 w-7" />;
      case 'Compass': return <LucideIcons.Compass className="h-7 w-7" />;
      case 'Brain': return <LucideIcons.Brain className="h-7 w-7" />;
      case 'TriangleAlert': return <LucideIcons.TriangleAlert className="h-7 w-7" />;
      case 'Globe': return <LucideIcons.Globe className="h-7 w-7" />;
      default: return <LucideIcons.BookOpen className="h-7 w-7" />;
    }
  };

  // Find course matching searched branch/topic
  const filteredCourses = COURSES.filter((course) => {
    if (!activeSearch) return true;
    const cleanSearch = activeSearch.toLowerCase();
    const matchesName = course.name.toLowerCase().includes(cleanSearch);
    const matchesBranches = course.branches.some(branch => branch.toLowerCase().includes(cleanSearch));
    const matchesDesc = course.description.toLowerCase().includes(cleanSearch);
    return matchesName || matchesBranches || matchesDesc;
  });

  const selectedCourse = COURSES.find(c => c.id === selectedCourseId) || COURSES[0];

  // Auto-focus first matching course if search alters
  useEffect(() => {
    if (activeSearch && filteredCourses.length > 0) {
      // Find matches
      const currentMatch = filteredCourses.find(c => c.id === selectedCourseId);
      if (!currentMatch) {
        onSelectCourse(filteredCourses[0]);
      }
    }
  }, [activeSearch, selectedCourseId, onSelectCourse]);

  return (
    <section 
      id="curriculum"
      className={`py-24 px-6 md:px-12 select-none transition-colors duration-700
        ${isSpace 
          ? 'bg-[#030712] text-white' 
          : 'bg-[#FBF9F6] text-charcoal'
        }
      `}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 justify-center mb-4">
            <span className={`h-[1px] w-8 ${isSpace ? 'bg-gold' : 'bg-crimson'}`} />
            <span className={`text-xs font-bold tracking-[0.3em] uppercase font-mono ${isSpace ? 'text-gold-light' : 'text-crimson'}`}>
              ACADEMIC SPECTRUM
            </span>
          </div>
          <h2 className="font-serif font-black text-3xl sm:text-4xl leading-tight mb-4">
            Branches of Major Subjects
          </h2>
          <p className="text-sm md:text-base text-stone-400 dark:text-stone-500 font-sans">
            Filter our eight major disciplines or search directly for critical subjects—be it modern capitalism, jurisprudence of Usul, or critical thinking ethics.
          </p>

          {/* INTERNAL ARCHIVAL SEARCH BAR */}
          <div className="mt-8 relative max-w-md mx-auto">
            <input 
              type="text"
              placeholder="Search branches... (e.g. AI, Usul, Epistemology)"
              value={internalSearch}
              onChange={(e) => setInternalSearch(e.target.value)}
              className={`w-full px-5 py-3 pl-11 text-sm rounded sm:rounded-sm border focus:outline-none transition-all font-sans
                ${isSpace 
                  ? 'bg-space border-gold/25 text-white placeholder-white/30 focus:border-gold focus:shadow-[0_0_10px_rgba(201,147,58,0.2)]' 
                  : 'bg-white border-crimson/15 text-charcoal placeholder-stone-400 focus:border-crimson focus:shadow-[0_4px_15px_rgba(139,0,0,0.05)]'
                }
              `}
            />
            <LucideIcons.Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4
              ${isSpace ? 'text-gold/60' : 'text-crimson/50'}
            `} />
          </div>
        </div>

        {/* COMPONENT BODYGRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-12">
          
          {/* LEFT CHANNELS (Subjects grid selector) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COURSES.map((course, idx) => {
              const worksWithFilter = filteredCourses.some(c => c.id === course.id);
              const isSelected = selectedCourseId === course.id;

              return (
                <button
                  key={course.id}
                  onClick={() => worksWithFilter && onSelectCourse(course)}
                  className={`group relative p-6 border rounded-sm text-left transition-all duration-300 flex flex-col justify-between cursor-pointer shadow-xs min-h-[140px]
                    ${isSpace 
                      ? 'bg-space/40 hover:bg-space border-gold/15 text-white' 
                      : 'bg-white hover:bg-[#FAF8F5] border-stone-200/60 text-charcoal'
                    }
                    ${isSelected ? (isSpace ? 'border-amber-400 ring-1 ring-amber-400/50 bg-amber-950/20' : 'border-crimson ring-1 ring-crimson/25 bg-crimson/5') : ''}
                    ${!worksWithFilter ? 'opacity-30 p-2 cursor-not-allowed filter grayscale' : ''}
                  `}
                >
                  {/* Decorative Crimson Vertical Marker strip when active */}
                  <div className={`absolute top-0 bottom-0 left-0 w-[3px] transition-transform duration-300
                    ${isSpace ? 'bg-gold' : 'bg-crimson'}
                    ${isSelected ? 'scale-y-100' : 'scale-y-0 group-hover:scale-y-100'}
                  `} />

                  <div className="flex justify-between items-start w-full">
                    <span className={`transition-transform duration-300 group-hover:scale-105
                      ${isSpace ? 'text-gold' : 'text-crimson'}
                    `}>
                      {getIcon(course.icon)}
                    </span>
                    <span className="text-[9px] uppercase tracking-widest font-mono text-stone-400 dark:text-stone-500 font-bold">
                      {course.count}
                    </span>
                  </div>

                  <div className="mt-4">
                    <h3 className="font-serif font-black text-xl tracking-wide leading-tight group-hover:text-gold transition-colors">
                      {course.name}
                    </h3>
                    <p className="text-xs text-stone-400 dark:text-stone-500 font-sans line-clamp-1 mt-1 font-medium">
                      {course.branches.join(', ')}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* RIGHT DETAILED VIEWPORT (Editorial Ledger Sheet) */}
          <div className="lg:col-span-5 relative z-10">
            <div className={`relative p-8 md:p-10 border rounded-sm transition-all duration-300 shadow-md overflow-hidden min-h-[460px]
              ${isSpace 
                ? 'bg-[#0a0f1d] border-gold/25 text-white' 
                : 'bg-white border-stone-200 text-charcoal'
              }
            `}>
              {/* Islamic Arabesque Star Graphic Background Layer */}
              <div className={`absolute -right-24 -bottom-24 w-80 h-80 opacity-5 transition-opacity duration-700 select-none pointer-events-none arabesque-star
                ${isSpace ? 'bg-gold' : 'bg-crimson'}
              `} />

              {/* Crimson fine-press corner accents */}
              <div className={`absolute top-0 left-0 w-3 h-3 border-t border-l rounded-tl-xs
                ${isSpace ? 'border-gold' : 'border-crimson'}
              `} />
              <div className={`absolute bottom-0 right-0 w-3 h-3 border-b border-r rounded-br-xs
                ${isSpace ? 'border-gold' : 'border-crimson'}
              `} />

              <div className="mb-6 pb-6 border-b border-stone-200/10 flex items-center justify-between">
                <span className={`text-[10px] tracking-[0.25em] font-mono uppercase font-bold
                  ${isSpace ? 'text-gold-light' : 'text-crimson'}
                `}>
                  Canonical Inspector
                </span>
                <span className="text-xs font-serif italic text-stone-400 font-medium">
                  {selectedCourse?.name || 'Selected Study'}
                </span>
              </div>

              {/* Title & Large Icon */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-full flex justify-center items-center backdrop-blur-sm border
                  ${isSpace ? 'bg-gold/10 border-gold/40 text-gold' : 'bg-crimson/5 border-crimson/20 text-crimson'}
                `}>
                  {getIcon(selectedCourse?.icon)}
                </div>
                <div>
                  <h3 className="font-serif font-black text-2xl tracking-wide">{selectedCourse?.name}</h3>
                  <span className="text-xs font-mono text-stone-400 dark:text-stone-500 font-medium">{selectedCourse?.count}</span>
                </div>
              </div>

              {/* Course Long Description */}
              <p className="text-sm leading-relaxed text-stone-500 dark:text-stone-400 mb-8 font-serif italic select-all border-l-2 pl-4 border-stone-600/20">
                {selectedCourse?.description}
              </p>

              {/* Branches breakdown ledger */}
              <div>
                <h4 className={`text-xs uppercase font-mono tracking-[0.25em] font-bold mb-4
                  ${isSpace ? 'text-gold-light' : 'text-crimson'}
                `}>
                  Core Branches Study
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedCourse?.branches.map((branch, idx) => (
                    <li key={idx} className="flex items-center gap-2.5">
                      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 animate-ping duration-1000
                        ${isSpace ? 'bg-gold' : 'bg-crimson'}
                      `} />
                      <span className="text-xs md:text-sm font-sans font-semibold tracking-wide text-stone-600 dark:text-stone-300">
                        {branch}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
