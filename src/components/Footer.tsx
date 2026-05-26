import React from 'react';

interface FooterProps {
  currentTheme: 'parchment' | 'space';
}

export default function Footer({ currentTheme }: FooterProps) {
  const isSpace = currentTheme === 'space';

  return (
    <footer 
      className={`py-16 px-6 md:px-12 select-none border-t transition-colors duration-700
        ${isSpace 
          ? 'bg-black border-gold/15 text-white/55' 
          : 'bg-charcoal border-crimson/10 text-white/70'
        }
      `}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        
        {/* LOGO DESCRIPTION BLOCK */}
        <div className="max-w-sm">
          <div className="flex items-center gap-3 mb-6">
            <img 
              alt="Albab Logo" 
              className="h-12 w-12 object-contain rounded-full border border-gold/30 shadow-md" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6GPkUINYomPqZtlU7xopLCQf3q2nN-uUtfe1o0-i5-PYC9iizfy-0wzrokp8ZPsjwLw73OXyCEdL6yFr3uEb8pGYC1RHOHQADviljCbiMBXz7dn_ODjpxpQqyCH0IAfxdN4L-0H5a5HhTMbMpnVUet1SZ4jv33EnJ5hiAGRvpTQBIY9SfPkb6QEK-q5kZ06lCsprBWndsJOg3Q8bnWR_Bd-YSHR1sc4dBtaDowmYtYkMfqOkVQmsnr_F4sh4V_rnuzy8iOO-MdNYs"
            />
            <div>
              <h5 className="font-serif text-xl font-bold tracking-wide text-white leading-none">Albab Islamic University</h5>
              <span className="text-[9px] tracking-widest font-mono text-gold-light uppercase block mt-1">Virtual Seminary of Understanding</span>
            </div>
          </div>
          <p className="text-stone-400 leading-relaxed text-sm font-sans font-medium">
            A global institution dedicated to the preservation and active contextualization of sacred knowledge. Bridging Usul al-Deen with neuroscience and clinical AI ethics.
          </p>
        </div>

        {/* SITE MAP LINKS */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 font-serif">
          
          {/* UNIVERSITY */}
          <div>
            <h6 className="text-[10px] uppercase font-mono tracking-[0.25em] font-black mb-6 text-gold-light">
              University
            </h6>
            <ul className="space-y-3.5 text-sm text-stone-400 group">
              <li><a href="#scholarly" className="hover:text-white transition-colors duration-200">Our Story</a></li>
              <li><a href="#scholarly" className="hover:text-white transition-colors duration-200">Ethic Mandates</a></li>
              <li><a href="#partners" className="hover:text-white transition-colors duration-200">Partners Syndicate</a></li>
            </ul>
          </div>

          {/* ACADEMICS */}
          <div>
            <h6 className="text-[10px] uppercase font-mono tracking-[0.25em] font-black mb-6 text-gold-light">
              Academics
            </h6>
            <ul className="space-y-3.5 text-sm text-stone-400">
              <li><a href="#curriculum" className="hover:text-white transition-colors duration-200 font-medium">Branches of Study</a></li>
              <li><a href="#hadith-explorer" className="hover:text-white transition-colors duration-200">Hadith Collections</a></li>
              <li><a href="#hero" className="hover:text-white transition-colors duration-200">Celestial Fields</a></li>
            </ul>
          </div>

          {/* LEGAL */}
          <div>
            <h6 className="text-[10px] uppercase font-mono tracking-[0.25em] font-black mb-6 text-gold-light">
              Legal
            </h6>
            <ul className="space-y-3.5 text-sm text-stone-400">
              <li><a href="#" className="hover:text-white transition-colors duration-200">Academic Integrity</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Covenant Terms</a></li>
            </ul>
          </div>

        </div>

      </div>

      {/* FOOTER METADATA COVENANT SUB-BAR */}
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-stone-200/10 flex flex-col sm:flex-row justify-between items-center gap-6 text-[10px] uppercase font-mono tracking-widest text-stone-400/80">
        <p className="text-center sm:text-left font-black">
          © 2024-2026 Albab University. All Rights Reserved. | Designed for Ulul Albab ✓
        </p>
        <div className="flex gap-6 font-bold">
          <span className="hover:text-white cursor-help">Twitter</span>
          <span className="hover:text-white cursor-help">Instagram</span>
          <span className="hover:text-white cursor-help">LinkedIn</span>
        </div>
      </div>
    </footer>
  );
}
