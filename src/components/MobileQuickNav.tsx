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
}

export default function MobileQuickNav({ 
  currentTheme, 
  currentSection, 
  onNavigate,
  language = 'en'
}: MobileQuickNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isSpace = currentTheme === 'space';

  const menuGroups = [
    {
      title: language === 'ar' ? 'العلوم الأساسية' : language === 'ur' ? 'بنیادی علوم' : 'Core Divine Sciences',
      items: [
        { id: 'landing', label: language === 'ar' ? 'الكرة السماوية' : language === 'ur' ? 'فلکیاتی گلوب' : 'Celestial Globe Hub', icon: Globe },
        { id: 'academic-world', label: language === 'ar' ? 'الجامعة العلمية' : language === 'ur' ? 'علمی دنیا' : 'Scholastic Universe', icon: GraduationCap },
        { id: 'quran-explorer', label: language === 'ar' ? 'مستكشف القرآن' : language === 'ur' ? 'قرآن ایکسپلورر' : 'Qur\'an Explorer', icon: BookOpen },
        { id: 'hadith', label: language === 'ar' ? 'مكتبة الحديث' : language === 'ur' ? 'حدیث لائبریری' : 'Prophetic Hadiths', icon: BookOpen },
      ]
    },
    {
      title: language === 'ar' ? 'علم الكلام والمنطق' : language === 'ur' ? 'کلام و منطق' : 'Theology & Dialectics',
      items: [
        { id: 'debate', label: language === 'ar' ? 'ساحة المناظرة' : language === 'ur' ? 'مناظرہ ہال' : 'Scholarly Debate Arena', icon: Sparkles },
        { id: 'fiqh-ruling', label: language === 'ar' ? 'الأحكام الفقهية' : language === 'ur' ? 'شرعی مسائل' : 'Fiqh Jurisprudence', icon: HelpCircle },
        { id: 'aqeedah-firewall', label: language === 'ar' ? 'حصن العقيدة' : language === 'ur' ? 'عقیدہ فائر وال' : 'Aqeedah Firewall', icon: ShieldCheck },
        { id: 'mantiq-tutor', label: language === 'ar' ? 'علم المنطق' : language === 'ur' ? 'منطق ٹیوٹر' : 'Mantiq Logic Tutor', icon: Compass },
        { id: 'fallacy-scanner', label: language === 'ar' ? 'كاشف المغالطات' : language === 'ur' ? 'مغالطہ سکینر' : 'Fallacy Scanner', icon: ShieldAlert },
      ]
    },
    {
      title: language === 'ar' ? 'التزكية والإرشاد العقلاني' : language === 'ur' ? 'روحانی علاج و اخلاقیات' : 'Spiritual Therapy & Ethics',
      items: [
        { id: 'waswas-clinic', label: language === 'ar' ? 'علاج الوسواس' : language === 'ur' ? 'وسواس کلینک' : 'Waswas Cognitive Clinic', icon: Heart },
        { id: 'dhikr-rx', label: language === 'ar' ? 'صيدلية الأذكار' : language === 'ur' ? 'ذکر فارمیسی' : 'Dhikr Neuro-Rx Pharmacy', icon: Sparkles },
        { id: 'nafs-assessment', label: language === 'ar' ? 'تحليل النفس' : language === 'ur' ? 'نفسانی جائزہ' : 'Nafs Assessment Map', icon: Brain },
        { id: 'ruya-interpreter', label: language === 'ar' ? 'تفسير الرؤى' : language === 'ur' ? 'تعبیر الرؤیا' : 'Ru\'ya Dream Interpreter', icon: Moon },
        { id: 'maqasid-analyzer', label: language === 'ar' ? 'مقاصد الشريعة' : language === 'ur' ? 'مقاصد شریعت' : 'Maqasid Ethical Analyzer', icon: Scale },
        { id: 'portal', label: language === 'ar' ? 'البوابة الأكاديمية' : language === 'ur' ? 'سٹوڈنٹ پورٹل' : 'Student & Scribe Portal', icon: GraduationCap }
      ]
    }
  ];

  return (
    <div className="lg:hidden" id="mobile-quick-nav-root">
      {/* FLOATING ACTION TRIGGER TRIGGERED AT BOTTOM RIGHT (COMPACT & HIGHLY VISIBLE ON MOBILE SCREEN) */}
      <div className="fixed bottom-24 right-4 z-[99999] pointer-events-auto">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative group flex h-10 w-10 items-center justify-center rounded-full shadow-2xl transition-all duration-300 transform active:scale-95 border cursor-pointer
            ${isSpace 
              ? 'bg-[#0A0F2E] border-gold text-gold-light hover:border-gold shadow-[0_4px_16px_rgba(201,147,58,0.4)]' 
              : 'bg-[#8B1A1A] border-amber-200 text-white hover:border-[#8B1A1A] shadow-[0_4px_16px_rgba(139,26,26,0.35)]'
            }
          `}
          id="mobile-quick-nav-trigger"
          aria-label="Toggle navigation map"
          title="Campus Navigation Hub"
        >
          {/* Pulsing visual indicator circle */}
          <span className={`absolute -inset-1 rounded-full border opacity-40 animate-pulse duration-700
            ${isSpace ? 'border-gold' : 'border-amber-400'}
          `} />
          
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close-icon"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-center text-white"
              >
                <X className="h-4.5 w-4.5 stroke-[2.5]" />
              </motion.div>
            ) : (
              <motion.div
                key="menu-icon"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-center"
              >
                <Menu className="h-4.5 w-4.5 stroke-[2.5]" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

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
                              onNavigate(item.id);
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
