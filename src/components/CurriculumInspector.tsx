import React, { useState, useEffect, useMemo } from 'react';
import { COURSES } from '../data';
import { Course } from '../types';
import * as LucideIcons from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';

interface CurriculumInspectorProps {
  currentTheme: 'parchment' | 'space';
  selectedCourseId: string;
  onSelectCourse: (course: Course) => void;
  onEnroll?: (course: Course) => void;
  searchText: string;
}

const CATEGORIES = [
  { id: 'all', name: 'All Disciplines', icon: 'Layers', desc: 'Complete spectrum of learning', courseIds: [] as string[] },
  { id: 'quran', name: 'Quran Studies', icon: 'BookOpen', desc: 'Exegesis & structural miracles', courseIds: ['quran'] },
  { id: 'hadith', name: 'Hadith Sciences', icon: 'MessageSquareText', desc: 'Prophetic traditions & chain validation', courseIds: ['hadith'] },
  { id: 'fiqh', name: 'Fiqh & Finance', icon: 'Scale', desc: 'Jurisprudence, contracts & economics', courseIds: ['fiqh', 'economic-studies'] },
  { id: 'logic', name: 'Logic & Modernity', icon: 'Binary', desc: 'Reasoning, philosophy & modern critique', courseIds: ['logic', 'philosophy', 'modernity', 'challenges'] },
  { id: 'islamic-studies', name: 'Islamic Theology', icon: 'BookType', desc: 'Theology, seerah & purification', courseIds: ['islamic-studies'] },
  { id: 'humanities', name: 'Humanities & Soul', icon: 'Heart', desc: 'Psychology, history, politics & poetry', courseIds: ['psychology', 'history', 'politics', 'poetry'] }
];

const TOGGLEABLE_SUBJECTS = [
  { id: 'fiqh', name: 'Fiqh', courseIds: ['fiqh', 'economic-studies'], icon: 'Scale' },
  { id: 'aqeedah', name: 'Aqeedah', courseIds: ['islamic-studies'], icon: 'BookType' },
  { id: 'hadith', name: 'Hadith', courseIds: ['hadith'], icon: 'MessageSquareText' },
  { id: 'logic', name: 'Logic', courseIds: ['logic'], icon: 'Binary' },
  { id: 'quran', name: "Qur'an", courseIds: ['quran'], icon: 'BookOpen' },
  { id: 'philosophy', name: 'Philosophy', courseIds: ['philosophy'], icon: 'Compass' },
  { id: 'humanities', name: 'Humanities & Soul', courseIds: ['psychology', 'history', 'politics', 'poetry', 'challenges', 'modernity'], icon: 'Heart' },
];

