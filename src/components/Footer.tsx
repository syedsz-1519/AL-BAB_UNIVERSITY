import React from 'react';
import { Phone, Instagram, Youtube, Mail } from 'lucide-react';

interface FooterProps {
  currentTheme: 'parchment' | 'space';
}

export default function Footer({ currentTheme }: FooterProps) {
  const isSpace = currentTheme === 'space';

  const rawMessage = `Assalamu'alaikum wa Rahmatullahi wa Barakatuhu Adnan Bhai,

I hope this message finds you in the best of health and faith. 

I am highly interested in pursuing my higher education and would love to enroll as a student at Albab Islamic University. Please guide me regarding the enrollment process and admissions. 

JazakAllah khair!`;

  const encodedMessage = encodeURIComponent(rawMessage);
  const whatsappUrl = `https://wa.me/917051913270?text=${encodedMessage}`;
  const emailUrl = `mailto:adnaanibnfarooq@gmail.com?subject=${encodeURIComponent("Admissions Inquiry - Albab Islamic University")}&body=${encodedMessage}`;

  return (
    <footer 
      className={`py-16 px-6 md:px-12 select-none border-t transition-colors duration-700
        ${isSpace 
          ? 'bg-black border-gold/15 text-white/55' 
          : 'bg-charcoal border-crimson/10 text-white/70'
        }
      `}
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-12">
        
        {/* LOGO DESCRIPTION BLOCK */}
        <div className="max-w-sm">
          <div className="flex items-center gap-3 mb-6">
            <img 
              alt="Albab Logo" 
              className="h-12 w-12 object-contain rounded-full border border-gold/30 shadow-md" 
              src="https://learn.logicwhile.com/home/test/ed6db4a4-1f4c-4eb2-9038-d56d1d82308a"
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-8 font-serif w-full lg:w-auto flex-1 lg:max-w-3xl justify-items-stretch">
          
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
              <li><a href="#curriculum" className="hover:text-white transition-colors duration-200 font-medium font-serif leading-none">Branches of Study</a></li>
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

          {/* CONTACT */}
          <div>
            <h6 className="text-[10px] uppercase font-mono tracking-[0.25em] font-black mb-6 text-gold-light">
              Contact
            </h6>
            <div className="space-y-4 text-xs sm:text-sm text-stone-400 font-sans">
              <div>
                <p className="text-[9px] font-mono tracking-wider text-gold-light/75 uppercase font-bold leading-none mb-1">Founder &amp; Director</p>
                <p className="font-serif font-black text-white text-base leading-none">Adnan al Farooq</p>
              </div>

              <div className="space-y-3">
                <a 
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors group"
                >
                  <Phone className="h-4 w-4 text-[#25D366] group-hover:scale-110 transition-transform shrink-0" />
                  <span className="font-mono text-xs">+91 7051913270</span>
                </a>

                <a 
                  href={emailUrl}
                  className="flex items-center gap-2 hover:text-white transition-colors group"
                >
                  <Mail className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="font-mono text-xs">adnaanibnfarooq@gmail.com</span>
                </a>

                <a 
                  href="https://youtube.com/@adnanalfarooq?si=VEwvOnNjSOoDR0Cm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors group"
                >
                  <Youtube className="h-4 w-4 text-[#FF0000] group-hover:scale-110 transition-transform shrink-0" />
                  <span className="text-xs truncate">YouTube Channel</span>
                </a>

                <a 
                  href="https://www.instagram.com/albabuniversity?igsh=Z295OXpjNGZpaWEy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors group"
                >
                  <Instagram className="h-4 w-4 text-rose-500 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="text-xs truncate">University IG</span>
                </a>

                <a 
                  href="https://www.instagram.com/adnanalfarooq?igsh=MXdrY2s1OWU5Z3d4Ng=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors group"
                >
                  <Instagram className="h-4 w-4 text-amber-500 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="text-xs truncate">Founder IG</span>
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* FOOTER METADATA COVENANT SUB-BAR */}
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-stone-200/10 flex flex-col sm:flex-row justify-between items-center gap-6 text-[10px] uppercase font-mono tracking-widest text-stone-400/80">
        <p className="text-center sm:text-left font-black">
          © 2024-2026 Albab Islamic University. All Rights Reserved. | Designed for Ulul Albab ✓
        </p>
        <div className="flex gap-6 font-bold">
          <a href="https://youtube.com/@adnanalfarooq?si=VEwvOnNjSOoDR0Cm" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">YouTube</a>
          <a href="https://www.instagram.com/albabuniversity?igsh=Z295OXpjNGZpaWEy" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Albab Islamic University IG</a>
          <a href="https://www.instagram.com/adnanalfarooq?igsh=MXdrY2s1OWU5Z3d4Ng==" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Founder IG</a>
        </div>
      </div>
    </footer>
  );
}
