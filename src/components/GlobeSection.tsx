import React, { useMemo, useState, useEffect, useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { COURSES, HADITHS } from '../data';
import { Course } from '../types';

interface GlobeSectionProps {
  currentTheme: 'parchment' | 'space';
  selectedCourseId: string;
  onSelectCourse: (course: Course) => void;
}

// Generate stars once to prevent re-rendering flicker in space mode
const generateStars = () => {
  const list = [];
  for (let i = 0; i < 180; i++) {
    list.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.8 + 0.6,
      delay: Math.random() * 4,
      duration: Math.random() * 3 + 2,
    });
  }
  return list;
};

export interface RegionalHistory {
  regionName: string;
  title: string;
  coordinates: string;
  era: string;
  summary: string;
  institutions: string[];
  keyFigures: string[];
  achievements: string[];
  narrative: string;
}

export const REGIONAL_HISTORIES: Record<string, RegionalHistory> = {
  'Andalusian Basin': {
    regionName: 'Andalusian Basin',
    title: 'Al-Andalus (Islamic Spain)',
    coordinates: '37.88° N, 4.77° W',
    era: '711 CE – 1492 CE',
    summary: 'A golden bridge of knowledge connecting Islamic intellectual treasures with Western Europe, renowned for its massive caliphate libraries and pluralistic research environment.',
    institutions: ['Great Mosque and Madrasa of Córdoba', 'Royal Library of Al-Hakam II', 'Madrasah of Granada'],
    keyFigures: ['Ibn Rushd (Averroes)', 'Ibn Arabi', 'Al-Zahrawi (Abulcasis, pioneer of modern surgery)'],
    achievements: [
      'Pioneered surgical instrumentation and medical encyclopedias.',
      'Advanced philosophical translation projects that triggered the European Renaissance.',
      'Developed sophisticated agricultural water management and botanical taxonomy.'
    ],
    narrative: 'In Córdoba, the caliphate library housed over 400,000 cataloged manuscripts. Muslim, Jewish, and Christian scholars translated classical Greek works into Arabic and Latin, working side-by-side. Al-Zahrawi wrote the definitive 30-volume surgical manual Al-Tasrif, introducing over 200 surgical tools still recognizable today.'
  },
  'Maghreb Region': {
    regionName: 'Maghreb Region',
    title: 'The Maghreb (North Africa)',
    coordinates: '34.03° N, 5.00° W',
    era: '800 CE – Present',
    summary: 'Home to the world\'s oldest continuously operating university, serving as a bastion of Maliki jurisprudence, grammar, and early social sciences.',
    institutions: ['University of al-Qarawiyyin (Fez)', 'Mosque-Madrasa of al-Andalusiyyin (Fez)', 'Zaytuna University (Tunis)'],
    keyFigures: ['Fatima al-Fihri (founder of Al-Qarawiyyin)', 'Ibn Khaldun (father of sociology)', 'Ibn al-Yasamin (mathematician)'],
    achievements: [
      'Established the world\'s first degree-granting higher education system.',
      'Formulated the foundational principles of sociology and historiography (Muqaddimah).',
      'Advanced algebraic poetry and fractional arithmetic notation.'
    ],
    narrative: 'Fatima al-Fihri, an educated and wealthy Muslim woman, dedicated her entire inheritance to establish the Al-Qarawiyyin Mosque and University in Fez in 859 CE. It became a powerhouse of scholarship, drawing figures like Pope Sylvester II to study Arabic numerals. Centuries later, Ibn Khaldun wrote his revolutionary Muqaddimah here, charting the rise and fall of civilizations.'
  },
  'Anatolia Sector': {
    regionName: 'Anatolia Sector',
    title: 'Anatolia & Asia Minor',
    coordinates: '39.93° N, 32.85° E',
    era: '1071 CE – 1922 CE',
    summary: 'The administrative and spiritual heart of the later Islamic world, where sophisticated Ottoman madrasa complexes unified theological sciences, medicine, astronomy, and architectural engineering.',
    institutions: ['Süleymaniye Madrasa Complex (Istanbul)', 'Gök Medrese (Sivas)', 'Cacabey Medrese & Astronomy School (Kırşehir)'],
    keyFigures: ['Ali Qushji (astronomer & mathematician)', 'Mimar Sinan (master architect)', 'Jalal al-Din Rumi (mystic & jurist)'],
    achievements: [
      'Built massive multi-disciplinary complex universities (Külliyes).',
      'Calculated earth\'s axial tilt with remarkable precision and advanced lunar orbit formulas.',
      'Pioneered seismic-resistant, acoustically perfect sacred architecture.'
    ],
    narrative: 'After the conquest of Constantinople, Ali Qushji, a student of Ulugh Beg, was invited by Sultan Mehmed II to head the Sahn-i Seman Madrasa. His work on mathematical astronomy liberated astronomy from Aristotelian physics, treating celestial paths purely through mathematical coordinates. Cacabey Madrasa featured a unique central well with a viewing dome above to study constellations reflected on the water.'
  },
  'Nile Delta Corridor': {
    regionName: 'Nile Delta Corridor',
    title: 'Nile Delta & Egypt',
    coordinates: '30.04° N, 31.23° E',
    era: '641 CE – Present',
    summary: 'An unparalleled scholastic hub where experimental science, optics, astronomy, and systemic Sunni legal systems were institutionalized for over a millennium.',
    institutions: ['Al-Azhar University (Cairo)', 'Dar al-Hikma (Fatimid Cairo)', 'Qalawun Complex (Hospital & Madrasa)'],
    keyFigures: ['Ibn al-Haytham (Alhazen, father of optics)', 'Ibn Nafis (discovered pulmonary circulation)', 'Maimonides (philosopher & royal physician)'],
    achievements: [
      'Established the experimental scientific method (optics/physics).',
      'Pioneered advanced quarantine protocols and specialized medical wards (Qalawun Hospital).',
      'Discovered the pulmonary transit of blood, correcting centuries-old Galenic errors.'
    ],
    narrative: 'Arriving in Cairo during the Fatimid era, Ibn al-Haytham revolutionized science by declaring that hypotheses must be rigorously tested using empirical, repeatable evidence. Confined to his home, he utilized the camera obscura (Al-Bayt al-Muthlim) to prove that light travels in straight lines and enters the eye, birthing modern optics. Al-Azhar, founded in 970 CE, became the premier global seat of Islamic jurisprudence.'
  },
  'Mesopotamia Valley': {
    regionName: 'Mesopotamia Valley',
    title: 'Mesopotamia & Iraq',
    coordinates: '33.31° N, 44.36° E',
    era: '750 CE – 1258 CE',
    summary: 'The epicenter of the Abbasid Golden Age, where translation bureaus, public observatories, and libraries birthed algebra, modern chemistry, and systematic paper manufacturing.',
    institutions: ['Bayt al-Hikma (House of Wisdom, Baghdad)', 'Mustansiriya Madrasa (Baghdad)', 'Nizamiyah Madrasa'],
    keyFigures: ['Al-Khwarizmi (father of algebra)', 'Jabir ibn Hayyan (father of chemistry)', 'Al-Kindi (philosopher of the Arabs)'],
    achievements: [
      'Synthesized Indian and Greek mathematics into Algebra (Al-Jabr).',
      'Developed crystallization, distillation, filtration, and calcination chemical techniques.',
      'Created standard coordinate maps of the known world.'
    ],
    narrative: 'Under Caliph Al-Ma\'mun, the House of Wisdom was filled with scholars who received the weight of translated books in gold. Here, Al-Khwarizmi wrote "Al-Kitab al-mukhtasar fi hisab al-jabr wal-muqabala", from which we derive the word "algebra" and "algorithm". Mustansiriya Madrasa, built in 1227 CE, offered free tuition, medical care, and a grand water-powered astronomical clock.'
  },
  'Hijaz Sanctum': {
    regionName: 'Hijaz Sanctum',
    title: 'The Holy Hijaz (Mecca & Medina)',
    coordinates: '24.46° N, 39.61° E',
    era: '622 CE – Present',
    summary: 'The sacred genesis of Islamic intellectual tradition. It established the science of Hadith verification (isnad transmission), legal methodologies (Usul al-Fiqh), and sacred geography.',
    institutions: ['Al-Masjid an-Nabawi (Medina)', 'Al-Masjid al-Haram (Mecca)', 'Early Halaqat (Scholar Circles)'],
    keyFigures: ['Imam Malik ibn Anas (author of Al-Muwatta)', 'Imam Al-Shafi\'i', 'Aisha bint Abi Bakr (pioneering female jurist & narrator)'],
    achievements: [
      'Established the earliest codified book of Islamic law (Al-Muwatta).',
      'Formulated systematic legal theory and structural linguistics (Risala).',
      'Pioneered biographical evaluation sciences (ilm al-rijal) for reliable historical transmission.'
    ],
    narrative: 'In the Prophet\'s Mosque in Medina, early study circles (halaqat) laid the groundwork for all Islamic fields. Imam Malik lectured at Medina for fifty years, compiling Al-Muwatta. Scholars from Al-Andalus to Central Asia traveled for months on end as "seekers of knowledge" (Rihla fi Talab al-Ilm) to sit under these circles and obtain official teaching licenses (ijazah).'
  },
  'Transoxiana Heights': {
    regionName: 'Transoxiana Heights',
    title: 'Transoxiana & Central Asia',
    coordinates: '39.77° N, 64.42° E',
    era: '800 CE – 1600 CE',
    summary: 'The celestial crown of Islamic astronomy, medicine, and critical text-validation, where massive stone observatories mapped the stars and pristine encyclopedias systematized medical practices.',
    institutions: ['Ulugh Beg Observatory & Madrasa (Samarkand)', 'Kalyan Madrasa (Bukhara)', 'Registan Academy'],
    keyFigures: ['Imam al-Bukhari (master of Hadith criticism)', 'Ibn Sina (Avicenna, prince of physicians)', 'Al-Biruni (pioneer of geodesy)'],
    achievements: [
      'Published "The Canon of Medicine", the standard medical text in East and West for 600 years.',
      'Measured the Earth\'s radius using trigonometry from a single mountain peak.',
      'Compiled the most authentic compendium of prophetic narrations with ultra-stringent textual criticism.'
    ],
    narrative: 'In Samarkand, the royal astronomer-ruler Ulugh Beg constructed an enormous three-story sextant built directly into a limestone trench. His astronomical tables cataloged 1,018 stars with unprecedented coordinate accuracy. Meanwhile, Bukhara birthed Ibn Sina, who systematized clinical medicine, identifying the contagious nature of tuberculosis and introducing clinical drug trials.'
  },
  'Sindh Oasis': {
    regionName: 'Sindh Oasis',
    title: 'Sindh & The Indus Valley',
    coordinates: '25.39° N, 68.35° E',
    era: '711 CE – 1700 CE',
    summary: 'A vital synthesis point between Islamic and Indian mathematics, astronomy, and linguistic scholarship. It facilitated the translation of astronomical tables (Siddhanta) into Arabic.',
    institutions: ['Madrasas of Mansura & Debal', 'Scholarly Circles of Thatta', 'Grand Madrasa of Multan'],
    keyFigures: ['Al-Fazari (astronomer who translated Sanskrit tables)', 'Abu Mashar al-Sindhi (historian & scholar)', 'Qazi Abu Hanifa al-Sindhi'],
    achievements: [
      'Translated the Indian astronomical treaties Brahmasphutasiddhanta into Arabic ("Sindhind").',
      'Introduced zero and decimal notation into the Arabic mathematical corpus.',
      'Established early inter-religious theological forums and multi-language dictionary desks.'
    ],
    narrative: 'The Indus Valley served as a flourishing intellectual exchange gateway. Under translation initiatives, Sanskrit astronomical texts were brought to Baghdad via Sindh. Al-Fazari translated these texts into the "Zij al-Sindhind," which introduced the concept of zero and Indian numerals to the Muslim world. Thatta later became an eminent global university city hosting over 400 institutions of higher learning.'
  }
};