export default function CurriculumInspector({ currentTheme, selectedCourseId, onSelectCourse, onEnroll, searchText }: CurriculumInspectorProps) {
  const isSpace = currentTheme === 'space';
  const [internalSearch, setInternalSearch] = useState('');
  const [allCourses, setAllCourses] = useState<Course[]>(COURSES);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [enabledSubjects, setEnabledSubjects] = useState<string[]>(['fiqh', 'aqeedah', 'hadith', 'logic', 'quran', 'philosophy', 'humanities']);

  // Local Storage Persistence for Completed & Interested status
  const [completedCourses, setCompletedCourses] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('completedCourses');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [interestedCourses, setInterestedCourses] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('interestedCourses');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showCompletedOnly, setShowCompletedOnly] = useState(false);
  const [showInterestedOnly, setShowInterestedOnly] = useState(false);

  // Sync back to local storage
  useEffect(() => {
    localStorage.setItem('completedCourses', JSON.stringify(completedCourses));
  }, [completedCourses]);

  useEffect(() => {
    localStorage.setItem('interestedCourses', JSON.stringify(interestedCourses));
  }, [interestedCourses]);
  
  // Combine props search and component's internal index search
  const activeSearch = searchText || internalSearch;

  // Real-time Firestore courses fetch and sync
  useEffect(() => {
    const coursesColPath = 'albab_courses';
    const q = query(collection(db, coursesColPath), orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dynamicCourses: Course[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        let iconName = 'BookOpen';
        let accentCls = 'gold';
        if (data.category === 'Theology & Dialectics') {
          iconName = 'Sparkles';
          accentCls = 'rose-600';
        } else if (data.category === 'Psycho-Spiritual Healing') {
          iconName = 'Brain';
          accentCls = 'pink-500';
        } else if (data.category === 'Ethics & Scholarly Systems') {
          iconName = 'Scale';
          accentCls = 'emerald-600';
        }

        dynamicCourses.push({
          id: doc.id,
          name: data.title || 'Untitled Branch',
          count: data.focusArea || 'Academic Focus',
          icon: iconName,
          branches: [data.tag1, data.tag2, data.tag3].filter(Boolean) as string[],
          description: data.description || '',
          accentColor: accentCls
        });
      });
      
      setAllCourses([...COURSES, ...dynamicCourses]);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, coursesColPath);
    });

    return () => unsubscribe();
  }, []);

  // Helper to map string to Lucid Icon
  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className="h-7 w-7" />;
    }
    return <LucideIcons.BookOpen className="h-7 w-7" />;
  };

  // Helper to map category icons
  const getCategoryIcon = (iconName: string, active: boolean) => {
    const IconComponent = (LucideIcons as any)[iconName];
    const sizeCls = "h-4 w-4";
    const colorCls = active 
      ? (isSpace ? 'text-black' : 'text-white') 
      : (isSpace ? 'text-gold' : 'text-crimson');
    
    if (IconComponent) {
      return <IconComponent className={`${sizeCls} ${colorCls}`} />;
    }
    return <LucideIcons.BookOpen className={`${sizeCls} ${colorCls}`} />;
  };

  // Helper to map subject icons in workspace filters
  const getSubjectIconInline = (iconName: string, active: boolean) => {
    const IconComponent = (LucideIcons as any)[iconName];
    const sizeCls = "h-3.5 w-3.5";
    const colorCls = active 
      ? (isSpace ? 'text-gold' : 'text-crimson') 
      : 'text-stone-400';
    
    if (IconComponent) {
      return <IconComponent className={`${sizeCls} ${colorCls}`} />;
    }
    return <LucideIcons.BookOpen className={`${sizeCls} ${colorCls}`} />;
  };

  // Find course matching searched branch/topic AND selected category and subject toggles
  const filteredCourses = useMemo(() => {
    return allCourses.filter((course) => {
      // 1. Category Filter
      if (selectedCategory !== 'all') {
        const catObj = CATEGORIES.find(c => c.id === selectedCategory);
        if (catObj) {
          const matchesStaticId = catObj.courseIds.includes(course.id);
          let matchesDynamic = false;
          
          // Check if it is a dynamic course (not present in the static COURSES array)
          const isStatic = COURSES.some(c => c.id === course.id);
          if (!isStatic) {
            if (selectedCategory === 'islamic-studies') {
              matchesDynamic = course.icon === 'Sparkles' || course.icon === 'Brain';
            } else if (selectedCategory === 'fiqh') {
              matchesDynamic = course.icon === 'Scale';
            }
          }
          
          if (!matchesStaticId && !matchesDynamic) {
            return false;
          }
        }
      }

      // 2. Subject Toggle Filter
      const matchedSubject = TOGGLEABLE_SUBJECTS.find((sub) => {
        const isStatic = COURSES.some(c => c.id === course.id);
        if (!isStatic) {
          if (course.icon === 'Sparkles' || course.icon === 'Brain') {
            return sub.id === 'aqeedah';
          }
          if (course.icon === 'Scale') {
            return sub.id === 'fiqh';
          }
          return sub.id === 'humanities';
        }
        return sub.courseIds.includes(course.id);
      });

      if (matchedSubject && !enabledSubjects.includes(matchedSubject.id)) {
        return false;
      }

      // 3. Tracking Status Filters
      if (showCompletedOnly && !completedCourses.includes(course.id)) {
        return false;
      }
      if (showInterestedOnly && !interestedCourses.includes(course.id)) {
        return false;
      }

      // 4. Search Text Filter
      if (!activeSearch) return true;
      const cleanSearch = activeSearch.toLowerCase();
      const matchesName = course.name.toLowerCase().includes(cleanSearch);
      const matchesBranches = course.branches.some(branch => branch.toLowerCase().includes(cleanSearch));
      const matchesDesc = course.description.toLowerCase().includes(cleanSearch);
      return matchesName || matchesBranches || matchesDesc;
    });
  }, [allCourses, selectedCategory, activeSearch, enabledSubjects, completedCourses, interestedCourses, showCompletedOnly, showInterestedOnly]);

  const selectedCourse = allCourses.find(c => c.id === selectedCourseId) || allCourses[0];

  // Auto-focus first matching course if filter or search alters
  useEffect(() => {
    if (filteredCourses.length > 0) {
      const currentMatch = filteredCourses.find(c => c.id === selectedCourseId);
      if (!currentMatch) {
        onSelectCourse(filteredCourses[0]);
      }
    }
  }, [selectedCategory, activeSearch, allCourses.length, onSelectCourse, filteredCourses, selectedCourseId]);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
  };


  return (
    <section 
      id="curriculum"
      className={`scroll-mt-28 py-24 px-6 md:px-12 select-none transition-colors duration-700
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

          {/* SMOTH SCROLL TO CELESTIAL GLOBE TRIGGER */}
          <button
            onClick={() => {
              const el = document.getElementById('scholarly');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className={`mt-4 inline-flex items-center gap-1.5 text-[10px] font-mono tracking-wider uppercase transition-all duration-300 border-b pb-0.5 hover:scale-105
              ${isSpace 
                ? 'text-gold/90 border-gold/20 hover:text-white hover:border-gold' 
                : 'text-crimson/90 border-crimson/20 hover:text-stone-700 hover:border-crimson'
              }
            `}
          >
            <LucideIcons.Globe className="h-3.5 w-3.5 animate-spin-slow" />
            Revisit Celestial Globe Orbits
          </button>

          {/* INTERNAL ARCHIVAL SEARCH BAR */}
          <div className="mt-8 relative max-w-md mx-auto">
            <input 
              type="text"
              placeholder="Search branches... (e.g. AI, Usul, Epistemology)"
              value={internalSearch}
              onChange={(e) => setInternalSearch(e.target.value)}
              className={`w-full px-5 py-3.5 pl-11 text-sm rounded sm:rounded-sm border focus:outline-none transition-all font-sans min-h-[44px]
                ${isSpace 
                  ? 'bg-space border-gold/25 text-white placeholder-white/30 focus:border-gold focus:shadow-[0_0_10px_rgba(201,147,58,0.2)]' 
                  : 'bg-white border-crimson/15 text-charcoal placeholder-stone-400 focus:border-crimson focus:shadow-[0_4px_15px_rgba(11, 70, 40,0.05)]'
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
          
          {/* LEFT: CATEGORY FILTER SIDEBAR (lg:col-span-3) */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Desktop View Sidebar */}
            <div className={`hidden lg:flex flex-col p-5 border rounded-sm transition-all duration-300
              ${isSpace 
                ? 'bg-[#0a0f1d] border-gold/15 text-white shadow-[0_4px_20px_rgba(0,0,0,0.4)]' 
                : 'bg-[#FFFDF9] border-stone-200 text-charcoal shadow-sm'
              }
            `}>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-200/10">
                <LucideIcons.ListFilter className={`h-4 w-4 ${isSpace ? 'text-gold' : 'text-crimson'}`} />
                <span className="text-xs font-mono tracking-widest uppercase font-black opacity-80">
                  Disciplines
                </span>
              </div>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 font-sans mb-4 leading-relaxed font-medium">
                Select an academic discipline to filter our scholarly curriculum.
              </p>
              
              <div className="flex flex-col gap-2">
                {CATEGORIES.map((cat) => {
                  const isCatSelected = selectedCategory === cat.id;
                  
                  // Count matches for this category in allCourses
                  const countInCat = allCourses.filter((course) => {
                    const matchesStaticId = cat.courseIds.includes(course.id);
                    let matchesDynamic = false;
                    const isStatic = COURSES.some(c => c.id === course.id);
                    if (!isStatic) {
                      if (cat.id === 'islamic-studies') {
                        matchesDynamic = course.icon === 'Sparkles' || course.icon === 'Brain';
                      } else if (cat.id === 'fiqh') {
                        matchesDynamic = course.icon === 'Scale';
                      }
                    }
                    return cat.id === 'all' || matchesStaticId || matchesDynamic;
                  }).length;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`group relative w-full p-3.5 rounded-sm text-left transition-all duration-300 flex items-center justify-between cursor-pointer border
                        ${isCatSelected
                          ? isSpace
                            ? 'bg-gold text-black border-gold shadow-[0_0_15px_rgba(201,147,58,0.45)] font-bold scale-[1.02]'
                            : 'bg-crimson text-white border-crimson shadow-[0_4px_12px_rgba(139,22,23,0.15)] font-bold scale-[1.02]'
                          : isSpace
                            ? 'bg-white/5 border-gold/10 text-stone-300 hover:text-white hover:bg-white/10 hover:border-gold/30'
                            : 'bg-[#FCFAF6] border-stone-200 text-stone-700 hover:text-charcoal hover:bg-[#F2ECE0]'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex-shrink-0">
                          {getCategoryIcon(cat.icon, isCatSelected)}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-serif font-black tracking-wide truncate">
                            {cat.name} ({countInCat})
                          </span>
                          <span className={`text-[9px] font-sans truncate font-medium opacity-70
                            ${isCatSelected 
                              ? (isSpace ? 'text-black/80' : 'text-white/80') 
                              : 'text-stone-400 dark:text-stone-500'
                            }
                          `}>
                            {cat.desc}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile/Tablet View Selector (Horizontal scrollable pill list) */}
            <div className="lg:hidden flex flex-col gap-2">
              <div className="flex items-center gap-1.5 px-1 mb-1">
                <LucideIcons.ListFilter className={`h-3.5 w-3.5 ${isSpace ? 'text-gold' : 'text-crimson'}`} />
                <span className="text-[10px] font-mono tracking-widest uppercase font-black opacity-60">
                  Select Discipline
                </span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
                {CATEGORIES.map((cat) => {
                  const isCatSelected = selectedCategory === cat.id;
                  const countInCat = allCourses.filter((course) => {
                    const matchesStaticId = cat.courseIds.includes(course.id);
                    let matchesDynamic = false;
                    const isStatic = COURSES.some(c => c.id === course.id);
                    if (!isStatic) {
                      if (cat.id === 'islamic-studies') {
                        matchesDynamic = course.icon === 'Sparkles' || course.icon === 'Brain';
                      } else if (cat.id === 'fiqh') {
                        matchesDynamic = course.icon === 'Scale';
                      }
                    }
                    return cat.id === 'all' || matchesStaticId || matchesDynamic;
                  }).length;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`snap-start flex-shrink-0 flex items-center gap-2 px-4 py-2.5 border rounded-full transition-all duration-300 text-xs font-serif font-black cursor-pointer min-h-[44px]
                        ${isCatSelected
                          ? isSpace
                            ? 'bg-gold text-black border-gold shadow-[0_2px_8px_rgba(201,147,58,0.3)]'
                            : 'bg-crimson text-white border-crimson shadow-[0_2px_8px_rgba(139,22,23,0.15)]'
                          : isSpace
                            ? 'bg-space border-gold/15 text-stone-300'
                            : 'bg-white border-stone-200 text-stone-700'
                        }
                      `}
                    >
                      <span>{getCategoryIcon(cat.icon, isCatSelected)}</span>
                      <span>{cat.name} ({countInCat})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* CENTER: CHANNELS/COURSES LIST (lg:col-span-6) */}
          <div className="lg:col-span-6">
            {/* SUBJECT WORKSPACE FILTER BAR */}
            <div className={`mb-6 p-4 border rounded-sm transition-all duration-300
              ${isSpace 
                ? 'bg-[#0a0f1d] border-gold/15 text-white shadow-[0_4px_15px_rgba(0,0,0,0.3)]' 
                : 'bg-[#FFFDF9] border-stone-200 text-[#0B4628] shadow-sm'
              }
            `}>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-1.5">
                  <LucideIcons.SlidersHorizontal className={`h-4 w-4 ${isSpace ? 'text-gold' : 'text-crimson'}`} />
                  <span className="text-[11px] font-mono tracking-wider uppercase font-black opacity-80">
                    Subject Workspace Filters ({enabledSubjects.length}/{TOGGLEABLE_SUBJECTS.length})
                  </span>
                </div>
                {enabledSubjects.length < TOGGLEABLE_SUBJECTS.length ? (
                  <button 
                    onClick={() => setEnabledSubjects(TOGGLEABLE_SUBJECTS.map(s => s.id))}
                    className={`text-[10px] font-mono tracking-wider uppercase border-b pb-0.5 hover:scale-105 transition-all
                      ${isSpace ? 'text-gold hover:text-white border-gold/20 hover:border-white' : 'text-crimson hover:text-stone-700 border-crimson/20 hover:border-stone-700'}
                    `}
                  >
                    Reset Filters
                  </button>
                ) : (
                  <span className="text-[10px] font-mono opacity-50">All Enabled</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {TOGGLEABLE_SUBJECTS.map((sub) => {
                  const isActive = enabledSubjects.includes(sub.id);
                  const countInSub = allCourses.filter((course) => {
                    const isStatic = COURSES.some(c => c.id === course.id);
                    if (!isStatic) {
                      if (course.icon === 'Sparkles' || course.icon === 'Brain') {
                        return sub.id === 'aqeedah';
                      }
                      if (course.icon === 'Scale') {
                        return sub.id === 'fiqh';
                      }
                      return sub.id === 'humanities';
                    }
                    return sub.courseIds.includes(course.id);
                  }).length;

                  return (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setEnabledSubjects(prev => {
                          if (prev.includes(sub.id)) {
                            return prev.filter(id => id !== sub.id);
                          } else {
                            return [...prev, sub.id];
                          }
                        });
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 border rounded-sm transition-all duration-200 text-xs font-serif font-black cursor-pointer select-none
                        ${isActive
                          ? isSpace
                            ? 'bg-space border-gold/60 text-white shadow-[0_0_8px_rgba(201,147,58,0.25)]'
                            : 'bg-white border-crimson/60 text-crimson shadow-sm font-bold'
                          : isSpace
                            ? 'bg-[#030712]/50 border-gold/10 text-stone-500 opacity-60 hover:opacity-100 hover:border-gold/30'
                            : 'bg-stone-50 border-stone-200 text-stone-400 opacity-60 hover:opacity-100 hover:bg-[#F2ECE0]'
                        }
                      `}
                    >
                      <span>{getSubjectIconInline(sub.id === 'fiqh' ? 'Scale' : sub.id === 'aqeedah' ? 'BookType' : sub.id === 'hadith' ? 'MessageSquareText' : sub.id === 'logic' ? 'Binary' : sub.id === 'quran' ? 'BookOpen' : sub.id === 'philosophy' ? 'Compass' : 'Heart', isActive)}</span>
                      <span>{sub.name} ({countInSub})</span>
                      <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300
                        ${isActive
                          ? isSpace ? 'bg-gold animate-pulse' : 'bg-crimson animate-pulse'
                          : 'bg-stone-300 dark:bg-stone-700'
                        }
                      `} />
                    </button>
                  );
                })}
              </div>

              {/* PERSONAL TRACKING FILTERS */}
              {(completedCourses.length > 0 || interestedCourses.length > 0) && (
                <div className="mt-3.5 pt-3 border-t border-stone-200/10 flex flex-wrap items-center gap-3">
                  <span className="text-[10px] font-mono tracking-wider uppercase opacity-50">
                    My Tracking:
                  </span>
                  {completedCourses.length > 0 && (
                    <button
                      onClick={() => setShowCompletedOnly(!showCompletedOnly)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-sm text-[11px] font-serif transition-all duration-200 cursor-pointer select-none
                        ${showCompletedOnly
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 font-bold'
                          : isSpace
                            ? 'bg-transparent border-gold/10 text-stone-400 hover:text-white'
                            : 'bg-transparent border-stone-200 text-stone-600 hover:bg-stone-50'
                        }
                      `}
                    >
                      <LucideIcons.CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      <span>Completed ({completedCourses.length})</span>
                    </button>
                  )}
                  {interestedCourses.length > 0 && (
                    <button
                      onClick={() => setShowInterestedOnly(!showInterestedOnly)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-sm text-[11px] font-serif transition-all duration-200 cursor-pointer select-none
                        ${showInterestedOnly
                          ? 'bg-amber-500/10 border-amber-500 text-amber-500 font-bold'
                          : isSpace
                            ? 'bg-transparent border-gold/10 text-stone-400 hover:text-white'
                            : 'bg-transparent border-stone-200 text-stone-600 hover:bg-stone-50'
                        }
                      `}
                    >
                      <LucideIcons.Bookmark className="h-3 w-3 text-amber-500 fill-amber-500/10" />
                      <span>Interested ({interestedCourses.length})</span>
                    </button>
                  )}
                  {(showCompletedOnly || showInterestedOnly) && (
                    <button
                      onClick={() => {
                        setShowCompletedOnly(false);
                        setShowInterestedOnly(false);
                      }}
                      className={`text-[10px] font-mono tracking-wider uppercase border-b pb-0.5 hover:scale-105 transition-all ml-auto
                        ${isSpace ? 'text-gold hover:text-white border-gold/20 hover:border-white' : 'text-crimson hover:text-stone-700 border-crimson/20 hover:border-stone-700'}
                      `}
                    >
                      Reset Tracking Filter
                    </button>
                  )}
                </div>
              )}
            </div>

            {filteredCourses.length === 0 ? (
              <div className={`p-8 text-center border border-dashed rounded-sm flex flex-col items-center justify-center min-h-[300px]
                ${isSpace ? 'border-gold/10 text-stone-400 bg-space/20' : 'border-stone-200 text-stone-500 bg-stone-50/50'}
              `}>
                <LucideIcons.SearchX className="h-10 w-10 opacity-30 mb-4" />
                <h4 className="font-serif font-black text-lg mb-1">No Branches Found</h4>
                <p className="text-xs font-sans max-w-xs leading-relaxed opacity-85">
                  No academic branches match your selected category and search query. Try clearing filters or searching for keywords.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setInternalSearch('');
                  }}
                  className={`mt-4 text-[10px] font-mono tracking-wider uppercase border-b pb-0.5 transition-all duration-300
                    ${isSpace ? 'text-gold hover:text-white border-gold/20 hover:border-white' : 'text-crimson hover:text-stone-700 border-crimson/20 hover:border-stone-700'}
                  `}
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative">
                <AnimatePresence mode="popLayout">
                  {filteredCourses.map((course, idx) => {
                    const isSelected = selectedCourseId === course.id;

                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ 
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                          opacity: { duration: 0.2 }
                        }}
                        whileHover={{ 
                          y: -2,
                          scale: isSelected ? [1.02, 1.04, 1.02] : [1.00, 1.02, 1.00],
                          boxShadow: isSpace
                            ? [
                                "0 0 12px rgba(165, 243, 252, 0.2)",
                                "0 0 25px rgba(165, 243, 252, 0.55)",
                                "0 0 12px rgba(165, 243, 252, 0.2)"
                              ]
                            : [
                                "0 0 12px rgba(201, 147, 58, 0.25)",
                                "0 0 25px rgba(201, 147, 58, 0.5)",
                                "0 0 12px rgba(201, 147, 58, 0.25)"
                              ],
                          transition: {
                            y: { duration: 0.15 },
                            scale: {
                              repeat: Infinity,
                              duration: 2.2,
                              ease: "easeInOut"
                            },
                            boxShadow: {
                              repeat: Infinity,
                              duration: 2.2,
                              ease: "easeInOut"
                            }
                          }
                        }}
                        whileTap={{ scale: 0.98 }}
                        key={course.id}
                        onClick={() => {
                          onSelectCourse(course);
                          // Smoothly redirect the viewer to the Canonical Inspector detailed view panel on mobile
                          setTimeout(() => {
                            const el = document.getElementById('canonical-inspector-viewport');
                            if (el && window.innerWidth < 1024) {
                              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                          }, 50);
                        }}
                        role="button"
                        tabIndex={0}
                        className={`group relative p-4 sm:p-5 rounded-lg text-left transition-all duration-300 flex items-center gap-4 sm:gap-5 cursor-pointer overflow-hidden skeuo-active-click
                          ${isSelected
                            ? isSpace
                              ? 'skeuo-card-space border-gold text-white shadow-[0_0_25px_rgba(196,163,90,0.5)] ring-2 ring-gold/40 z-10'
                              : 'skeuo-card-parchment border-[#C9933A] text-[#0B4628] shadow-[0_0_20px_rgba(196,163,90,0.3)] ring-2 ring-[#C9933A]/40 z-10'
                            : isSpace
                              ? 'skeuo-card-space text-stone-300 hover:text-white'
                              : 'skeuo-card-parchment text-stone-700 hover:text-charcoal'
                          }
                        `}
                      >
                        {/* Decorative Vertical Marker strip when active */}
                        <div className={`absolute top-0 bottom-0 left-0 w-[3px] transition-transform duration-300
                          ${isSpace ? 'bg-gold' : 'bg-crimson'}
                          ${isSelected ? 'scale-y-100' : 'scale-y-0 group-hover:scale-y-100'}
                        `} />

                        {/* Icon medallion */}
                        <div className={`shrink-0 h-14 w-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 border
                          ${isSpace
                            ? 'bg-white/5 border-gold/25 text-gold'
                            : 'bg-[#0B4628]/5 border-[#0B4628]/15 text-crimson'
                          }
                        `}>
                          {getIcon(course.icon)}
                        </div>

                        {/* Content + actions */}
                        <div className="flex-1 min-w-0 flex flex-col gap-2.5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="font-serif font-black text-base sm:text-lg tracking-wide leading-tight truncate group-hover:text-gold transition-colors">
                                {course.name}
                              </h3>
                              <p className="text-xs text-stone-400 dark:text-stone-500 font-sans line-clamp-1 mt-0.5 font-medium">
                                {course.branches.join(', ')}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {completedCourses.includes(course.id) && (
                                <LucideIcons.CheckCircle2
                                  className="h-3.5 w-3.5 text-emerald-500 animate-fade-in"
                                  title="Completed Study"
                                />
                              )}
                              {interestedCourses.includes(course.id) && (
                                <LucideIcons.Bookmark
                                  className="h-3.5 w-3.5 text-amber-500 fill-amber-500/15 animate-fade-in"
                                  title="Interested Study"
                                />
                              )}
                              <span className="text-[9px] uppercase tracking-widest font-mono text-stone-400 dark:text-stone-500 font-bold">
                                {course.count}
                              </span>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectCourse(course);
                                onEnroll?.(course);
                              }}
                              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 shadow-sm
                                ${isSpace
                                  ? 'bg-gold text-space hover:bg-gold-light'
                                  : 'bg-[#0B4628] text-[#FAF6EF] hover:bg-[#0d5432]'
                                }
                              `}
                            >
                              <LucideIcons.GraduationCap className="h-3.5 w-3.5" />
                              Enroll
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectCourse(course);
                                setTimeout(() => {
                                  const el = document.getElementById('canonical-inspector-viewport');
                                  if (el) {
                                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }
                                }, 50);
                              }}
                              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider border transition-all duration-300 active:scale-95
                                ${isSpace
                                  ? 'border-gold/40 text-gold hover:bg-gold/10'
                                  : 'border-[#0B4628]/30 text-[#0B4628] hover:bg-[#0B4628]/5'
                                }
                              `}
                            >
                              Details
                              <LucideIcons.ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* RIGHT: DETAILED VIEWPORT (Canonical Inspector) (lg:col-span-3) */}
          <div className="lg:col-span-3 relative z-10" id="canonical-inspector-viewport">
            <div 
              key={selectedCourseId}
              className={`relative p-6 sm:p-8 md:p-10 border rounded-sm transition-all duration-300 shadow-md overflow-hidden min-h-[460px] animate-pulse-glow
                ${isSpace 
                  ? 'bg-[#0a0f1d] border-gold/25 text-white' 
                  : 'bg-white border-stone-200 text-charcoal'
                }
              `}
            >
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
                  <h3 className="font-serif font-black text-2xl tracking-wide leading-tight">{selectedCourse?.name}</h3>
                  <span className="text-xs font-mono text-stone-400 dark:text-stone-500 font-medium">{selectedCourse?.count}</span>
                </div>
              </div>

              {/* Course Long Description */}
              <p className="text-sm leading-relaxed text-stone-500 dark:text-stone-400 mb-8 font-serif italic select-all border-l-2 pl-4 border-stone-600/20">
                {selectedCourse?.description}
              </p>

              {/* Progress & Interest Persistence Controls */}
              {selectedCourse && (
                <div className={`mb-8 p-4 border rounded-sm transition-all duration-300
                  ${isSpace 
                    ? 'bg-space/40 border-gold/15 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]' 
                    : 'bg-stone-50 border-stone-150 shadow-inner'
                  }
                `}>
                  <h4 className={`text-[10px] uppercase font-mono tracking-[0.25em] font-bold mb-3
                    ${isSpace ? 'text-gold-light' : 'text-crimson'}
                  `}>
                    YOUR TRACKING & ARCHIVE
                  </h4>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const courseId = selectedCourse.id;
                        setCompletedCourses(prev => 
                          prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
                        );
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-sm text-xs font-serif font-black transition-all duration-200 cursor-pointer select-none
                        ${completedCourses.includes(selectedCourse.id)
                          ? isSpace
                            ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : isSpace
                            ? 'bg-transparent border-gold/10 text-stone-400 hover:border-gold/30 hover:text-white'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-charcoal'
                        }
                      `}
                    >
                      <LucideIcons.CheckCircle2 className={`h-4 w-4 ${completedCourses.includes(selectedCourse.id) ? 'text-emerald-500' : 'opacity-65'}`} />
                      <span>{completedCourses.includes(selectedCourse.id) ? 'Completed' : 'Mark Completed'}</span>
                    </button>

                    <button
                      onClick={() => {
                        const courseId = selectedCourse.id;
                        setInterestedCourses(prev => 
                          prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
                        );
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-sm text-xs font-serif font-black transition-all duration-200 cursor-pointer select-none
                        ${interestedCourses.includes(selectedCourse.id)
                          ? isSpace
                            ? 'bg-amber-950/40 border-amber-500/60 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
                            : 'bg-amber-50 border-amber-200 text-amber-800'
                          : isSpace
                            ? 'bg-transparent border-gold/10 text-stone-400 hover:border-gold/30 hover:text-white'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-charcoal'
                        }
                      `}
                    >
                      <LucideIcons.Bookmark className={`h-4 w-4 ${interestedCourses.includes(selectedCourse.id) ? 'text-amber-500 fill-amber-500/20' : 'opacity-65'}`} />
                      <span>{interestedCourses.includes(selectedCourse.id) ? 'Interested' : 'Interested'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Branches breakdown ledger */}
              <div>
                <h4 className={`text-xs uppercase font-mono tracking-[0.25em] font-bold mb-4
                  ${isSpace ? 'text-gold-light' : 'text-crimson'}
                `}>
                  Core Branches Study
                </h4>
                <ul className="grid grid-cols-1 gap-3">
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
