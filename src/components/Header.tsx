import React, { useState } from 'react';
import { Sun, Moon, Search, Menu, X, BookOpen, Sparkles, GraduationCap, Languages, HelpCircle, Brain } from 'lucide-react';
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
  onLanguageChange
}: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const isSpace = currentTheme === 'space';
  const t = LIST_TRANSLATIONS[language];
  const isRTL = language === 'ar' || language === 'ur';

  const navItems = [
    { id: 'landing', label: t.celestialGlobe },
    { id: 'debate', label: t.debateArena, icon: Sparkles },
    { id: 'quran-explorer', label: t.quranExplorer, icon: BookOpen },
    { id: 'fiqh-ruling', label: t.fiqhRuling, icon: HelpCircle },
    { id: 'cognitive-labs', label: 'Cognitive Labs', icon: Brain },
    { id: 'portal', label: t.scholasticPortal, icon: GraduationCap }
  ];

  return (
    <nav 
      id="navbar" 
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-6 md:px-12 backdrop-blur-md border-b
        ${isSpace 
          ? 'bg-space/85 border-gold/15 text-white' 
          : 'bg-[#FAF8F5]/85 border-crimson/10 text-charcoal'
        }
      `}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
        {/* LOGO */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative group cursor-pointer" onClick={() => { if (onTabChange) onTabChange('landing'); else if (onGoToLanding) onGoToLanding(); }}>
            <div className={`absolute -inset-1 blur-sm rounded-full opacity-30 group-hover:opacity-75 transition duration-300
              ${isSpace ? 'bg-gold' : 'bg-crimson'}
            `}></div>
            <img 
              alt="Albab Logo" 
              className="relative h-11 w-11 object-contain rounded-full border border-gold/30 shadow-md transform group-hover:scale-105 transition-transform"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6GPkUINYomPqZtlU7xopLCQf3q2nN-uUtfe1o0-i5-PYC9iizfy-0wzrokp8ZPsjwLw73OXyCEdL6yFr3uEb8pGYC1RHOHQADviljCbiMBXz7dn_ODjpxpQqyCH0IAfxdN4L-0H5a5HhTMbMpnVUet1SZ4jv33EnJ5hiAGRvpTQBIY9SfPkb6QEK-q5kZ06lCsprBWndsJOg3Q8bnWR_Bd-YSHR1sc4dBtaDowmYtYkMfqOkVQmsnr_F4sh4V_rnuzy8iOO-MdNYs"
            />
          </div>
          <div>
            <h1 className={`font-serif font-black text-sm md:text-base leading-none tracking-wide
              ${isSpace ? 'text-amber-500' : 'text-crimson'}
            `}>
              {t.title}
            </h1>
            <p className={`text-[9px] tracking-[0.2em] font-mono font-bold mt-0.5 opacity-80
              ${isSpace ? 'text-gold-light' : 'text-stone-500'}
            `}>
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden lg:flex gap-6 items-center font-serif text-sm font-medium">
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
                className={`flex items-center gap-1.5 py-1 px-2.5 rounded transition-all cursor-pointer bg-transparent border-none font-serif text-sm font-semibold focus:outline-none
                  ${isActive 
                    ? (isSpace ? 'text-gold font-bold border-b border-gold/40' : 'text-crimson font-bold border-b border-crimson/40')
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-gold-light'
                  }
                `}
              >
                {item.icon && <item.icon className="h-3.5 w-3.5 shrink-0" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          
          {/* LANGUAGE PICKER */}
          <div className="flex items-center gap-1 border border-stone-200 dark:border-gold/25 p-1 rounded bg-white/40 dark:bg-space-dark/40 font-mono text-[10px]">
            <LanguageButton lang="en" cur={language} onClick={onLanguageChange} />
            <LanguageButton lang="ar" cur={language} label="عربي" onClick={onLanguageChange} />
            <LanguageButton lang="ur" cur={language} label="اردو" onClick={onLanguageChange} />
          </div>

          {/* THEME TOGGLE */}
          <button 
            onClick={onToggleTheme} 
            className={`p-2 rounded-full transition-all duration-300 relative group
              ${isSpace ? 'bg-[#2F2113]/30 text-[#EBC15A] border border-gold/15' : 'bg-stone-200/50 text-stone-700 border border-stone-300/30'}
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
            className="hidden sm:flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase py-2 px-4 border rounded-sm transition-all duration-300 shadow-sm cursor-pointer
              bg-crimson text-white hover:bg-black hover:border-black active:translate-y-px border-crimson
              dark:bg-gold dark:text-space dark:hover:bg-white dark:hover:border-white dark:border-gold
            "
          >
            {t.applyNow}
          </button>

          {/* MOBILE MENU TOGGLE */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
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
                setMobileMenuOpen(false);
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
              setMobileMenuOpen(false);
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
