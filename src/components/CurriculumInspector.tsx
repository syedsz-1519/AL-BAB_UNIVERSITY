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
  searchText: string;
  onOpenAdmission?: (courseId?: string) => void;
}

const CATEGORIES = [
  { id: 'all', name: 'All Disciplines', icon: 'Layers', desc: 'Complete spectrum of learning', courseIds: [] as string[] },
  { id: 'quran', name: 'Quran Studies', icon: 'BookOpen', desc: 'Exegesis & structural miracles', courseIds: ['quran'] },
  { id: 'hadith', name: 'Hadith Sciences', icon: 'MessageSquareText', desc: 'Prophetic traditions & chain validation', courseIds: ['hadith'] },
  { id: 'fiqh', name: 'Fiqh & Finance', icon: 'Scale', desc: 'Jurisprudence, contracts & economics', courseIds: ['fiqh', 'economic-studies'] },
  { id: 'logic', name: 'Logic & Modernity', icon: 'Binary', desc: 'Reasoning, philosophy & modern critique', courseIds: ['logic', 'philosophy', 'modernity', 'challenges'] },
  { id: 'islamic-studies', name: 'Islamic Theology', icon: 'BookType', desc: 'Theology, seerah & purification', courseIds: ['islamic-studies'] },
  { id: 'humanities', name: 'Humanities & Soul', icon: 'Heart', desc: 'Psychology, history, politics & poetry', courseIds: ['psychology', 'history', 'politics', 'poetry'] },
  { id: 'science', name: 'Science & AI', icon: 'Atom', desc: 'Natural, mathematical & AI sciences', courseIds: ['science'] }
];

