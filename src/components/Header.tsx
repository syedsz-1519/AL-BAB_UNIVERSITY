import React, { useState } from 'react';
import { Sun, Moon, Search, Menu, X, BookOpen, Sparkles, GraduationCap } from 'lucide-react';

interface HeaderProps {
  currentTheme: 'parchment' | 'space';
  onToggleTheme: () => void;
  onSearch: (term: string) => void;
  onOpenAdmission: () => void;
  onOpenPortal: () => void;
  onGoToLanding?: () => void;
}

export default function Header({ currentTheme, onToggleTheme, onSearch, onOpenAdmission, onOpenPortal, onGoToLanding }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const isSpace = currentTheme === 'space';

  return (
    <nav 
      id="navbar" 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-6 md:px-12 backdrop-blur-md border-b
        ${isSpace 
          ? 'bg-space/85 border-gold/15 text-white' 
          : 'bg-[#FAF8F5]/85 border-crimson/10 text-charcoal'
        }
      `}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* LOGO */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer" onClick={() => { if (onGoToLanding) onGoToLanding(); else window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
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
            <h1 className={`font-serif font-bold text-base md:text-lg leading-none tracking-wide
              ${isSpace ? 'text-amber-500' : 'text-crimson'}
            `}>
              ALBAB ISLAMIC
            </h1>
            <p className={`text-[10px] tracking-[0.25em] uppercase opacity-75 font-mono
              ${isSpace ? 'text-gold-light' : 'text-stone-500'}
            `}>
              UNIVERSITY
            </p>
          </div>
        </div>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden md:flex gap-8 items-center font-serif text-base font-medium">
          <a href="#hero" onClick={() => onGoToLanding?.()} className="hover:text-gold transition-colors duration-200">Celestial Globe</a>
          <a href="#scholarly" onClick={() => onGoToLanding?.()} className="hover:text-gold transition-colors duration-200">Mission</a>
          <a href="#curriculum" onClick={() => onGoToLanding?.()} className="hover:text-gold transition-colors duration-200">Curriculum</a>
          <button 
            onClick={onOpenPortal} 
            className="hover:text-gold transition-colors duration-200 cursor-pointer bg-transparent border-0 font-serif text-base font-medium p-0 focus:outline-none"
          >
            Scholastic Portal
          </button>
          <a href="#partners" onClick={() => onGoToLanding?.()} className="hover:text-gold transition-colors duration-205">Partners Team</a>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* SEARCH BAR */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <button 
              type="button"
              onClick={() => setSearchOpen(!searchOpen)} 
              className={`p-2 rounded-full focus:outline-none transition-colors
                ${isSpace ? 'hover:bg-white/10 text-gold-light' : 'hover:bg-crimson/5 text-stone-600'}
              `}
              title="Search curriculum"
            >
              <Search className="h-5 w-5" />
            </button>
            {searchOpen && (
              <input 
                type="text" 
                placeholder="Search branches..." 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  onSearch(e.target.value);
                }}
                className={`absolute right-10 top-1/2 -translate-y-1/2 w-36 md:w-48 px-3 py-1 text-xs rounded border bg-transparent font-sans focus:outline-none transition-all
                  ${isSpace 
                    ? 'border-gold/30 text-white placeholder-white/40 focus:border-gold' 
                    : 'border-crimson/20 text-charcoal placeholder-stone-400 focus:border-crimson'
                  }
                `}
              />
            )}
          </form>

          {/* THEME TOGGLE */}
          <button 
            onClick={onToggleTheme} 
            className={`p-2 rounded-full transition-all duration-300 relative group
              ${isSpace ? 'bg-amber-950/40 text-amber-300 border border-amber-900/50' : 'bg-stone-200/50 text-stone-700 border border-stone-300/30'}
            `}
            title={isSpace ? "Switch to light scholarly mode" : "Switch to dark celestial mode"}
          >
            <div className="relative h-5 w-5 transition-transform duration-500 group-hover:rotate-12">
              {isSpace ? (
                <Sun className="absolute inset-0 h-5 w-5" />
              ) : (
                <Moon className="absolute inset-0 h-5 w-5" />
              )}
            </div>
            <span className="sr-only">Toggle Theme</span>
          </button>

          {/* ENROLL BUTTON */}
          <button 
            onClick={onOpenAdmission}
            className="hidden sm:flex items-center gap-1 text-xs font-bold tracking-widest uppercase py-2 px-5 border rounded-sm transition-all duration-300 shadow-sm
              bg-crimson text-white hover:bg-black hover:border-black active:translate-y-px border-crimson
              dark:bg-gold dark:text-space dark:hover:bg-white dark:hover:border-white dark:border-gold
            "
          >
            <GraduationCap className="h-3.5 w-3.5" />
            Apply Now
          </button>

          {/* MOBILE MENU TOGGLE */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-black/5 rounded-full"
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
          <a href="#hero" onClick={() => { setMobileMenuOpen(false); onGoToLanding?.(); }} className="py-2 border-b border-stone-200/10 hover:text-gold transition-colors text-left">Celestial Globe</a>
          <a href="#scholarly" onClick={() => { setMobileMenuOpen(false); onGoToLanding?.(); }} className="py-2 border-b border-stone-200/10 hover:text-gold transition-colors text-left">Mission & Ethics</a>
          <a href="#curriculum" onClick={() => { setMobileMenuOpen(false); onGoToLanding?.(); }} className="py-2 border-b border-stone-200/10 hover:text-gold transition-colors text-left">Branches of Study</a>
          <button 
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenPortal();
            }} 
            className="py-2 border-b border-stone-200/10 hover:text-gold transition-colors text-left bg-transparent border-0 font-serif text-lg p-0 focus:outline-none w-full"
          >
            Scholastic Portal
          </button>
          <a href="#partners" onClick={() => { setMobileMenuOpen(false); onGoToLanding?.(); }} className="py-2 border-b border-stone-200/10 hover:text-gold transition-colors text-left">Strategic Partners</a>
          <button 
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAdmission();
            }}
            className="mt-4 flex justify-center items-center gap-2 py-3 bg-crimson dark:bg-gold text-white dark:text-space font-bold tracking-widest text-xs uppercase rounded-sm"
          >
            <GraduationCap className="h-4 w-4" />
            Enrollment Application
          </button>
        </div>
      )}
    </nav>
  );
}