export default function GlobeSection({ currentTheme, selectedCourseId, onSelectCourse }: GlobeSectionProps) {
  const starsList = useMemo(() => generateStars(), []);
  const isSpace = currentTheme === 'space';

  const [zoomScale, setZoomScale] = useState(1);
  const globeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = globeContainerRef.current;
    if (!container) return;

    const handleWheelNative = (e: WheelEvent) => {
      const zoomIntensity = 0.08;
      const delta = -e.deltaY * zoomIntensity * 0.012;
      
      setZoomScale((prev) => {
        const next = prev + delta;
        const clamped = Math.min(Math.max(next, 1), 2.5);
        if (clamped !== prev) {
          e.preventDefault();
        }
        return clamped;
      });
    };

    let touchStartDist = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchStartDist > 0) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = dist / touchStartDist;
        setZoomScale((prev) => {
          const next = prev * (1 + (factor - 1) * 0.15);
          const clamped = Math.min(Math.max(next, 1), 2.5);
          return clamped;
        });
        touchStartDist = dist;
      }
    };

    const handleTouchEnd = () => {
      touchStartDist = 0;
    };

    container.addEventListener('wheel', handleWheelNative, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      container.removeEventListener('wheel', handleWheelNative);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Compute a slow, subtle parallax offset.
  const parallaxOffset = scrollY * 0.08;

  // Continuous rotation angle state to calculate shifting radial-gradient light sources
  const [rotationAngle, setRotationAngle] = useState(0);

  useEffect(() => {
    let frameId: number;
    const startTime = Date.now();
    const update = () => {
      // 18 seconds for full rotation (matching the planet's rotation animation)
      const elapsed = (Date.now() - startTime) / 1000;
      const angle = (elapsed * (360 / 18)) % 360;
      setRotationAngle(angle);
      frameId = requestAnimationFrame(update);
    };
    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Subtle orbit calculations for shifting light source coordinates (mimic moving sun)
  const rad = (rotationAngle * Math.PI) / 180;
  // Shift center points from nominal 30% or 180x, 160y
  const bgLightX = 30 + Math.cos(rad) * 4;
  const bgLightY = 30 + Math.sin(rad) * 4;
  const svgLightX = 200 + Math.cos(rad) * 16;
  const svgLightY = 180 + Math.sin(rad) * 16;

  // Interactive Hadith overlay state
  const [showHadithModal, setShowHadithModal] = useState(false);
  const [hadithIndex, setHadithIndex] = useState(0);

  const activeHadith = HADITHS[hadithIndex];

  // Filter courses for Celestial Globe Section: QUR'AN, HADITH, FIQH, ISLAMIC STUDIES, LOGIC, DUNIYA VI ILM
  const globeCourses = useMemo(() => {
    const ids = ['quran', 'hadith', 'fiqh', 'islamic-studies', 'logic', 'duniyavi-ilm'];
    return ids.map(id => COURSES.find(c => c.id === id)).filter(Boolean) as Course[];
  }, []);

  // Interactive Regional Academic History modal state
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [selectedRegionHistory, setSelectedRegionHistory] = useState<RegionalHistory | null>(null);

  const openRegionDetail = (regionName: string) => {
    const data = REGIONAL_HISTORIES[regionName];
    if (data) {
      setSelectedRegionHistory(data);
      setShowRegionModal(true);
    }
  };

  // Hover tracking for showing coordinate pin & tooltip
  const [hoverPin, setHoverPin] = useState<{
    x: number;
    y: number;
    lat: string;
    lon: string;
    regionName: string;
  } | null>(null);

  const handleGlobeMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Radius calculation inside the circular bounding box of the globe
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    
    // Check if the pointer is within the actual spherical visual bounds of the globe
    if (dist <= rect.width / 2) {
      const pctX = (x / rect.width) * 100;
      const pctY = (y / rect.height) * 100;

      // Map percentages to mock coordinates (Lat: -90 to 90, Lon: -180 to 180)
      const lonVal = Math.round((pctX - 50) * 3.6);
      const latVal = Math.round((50 - pctY) * 1.8);
      
      const lonStr = `${Math.abs(lonVal)}° ${lonVal >= 0 ? 'E' : 'W'}`;
      const latStr = `${Math.abs(latVal)}° ${latVal >= 0 ? 'N' : 'S'}`;

      // Geocultural historical zones
      let regionName = 'Horizon Sector';
      if (pctX < 35 && pctY < 50) {
        regionName = 'Andalusian Basin';
      } else if (pctX < 35 && pctY >= 50) {
        regionName = 'Maghreb Region';
      } else if (pctX >= 35 && pctX < 48 && pctY < 45) {
        regionName = 'Anatolia Sector';
      } else if (pctX >= 35 && pctX < 48 && pctY >= 45) {
        regionName = 'Nile Delta Corridor';
      } else if (pctX >= 48 && pctX < 62 && pctY < 50) {
        regionName = 'Mesopotamia Valley';
      } else if (pctX >= 48 && pctX < 62 && pctY >= 50) {
        regionName = 'Hijaz Sanctum';
      } else if (pctX >= 62 && pctY < 50) {
        regionName = 'Transoxiana Heights';
      } else if (pctX >= 62 && pctY >= 50) {
        regionName = 'Sindh Oasis';
      }

      setHoverPin({ x, y, lat: latStr, lon: lonStr, regionName });
    } else {
      setHoverPin(null);
    }
  };

  const handleGlobeMouseLeave = () => {
    setHoverPin(null);
  };

  const handleNextHadith = () => {
    setHadithIndex((prev) => (prev + 1) % HADITHS.length);
  };

  const triggerHadithPopup = () => {
    // Select a random Hadith to show first or recycle
    setHadithIndex(Math.floor(Math.random() * HADITHS.length));
    setShowHadithModal(true);
  };

  // Helper to map string to Lucid Icon
  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className="h-5 w-5" />;
    }
    return <LucideIcons.BookOpen className="h-5 w-5" />;
  };

  // Symmetrically position elements in an ellipse around the central globe
  const computeCardPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const rx = 41; // horizontal radius in %
    const ry = 43; // vertical radius in %
    const left = 50 + Math.cos(angle) * rx;
    const top = 50 + Math.sin(angle) * ry;
    return {
      left: `${left.toFixed(2)}%`,
      top: `${top.toFixed(2)}%`
    };
  };

  return (
    <section 
      id="scholarly"
      className={`relative py-20 flex flex-col justify-center items-center overflow-hidden transition-all duration-700 select-none border-b
        ${isSpace 
          ? 'text-white border-gold/15' 
          : 'bg-gradient-to-b from-[#FAF8F5] via-[#FCFAF7] to-[#FAF8F5] text-charcoal border-stone-200'
        }
      `}
      style={{
        background: isSpace ? 'radial-gradient(ellipse at center, #060D1F 0%, #020509 80%, #000000 100%)' : undefined
      }}
    >
      {/* 180+ Twinkling Stars (visible in both themes but glows more in space mode) */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${isSpace ? 'opacity-100' : 'opacity-25'}`}>
        {starsList.map((star) => (
          <div 
            key={star.id}
            className="absolute rounded-full bg-white animate-twinkle shadow-sm"
            style={{
              top: `${star.y}%`,
              left: `${star.x}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Milky Way Band Overlay */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 mix-blend-screen
          ${isSpace ? 'opacity-80' : 'opacity-10'}
        `}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0) 20%, rgba(201,147,58,0.04) 45%, rgba(139,0,0,0.03) 55%, rgba(255,255,255,0) 80%)'
        }}
      />

      {/* Nebula Glow Patches */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[160px] opacity-15 mix-blend-screen"
          style={{ background: 'radial-gradient(circle, rgba(201,147,58,0.25) 0%, rgba(0,0,0,0) 70%)' }}
        />
        <div 
          className="absolute -top-10 left-10 w-[450px] h-[450px] rounded-full blur-[140px] opacity-20 mix-blend-screen"
          style={{ background: 'radial-gradient(circle, rgba(139,0,0,0.2) 0%, rgba(0,0,0,0) 70%)' }}
        />
      </div>

      {/* Section Header Text detailing Globe function */}
      <div className="relative z-10 w-full max-w-2xl text-center px-6 mb-8">
        <h2 className="font-serif font-black text-2xl sm:text-3xl tracking-tight mb-2">
          Cosmos of Learning
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
          Hover over fields to preview scholastic branches. Click <strong className="text-gold font-medium dark:text-gold-light pointer-events-auto cursor-pointer underline" onClick={triggerHadithPopup}>Hadith</strong> or the <strong className="font-medium">Globe Center</strong> to query authentic prophetic wisdom.
          <span className="block mt-1.5 text-[10px] sm:text-xs tracking-wider opacity-75 font-mono">
            💡 Scroll wheel over globe or click buttons to zoom and inspect centers
          </span>
        </p>
      </div>

      {/* CENTRALIZED EARTH GLOBE ORBIT DISPLAY */}
      <div className="relative w-full max-w-5xl h-[320px] xs:h-[380px] sm:h-[480px] md:h-[650px] flex justify-center items-center select-none">
        
        {/* Concentric Orbit Rings (Now beautifully responsive across all screen sizes!) */}
        <div className="absolute inset-0 pointer-events-none">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={selectedCourseId}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.15 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 pointer-events-none"
            >
              {/* Ring 1 - Inner */}
              <div className="absolute top-1/2 left-1/2 w-[190px] h-[190px] xs:w-[240px] xs:h-[240px] sm:w-[330px] sm:h-[330px] md:w-[420px] md:h-[420px] rounded-full border border-gold/15 animate-wobble-orbit-1" style={{ transformStyle: 'preserve-3d' }}>
                <div className="absolute top-0 left-1/2 -ml-1 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gold/80 animate-pulse duration-700" />
              </div>
              
              {/* Ring 2 with Crescent Moon traveling */}
              <div className="absolute top-1/2 left-1/2 w-[240px] h-[240px] xs:w-[300px] xs:h-[300px] sm:w-[420px] sm:h-[420px] md:w-[540px] md:h-[540px] rounded-full border border-gold/25 animate-wobble-orbit-2" style={{ animationDirection: 'reverse', transformStyle: 'preserve-3d' }}>
                <div className="absolute -top-1.5 left-1/2 -ml-2 text-gold font-sans text-[10px] sm:text-xs select-none">🌙</div>
              </div>

              {/* Ring 3 */}
              <div className="absolute top-1/2 left-1/2 w-[280px] h-[280px] xs:w-[360px] xs:h-[360px] sm:w-[500px] sm:h-[500px] md:w-[660px] md:h-[660px] rounded-full border border-crimson/10 animate-wobble-orbit-3" style={{ transformStyle: 'preserve-3d' }} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Parallax Container for the Globe */}
        <div 
          onMouseMove={handleGlobeMouseMove}
          onMouseLeave={handleGlobeMouseLeave}
          className="relative w-44 h-44 xs:w-52 xs:h-52 sm:w-68 sm:h-68 md:w-80 md:h-80 z-20"
          style={{
            transform: `translateY(${parallaxOffset}px)`,
            willChange: 'transform'
          }}
        >
          {/* Central HTML 3D Globe with Click Handler for Hadith and Regional History */}
          <div 
            ref={globeContainerRef}
            onClick={(e) => {
              if (hoverPin && REGIONAL_HISTORIES[hoverPin.regionName]) {
                e.stopPropagation();
                openRegionDetail(hoverPin.regionName);
              } else {
                triggerHadithPopup();
              }
            }}
            className="relative w-full h-full rounded-full flex justify-center items-center overflow-hidden border border-gold/40 cursor-pointer shadow-2xl transition-all duration-500 hover:scale-[1.03] active:scale-95 group/globe"
            style={{
              background: `radial-gradient(circle at ${bgLightX}% ${bgLightY}%, ${
                isSpace 
                  ? '#2D6A4F 0%, #1A6B9A 40%, #060D1F 100%' 
                  : '#1B6CA8 0%, #0D4F8C 45%, #083A6B 80%, #041F3D 100%'
              })`,
              boxShadow: isSpace 
                ? 'inset -20px -20px 50px rgba(0,0,0,0.8), 0 0 60px 15px rgba(232,184,109,0.15)' 
                : 'inset -25px -25px 50px rgba(0,0,0,0.85), 0 10px 40px -10px rgba(0,0,0,0.15)',
              willChange: 'background'
            }}
            title="Click coordinates for academic history or center for Prophetic Wisdom"
          >
            {/* HYPER-REALISTIC SVG EARTH ILLUSTRATION */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none select-none" 
              viewBox="0 0 500 500"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                transform: `scale(${zoomScale})`,
                transformOrigin: '250px 250px',
                transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                willChange: 'transform'
              }}
            >
              <defs>
                {/* LAYER 1 — Deep Space Glow Gradient */}
                <radialGradient id="spaceGlow" cx="250" cy="250" r="240" fx="250" fy="250" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1e50a0" stopOpacity="0"/>
                  <stop offset="50%" stopColor="#143c8c" stopOpacity="0.15"/>
                  <stop offset="100%" stopColor="#000a1e" stopOpacity="0"/>
                </radialGradient>

                {/* LAYER 2 — Atmosphere Gradient */}
                <radialGradient id="atmosphereGlow" cx="250" cy="250" r="195" fx="250" fy="250" gradientUnits="userSpaceOnUse">
                  <stop offset="85%" stopColor="#64b4ff" stopOpacity="0"/>
                  <stop offset="100%" stopColor="#64b4ff" stopOpacity="0.35"/>
                </radialGradient>

                {/* LAYER 3 — Ocean Gradient with dynamic shifting light source */}
                <radialGradient id="oceanGrad" cx={svgLightX} cy={svgLightY} r="230" fx={svgLightX} fy={svgLightY} gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1B6CA8" />
                  <stop offset="30%" stopColor="#0D4F8C" />
                  <stop offset="70%" stopColor="#083A6B" />
                  <stop offset="100%" stopColor="#041F3D" />
                </radialGradient>

                {/* LAYER 4 — Continent Gradient */}
                <linearGradient id="continentGrad" x1="160" y1="140" x2="340" y2="340" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#2D6A4F" />
                  <stop offset="100%" stopColor="#1A4A30" />
                </linearGradient>

                {/* LAYER 8 — Terminator Shade Gradient */}
                <linearGradient id="terminatorGrad" x1="0" y1="250" x2="500" y2="250" gradientUnits="userSpaceOnUse">
                  <stop offset="25%" stopColor="#000514" stopOpacity="0" />
                  <stop offset="50%" stopColor="#000514" stopOpacity="0.15" />
                  <stop offset="75%" stopColor="#00020a" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="#000005" stopOpacity="0.94" />
                </linearGradient>

                {/* Globe Clipping Path */}
                <clipPath id="globeClip">
                  <circle cx="250" cy="250" r="180" />
                </clipPath>

                {/* Filters for photorealistic softening */}
                <filter id="globeShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blurTarget" />
                  <feMerge>
                    <feMergeNode in="blurTarget" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <filter id="atmosphereBlur" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
                </filter>

                <filter id="oceanDetailBlur" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
                </filter>

                <filter id="cloudBlur" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
                </filter>

                <filter id="specularBlur" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="12" />
                </filter>

                <filter id="brightSpotBlur" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
                </filter>

                <filter id="iceBlur" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
                </filter>

                <filter id="markerGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* LAYER 1 — Deep Space Glow behind globe (only visible in Space mode) */}
              {isSpace && <circle cx="250" cy="250" r="240" fill="url(#spaceGlow)" />}

              {/* LAYER 2 — Soft Blue Atmospheric Rings (Only visible in Space mode, completely removed in light mode to prevent clashing blue circles) */}
              {isSpace && (
                <>
                  <circle cx="250" cy="250" r="200" fill="rgba(80,160,255,0.08)" filter="url(#atmosphereBlur)" />
                  <circle cx="250" cy="250" r="195" fill="url(#atmosphereGlow)" />
                </>
              )}

              {/* Main Globe Area (Clipped Group) */}
              <g clipPath="url(#globeClip)">
                {/* LAYER 3 — Ocean Base */}
                <circle cx="250" cy="250" r="180" fill="url(#oceanGrad)" />

                {/* LAYER 5 — Ocean Surface Details (Light reflection ellipses) */}
                <g filter="url(#oceanDetailBlur)">
                  <ellipse cx="180" cy="220" rx="40" ry="25" fill="rgba(255,255,255,0.06)" />
                  <ellipse cx="320" cy="180" rx="60" ry="30" fill="rgba(255,255,255,0.04)" />
                  <ellipse cx="220" cy="300" rx="35" ry="15" fill="rgba(255,255,255,0.05)" />
                  <ellipse cx="280" cy="270" rx="55" ry="22" fill="rgba(255,255,255,0.04)" />
                </g>

                {/* HORIZONTALLY SPINNING SEAMLESS WORLD MAP LAYER (REVOLVING EFFECT WITH ACTUAL CONTINENT SHAPES) */}
                <g>
                  <g id="continentsGroup">
                    <g fill="url(#continentGrad)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" filter="url(#globeShadow)">
                      {/* Africa */}
                      <path d="M 255,195 Q 270,185 285,190 Q 305,200 308,230 Q 312,265 295,295 Q 278,325 260,330 Q 242,330 232,310 Q 218,285 220,255 Q 222,225 235,208 Z" />
                      
                      {/* Europe */}
                      <path d="M 248,155 Q 262,148 275,152 Q 288,158 290,170 Q 288,182 275,186 Q 262,188 252,182 Q 242,172 248,155 Z" />
                      
                      {/* Asia (partial) */}
                      <path d="M 290,145 Q 320,135 355,140 Q 380,148 385,168 Q 382,190 360,198 Q 335,202 312,192 Q 292,180 288,162 Z" />
                      
                      {/* South America */}
                      <path d="M 210,240 Q 222,232 232,238 Q 242,250 238,275 Q 232,300 220,312 Q 208,318 198,308 Q 188,292 190,268 Q 192,248 210,240 Z" />
                      
                      {/* North America */}
                      <path d="M 168,168 Q 185,155 205,160 Q 218,168 215,188 Q 210,208 195,215 Q 178,218 165,205 Q 155,190 168,168 Z" />
                      
                      {/* Australia/Oceania */}
                      <path d="M 370,290 Q 385,285 390,295 Q 385,310 375,308 Q 365,300 370,290 Z" />
                    </g>
                  </g>
                  
                  {/* Duplicates for 360px offset looping translation */}
                  <use href="#continentsGroup" x="360" />
                  <use href="#continentsGroup" x="-360" />
                  
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    from="0 0"
                    to="-360 0"
                    dur="24s"
                    repeatCount="indefinite"
                  />
                </g>

                {/* LAYER 6 — Latitude and Longitude Graticule grid overlay over rotating surface */}
                <g stroke="rgba(255,255,255,0.07)" strokeWidth="0.6" fill="none">
                  <ellipse cx="250" cy="250" rx="178" ry="30" />
                  <ellipse cx="250" cy="250" rx="168" ry="60" />
                  <ellipse cx="250" cy="250" rx="146" ry="90" />
                  <ellipse cx="250" cy="250" rx="112" ry="120" />
                  <ellipse cx="250" cy="250" rx="70" ry="150" />
                  
                  <ellipse cx="250" cy="250" rx="30" ry="178" />
                  <ellipse cx="250" cy="250" rx="60" ry="178" />
                  <ellipse cx="250" cy="250" rx="90" ry="178" />
                  <ellipse cx="250" cy="120" rx="120" ry="178" />
                  <ellipse cx="250" cy="150" rx="150" ry="178" />
                </g>

                {/* LAYER 7 — Cloud Layer (Rotating slightly faster at 14s) */}
                <g style={{ transformOrigin: '250px 250px', willChange: 'transform' }}>
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 250 250"
                    to="360 250 250"
                    dur="14s"
                    repeatCount="indefinite"
                  />
                  
                  <g filter="url(#cloudBlur)" fill="rgba(255,255,255,0.22)">
                    <ellipse cx="210" cy="180" rx="45" ry="15" />
                    <ellipse cx="310" cy="220" rx="55" ry="18" />
                    <ellipse cx="160" cy="280" rx="35" ry="12" />
                    <ellipse cx="280" cy="310" rx="50" ry="20" />
                    <ellipse cx="230" cy="130" rx="40" ry="14" />
                    <ellipse cx="340" cy="150" rx="30" ry="10" />
                    <ellipse cx="140" cy="200" rx="42" ry="16" />
                    <ellipse cx="200" cy="350" rx="38" ry="14" />
                    <ellipse cx="290" cy="110" rx="25" ry="10" />
                  </g>
                </g>

                {/* LAYER 10 — Polar Ice Caps */}
                <ellipse cx="250" cy="72" rx="38" ry="14" fill="rgba(220,235,255,0.85)" filter="url(#iceBlur)" />
                <ellipse cx="250" cy="428" rx="42" ry="16" fill="rgba(220,235,255,0.80)" filter="url(#iceBlur)" />

                {/* LAYER 8 — Terminator Line (Day/Night Shadow) */}
                <ellipse cx="310" cy="250" rx="180" ry="180" fill="url(#terminatorGrad)" />
              </g>

              {/* LAYER 9 — Specular Highlight (Sunlight Reflection) that shifts with moving light source */}
              <ellipse 
                cx={155 + Math.cos(rad) * 12} 
                cy={145 + Math.sin(rad) * 12} 
                rx="55" 
                ry="38" 
                fill="rgba(255,255,255,0.09)" 
                transform={`rotate(-30 ${155 + Math.cos(rad) * 12} ${145 + Math.sin(rad) * 12})`} 
                filter="url(#specularBlur)" 
              />
              <ellipse 
                cx={148 + Math.cos(rad) * 12} 
                cy={140 + Math.sin(rad) * 12} 
                rx="18" 
                ry="12" 
                fill="rgba(255,255,255,0.16)" 
                filter="url(#brightSpotBlur)" 
              />

              {/* UNCLIPPED HORIZONTALLY SLIDING MARKERS (ROTATING DYNAMICALLY WITH THE VECTOR MAP) */}
              <g>
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  from="0 0"
                  to="-360 0"
                  dur="24s"
                  repeatCount="indefinite"
                />

                <g id="markersGroup">
                  {/* Baghdad */}
                  <g id="marker-baghdad" className="pointer-events-auto group/marker cursor-pointer" onClick={(e) => { e.stopPropagation(); openRegionDetail('Mesopotamia Valley'); }}>
                    <circle cx="285" cy="182" r="10" fill="rgba(232,184,109,0.0)" className="group-hover/marker:fill-gold/20 transition-all duration-300" />
                    <circle cx="285" cy="182" r="6" fill="none" stroke="#E8B86D" strokeWidth="1" filter="url(#markerGlow)">
                      <animate attributeName="r" values="3;9;3" dur="2.4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.9;0.1;0.9" dur="2.4s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="285" cy="182" r="2.5" fill="#E8B86D" className="group-hover/marker:fill-white transition-all duration-300" />
                    
                    {/* Subtle micro label always visible next to dot when not hovered */}
                    <text x="295" y="185" fill="#E8B86D" fontSize="6.5" fontFamily="Georgia, serif" fontWeight="bold" opacity="0.65" className="group-hover/marker:opacity-0 transition-opacity duration-200 pointer-events-none tracking-wide text-shadow">Baghdad</text>

                    <g className="opacity-0 group-hover/marker:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <rect x="296" y="152" width="180" height="52" rx="4" fill="rgba(6, 11, 20, 0.98)" stroke="#C9933A" strokeWidth="1.2" />
                      <text x="304" y="166" fill="#E8B86D" fontSize="8.5" fontFamily="Georgia, serif" fontWeight="black">Baghdad</text>
                      <text x="304" y="179" fill="rgba(255,255,255,0.95)" fontSize="7" fontFamily="sans-serif" fontWeight="bold">House of Wisdom (Bayt al-Hikma)</text>
                      <text x="304" y="191" fill="rgba(255,255,255,0.6)" fontSize="6" fontFamily="sans-serif">Preserved Greek lore, birthed algebra &amp; astronomy.</text>
                    </g>
                    <title>Baghdad: House of Wisdom (Bayt al-Hikma)</title>
                  </g>

                  {/* Cairo */}
                  <g id="marker-cairo" className="pointer-events-auto group/marker cursor-pointer" onClick={(e) => { e.stopPropagation(); openRegionDetail('Nile Delta Corridor'); }}>
                    <circle cx="268" cy="198" r="10" fill="rgba(232,184,109,0.0)" className="group-hover/marker:fill-gold/20 transition-all duration-300" />
                    <circle cx="268" cy="198" r="6" fill="none" stroke="#E8B86D" strokeWidth="1" filter="url(#markerGlow)">
                      <animate attributeName="r" values="3;9;3" dur="2.1s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.9;0.1;0.9" dur="2.1s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="268" cy="198" r="2.5" fill="#E8B86D" className="group-hover/marker:fill-white transition-all duration-300" />
                    
                    {/* Subtle micro label always visible next to dot when not hovered */}
                    <text x="278" y="201" fill="#E8B86D" fontSize="6.5" fontFamily="Georgia, serif" fontWeight="bold" opacity="0.65" className="group-hover/marker:opacity-0 transition-opacity duration-200 pointer-events-none tracking-wide text-shadow">Cairo</text>

                    <g className="opacity-0 group-hover/marker:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <rect x="279" y="168" width="180" height="52" rx="4" fill="rgba(6, 11, 20, 0.98)" stroke="#C9933A" strokeWidth="1.2" />
                      <text x="287" y="182" fill="#E8B86D" fontSize="8.5" fontFamily="Georgia, serif" fontWeight="black">Cairo</text>
                      <text x="287" y="195" fill="rgba(255,255,255,0.95)" fontSize="7" fontFamily="sans-serif" fontWeight="bold">Al-Azhar &amp; Dar al-Hikma (970 CE)</text>
                      <text x="287" y="207" fill="rgba(255,255,255,0.6)" fontSize="6" fontFamily="sans-serif">Epicenter of Arabic grammar, logic, &amp; law.</text>
                    </g>
                    <title>Cairo: Al-Azhar &amp; Dar al-Hikma</title>
                  </g>

                  {/* Cordoba */}
                  <g id="marker-cordoba" className="pointer-events-auto group/marker cursor-pointer" onClick={(e) => { e.stopPropagation(); openRegionDetail('Andalusian Basin'); }}>
                    <circle cx="247" cy="172" r="10" fill="rgba(232,184,109,0.0)" className="group-hover/marker:fill-gold/20 transition-all duration-300" />
                    <circle cx="247" cy="172" r="6" fill="none" stroke="#E8B86D" strokeWidth="1" filter="url(#markerGlow)">
                      <animate attributeName="r" values="3;9;3" dur="2.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.9;0.1;0.9" dur="2.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="247" cy="172" r="2.5" fill="#E8B86D" className="group-hover/marker:fill-white transition-all duration-300" />
                    
                    {/* Subtle micro label always visible next to dot when not hovered */}
                    <text x="257" y="175" fill="#E8B86D" fontSize="6.5" fontFamily="Georgia, serif" fontWeight="bold" opacity="0.65" className="group-hover/marker:opacity-0 transition-opacity duration-200 pointer-events-none tracking-wide text-shadow">Cordoba</text>

                    <g className="opacity-0 group-hover/marker:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <rect x="258" y="142" width="180" height="52" rx="4" fill="rgba(6, 11, 20, 0.98)" stroke="#C9933A" strokeWidth="1.2" />
                      <text x="266" y="156" fill="#E8B86D" fontSize="8.5" fontFamily="Georgia, serif" fontWeight="black">Cordoba</text>
                      <text x="266" y="169" fill="rgba(255,255,255,0.95)" fontSize="7" fontFamily="sans-serif" fontWeight="bold">Caliphate Libraries (Al-Andalus)</text>
                      <text x="266" y="181" fill="rgba(255,255,255,0.6)" fontSize="6" fontFamily="sans-serif">400K+ manuscripts; interfaith science oasis.</text>
                    </g>
                    <title>Cordoba: Beacon of Andalusian Learning</title>
                  </g>

                  {/* Medina */}
                  <g id="marker-medina" className="pointer-events-auto group/marker cursor-pointer" onClick={(e) => { e.stopPropagation(); openRegionDetail('Hijaz Sanctum'); }}>
                    <circle cx="278" cy="215" r="10" fill="rgba(232,184,109,0.0)" className="group-hover/marker:fill-gold/20 transition-all duration-300" />
                    <circle cx="278" cy="215" r="6" fill="none" stroke="#E8B86D" strokeWidth="1" filter="url(#markerGlow)">
                      <animate attributeName="r" values="3;9;3" dur="2.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.9;0.1;0.9" dur="2.2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="278" cy="215" r="2.5" fill="#E8B86D" className="group-hover/marker:fill-white transition-all duration-300" />
                    
                    {/* Subtle micro label always visible next to dot when not hovered */}
                    <text x="288" y="218" fill="#E8B86D" fontSize="6.5" fontFamily="Georgia, serif" fontWeight="bold" opacity="0.65" className="group-hover/marker:opacity-0 transition-opacity duration-200 pointer-events-none tracking-wide text-shadow">Medina</text>

                    <g className="opacity-0 group-hover/marker:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <rect x="289" y="185" width="180" height="52" rx="4" fill="rgba(6, 11, 20, 0.98)" stroke="#C9933A" strokeWidth="1.2" />
                      <text x="297" y="199" fill="#E8B86D" fontSize="8.5" fontFamily="Georgia, serif" fontWeight="black">Medina</text>
                      <text x="297" y="212" fill="rgba(255,255,255,0.95)" fontSize="7" fontFamily="sans-serif" fontWeight="bold">Prophetic Science Cradle</text>
                      <text x="297" y="224" fill="rgba(255,255,255,0.6)" fontSize="6" fontFamily="sans-serif">Birthplace of sacred law &amp; pristine Hadith.</text>
                    </g>
                    <title>Medina: Center of Qur'anic &amp; Prophetic Sciences</title>
                  </g>

                  {/* Fez */}
                  <g id="marker-fez" className="pointer-events-auto group/marker cursor-pointer" onClick={(e) => { e.stopPropagation(); openRegionDetail('Maghreb Region'); }}>
                    <circle cx="234" cy="206" r="10" fill="rgba(232,184,109,0.0)" className="group-hover/marker:fill-gold/20 transition-all duration-300" />
                    <circle cx="234" cy="206" r="6" fill="none" stroke="#E8B86D" strokeWidth="1" filter="url(#markerGlow)">
                      <animate attributeName="r" values="3;9;3" dur="2.3s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.9;0.1;0.9" dur="2.3s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="234" cy="206" r="2.5" fill="#E8B86D" className="group-hover/marker:fill-white transition-all duration-300" />
                    
                    {/* Subtle micro label always visible next to dot when not hovered */}
                    <text x="202" y="209" fill="#E8B86D" fontSize="6.5" fontFamily="Georgia, serif" fontWeight="bold" opacity="0.65" className="group-hover/marker:opacity-0 transition-opacity duration-200 pointer-events-none tracking-wide text-shadow">Fez</text>

                    <g className="opacity-0 group-hover/marker:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <rect x="45" y="176" width="180" height="52" rx="4" fill="rgba(6, 11, 20, 0.98)" stroke="#C9933A" strokeWidth="1.2" />
                      <text x="53" y="190" fill="#E8B86D" fontSize="8.5" fontFamily="Georgia, serif" fontWeight="black">Fez</text>
                      <text x="53" y="203" fill="rgba(255,255,255,0.95)" fontSize="7" fontFamily="sans-serif" fontWeight="bold">University of al-Qarawiyyin (859 CE)</text>
                      <text x="53" y="215" fill="rgba(255,255,255,0.6)" fontSize="6" fontFamily="sans-serif">Oldest continuous university, founded by Fatima al-Fihri.</text>
                    </g>
                    <title>Fez: University of al-Qarawiyyin</title>
                  </g>

                  {/* Bukhara */}
                  <g id="marker-bukhara" className="pointer-events-auto group/marker cursor-pointer" onClick={(e) => { e.stopPropagation(); openRegionDetail('Transoxiana Heights'); }}>
                    <circle cx="308" cy="162" r="10" fill="rgba(232,184,109,0.0)" className="group-hover/marker:fill-gold/20 transition-all duration-300" />
                    <circle cx="308" cy="162" r="6" fill="none" stroke="#E8B86D" strokeWidth="1" filter="url(#markerGlow)">
                      <animate attributeName="r" values="3;9;3" dur="2.6s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.9;0.1;0.9" dur="2.6s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="308" cy="162" r="2.5" fill="#E8B86D" className="group-hover/marker:fill-white transition-all duration-300" />
                    
                    {/* Subtle micro label always visible next to dot when not hovered */}
                    <text x="318" y="165" fill="#E8B86D" fontSize="6.5" fontFamily="Georgia, serif" fontWeight="bold" opacity="0.65" className="group-hover/marker:opacity-0 transition-opacity duration-200 pointer-events-none tracking-wide text-shadow">Bukhara</text>

                    <g className="opacity-0 group-hover/marker:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <rect x="319" y="132" width="170" height="52" rx="4" fill="rgba(6, 11, 20, 0.98)" stroke="#C9933A" strokeWidth="1.2" />
                      <text x="327" y="146" fill="#E8B86D" fontSize="8.5" fontFamily="Georgia, serif" fontWeight="black">Bukhara</text>
                      <text x="327" y="159" fill="rgba(255,255,255,0.95)" fontSize="7" fontFamily="sans-serif" fontWeight="bold">Academy of Sciences</text>
                      <text x="327" y="171" fill="rgba(255,255,255,0.6)" fontSize="6" fontFamily="sans-serif">Thrived with Ibn Sina &amp; Hadith giants.</text>
                    </g>
                    <title>Bukhara: Academy of advanced sciences</title>
                  </g>
                </g>

                {/* Seamless looped copies of the marker group with exactly 360px offset */}
                <use href="#markersGroup" x="360" />
                <use href="#markersGroup" x="-360" />
              </g>
            </svg>

            {/* Center Arabic Text Watermark */}
            <div className="absolute z-30 flex flex-col justify-center items-center pointer-events-none text-center p-2 max-w-full">
              <span 
                className="font-arabic text-[#C9933A] text-xl sm:text-2xl md:text-3xl group-hover/globe:text-gold-light group-hover/globe:scale-110 transition-all duration-300 select-none font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                style={{ fontFamily: "'Amiri', serif" }}
              >
                الْبَاب
              </span>
              <span 
                className="text-[8px] sm:text-[9px] md:text-[11px] tracking-[3px] sm:tracking-[6px] text-[#C9933A]/85 font-sans select-none group-hover/globe:text-white transition-all duration-300 uppercase mt-0.5 sm:mt-1 pl-[3px] sm:pl-[6px]"
                style={{ fontFamily: "'Lato', sans-serif" }}
              >
                ALBAB
              </span>
              <span className="text-[7px] sm:text-[8px] md:text-[9px] tracking-[0.15em] sm:tracking-[0.2em] text-[#E8B86D] font-sans opacity-0 group-hover/globe:opacity-100 transition-all duration-300 mt-1.5 sm:mt-2 uppercase bg-black/40 px-1.5 sm:px-2 py-0.5 rounded border border-gold/20 shadow-md">
                GET HADITH
              </span>
            </div>
          </div>

          {/* Custom Floating Zoom Controls on the Right side of the globe */}
          <div className="absolute -right-8 sm:-right-12 md:-right-14 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-30 pointer-events-auto select-none">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setZoomScale(prev => Math.min(prev + 0.25, 2.5));
              }}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border transition-all duration-300 shadow-md hover:scale-110 active:scale-95
                ${isSpace 
                  ? 'bg-space/90 text-gold border-gold/45 hover:border-gold hover:text-white hover:shadow-[0_0_8px_rgba(232,184,109,0.3)]' 
                  : 'bg-white/95 text-crimson border-crimson/30 hover:border-crimson hover:bg-[#FAF8F5] hover:shadow-[0_2px_8px_rgba(139,0,0,0.12)]'
                }
              `}
              title="Zoom In"
            >
              <LucideIcons.ZoomIn className="h-4 w-4" />
            </button>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setZoomScale(prev => Math.max(prev - 0.25, 1));
              }}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border transition-all duration-300 shadow-md hover:scale-110 active:scale-95
                ${isSpace 
                  ? 'bg-space/90 text-gold border-gold/45 hover:border-gold hover:text-white hover:shadow-[0_0_8px_rgba(232,184,109,0.3)]' 
                  : 'bg-white/95 text-crimson border-crimson/30 hover:border-crimson hover:bg-[#FAF8F5] hover:shadow-[0_2px_8px_rgba(139,0,0,0.12)]'
                }
              `}
              title="Zoom Out"
            >
              <LucideIcons.ZoomOut className="h-4 w-4" />
            </button>

            {zoomScale > 1 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomScale(1);
                }}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border transition-all duration-300 shadow-md hover:scale-110 active:scale-95 animate-fade-in
                  ${isSpace 
                    ? 'bg-space/90 text-gold border-gold/50 hover:border-gold hover:text-white hover:shadow-[0_0_8px_rgba(232,184,109,0.3)]' 
                    : 'bg-white/95 text-crimson border-crimson/35 hover:border-crimson hover:bg-[#FAF8F5] hover:shadow-[0_2px_8px_rgba(139,0,0,0.12)]'
                  }
                `}
                title="Reset Zoom"
              >
                <LucideIcons.RefreshCw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Custom Interactive Floating Coordinate Pin and Tooltip */}
          {hoverPin && (
            <div 
              className="absolute pointer-events-none z-50 transform -translate-x-1/2 -translate-y-full transition-all duration-75 ease-out"
              style={{ 
                left: `${hoverPin.x}px`, 
                top: `${hoverPin.y}px` 
              }}
            >
              {/* Glowing Coordinate Pin */}
              <div className="relative flex flex-col items-center">
                {/* Translucent Card/Tooltip Frame */}
                <div className={`absolute bottom-8 flex flex-col p-2.5 rounded-md border w-44 backdrop-blur-md shadow-2xl transition-all duration-200 animate-scale-up
                  ${isSpace 
                    ? 'bg-[#050b18]/95 border-emerald-500/50 text-white shadow-[0_4px_24px_rgba(0,0,0,0.6)]' 
                    : 'bg-[#FFFBF5]/95 border-emerald-500/45 text-charcoal shadow-[0_4px_16px_rgba(16,185,129,0.15)]'
                  }
                `}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-mono tracking-wider text-emerald-500 font-bold uppercase">
                      Current Session: Research
                    </span>
                  </div>
                  <div className={`font-serif font-black text-xs leading-none mb-1 ${isSpace ? 'text-[#E8B86D]' : 'text-crimson'}`}>
                    {hoverPin.regionName}
                  </div>
                  <div className="text-[8.5px] font-mono text-stone-500 dark:text-stone-400 mt-1.5 flex justify-between border-t border-stone-200/20 pt-1 leading-none">
                    <span>Lat: {hoverPin.lat}</span>
                    <span>Lon: {hoverPin.lon}</span>
                  </div>
                </div>

                {/* Pulsing focal head */}
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-[0_0_12px_rgba(16,185,129,0.9)] flex items-center justify-center animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
                </div>
                
                {/* Secondary expanding circular scanwave */}
                <div className="absolute w-8 h-8 rounded-full border border-emerald-400 opacity-60 animate-ping duration-1000 -top-2" />

                {/* Delicate drop-pin vertical wireline */}
                <div className="w-0.5 h-6 bg-gradient-to-b from-emerald-500 to-transparent" />
              </div>
            </div>
          )}
        </div>

        {/* DESKTOP: Centered Floating Course Cards */}
        <div className="absolute inset-0 pointer-events-none hidden md:block">
          {globeCourses.map((course, idx) => {
            const pos = computeCardPosition(idx, globeCourses.length);
            const isSelected = selectedCourseId === course.id;

            const handleCardClick = (e: React.MouseEvent) => {
              e.stopPropagation();
              // For all cards, we select the course and smoothly scroll down to CurriculumInspector detailed view
              onSelectCourse(course);
              if (course.id === 'hadith') {
                triggerHadithPopup();
              }
              setTimeout(() => {
                const el = document.getElementById('canonical-inspector-viewport');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }, 60);
            };

            return (
              <div 
                key={course.id}
                className="absolute cursor-pointer pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 animate-float-card"
                style={{ 
                  top: pos.top, 
                  left: pos.left,
                  animationDelay: `${idx * 0.45}s`
                }}
                onClick={handleCardClick}
              >
                <div className={`relative px-4 py-3 rounded border w-44 backdrop-blur-md transition-all duration-300
                  ${isSpace 
                    ? 'bg-space/85 border-gold/30 hover:border-gold hover:shadow-[0_0_15px_rgba(201,147,58,0.4)]' 
                    : 'bg-white/95 border-crimson/25 hover:border-crimson hover:shadow-[0_10px_20px_rgba(139,0,0,0.1)]'
                  }
                  ${isSelected ? (isSpace ? 'border-amber-400 bg-amber-950/20 scale-105' : 'border-crimson bg-crimson/5 scale-105') : ''}
                `}>
                  {/* Tiny Crimson corner line indicators */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-gold/40 rounded-tl-xs" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-gold/40 rounded-br-xs" />

                  <div className="flex items-center gap-2">
                    <span className={isSpace ? 'text-gold' : 'text-crimson'}>
                      {getIcon(course.icon)}
                    </span>
                    <div>
                      <h4 className="font-serif font-black text-sm tracking-wide leading-none">{course.name}</h4>
                      <span className="text-[9px] text-stone-400 dark:text-stone-500 font-mono tracking-wider">{course.count}</span>
                    </div>
                  </div>

                  {/* Smooth sliding sub-branches listed on hover */}
                  <div className="max-h-0 overflow-hidden group-hover:max-h-24 group-hover:mt-2 transition-all duration-500 ease-in-out">
                    <div className="border-t border-stone-200/20 pt-1.5 flex flex-col gap-0.5 select-none pointer-events-none">
                      {course.branches.slice(0, 3).map((branch, bid) => (
                        <span key={bid} className="text-[10px] text-stone-500 italic block font-serif leading-none truncate font-semibold">
                          ✦ {branch}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MOBILE COLLAPSED: 3x2 Grid Below Globe */}
      <div className="w-full max-w-lg mx-auto px-6 mt-1 md:hidden flex flex-col select-none relative z-10">
        <h3 className="text-center font-serif italic text-stone-400 dark:text-stone-500 text-xs mb-4">
          — Select field to explore scholarly branches —
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {globeCourses.map((course) => {
            const isSelected = selectedCourseId === course.id;
            const handleMobileCardClick = () => {
              onSelectCourse(course);
              if (course.id === 'hadith') {
                triggerHadithPopup();
              }
              setTimeout(() => {
                const el = document.getElementById('canonical-inspector-viewport');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }, 60);
            };

            return (
              <button 
                key={course.id}
                onClick={handleMobileCardClick}
                className={`flex items-center gap-2.5 p-3.5 border rounded-sm transition-all duration-300 text-left active:scale-95
                  ${isSpace 
                    ? 'bg-space/85 border-gold/20 text-white' 
                    : 'bg-white border-crimson/15 text-charcoal'
                  }
                  ${isSelected ? (isSpace ? 'border-gold bg-gold/15' : 'border-crimson bg-crimson/5') : ''}
                `}
              >
                <span className={isSpace ? 'text-gold' : 'text-crimson'}>
                  {getIcon(course.icon)}
                </span>
                <div className="leading-none">
                  <h4 className="font-serif font-black text-sm tracking-wide">{course.name}</h4>
                  <p className="text-[9px] text-stone-400 dark:text-stone-500 font-mono mt-0.5">{course.count}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* INTERACTIVE WISDOM HADITH POPUP (STUNNING CENTERED MODAL OVERLAY) */}
      {showHadithModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div 
            className={`relative max-w-2xl w-full p-8 md:p-12 border rounded-sm md:rounded-md shadow-2xl transition-all duration-500 border-l-4 animate-scale-up
              ${isSpace 
                ? 'bg-[#0a0f1d] border-l-gold border-t-gold/10 border-r-gold/10 border-b-gold/10 text-white' 
                : 'bg-[#FFF9F0] border-l-crimson border-stone-200 text-charcoal'
              }
            `}
          >
            {/* Close Button Button */}
            <button 
              onClick={() => setShowHadithModal(false)}
              className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300
                ${isSpace 
                  ? 'text-stone-400 hover:text-white hover:bg-white/5' 
                  : 'text-stone-500 hover:text-charcoal hover:bg-black/5'
                }
              `}
              title="Close modal"
            >
              <LucideIcons.X className="w-5 h-5" />
            </button>

            {/* Icon Header */}
            <div className="text-center mb-6">
              <LucideIcons.MessageSquareQuote className={`h-8 w-8 mx-auto mb-2 opacity-85
                ${isSpace ? 'text-gold' : 'text-crimson'}
              `} />
              <h3 className="font-serif font-black text-xl tracking-wide mb-1">Celestial Wisdom</h3>
              <span className="text-[9px] font-mono tracking-widest text-stone-400 dark:text-stone-500 uppercase font-black">
                Featured Prophetic Hadith
              </span>
            </div>

            {/* ARABIC TEXT */}
            <div className="text-center mb-6 select-all font-semibold font-arabic text-xl sm:text-2xl leading-relaxed sm:leading-loose tracking-wide text-gold dark:text-gold-light">
              {activeHadith.arabic}
            </div>

            {/* ENGLISH TRANSLATION */}
            <p className="font-serif italic text-base sm:text-lg leading-relaxed text-stone-600 dark:text-stone-300 text-center max-w-2xl mx-auto mb-6">
              "{activeHadith.translation}"
            </p>

            {/* SOURCE BUTTON BADGE */}
            <div className="text-center mb-6">
              <span className={`inline-block text-[10px] md:text-xs font-mono font-bold tracking-wider py-1 px-3 border rounded-xs select-none
                ${isSpace 
                  ? 'bg-gold/10 border-gold/30 text-gold-light' 
                  : 'bg-crimson/5 border-crimson/25 text-crimson-light'
                }
              `}>
                {activeHadith.source}
              </span>
            </div>

            {/* CONTEXT ACCENT */}
            {activeHadith.context && (
              <div className="mt-6 pt-6 border-t border-stone-200/10 text-center">
                <p className="text-xs text-stone-400 dark:text-stone-500 max-w-xl mx-auto leading-relaxed">
                  <span className="font-semibold uppercase tracking-wider font-mono text-[9px] mr-1">Context:</span>
                  {activeHadith.context}
                </p>
              </div>
            )}

            {/* CYCLER BUTTON & CLOSE BUTTONS */}
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <button 
                onClick={handleNextHadith}
                className={`flex items-center gap-2 text-[10px] font-bold tracking-[0.25em] uppercase py-2.5 px-6 rounded-sm border transition-all duration-300 active:scale-95 shadow-sm
                  ${isSpace 
                    ? 'border-gold/30 text-gold-light hover:border-gold hover:bg-gold/10' 
                    : 'border-crimson/30 text-crimson hover:bg-crimson/5'
                  }
                `}
              >
                <LucideIcons.Sparkles className="h-3.5 w-3.5 animate-spin-slow" />
                Next Hadith
              </button>
              <button 
                onClick={() => setShowHadithModal(false)}
                className={`text-[10px] font-bold tracking-[0.25em] uppercase py-2.5 px-6 rounded-sm transition-all duration-300 active:scale-95
                  ${isSpace 
                    ? 'bg-stone-800 hover:bg-stone-700 text-white' 
                    : 'bg-stone-200 hover:bg-stone-300 text-charcoal'
                  }
                `}
              >
                Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REGIONAL ACADEMIC HISTORY MODAL OVERLAY */}
      {showRegionModal && selectedRegionHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity duration-300">
          <div 
            className={`relative max-w-3xl w-full p-6 md:p-10 border rounded-sm md:rounded-md shadow-2xl transition-all duration-500 max-h-[90vh] overflow-y-auto animate-scale-up border-l-4
              ${isSpace 
                ? 'bg-[#0a0f1d] border-l-gold border-t-gold/10 border-r-gold/10 border-b-gold/10 text-white' 
                : 'bg-[#FFF9F0] border-l-crimson border-stone-200 text-charcoal'
              }
            `}
          >
            {/* Close button */}
            <button 
              onClick={() => setShowRegionModal(false)}
              className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300
                ${isSpace 
                  ? 'text-stone-400 hover:text-white hover:bg-white/5' 
                  : 'text-stone-500 hover:text-charcoal hover:bg-black/5'
                }
              `}
              title="Close details"
            >
              <LucideIcons.X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-6 pb-4 border-b border-stone-200/10">
              <div className="flex items-center gap-2 mb-1">
                <LucideIcons.MapPin className={`h-4 w-4 ${isSpace ? 'text-gold' : 'text-crimson'}`} />
                <span className="text-xs font-mono tracking-widest uppercase text-stone-400 font-bold">
                  {selectedRegionHistory.coordinates} — {selectedRegionHistory.regionName}
                </span>
              </div>
              <h2 className="font-serif font-black text-2xl md:text-3xl tracking-tight mb-2">
                {selectedRegionHistory.title}
              </h2>
              <div className="flex items-center gap-2">
                <LucideIcons.Calendar className="h-3.5 w-3.5 opacity-60" />
                <span className="text-xs font-mono font-semibold opacity-75">{selectedRegionHistory.era}</span>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Left col: Summary & Narrative */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h3 className="text-xs font-mono tracking-wider uppercase font-black mb-2 opacity-50">HISTORIC SUMMARY</h3>
                  <p className="font-serif text-stone-600 dark:text-stone-300 leading-relaxed text-sm md:text-base">
                    {selectedRegionHistory.summary}
                  </p>
                </div>
                
                <div className={`p-4 rounded border font-serif italic text-stone-500 dark:text-stone-400 text-sm leading-relaxed border-dashed
                  ${isSpace ? 'bg-white/5 border-stone-700' : 'bg-orange-50/50 border-orange-200'}
                `}>
                  "{selectedRegionHistory.narrative}"
                </div>
              </div>

              {/* Right col: Stats & Figure items */}
              <div className="space-y-6">
                {/* Key Figures */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <LucideIcons.Users className="h-3.5 w-3.5 text-gold-light" />
                    <h3 className="text-xs font-mono tracking-wider uppercase font-black opacity-50">KEY FIGURES</h3>
                  </div>
                  <ul className="space-y-1.5 text-xs font-mono">
                    {selectedRegionHistory.keyFigures.map((f, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-gold font-bold">▪</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Institutions */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <LucideIcons.BookOpen className="h-3.5 w-3.5 text-gold-light" />
                    <h3 className="text-xs font-mono tracking-wider uppercase font-black opacity-50">INSTITUTIONS</h3>
                  </div>
                  <ul className="space-y-1.5 text-xs font-mono">
                    {selectedRegionHistory.institutions.map((inst, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-gold font-bold">▪</span>
                        <span>{inst}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Core Achievements */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <LucideIcons.Award className="h-3.5 w-3.5 text-gold-light" />
                    <h3 className="text-xs font-mono tracking-wider uppercase font-black opacity-50">ACHIEVEMENTS</h3>
                  </div>
                  <ul className="space-y-1.5 text-xs font-mono text-stone-700 dark:text-stone-300">
                    {selectedRegionHistory.achievements.map((ach, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-gold font-bold">▪</span>
                        <span>{ach}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Close Action Buttons */}
            <div className="pt-4 border-t border-stone-200/10 flex justify-end">
              <button 
                onClick={() => setShowRegionModal(false)}
                className={`text-[10px] font-bold tracking-[0.25em] uppercase py-2.5 px-6 rounded-sm transition-all duration-300 active:scale-95 shadow-md
                  ${isSpace 
                    ? 'bg-gold hover:bg-gold-light text-black' 
                    : 'bg-crimson hover:bg-crimson-light text-white'
                  }
                `}
              >
                Return to Cosmos
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
