import React, { useState } from 'react';
import { Sun, Moon, Search, Menu, X, BookOpen, Sparkles, GraduationCap, Languages, HelpCircle, Brain, Heart, Compass, ShieldAlert, Scale, ShieldCheck } from 'lucide-react';
import { Language, LIST_TRANSLATIONS } from '../i18n';

interface HeaderProps {
  currentTheme: 'parchment' | 'space';
  onToggleTheme: () => void;
  onSearch: (term: string) => void;
  onOpenAdmission: () => void;
  onOpenPortal: () => void;
  onGoToLanding?: () => void;
  
  // Custom scholarly navigation coordinates
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  language?: Language;
  onLanguageChange?: (lang: Language) => void;

  // Lifted mobile menu props for merged quick nav
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export default function Header({ 
  currentTheme, 
  onToggleTheme, 
  onSearch, 
  onOpenAdmission, 
  onOpenPortal, 
  onGoToLanding,
  activeTab = 'landing',
  onTabChange,
  language = 'en',
  onLanguageChange,
  mobileMenuOpen,
  setMobileMenuOpen
}: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [localMobileMenuOpen, setLocalMobileMenuOpen] = useState(false);

  const isMobileOpen = mobileMenuOpen !== undefined ? mobileMenuOpen : localMobileMenuOpen;
  const toggleMobileOpen = () => {
    if (setMobileMenuOpen) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setLocalMobileMenuOpen(!localMobileMenuOpen);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const isSpace = currentTheme === 'space';
  const t = LIST_TRANSLATIONS[language];
  const isRTL = language === 'ar' || language === 'ur';

  const navItems = [
    { id: 'landing', label: t.celestialGlobe },
    { 
      id: 'academic-world', 
      label: language === 'ar' 
        ? 'المنظومات الأكاديمية' 
        : language === 'ur' 
          ? 'علمی شعبہ جات' 
          : 'Scholastic Universe', 
      icon: Menu 
    }
  ];

  return (
    <nav 
      id="navbar" 
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md border-b shadow-sm
        ${isSpace 
          ? 'bg-[#020509]/95 border-gold/20 text-white' 
          : 'bg-[#FAF8F5]/95 border-crimson/15 text-charcoal'
        }
      `}
    >
      {/* TOP ROW: LOGO & CONTROLS */}
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-4 py-3 px-6 md:px-12">
        {/* LOGO */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative group cursor-pointer" onClick={() => { if (onTabChange) onTabChange('landing'); else if (onGoToLanding) onGoToLanding(); }}>
            <div className={`absolute -inset-1 blur-sm rounded-full opacity-35 group-hover:opacity-80 transition duration-300
              ${isSpace ? 'bg-gold' : 'bg-crimson'}
            `}></div>
            <img 
              alt="Albab Logo" 
              className="relative h-11 w-11 object-contain rounded-full border border-gold/30 shadow-md transform group-hover:scale-105 transition-transform"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6GPkUINYomPqZtlU7xopLCQf3q2nN-uUtfe1o0-i5-PYC9iizfy-0wzrokp8ZPsjwLw73OXyCEdL6yFr3uEb8pGYC1RHOHQADviljCbiMBXz7dn_ODjpxpQqyCH0IAfxdN4L-0H5a5HhTMbMpnVUet1SZ4jv33EnJ5hiAGRvpTQBIY9SfPkb6QEK-q5kZ06lCsprBWndsJOg3Q8bnWR_Bd-YSHR1sc4dBtaDowmYtYkMfqOkVQmsnr_F4sh4V_rnuzy8iOO-MdNYs"
            />
          </div>
          <div>
            <h1 className={`font-serif font-black text-base md:text-lg leading-none tracking-wide
              ${isSpace ? 'text-[#E8B86D]' : 'text-[#8B1A1A]'}
            `}>
              {t.title}
            </h1>
            <p className={`text-[10px] tracking-[0.2em] font-mono font-black mt-1 opacity-100
              ${isSpace ? 'text-[#E8B86D]' : 'text-[#8B1A1A]'}
            `}>
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          
          {/* LANGUAGE PICKER */}
          <div className="flex items-center gap-1.5 border border-stone-400 p-1 rounded bg-white/60 dark:bg-space-dark/40 font-mono text-[11px] hover:border-black transition-colors">
            <LanguageButton lang="en" cur={language} onClick={onLanguageChange} />
            <LanguageButton lang="ar" cur={language} label="عربي" onClick={onLanguageChange} />
            <LanguageButton lang="ur" cur={language} label="اردو" onClick={onLanguageChange} />
          </div>

          {/* THEME TOGGLE */}
          <button 
            onClick={onToggleTheme} 
            className={`p-2 rounded-full transition-all duration-300 relative group cursor-pointer
              ${isSpace ? 'bg-[#2F2113]/40 text-[#EBC15A] border-2 border-gold/40' : 'bg-stone-200/90 text-black border-2 border-[#111]'}
            `}
            title={isSpace ? t.toggleThemeLight : t.toggleThemeDark}
          >
            <div className="relative h-4.5 w-4.5 transition-transform duration-500 group-hover:rotate-12">
              {isSpace ? <Sun className="absolute inset-0 h-4.5 w-4.5" /> : <Moon className="absolute inset-0 h-4.5 w-4.5" />}
            </div>
          </button>

          {/* ENROLL BUTTON */}
          <button 
            onClick={onOpenAdmission}
            className="hidden sm:flex items-center gap-1 text-[11px] font-black tracking-widest uppercase py-2 px-4 border rounded-sm transition-all duration-300 shadow-md cursor-pointer
              bg-crimson text-white hover:bg-black hover:border-black active:translate-y-px border-crimson
              dark:bg-gold dark:text-space dark:hover:bg-white dark:hover:border-white dark:border-gold
            "
          >
            {t.applyNow}
          </button>

          {/* DYNAMIC SCRIBE AI ASSISTANT TRIGGER */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-albab-bot'))}
            className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-black tracking-widest uppercase py-1.5 px-2.5 sm:py-2 sm:px-3.5 border rounded-sm transition-all duration-300 shadow-md cursor-pointer
              bg-[#8b1a1a]/5 hover:bg-[#8b1a1a]/10 text-[#8b1a1a] border-[#8b1a1a]/25 hover:border-[#8b1a1a]
              dark:bg-gold/5 dark:text-gold-light dark:border-gold/25 dark:hover:bg-gold/10 dark:hover:border-gold
            "
            title="Ask ALBAB AI"
          >
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-pulse text-crimson dark:text-gold-light" />
            <span>ALBAB AI</span>
          </button>

          {/* MOBILE MENU TOGGLE */}
          <button 
            onClick={toggleMobileOpen}
            className="lg:hidden p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full cursor-pointer text-black dark:text-white"
          >
            {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* COMPREHENSIVE, PROMINENT MENU BAR WITH ALL SECTIONS (BOLD FONTS ONLY) */}
      <div 
        className={`hidden lg:block border-t border-b overflow-x-auto select-none
          ${isSpace 
            ? 'border-gold/25 bg-[#03080e]/95' 
            : 'border-crimson/20 bg-[#FAF8F5]'
          }
        `}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-8 py-1.5 px-4 md:px-8 whitespace-nowrap scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (onTabChange) {
                    onTabChange(item.id);
                  } else {
                    if (item.id === 'portal') onOpenPortal();
                    else onGoToLanding?.();
                  }
                }}
                className={`flex items-center gap-1 px-3 py-2 rounded transition-all duration-150 cursor-pointer text-[11px] tracking-wide font-sans select-none border-2
                  ${isActive 
                    ? (isSpace 
                        ? 'bg-gold text-[#020509] border-gold font-bold shadow-md scale-102' 
                        : 'bg-crimson text-white border-crimson font-black shadow-md scale-102'
                      )
                    : (isSpace 
                        ? 'text-white hover:text-white hover:bg-gold/15 border-transparent hover:border-gold/30 font-bold' 
                        : 'text-black hover:text-black hover:bg-crimson/10 border-transparent hover:border-[#000000]/60 font-black'
                      )
                  }
                `}
              >
                {item.icon && <item.icon className="h-3.5 w-3.5 shrink-0 stroke-[2.5]" />}
                <span className="font-extrabold uppercase">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* LEGACY MOBILE DRAWER (Only when not using lifted state to prevent duplicates) */}
      {!setMobileMenuOpen && isMobileOpen && (
        <div className={`absolute top-full left-0 right-0 py-6 px-8 shadow-xl flex flex-col gap-4 border-b font-serif text-lg z-40 transition-all duration-300
          ${isSpace 
            ? 'bg-space border-gold/15 text-white/90' 
            : 'bg-[#FAF8F5] border-crimson/10 text-charcoal'
          }
        `}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (setMobileMenuOpen) setMobileMenuOpen(false);
                else setLocalMobileMenuOpen(false);
                if (onTabChange) {
                  onTabChange(item.id);
                } else {
                  if (item.id === 'portal') onOpenPortal();
                  else onGoToLanding?.();
                }
              }}
              className="py-2 border-b border-stone-200/5 hover:text-gold transition-colors text-left font-serif text-base font-semibold bg-transparent border-0 w-full focus:outline-none"
            >
              {item.label}
            </button>
          ))}
          <button 
            onClick={() => {
              if (setMobileMenuOpen) setMobileMenuOpen(false);
              else setLocalMobileMenuOpen(false);
              onOpenAdmission();
            }}
            className="mt-4 flex justify-center items-center gap-2 py-3 bg-crimson dark:bg-gold text-white dark:text-space font-bold tracking-widest text-xs uppercase rounded-sm"
          >
            {t.applyNow}
          </button>
        </div>
      )}
    </nav>
  );
}

interface LanguageBtnProps {
  lang: Language;
  cur: Language;
  label?: string;
  onClick?: (lang: Language) => void;
}

function LanguageButton({ lang, cur, label, onClick }: LanguageBtnProps) {
  const active = cur === lang;
  return (
    <button
      type="button"
      onClick={() => onClick?.(lang)}
      className={`px-1.5 py-0.5 rounded text-[10px] font-mono tracking-tighter cursor-pointer transition-all uppercase
        ${active 
          ? 'bg-crimson dark:bg-gold text-white dark:text-space font-bold' 
          : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
        }
      `}
    >
      {label || lang}
    </button>
  );
}
