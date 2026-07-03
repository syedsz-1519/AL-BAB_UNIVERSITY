import React, { useState } from 'react';
import { BookOpen, Shield, Heart, Compass, Sparkles, Award, Check, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FivePillarsSectionProps {
  currentTheme: 'parchment' | 'space';
}

interface Pillar {
  id: string;
  nameEn: string;
  nameAr: string;
  nameTranslit: string;
  tagline: string;
  concept: string;
  icon: any;
  rules: string;
  steps: string;
  significance: string;
  times?: { name: string; desc: string }[];
  academicRef: string;
}

export default function FivePillarsSection({ currentTheme }: FivePillarsSectionProps) {
  const isSpace = currentTheme === 'space';
  const [activePillarId, setActivePillarId] = useState<string>('shahadah');

  // Track the learning status of each pillar: 'not_started', 'studied', 'completed'
  const [pillarStatus, setPillarStatus] = useState<Record<string, 'not_started' | 'studied' | 'completed'>>(() => {
    const saved = localStorage.getItem('albab_pillars_status');
    return saved ? JSON.parse(saved) : {};
  });

  const updateStatus = (pillarId: string, status: 'not_started' | 'studied' | 'completed') => {
    const newStatus = { ...pillarStatus, [pillarId]: status };
    setPillarStatus(newStatus);
    localStorage.setItem('albab_pillars_status', JSON.stringify(newStatus));
  };

  const pillars: Pillar[] = [
    {
      id: 'shahadah',
      nameEn: 'Shahadah (Faith)',
      nameAr: 'الشَّهَادَة',
      nameTranslit: 'Declaration of Faith',
      tagline: 'The formal entry into Islam and the absolute foundation of a Muslim\'s entire belief system.',
      concept: 'Epistemic commitment to divine unity and prophetic legacy.',
      icon: Award,
      rules: 'One must recite the phrase aloud with total conviction and understanding of its weight.',
      steps: 'Reciting "La ilaha illallah, Muhammadur rasulullah" (There is no true god worthy of worship except Allah, and Muhammad is the messenger of Allah).',
      significance: 'It marks the transition to living a life submitted to God. It is traditionally the first thing whispered into a newborn\'s ear and the ideal final words a person says before passing away.',
      academicRef: 'Surah Muhammad [47:19]: "So know, [O Muhammad], that there is no deity except Allah..."'
    },
    {
      id: 'salah',
      nameEn: 'Salah (Prayer)',
      nameAr: 'الصَّلَاة',
      nameTranslit: 'Sacred Commemoration',
      tagline: 'The systematic spiritual anchor repeating five times across the daily cosmic cycles.',
      concept: 'Neuro-physiological and spiritual realignment with the Divine.',
      icon: Compass,
      rules: 'Before praying, a person must perform Wudu (ritual washing with clean water). They must wear clean clothes, cover their private areas appropriately, and face toward the Kaaba in Mecca.',
      steps: 'The prayer consists of sets of physical standing, bowing, and prostrating (Rak\'ahs) combined with reciting chapters from the Quran.',
      significance: 'Salah provides a direct spiritual link between the servant and the Creator, repeated five times a day to wash away daily sins.',
      times: [
        { name: 'Fajr', desc: 'Performed at dawn, before sunrise.' },
        { name: 'Dhuhr', desc: 'Performed just after noon, when the sun passes its highest point.' },
        { name: 'Asr', desc: 'Performed in the late afternoon.' },
        { name: 'Maghrib', desc: 'Performed immediately after sunset.' },
        { name: 'Isha', desc: 'Performed during the dark night hours.' }
      ],
      academicRef: 'Surah Al-Ankabut [29:45]: "Indeed, prayer prohibits immorality and wrongdoing, and the remembrance of Allah is greater..."'
    },
    {
      id: 'zakat',
      nameEn: 'Zakat (Almsgiving)',
      nameAr: 'الزَّكَاة',
      nameTranslit: 'Purifying Alms',
      tagline: 'An elegant, systematic wealth redistribution mechanism built directly into core jurisprudence.',
      concept: 'Institutional purification of assets and eradication of wealth hoarding.',
      icon: Shield,
      rules: 'It is not calculated on personal income alone, but on accumulated personal wealth (such as gold, silver, savings accounts, or investments) that has been kept for a full lunar year. This wealth must cross a minimum threshold called the Nisab (the value of 87.48 grams of gold or 612.36 grams of silver).',
      steps: 'If a Muslim qualifies, they calculate exactly 2.5% of their eligible stagnant wealth and distribute it directly to specified categories of needy people.',
      significance: 'The Arabic word means "purification," as it cleanses a believer\'s heart from greed and purifies the leftover wealth.',
      academicRef: 'Surah At-Tawbah [9:103]: "Take, [O Muhammad], from their wealth a charity by which you purify them and cause them increase..."'
    },
    {
      id: 'sawm',
      nameEn: 'Sawm (Fasting)',
      nameAr: 'الصَّوْم',
      nameTranslit: 'Volitional Abnegation',
      tagline: 'An annual intensive masterclass in cognitive self-regulation during the month of Ramadan.',
      concept: 'Deliberate detachment from sensory appetites to cultivate Taqwa (mindfulness).',
      icon: Heart,
      rules: 'Fasting is mandatory for every healthy, adult Muslim during the entire 9th lunar month of the Islamic calendar (Ramadan). Children, travelers, the sick, elderly individuals, and pregnant or menstruating women are exempt and can make up missed fasts later.',
      steps: 'Believers must completely abstain from all food, liquids, smoking, and marital relationships from the first light of dawn until the exact moment of sunset.',
      significance: 'By denying the physical body its basic necessities, a person learns empathy for the poor and redirects their focus entirely to prayer, Quran reading, and charity.',
      academicRef: 'Surah Al-Baqarah [2:183]: "O you who have believed, decreed upon you is fasting... that you may become mindful of God."'
    },
    {
      id: 'hajj',
      nameEn: 'Hajj (Pilgrimage)',
      nameAr: 'الْحَجّ',
      nameTranslit: 'The Sacred Assembly',
      tagline: 'The ultimate, transformative convergence of global humanity in the footsteps of prophets.',
      concept: 'Cosmic rehearsal of the final gathering, dissolving all temporal identities.',
      icon: BookOpen,
      rules: 'It is required only once in a lifetime, and only for adults who possess the physical health and sufficient independent funds to complete the journey without leaving their families in debt.',
      steps: 'Pilgrims travel to Mecca during the 12th month of the Islamic calendar (Dhul-Hijjah). They put on identical, simple white pieces of unstitched cloth (Ihram) to remove any social classes or wealth status. Over five days, they perform a series of unified rituals, including walking seven times around the Kaaba (Tawaf), standing in prayer at Mount Arafat, and symbolically throwing pebbles at stone pillars to reject evil thoughts.',
      significance: 'Completing a sincere Hajj successfully wipes clean a person\'s life history of mistakes, leaving them as spiritually pure as a newborn child.',
      academicRef: 'Surah Ali \'Imran [3:97]: "And [due] to Allah from the people is a pilgrimage to the House - for whoever is able to find thereto a way..."'
    }
  ];

  const activePillar = pillars.find(p => p.id === activePillarId) || pillars[0];
  const ActiveIcon = activePillar.icon;

  return (
    <section 
      id="islamic-pillars"
      className={`scroll-mt-28 py-20 px-6 md:px-12 border-t relative overflow-hidden transition-colors duration-300
        ${isSpace 
          ? 'bg-[#030613] border-gold/15 text-gold-light' 
          : 'bg-[#FCFAF7] border-stone-200/80 text-stone-900'
        }
      `}
    >
      {/* Decorative Traditional Arabic Motifs */}
      <div className="absolute top-0 left-0 w-32 h-32 opacity-[0.03] select-none pointer-events-none arabesque-star bg-current" />
      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-[0.03] select-none pointer-events-none arabesque-star bg-current" />

      <div className="max-w-6xl mx-auto">
        
        {/* Header Block */}
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16 space-y-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: { opacity: 0, y: 15 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: {
                duration: 0.8,
                staggerChildren: 0.12,
                ease: [0.16, 1, 0.3, 1]
              }
            }
          }}
        >
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 }
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-mono tracking-[0.25em] uppercase font-bold
              ${isSpace 
                ? 'border-gold/20 bg-gold/5 text-gold' 
                : 'border-[#0B4628]/15 bg-[#0B4628]/5 text-[#0B4628]'
              }
            `}
          >
            <Sparkles className="h-3 w-3 animate-pulse" />
            Essential Foundations
          </motion.div>
          <motion.h2 
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 }
            }}
            className="font-serif font-black text-3xl sm:text-4xl tracking-wide"
          >
            Islamic Five Pillars Foundation
          </motion.h2>
          <motion.div 
            variants={{
              hidden: { scaleX: 0 },
              visible: { scaleX: 1, transition: { duration: 0.6 } }
            }}
            className="h-0.5 w-24 mx-auto bg-gradient-to-r from-transparent via-gold to-transparent my-1 origin-center" 
          />
          <motion.p 
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 }
            }}
            className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed font-serif"
          >
            The structural framework of Islamic praxis mapped systematically through theological logic, psychological hygiene, and sociological equilibrium. Explore the core covenants of our scholastic faith.
          </motion.p>
        </motion.div>

        {/* Dynamic Bento-Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Pillar Selector (Left 5 cols) */}
          <motion.div 
            className="lg:col-span-5 flex flex-col gap-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.08
                }
              }
            }}
          >
            <span className="font-mono text-[9px] uppercase tracking-widest text-stone-400 mb-1 block font-bold">Select Foundation Pillar:</span>
            {pillars.map((pillar) => {
              const IconComp = pillar.icon;
              const isSelected = pillar.id === activePillarId;
              return (
                <motion.button
                  key={pillar.id}
                  onClick={() => {
                    setActivePillarId(pillar.id);
                    // Smoothly redirect/scroll the viewer to the Core Juridical Axiom panel
                    setTimeout(() => {
                      const el = document.getElementById('core-juridical-axiom-panel');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                      }
                    }, 50);
                  }}
                  whileHover="hover"
                  whileTap={{ scale: 0.98 }}
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { 
                      opacity: 1, 
                      y: 0,
                      transition: { type: "spring", stiffness: 120, damping: 18 }
                    },
                    hover: { x: 6 }
                  }}
                  className={`w-full text-left p-4.5 rounded-sm flex items-center justify-between transition-all duration-300 group cursor-pointer skeuo-active-click
                    ${isSelected
                      ? isSpace
                        ? 'skeuo-card-space border-gold text-white shadow-[0_0_25px_rgba(196,163,90,0.5)] ring-2 ring-gold/40 scale-[1.04]'
                        : 'skeuo-card-parchment border-[#C9933A] text-[#0B4628] shadow-[0_0_20px_rgba(196,163,90,0.3)] ring-2 ring-[#C9933A]/40 scale-[1.04]'
                      : isSpace
                        ? 'skeuo-card-space text-stone-400 hover:text-white hover:scale-[1.01]'
                        : 'skeuo-card-parchment text-stone-600 hover:text-stone-950 hover:scale-[1.01]'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <motion.div 
                      variants={{
                        hover: { 
                          scale: 1.15,
                          rotate: 6,
                          backgroundColor: isSelected 
                            ? (isSpace ? "rgba(251, 191, 36, 0.35)" : "rgba(11, 70, 40, 0.35)")
                            : (isSpace ? "rgba(251, 191, 36, 0.15)" : "rgba(11, 70, 40, 0.15)"),
                          color: isSpace ? "#fbbf24" : "#0B4628"
                        }
                      }}
                      className={`p-2 rounded transition-colors duration-200
                        ${isSelected 
                          ? isSpace ? 'bg-gold/20 text-gold' : 'bg-[#0B4628]/20 text-[#0B4628]'
                          : isSpace ? 'bg-stone-800/50 text-stone-500' : 'bg-stone-100 text-stone-400'
                        }
                      `}
                    >
                      <IconComp className="h-5 w-5" />
                    </motion.div>
                    <div>
                      <h3 className="font-serif font-black text-sm sm:text-base leading-none">
                        {pillar.nameEn}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] font-mono tracking-wider opacity-60">
                          {pillar.nameTranslit}
                        </span>
                        {(pillarStatus[pillar.id] || 'not_started') === 'completed' && (
                          <span className="text-[8px] font-mono font-bold tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-sm flex items-center gap-0.5 uppercase">
                            <Check className="h-2 w-2 stroke-[3]" /> Completed
                          </span>
                        )}
                        {(pillarStatus[pillar.id] || 'not_started') === 'studied' && (
                          <span className="text-[8px] font-mono font-bold tracking-widest text-amber-600 dark:text-gold bg-amber-500/10 dark:bg-gold/10 px-1.5 py-0.5 rounded-sm flex items-center gap-0.5 uppercase">
                            <Bookmark className="h-2 w-2" /> Studied
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <span className={`font-arabic text-lg pr-2 transition-transform duration-300 group-hover:scale-110
                    ${isSelected 
                      ? isSpace ? 'text-gold' : 'text-[#0B4628]' 
                      : 'text-stone-400 dark:text-stone-600'
                    }
                  `}>
                    {pillar.nameAr}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Detailed Content Display Panel (Right 7 cols) */}
          <div className="lg:col-span-7" id="core-juridical-axiom-panel">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePillarId}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: {
                      duration: 0.5,
                      staggerChildren: 0.08,
                      delayChildren: 0.05,
                      ease: [0.16, 1, 0.3, 1]
                    }
                  },
                  exit: { 
                    opacity: 0, 
                    y: -15, 
                    transition: { duration: 0.2, ease: "easeIn" } 
                  }
                }}
                className={`h-full rounded-sm border p-6 sm:p-8 flex flex-col justify-between shadow-lg relative overflow-hidden
                  ${isSpace 
                    ? 'bg-[#050920] border-gold/20 text-gold-light' 
                    : 'bg-white border-[#0B4628]/20 text-stone-900'
                  }
                `}
              >
                {/* Decorative background star */}
                <div className="absolute -right-16 -top-16 w-48 h-48 opacity-[0.02] select-none pointer-events-none arabesque-star bg-current" />

                <div className="space-y-6">
                  {/* Title Bar */}
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
                    }}
                    className="flex justify-between items-start border-b pb-4 border-stone-200/60 dark:border-gold/10"
                  >
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-stone-400 font-bold block">
                        Core Juridical Axiom
                      </span>
                      <h3 className="font-serif font-black text-xl sm:text-2xl tracking-wide dark:text-gold text-[#0B4628] mt-1">
                        {activePillar.nameEn}
                      </h3>
                    </div>
                    <div className={`p-3 rounded-full border
                      ${isSpace ? 'border-gold/20 bg-gold/5 text-gold' : 'border-[#0B4628]/20 bg-[#0B4628]/5 text-[#0B4628]'}
                    `}>
                      <ActiveIcon className="h-6 w-6 animate-[pulse_3s_infinite]" />
                    </div>
                  </motion.div>

                  {/* Tagline */}
                  <motion.p 
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
                    }}
                    className="font-serif italic text-sm sm:text-base leading-relaxed font-semibold dark:text-white text-stone-800"
                  >
                    "{activePillar.tagline}"
                  </motion.p>

                  {/* Rules and Conditions */}
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
                    }}
                    className="space-y-1"
                  >
                    <span className="font-mono text-[8px] uppercase tracking-widest text-[#C9933A] dark:text-gold block font-bold">
                      The Rules & Conditions:
                    </span>
                    <p className="text-xs sm:text-sm leading-relaxed text-stone-750 dark:text-stone-300 font-sans">
                      {activePillar.rules}
                    </p>
                  </motion.div>

                  {/* Steps and Practical Application */}
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
                    }}
                    className="space-y-1"
                  >
                    <span className="font-mono text-[8px] uppercase tracking-widest text-[#C9933A] dark:text-gold block font-bold">
                      The Practical Steps:
                    </span>
                    <p className="text-xs sm:text-sm leading-relaxed text-stone-750 dark:text-stone-300 font-sans">
                      {activePillar.steps}
                    </p>
                  </motion.div>

                  {/* Sacred Timings (Specific to Salah) */}
                  {activePillar.times && (
                    <motion.div 
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
                      }}
                      className="space-y-2 p-3.5 rounded-sm border border-stone-200/50 dark:border-gold/10 bg-stone-100/30 dark:bg-stone-900/40"
                    >
                      <span className="font-mono text-[8px] uppercase tracking-widest text-[#C9933A] dark:text-gold block font-bold">
                        The Five Obligatory Prayer Times:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {activePillar.times.map((t, idx) => (
                          <div key={idx} className="p-2 rounded border border-stone-200/60 dark:border-stone-800/85 bg-white/70 dark:bg-black/40">
                            <h4 className="font-serif font-black text-xs text-[#0B4628] dark:text-gold">{t.name}</h4>
                            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 leading-tight">{t.desc}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Spiritual Significance */}
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
                    }}
                    className="space-y-1"
                  >
                    <span className="font-mono text-[8px] uppercase tracking-widest text-[#C9933A] dark:text-gold block font-bold">
                      Spiritual Significance:
                    </span>
                    <p className="text-xs sm:text-sm leading-relaxed text-stone-750 dark:text-stone-300 font-sans">
                      {activePillar.significance}
                    </p>
                  </motion.div>

                  {/* Academic Reference */}
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
                    }}
                    className={`p-4 border-l-2 text-xs font-serif leading-relaxed italic
                      ${isSpace 
                        ? 'bg-[#090e2d] border-gold text-gold-light/90' 
                        : 'bg-[#FAF8F5] border-[#0B4628] text-[#0B4628]/90'
                      }
                    `}
                  >
                    <span className="font-mono text-[8px] uppercase tracking-wider block font-bold not-italic mb-1 text-stone-400">
                      Canonical Scripture Proof:
                    </span>
                    {activePillar.academicRef}
                  </motion.div>

                  {/* Progress Tracker Controls */}
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
                    }}
                    className={`p-4 rounded border mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300
                      ${isSpace 
                        ? 'bg-gold/5 border-gold/15 text-gold-light' 
                        : 'bg-[#FAF8F5] border-stone-200 text-[#0B4628]'
                      }
                    `}
                  >
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-stone-400 font-bold block">Contemplation Status</span>
                      <p className="text-[11px] text-stone-500 dark:text-stone-300 mt-0.5">Record your learning and spiritual contemplation progress.</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => updateStatus(activePillar.id, 'not_started')}
                        className={`px-3 py-1.5 rounded-sm font-mono text-[10px] tracking-wider uppercase font-bold border transition-all cursor-pointer
                          ${(pillarStatus[activePillar.id] || 'not_started') === 'not_started'
                            ? (isSpace ? 'bg-gold/20 border-gold text-white' : 'bg-[#0B4628]/20 border-[#0B4628] text-[#0B4628]')
                            : (isSpace ? 'bg-transparent border-gold/10 text-stone-400 hover:text-white hover:border-gold/30' : 'bg-transparent border-stone-200 text-stone-500 hover:text-stone-900 hover:border-stone-400')
                          }
                        `}
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => updateStatus(activePillar.id, 'studied')}
                        className={`px-3 py-1.5 rounded-sm font-mono text-[10px] tracking-wider uppercase font-bold border transition-all flex items-center gap-1.5 cursor-pointer
                          ${(pillarStatus[activePillar.id] || 'not_started') === 'studied'
                            ? (isSpace ? 'bg-gold/30 border-gold text-white' : 'bg-amber-600/15 border-amber-600 text-amber-900 dark:text-amber-400')
                            : (isSpace ? 'bg-transparent border-gold/10 text-stone-400 hover:text-white hover:border-gold/30' : 'bg-transparent border-stone-200 text-stone-500 hover:text-stone-900 hover:border-stone-400')
                          }
                        `}
                      >
                        <Bookmark className="h-3.5 w-3.5" />
                        Studied
                      </button>
                      <button
                        onClick={() => updateStatus(activePillar.id, 'completed')}
                        className={`px-3 py-1.5 rounded-sm font-mono text-[10px] tracking-wider uppercase font-bold border transition-all flex items-center gap-1.5 cursor-pointer
                          ${(pillarStatus[activePillar.id] || 'not_started') === 'completed'
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                            : (isSpace ? 'bg-transparent border-gold/10 text-stone-400 hover:text-white hover:border-gold/30' : 'bg-transparent border-stone-200 text-stone-500 hover:text-stone-900 hover:border-stone-400')
                          }
                        `}
                      >
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                        Completed
                      </button>
                    </div>
                  </motion.div>

                </div>

                {/* Academic Footnote */}
                <motion.div 
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { duration: 0.4 } }
                  }}
                  className="mt-8 border-t pt-3 border-stone-200/60 dark:border-gold/10 flex justify-between items-center text-[9px] font-mono tracking-widest uppercase text-stone-400 select-none"
                >
                  <span>Scribe Class II: {activePillar.id}</span>
                  <span>Albab Academic Council</span>
                </motion.div>

              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
