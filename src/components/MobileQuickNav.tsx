import React, { useState } from 'react';
import { 
  Menu, X, Globe, GraduationCap, BookOpen, Sparkles, HelpCircle, 
  ShieldCheck, ShieldAlert, Compass, Heart, Brain, Moon, Scale, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MobileQuickNavProps {
  currentTheme: 'parchment' | 'space';
  currentSection: string;
  onNavigate: (section: string) => void;
  language?: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onOpenAdmission?: () => void;
}

export default function MobileQuickNav({ 
  currentTheme, 
  currentSection, 
  onNavigate,
  language = 'en',
  isOpen,
  setIsOpen,
  onOpenAdmission
}: MobileQuickNavProps) {
  const isSpace = currentTheme === 'space';

  const menuGroups = [
    {
      title: language === 'ar' ? 'البوابات الرئيسية' : language === 'ur' ? 'اہم سیکشنز' : 'Core Navigation Gateways',
      items: [
        { id: 'landing', label: language === 'ar' ? 'الكرة السماوية' : language === 'ur' ? 'فلکیاتی گلوب' : 'Celestial Globe Hub', icon: Globe },
        { id: 'academic-world', label: language === 'ar' ? 'المنظومات الأكاديمية' : language === 'ur' ? 'علمی شعبہ جات' : 'Scholastic Universe', icon: GraduationCap },
        { id: 'ai-bot-trigger', label: language === 'ar' ? 'ألباب ذكاء اصطناعي (ALBAB AI)' : language === 'ur' ? 'الباب اے آئی (ALBAB AI)' : 'ALBAB AI', icon: Sparkles },
      ]
    }
  ];

  return (
    <div className="lg:hidden" id="mobile-quick-nav-root">
      {/* FULL RESPONSIVE OVERLAY DRAWER PANEL */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop cover blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[48] pointer-events-auto"
            />

            {/* Slide up responsive sheet drawer */}
            <motion.div
              initial={{ y: "100%", opacity: 0.9 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className={`fixed bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl z-[49] flex flex-col pointer-events-auto border-t shadow-2xl overflow-hidden
                ${isSpace 
                  ? 'bg-[#040815] border-gold/30 text-white' 
                  : 'bg-[#FCFAF7] border-crimson/25 text-stone-800'
                }
              `}
              id="mobile-navigation-drawer-panel"
            >
              {/* Drawer Top Header Indicator Bar */}
              <div className="flex justify-center py-2.5">
                <div className={`h-1.5 w-12 rounded-full opacity-40
                  ${isSpace ? 'bg-gold' : 'bg-stone-400'}
                `} />
              </div>

              {/* Drawer Brand & Header */}
              <div className="px-6 pb-4 pt-1 flex justify-between items-center border-b border-stone-200/40 dark:border-stone-800/40">
                <div>
                  <div className="flex items-center gap-1.5 mb-1 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/30 px-2 py-0.5 rounded-full w-fit">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-mono text-[9px] tracking-widest text-[#C4A35A] uppercase font-black">
                      CAMPUS NAVIGATION RADAR
                    </span>
                  </div>
                  <h3 className="font-serif font-black text-lg" style={{ fontFamily: 'Amiri, Georgia, serif' }}>
                    بوابة البحث العلمي <span className="font-sans text-xs ml-1 font-bold tracking-tight text-stone-500">Albab Campus Gate</span>
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 border border-stone-300 dark:border-stone-800 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Categorised Departments List Scroll area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
                {menuGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="space-y-2">
                    <h4 className="font-mono text-[10px] tracking-[0.2em] font-black uppercase opacity-65 border-b border-stone-200/35 dark:border-stone-800/35 pb-1 select-none">
                      {group.title}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {group.items.map((item) => {
                        const isCurrent = currentSection === item.id;
                        const IconComponent = item.icon;

                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              if (item.id === 'ai-bot-trigger') {
                                window.dispatchEvent(new CustomEvent('open-albab-bot'));
                              } else {
                                onNavigate(item.id);
                              }
                              setIsOpen(false);
                            }}
                            className={`flex items-center justify-between p-3 rounded-md border text-left cursor-pointer transition-all duration-150 group/item select-none
                              ${isCurrent
                                ? (isSpace 
                                    ? 'bg-gold/15 border-gold text-gold-light font-bold' 
                                    : 'bg-crimson text-white border-crimson font-black'
                                  )
                                : (isSpace
                                    ? 'bg-space-dark/40 border-gold/10 hover:bg-gold/5 text-stone-300 hover:text-white hover:border-gold/30'
                                    : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-700 hover:text-stone-900 hover:border-stone-400'
                                  )
                              }
                            `}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`p-1.5 rounded-sm shrink-0 border transition-colors
                                ${isCurrent
                                  ? 'bg-white/10 border-white/20'
                                  : (isSpace ? 'bg-space-dark border-gold/15' : 'bg-stone-50 border-stone-150')
                                }
                              `}>
                                <IconComponent className="h-4 w-4 shrink-0 stroke-[2]" />
                              </div>
                              <span className="text-xs font-serif tracking-tight font-black leading-none truncate">
                                {item.label}
                              </span>
                            </div>

                            <ChevronRight className={`h-3.5 w-3.5 opacity-40 shrink-0 transition-transform group-hover/item:translate-x-0.5
                              ${isCurrent ? 'text-white' : ''}
                            `} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Admission Call to Action Button inside Drawer */}
              {onOpenAdmission && (
                <div className="px-5 pb-3 pt-1">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenAdmission();
                    }}
                    className="w-full flex justify-center items-center gap-2 py-3 bg-crimson dark:bg-gold text-white dark:text-space font-mono text-xs uppercase font-extrabold tracking-widest rounded-md shadow-md active:scale-[0.98] transition-transform cursor-pointer"
                  >
                    <GraduationCap className="h-4 w-4" />
                    Apply for Admissions Now
                  </button>
                </div>
              )}

              {/* Quick Academic Pledge Banner Footer */}
              <div className="p-4 bg-stone-100 dark:bg-space-dark/80 border-t border-stone-200/50 dark:border-stone-800/50 flex items-center justify-between text-[10px] font-mono select-none">
                <span className="opacity-60">ADMINISTRATIVE COVENANT SHIELD</span>
                <span className="text-[#C4A35A] font-bold">ALBAB ONLINE v1.4</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
