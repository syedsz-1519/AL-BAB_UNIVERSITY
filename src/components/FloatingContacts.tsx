import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';

interface FloatingContactsProps {
  currentTheme: 'parchment' | 'space';
}

export default function FloatingContacts({ currentTheme }: FloatingContactsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showScrollToGlobe, setShowScrollToGlobe] = useState(false);
  const isSpace = currentTheme === 'space';

  useEffect(() => {
    const handleScroll = () => {
      // Show when user scrolls past 600px
      if (window.scrollY > 600) {
        setShowScrollToGlobe(true);
      } else {
        setShowScrollToGlobe(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToGlobe = () => {
    const el = document.getElementById('scholarly');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Customized, highly professional & respectful dual-language-vibe message
  const whatsappNumber = '917051913270';
  const rawMessage = `Assalamu'alaikum wa Rahmatullahi wa Barakatuhu Adnan Bhai,

I hope this message finds you in the best of health and faith. 

I am highly interested in pursuing my higher education and would love to enroll as a student at Albab Islamic University. Please guide me regarding the enrollment process and admissions. 

JazakAllah khair!`;

  const encodedMessage = encodeURIComponent(rawMessage);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
  const emailUrl = `mailto:adnaanibnfarooq@gmail.com?subject=${encodeURIComponent("Admissions Inquiry - Albab Islamic University")}&body=${encodedMessage}`;

  const instagramAccounts = [
    {
      name: 'Albab Islamic University',
      handle: '@albabuniversity',
      url: 'https://www.instagram.com/albabuniversity?igsh=Z295OXpjNGZpaWEy',
      desc: 'Official Academic Portal & Updates'
    },
    {
      name: 'Adnan al Farooq',
      handle: '@adnanalfarooq',
      url: 'https://www.instagram.com/adnanalfarooq?igsh=MXdrY2s1OWU5Z3d4Ng==',
      desc: 'Founder & Spiritual Director'
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end pointer-events-none">
      
      {/* INSTAGRAM OPTIONS FLOATING SUBMENU */}
      {isOpen && (
        <div className="pointer-events-auto animate-fade-in-up flex flex-col gap-2 p-3 rounded-lg shadow-2xl backdrop-blur-xl border w-64 mr-1 transition-all duration-300
          bg-opacity-95 
          ${isSpace 
            ? 'bg-space-dark border-[#C9933A]/40 text-stone-200' 
            : 'bg-[#FCFAF7] border-crimson/25 text-charcoal'
          }
        "
          style={{ animationDuration: '0.2s', animationFillMode: 'both' }}
        >
          <div className="flex justify-between items-center pb-2 border-b border-stone-200 dark:border-stone-800">
            <span className="text-xs font-bold uppercase tracking-widest font-serif text-[#C9933A]">
              Connect via Instagram
            </span>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
              title="Close menu"
            >
              <LucideIcons.X className="h-3.5 w-3.5" />
            </button>
          </div>
          
          <div className="flex flex-col gap-2 mt-1">
            {instagramAccounts.map((acc, index) => (
              <a
                key={index}
                href={acc.url}
                target="_blank"
                referrerPolicy="no-referrer"
                rel="noopener noreferrer"
                className="group flex items-start gap-2.5 p-2 rounded-md hover:bg-stone-100 dark:hover:bg-stone-900 border border-transparent hover:border-gold/20 transition-all"
              >
                <div className="flex items-center justify-center p-1.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shrink-0">
                  <LucideIcons.Instagram className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-serif font-black leading-tight group-hover:text-gold transition-colors">
                    {acc.name}
                  </p>
                  <p className="text-[10px] text-[#C9933A] font-mono leading-none mt-0.5">
                    {acc.handle}
                  </p>
                  <p className="text-[9px] text-stone-500 dark:text-stone-400 mt-0.5 leading-tight line-clamp-1">
                    {acc.desc}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* FLOATING ACTION ICON BUBBLES BLOCK */}
      <div className="pointer-events-auto flex flex-row sm:flex-col gap-3">
        
        {/* CELESTIAL GLOBE REVISIT FLOATING TRIGGER */}
        {showScrollToGlobe && (
          <button
            onClick={scrollToGlobe}
            className={`group flex h-12 w-12 items-center justify-center rounded-full shadow-lg border backdrop-blur-md transition-all duration-500 hover:scale-110 relative animate-fade-in-up
              ${isSpace 
                ? 'bg-space/95 border-gold/50 text-[#E8B86D] hover:border-gold hover:shadow-[0_0_15px_rgba(201,147,58,0.55)]' 
                : 'bg-white/95 border-crimson/35 text-[#8B0000] hover:border-crimson hover:bg-[#FAF8F5] hover:shadow-[0_4px_12px_rgba(139,0,0,0.15)]'
              }
            `}
            title="Revisit Celestial Globe"
          >
            {/* Pulsing ring halo around it */}
            <span className={`absolute -inset-1 rounded-full border opacity-20 group-hover:opacity-40 animate-pulse duration-1000 select-none pointer-events-none
              ${isSpace ? 'border-gold' : 'border-crimson'}
            `} />
            <LucideIcons.Globe className="h-5.5 w-5.5 animate-spin-slow" />
            
            {/* Tooltip */}
            <span className={`absolute right-14 whitespace-nowrap px-2.5 py-1 text-[10px] font-mono leading-none tracking-widest rounded shadow-md border pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0
              ${isSpace 
                ? 'bg-space border-gold/30 text-gold-light' 
                : 'bg-[#FCFAF7] border-stone-100 text-[#8B0000] font-bold shadow-sm'
              }
            `}>
              Celestial Globe
            </span>
          </button>
        )}

        {/* INSTAGRAM HUB TRIGGER BUTTON */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group flex h-12 w-12 items-center justify-center rounded-full shadow-lg border backdrop-blur-md transition-all duration-300 relative
            ${isSpace 
              ? 'bg-space/90 border-[#C9933A]/40 text-stone-200 hover:border-[#E8B86D] hover:shadow-[0_0_15px_rgba(201,147,58,0.4)]' 
              : 'bg-white/95 border-crimson/35 text-stone-800 hover:border-crimson hover:shadow-[0_4px_12px_rgba(139,0,0,0.15)]'
            }
            ${isOpen ? 'scale-105 rotate-45' : 'hover:scale-110'}
          "
          title="Connect on Instagram"
        >
          <div className="absolute inset-0.5 rounded-full bg-gradient-to-tr from-rose-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <LucideIcons.Instagram className="h-5.5 w-5.5 text-rose-500 group-hover:scale-110 transition-transform" />
        </button>

        {/* DIRECT EMAIL ACTION BUBBLE */}
        <a
          href={emailUrl}
          className={`group flex h-12 w-12 items-center justify-center rounded-full shadow-lg border backdrop-blur-md transition-all duration-300 relative
            ${isSpace 
              ? 'bg-space/90 border-[#C9933A]/40 text-stone-200 hover:border-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]' 
              : 'bg-white/95 border-blue-500/35 text-stone-800 hover:border-blue-500 hover:shadow-[0_4px_12px_rgba(59,130,246,0.15)]'
            }
            hover:scale-110
          `}
          title="Direct Email Admission Inquiry"
        >
          <LucideIcons.Mail className="h-5.5 w-5.5 text-blue-500 group-hover:scale-110 transition-transform" />
        </a>

        {/* CUSTOM ENHANCED PULSING WHATSAPP BUBBLE */}
        <a
          href={whatsappUrl}
          target="_blank"
          referrerPolicy="no-referrer"
          rel="noopener noreferrer"
          className="group flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-[0_0_18px_rgba(37,211,102,0.6)] hover:scale-110 transition-all duration-300 relative"
          title="Direct WhatsApp Admission Inquiry"
        >
          {/* Subtle Ringing Ripple Animation */}
          <span className="absolute -inset-1 rounded-full border border-[#25D366] opacity-60 animate-ping duration-1000 select-none pointer-events-none" />
          
          {/* Internal gradient overlays and actual logo representation */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-600/35 to-green-400/10 shadow-[inner_0_2px_4px_rgba(255,255,255,0.2)]" />
          
          {/* Custom SVG Path for precise official WhatsApp Icon */}
          <svg 
            viewBox="0 0 24 24" 
            className="h-6 w-6 fill-current relative z-10 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436.002 9.858-4.42 9.861-9.864.002-2.637-1.023-5.115-2.887-6.98C16.576 1.897 14.1 1.87 11.462 1.87c-5.438 0-9.86 4.418-9.863 9.862-.001 1.762.472 3.483 1.371 4.981l-.997 3.642 3.734-.979zM15.726 13.04c-.317-.159-1.875-.926-2.16-1.03-.285-.105-.493-.159-.7.159-.207.319-.803.103-.984.319-.181.215-.363.24-.68.082-.317-.159-1.341-.494-2.55-1.573-.94-.838-1.575-1.873-1.759-2.19-.184-.318-.02-.489.139-.647.143-.142.317-.37.476-.556.16-.186.213-.318.32-.53.106-.213.053-.398-.027-.557-.08-.16-.7-1.688-.959-2.314-.253-.61-.51-.527-.7-.537-.18-.01-.387-.012-.594-.012s-.54.077-.822.388c-.282.31-.1 .778-.1 1.242 0 1.958 .71 3.847 1.025 4.26 .316 .412 1.83 2.795 4.432 3.918 .62 .267 1.103 .426 1.482 .546 .622 .198 1.19 .17 1.64 .102 .5-.075 1.54-.63 1.756-1.24 .217-.612 .217-1.14 .153-1.24-.064-.1-.233-.16-.54-.319z" />
          </svg>
        </a>
      </div>

    </div>
  );
}