export default function CurriculumInspector({ currentTheme, selectedCourseId, onSelectCourse, searchText, onOpenAdmission }: CurriculumInspectorProps) {
  const isSpace = currentTheme === 'space';
  const [internalSearch, setInternalSearch] = useState('');
  const [allCourses, setAllCourses] = useState<Course[]>(COURSES);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedCourseIds, setExpandedCourseIds] = useState<Record<string, boolean>>({});
  
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
      return <IconComponent className="h-6 w-6" />;
    }
    return <LucideIcons.BookOpen className="h-6 w-6" />;
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

  // Find course matching searched branch/topic AND selected category
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

      // 2. Search Text Filter
      if (!activeSearch) return true;
      const cleanSearch = activeSearch.toLowerCase();
      const matchesName = course.name.toLowerCase().includes(cleanSearch);
      const matchesBranches = course.branches.some(branch => branch.toLowerCase().includes(cleanSearch));
      const matchesDesc = course.description.toLowerCase().includes(cleanSearch);
      return matchesName || matchesBranches || matchesDesc;
    });
  }, [allCourses, selectedCategory, activeSearch]);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
  };

  const toggleExpand = (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCourseIds(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

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
            Filter our academic disciplines or search directly for critical subjects—be it modern sciences, jurisprudence of Usul, or critical thinking ethics.
          </p>

          {/* SMOOTH SCROLL TO CELESTIAL GLOBE TRIGGER */}
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
              className={`w-full px-5 py-3 pl-11 text-sm rounded sm:rounded-sm border focus:outline-none transition-all font-sans
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
                            {cat.name}
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
                      
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ml-2 font-bold flex-shrink-0
                        ${isCatSelected
                          ? isSpace ? 'bg-black/15 text-black' : 'bg-white/20 text-white'
                          : isSpace ? 'bg-white/5 text-gold-light' : 'bg-black/5 text-stone-500'
                        }
                      `}>
                        {countInCat}
                      </span>
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
                      className={`snap-start flex-shrink-0 flex items-center gap-2 px-4 py-2 border rounded-full transition-all duration-300 text-xs font-serif font-black cursor-pointer
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
                      <span>{cat.name}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold
                        ${isCatSelected
                          ? isSpace ? 'bg-black/15 text-black' : 'bg-white/20 text-white'
                          : isSpace ? 'bg-white/5 text-gold-light' : 'bg-black/5 text-stone-500'
                        }
                      `}>
                        {countInCat}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* RIGHT: CHANNELS/COURSES GRID (lg:col-span-9) */}
          <div className="lg:col-span-9">
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative items-start">
                <AnimatePresence mode="popLayout">
                  {filteredCourses.map((course) => {
                    const isExpanded = !!expandedCourseIds[course.id];

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
                        whileHover={{ y: -4, transition: { duration: 0.15 } }}
                        key={course.id}
                        className={`group relative p-6 rounded-sm text-left transition-all duration-300 flex flex-col justify-between cursor-default border skeuo-active-click min-h-[260px]
                          ${isSpace
                            ? 'skeuo-card-space border-gold/15 text-stone-300 hover:text-white bg-[#0a0f1d] shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
                            : 'skeuo-card-parchment border-stone-200 text-stone-700 hover:text-charcoal bg-white shadow-sm'
                          }
                        `}
                      >
                        {/* Decorative Vertical Marker strip */}
                        <div className={`absolute top-0 bottom-0 left-0 w-[3.5px] transition-transform duration-300
                          ${isSpace ? 'bg-gold' : 'bg-crimson'}
                          scale-y-0 group-hover:scale-y-100
                        `} />

                        <div>
                          {/* Card Header */}
                          <div className="flex justify-between items-start w-full mb-4">
                            <span className={`transition-transform duration-300 group-hover:scale-105
                              ${isSpace ? 'text-gold' : 'text-crimson'}
                            `}>
                              {getIcon(course.icon)}
                            </span>
                            <span className="text-[9px] uppercase tracking-widest font-mono text-stone-400 dark:text-stone-500 font-bold">
                              {course.count}
                            </span>
                          </div>

                          {/* Course Title */}
                          <h3 className="font-serif font-black text-xl tracking-wide leading-tight group-hover:text-gold transition-colors">
                            {course.name}
                          </h3>

                          {/* Course Description */}
                          <p className="text-xs text-stone-400 dark:text-stone-500 font-sans mt-3 font-medium leading-relaxed">
                            {course.description}
                          </p>

                          {/* Expandable Core Branches Study List */}
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                className="overflow-hidden mt-4 pt-4 border-t border-stone-200/10"
                              >
                                <h4 className={`text-[10px] uppercase font-mono tracking-[0.25em] font-bold mb-3
                                  ${isSpace ? 'text-gold-light' : 'text-crimson'}
                                `}>
                                  Core Branches Study
                                </h4>
                                <ul className="grid grid-cols-1 gap-2">
                                  {course.branches.map((branch, idx) => (
                                    <li key={idx} className="flex items-center gap-2.5">
                                      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0
                                        ${isSpace ? 'bg-gold' : 'bg-crimson'}
                                      `} />
                                      <span className="text-xs font-sans font-semibold tracking-wide text-stone-600 dark:text-stone-300">
                                        {branch}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Actions Footer */}
                        <div className="mt-6 pt-4 border-t border-stone-200/10 flex items-center gap-3 w-full">
                          <button
                            onClick={(e) => toggleExpand(course.id, e)}
                            className={`flex-1 py-2 px-3 rounded text-center text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 border flex items-center justify-center gap-1.5 cursor-pointer
                              ${isSpace
                                ? 'bg-transparent border-gold/20 text-gold hover:bg-gold/10 hover:border-gold/40'
                                : 'bg-transparent border-crimson/15 text-crimson hover:bg-crimson/5 hover:border-[#8b1617]/30'
                              }
                            `}
                          >
                            {isExpanded ? (
                              <>
                                <LucideIcons.ChevronUp className="h-3.5 w-3.5" />
                                Hide Details
                              </>
                            ) : (
                              <>
                                <LucideIcons.ChevronDown className="h-3.5 w-3.5" />
                                View Details
                              </>
                            )}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onOpenAdmission) {
                                onOpenAdmission(course.id);
                              }
                            }}
                            className={`flex-1 py-2 px-3 rounded text-center text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer
                              ${isSpace
                                ? 'bg-gold text-black hover:bg-gold-light shadow-[0_4px_12px_rgba(201,147,58,0.2)] hover:shadow-[0_4px_16px_rgba(201,147,58,0.35)] font-extrabold'
                                : 'bg-crimson text-white hover:bg-crimson-dark shadow-[0_4px_12px_rgba(139,22,23,0.15)] hover:shadow-[0_4px_16px_rgba(139,22,23,0.25)] font-extrabold'
                              }
                            `}
                          >
                            Enroll Now
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </section>
  );
}
