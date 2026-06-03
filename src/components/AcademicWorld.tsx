import React, { useState } from 'react';
import { 
  Sparkles, BookOpen, Brain, Heart, Compass, ShieldAlert, Scale, 
  ShieldCheck, Moon, GraduationCap, HelpCircle, ArrowRight, Search, Zap 
} from 'lucide-react';
import { motion } from 'motion/react';

interface AcademicWorldProps {
  currentTheme: 'parchment' | 'space';
  onNavigateToSection: (section: string) => void;
  language: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: 'spring', 
      stiffness: 70, 
      damping: 14
    }
  }
};

export default function AcademicWorld({ currentTheme, onNavigateToSection, language }: AcademicWorldProps) {
  const isSpace = currentTheme === 'space';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'divine' | 'theology' | 'psycho' | 'ethics'>('all');

  const tools = [
    {
      id: 'quran-explorer',
      title: 'Qur\'an Interactive Explorer',
      arabic: 'مستكشف القرآن',
      category: 'divine',
      categoryLabel: 'Divine Text & Tradition',
      summary: 'Explore the Divine Text with word-by-word syntax, grammar mappings, thematic analysis, and recitation audio tracks.',
      icon: BookOpen,
      tags: ['Syntax & Grammar', 'Root Analysis', 'Interactive Audio'],
      imageUrl: 'https://images.unsplash.com/photo-1609599006353-e629f1d00f18?auto=format&fit=crop&w=600&h=600&q=80'
    },
    {
      id: 'hadith',
      title: 'Prophetic Hadith Library',
      arabic: 'مكتبة السنة الضوئية',
      category: 'divine',
      categoryLabel: 'Divine Text & Tradition',
      summary: 'Authentic Prophetic narrations with chain of transmission (Isnad) maps, grading, and thematic schemas.',
      icon: BookOpen,
      tags: ['Sihah al-Sittah', 'Isnad Mapping', 'Grade Verification'],
      imageUrl: 'https://images.unsplash.com/photo-1584281723171-897db642284e?auto=format&fit=crop&w=600&h=600&q=80'
    },
    {
      id: 'debate',
      title: 'Scholarly Debate Arena',
      arabic: 'ساحة المناظرة العلمية',
      category: 'theology',
      categoryLabel: 'Theology & Dialectics',
      summary: 'Structured AI-moderated virtual disputation chambers covering theological, philosophical, and legal paradigms.',
      icon: Sparkles,
      tags: ['Dialectical Kalam', 'AI Scholarly Peer', 'Tanzil & Ta\'wil'],
      imageUrl: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=600&h=600&q=80'
    },
    {
      id: 'fiqh-ruling',
      title: 'Fiqh Jurisprudence Rulings',
      arabic: 'لوحة الأحكام الفقهية',
      category: 'theology',
      categoryLabel: 'Theology & Dialectics',
      summary: 'Interactive legal inquiry module parsing complex juristic cases across major schools of Islamic law.',
      icon: HelpCircle,
      tags: ['Comparative Fiqh', 'Iftaa Simulation', 'Usul Principles'],
      imageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&h=600&q=80'
    },
    {
      id: 'aqeedah-firewall',
      title: 'Aqeedah Dialectical Firewall',
      arabic: 'دروع العقيدة',
      category: 'theology',
      categoryLabel: 'Theology & Dialectics',
      summary: 'Refutational logic system counteracting secular challenges using classical Kalam models.',
      icon: ShieldCheck,
      tags: ['Problem of Evil Refuted', 'Formal Syllogisms', 'Rational Theology'],
      imageUrl: 'https://images.unsplash.com/photo-1531315630201-bb15abeb1653?auto=format&fit=crop&w=600&h=600&q=80'
    },
    {
      id: 'mantiq-tutor',
      title: 'Mantiq Classical Logic Tutor',
      arabic: 'مدرب علم المنطق',
      category: 'theology',
      categoryLabel: 'Theology & Dialectics',
      summary: 'Comprehensive tutor for classical Aristotelian-Islamic logic teaching Hadd and Qiyas.',
      icon: Compass,
      tags: ['Syllogistic Dialectic', 'Formal Definitions', 'Logical Certainty'],
      imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&h=600&q=80'
    },
    {
      id: 'fallacy-scanner',
      title: 'Mughalata Fallacy Scanner',
      arabic: 'كاشف مغالطات السفسطة',
      category: 'theology',
      categoryLabel: 'Theology & Dialectics',
      summary: 'Critique engine scanning modern text to flag sophistical logic traps and cognitive flaws.',
      icon: ShieldAlert,
      tags: ['Fallacy Extraction', 'Security Scorecard', 'Dialectical Audit'],
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&h=600&q=80'
    },
    {
      id: 'waswas-clinic',
      title: 'Waswas Cognitive Clinic',
      arabic: 'عيادة علاج الوساوس',
      category: 'psycho',
      categoryLabel: 'Psycho-Spiritual Healing',
      summary: 'Therapeutic sanctuary combining Ighathat al-Lahfan guidance with modern Acceptance and Commitment Therapy.',
      icon: Heart,
      tags: ['Anti-Scrupulosity', 'Cognitive Restructuring', 'Ghazalian ACT'],
      imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&h=600&q=80'
    },
    {
      id: 'dhikr-rx',
      title: 'Dhikr Neuro-Rx Pharmacy',
      arabic: 'صيدلية الأذكار الحيوية',
      category: 'psycho',
      categoryLabel: 'Psycho-Spiritual Healing',
      summary: 'Personalized spiritual prescriptions matching 8 cognitive-behavioral distress states with prophetic litanies.',
      icon: Sparkles,
      tags: ['Remedial Remembrance', 'Vagus Stimulation', 'Lifestyle Medicine'],
      imageUrl: 'https://images.unsplash.com/photo-1574246604907-db8c710f637a?auto=format&fit=crop&w=600&h=600&q=80'
    },
    {
      id: 'nafs-assessment',
      title: 'Spiritual Nafs Assessment',
      arabic: 'تزكية وسيكولوجية النفس',
      category: 'psycho',
      categoryLabel: 'Psycho-Spiritual Healing',
      summary: 'Multi-parameter diagnostic evaluating soul-state across Tazkiyah concepts to issue behavioral prescriptions.',
      icon: Brain,
      tags: ['Tazkiyah Diagnostic', 'Nafs Classification', '7-Day Remedy Map'],
      imageUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=600&h=600&q=80'
    },
    {
      id: 'ruya-interpreter',
      title: 'Ru\'ya Dream Interpreter',
      arabic: 'تعبير الرؤى والمنامات',
      category: 'psycho',
      categoryLabel: 'Psycho-Spiritual Healing',
      summary: 'Interpretation engine merging classical Ibn Sirin dream frameworks with modern Jungian spiritual depth psychology.',
      icon: Moon,
      tags: ['Symbol Archetypes', 'Classical Ta\'bir', 'Depth Psychology'],
      imageUrl: 'https://images.unsplash.com/photo-1532690653146-20e786190c11?auto=format&fit=crop&w=600&h=600&q=80'
    },
    {
      id: 'maqasid-analyzer',
      title: 'Maqasid Ethical Analyzer',
      arabic: 'محلل مقاصد الشريعة',
      category: 'ethics',
      categoryLabel: 'Ethics & Scholarly Systems',
      summary: 'Assess morality of modern disputes against the 5 sacred protections of Shariah law.',
      icon: Scale,
      tags: ['Protected Necessities', 'Dilemma Evaluation', 'Islamic Bioethics'],
      imageUrl: 'https://images.unsplash.com/photo-1505664194779-8bebcb95c539?auto=format&fit=crop&w=600&h=600&q=80'
    },
    {
      id: 'portal',
      title: 'Scholastic Student & Admin Portal',
      arabic: 'بوابة السجلات الأكاديمية',
      category: 'ethics',
      categoryLabel: 'Ethics & Scholarly Systems',
      summary: 'Complete registration, browse logs, review grades, download diplomas.',
      icon: GraduationCap,
      tags: ['Student Covenants', 'Scribes Audit Logs', 'Certificates'],
      imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&h=600&q=80'
    }
  ];

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'divine', label: 'Divine Tradition' },
    { id: 'theology', label: 'Theology & Logic' },
    { id: 'psycho', label: 'Spiritual Therapy' },
    { id: 'ethics', label: 'Ethics & Portals' }
  ] as const;

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tool.arabic.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tool.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`py-12 px-4 sm:px-8 max-w-7xl mx-auto transition-all duration-500 rounded-lg shadow-sm
      ${isSpace 
        ? 'bg-[#020509] text-white border border-gold/10' 
        : 'bg-[#FAF6EE] text-[#1E120A] border border-stone-200/60'
      }
    `}>
      
      {/* EXQUISITE SCHOLASTIC HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-12 mt-4">
        <div className="inline-flex items-center gap-3 justify-center mb-4">
          <span className={`h-[1px] w-10 ${isSpace ? 'bg-gold/40' : 'bg-[#8B1A1A]/40'}`} />
          <span className={`text-[10px] uppercase tracking-[0.3em] font-mono font-bold
            ${isSpace ? 'text-gold-light' : 'text-[#8B1A1A]'}`}
          >
            Bismillah Al-Rahman Al-Rahim
          </span>
          <span className={`h-[1px] w-10 ${isSpace ? 'bg-gold/40' : 'bg-[#8B1A1A]/40'}`} />
        </div>
        
        <h2 className="font-eb font-bold text-4xl sm:text-5xl tracking-tight leading-tight mb-4 text-stone-900 dark:text-stone-100">
          ALBAB Scholastic Labs
        </h2>
        
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-xl mx-auto leading-relaxed font-serif italic">
          "A unified coordinate landscape of traditional Islamic sciences, classical logic, and modern intellectual psychology." Select a box below to enter a specific specialized laboratory sanctuary.
        </p>
      </div>

      {/* FILTER SEARCH DIALOG BAR */}
      <div className="space-y-6 mb-12">
        {/* INTERACTIVE FILTERS */}
        <div className="flex flex-wrap items-center justify-center gap-2 pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-mono uppercase tracking-widest rounded-sm transition-all duration-300 border cursor-pointer whitespace-nowrap
                ${selectedCategory === cat.id
                  ? (isSpace 
                      ? 'bg-gold text-space border-gold font-bold shadow-md' 
                      : 'bg-[#8B1A1A] text-[#FAF6EE] border-[#8B1A1A] font-bold shadow-md'
                    )
                  : (isSpace 
                      ? 'bg-space-dark/40 border-gold/15 text-gold-light hover:bg-zinc-900/60 hover:border-gold' 
                      : 'bg-[#FAF6EE]/50 border-stone-200 text-[#8B1A1A] hover:bg-[#FAF6EE] hover:border-[#8B1A1A]'
                    )
                }
              `}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* STANDALONE BAR SEARCH INPUT */}
        <div className="max-w-md mx-auto relative flex items-center font-mono">
          <input
            type="text"
            placeholder="Identify Scholastic Coordinates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full py-2.5 pl-11 pr-4 text-xs tracking-wide rounded-sm border outline-none font-sans transition-all
              ${isSpace 
                ? 'bg-[#020509] border-gold/20 text-white focus:border-gold focus:ring-1 focus:ring-gold/30' 
                : 'bg-[#FAF6EE] border-stone-300 text-stone-900 focus:border-[#8B1A1A] focus:ring-1 focus:ring-crimson/20'
              }
            `}
          />
          <Search className={`absolute left-4 top-3.5 h-3.5 w-3.5 ${isSpace ? 'text-gold' : 'text-[#8B1A1A]'}`} />
        </div>
      </div>

      {/* SYSTEMATIC BENTO CARD GRID PREVIEW */}
      {filteredTools.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-serif italic text-stone-500">
            No academic systems matched your coordinates. Try widening your research search tags.
          </p>
        </div>
      ) : (
        <motion.div 
          key={`grid-${selectedCategory}-${searchQuery}`}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 xl:grid-cols-2 gap-10"
        >
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.id}
                variants={itemVariants}
                layout
                onClick={() => onNavigateToSection(tool.id)}
                className={`flex flex-col md:flex-row w-full md:h-[350px] overflow-hidden rounded-md border text-stone-950 dark:text-neutral-100 bg-[#FAF6EE] dark:bg-zinc-950/20 group hover:-translate-y-1.5 hover:shadow-xl transition-all duration-500 relative cursor-pointer
                  ${isSpace
                    ? 'border-gold/20 hover:border-gold/50'
                    : 'border-stone-200 hover:border-[#8B1A1A]'
                  }
                `}
              >
                {/* Visual Top Highlight Bar */}
                <div className={`absolute top-0 left-0 right-0 h-[2.5px] transition-transform duration-300 scale-x-0 group-hover:scale-x-100
                  ${isSpace ? 'bg-gold' : 'bg-[#8B1A1A]'}
                `} />

                {/* Left side: Square Card Context */}
                <div className="p-6 md:w-1/2 flex flex-col justify-between shrink-0 aspect-square bg-[#FAF6EE] dark:bg-zinc-950/40 relative">
                  <div className="space-y-3.5">
                    {/* Category Caps Badge */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono tracking-widest uppercase font-black
                        ${isSpace ? 'text-gold' : 'text-[#8B1A1A]'}
                      `}>
                        {tool.categoryLabel}
                      </span>
                      <Icon className={`h-4 w-4 opacity-50 ${isSpace ? 'text-gold' : 'text-[#8B1A1A]'}`} />
                    </div>

                    {/* Arabic title + English separator */}
                    <div className="space-y-1 pb-1 border-b border-[#8B1A1A]/10 dark:border-gold/10">
                      <div className="font-arabic amiri text-3xl text-right select-none pr-1 tracking-normal font-bold leading-normal" style={{ color: isSpace ? '#E8B86D' : '#8B1A1A' }}>
                        {tool.arabic}
                      </div>
                      <h3 className="font-eb font-bold text-xl leading-snug pt-1 text-stone-900 dark:text-neutral-100 group-hover:text-[#8B1A1A] dark:group-hover:text-gold transition-colors duration-150">
                        {tool.title}
                      </h3>
                    </div>

                    {/* Summary */}
                    <p className="text-xs text-stone-750 dark:text-stone-300 font-sans leading-relaxed">
                      {tool.summary}
                    </p>
                  </div>

                  {/* Badges and button wrapper */}
                  <div className="space-y-4 pt-3 mt-auto">
                    {/* Tags Pills Row */}
                    <div className="flex flex-wrap gap-1">
                      {tool.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className={`text-[8.5px] font-mono uppercase bg-black/5 dark:bg-white/5 border border-stone-300/30 dark:border-white/10 px-2 py-0.5 rounded-xs font-bold
                            ${isSpace ? 'text-gold-light' : 'text-[#8B1A1A]'}
                          `}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Launch trigger action bar */}
                    <div className="pt-2 border-t border-[#8B1A1A]/10 dark:border-gold/10">
                      <div className={`w-full py-1 px-2.5 sm:py-1.5 sm:px-3 rounded-xs text-[9.5px] sm:text-[10.5px] font-mono font-bold uppercase tracking-wider border transition-all duration-300 flex items-center justify-between group-hover:bg-[#8B1A1A] dark:group-hover:bg-gold-light group-hover:text-white dark:group-hover:text-space
                        ${isSpace 
                          ? 'border-gold/30 text-gold' 
                          : 'border-[#8B1A1A]/30 text-[#8B1A1A]'
                        }
                      `}>
                        <span>Launch Section</span>
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connected subtle vertical maroon divider */}
                <div className={`hidden md:block w-[1.5px] shrink-0 self-stretch opacity-60
                  ${isSpace ? 'bg-gold/30' : 'bg-[#8B1A1A]'}
                `} />

                {/* Right side: Square contextual image */}
                <div className="md:w-1/2 aspect-square relative overflow-hidden bg-stone-100 shrink-0">
                  <img 
                    src={tool.imageUrl} 
                    alt={tool.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle darkening overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-[#1E120A]/10 to-transparent opacity-80" />
                </div>

              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* SYSTEM DIRECTORY FOOTER BRIEFING */}
      <div className={`mt-16 p-8 border text-center rounded-sm max-w-3xl mx-auto space-y-3
        ${isSpace ? 'bg-[#030611] border-gold/15' : 'bg-[#FAF6EE] border-[#8B1A1A]/10'}
      `}>
        <div className="flex justify-center mb-1">
          <Zap className={`h-5 w-5 ${isSpace ? 'text-gold' : 'text-[#8B1A1A]'}`} />
        </div>
        <h4 className="font-eb font-bold text-xl tracking-wide text-stone-900 dark:text-stone-100">
          Intelligent Synoptic Indexing
        </h4>
        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-sans max-w-xl mx-auto">
          Each laboratory environment executes server-side semantic reasoning. All analyses, tests, logic syllogisms, and diagnostic journals are permanently securely synchronized to your scholar enrollment ledger in the Student Portal.
        </p>
      </div>

    </div>
  );
}
