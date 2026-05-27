import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, ShieldCheck, Scale, ArrowRight, BookOpen, 
  RotateCcw, Save, AlertCircle, Bookmark, Compass, Award,
  HelpCircle, Infinity, Dna, Cpu, Flame, Globe, Puzzle, Bot, ShieldAlert
} from 'lucide-react';

interface AqeedahFirewallProps {
  currentTheme: 'parchment' | 'space';
  onBackToLanding: () => void;
}

interface SavedRefutation {
  id: string;
  challengeId: string;
  challengeName: string;
  text: string;
  timestamp: string;
}

const CHALLENGES = [
  { id: 'nihilism', name: 'Nihilism', descriptor: 'Meaninglessness', icon: Infinity },
  { id: 'evil', name: 'Problem of Evil', descriptor: 'Theodicy', icon: HelpCircle },
  { id: 'darwinism', name: 'Darwinism', descriptor: 'Origins', icon: Dna },
  { id: 'simulation', name: 'Simulation Theory', descriptor: 'Reality', icon: Cpu },
  { id: 'new_atheism', name: 'New Atheism', descriptor: 'Denial', icon: Flame },
  { id: 'relativism', name: 'Moral Relativism', descriptor: 'Ethics', icon: Scale },
  { id: 'existentialism', name: 'Existentialism', descriptor: 'Purpose', icon: Compass },
  { id: 'secularism', name: 'Secular Humanism', descriptor: 'Godlessness', icon: Globe },
  { id: 'postmodernism', name: 'Postmodernism', descriptor: 'Truth', icon: Puzzle },
  { id: 'ai_conscious', name: 'AI Consciousness', descriptor: 'Machine Soul', icon: Bot }
];

// Parser component to process streaming markdown text into the rich customized design required.
function SectionContentRenderer({ content, header }: { content: string; header: string }) {
  const isSummary = header.includes('الْخُلَاصَةُ') || header.toLowerCase().includes('summary');
  const isQuran = header.includes('الدَّلِيلُ الْقُرْآنِيُّ') || header.toLowerCase().includes('quran');
  
  const lines = content.split('\n');
  
  if (isSummary) {
    return (
      <div className="bg-[#2D0A0A] border border-[#C4A35A]/40 text-[#FAF8F5] p-5 sm:p-7 rounded-sm shadow-inner italic font-serif leading-relaxed text-sm sm:text-base my-2">
        {content}
      </div>
    );
  }

  return (
    <div className="space-y-4 font-serif leading-relaxed text-sm sm:text-base text-stone-900">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Detect formal logical lines like P1, P2, P3, ∴, Conclusion, Counter, etc.
        const isLogical = /^(P\d+|∴|Conclusion|Counter|Conclusion failure|Conclusion fails|P1:|P2:|P3:|Premise)/i.test(trimmed) || trimmed.startsWith('∴') || trimmed.startsWith('P1') || trimmed.startsWith('P2');
        
        if (isLogical) {
          return (
            <div 
              key={idx} 
              className="font-mono text-xs sm:text-sm bg-[#1A0505] text-[#FAF8F5] border-l-2 border-[#C4A35A] px-4 py-2.5 my-2 rounded-sm shadow-inner tracking-wide"
            >
              {trimmed}
            </div>
          );
        }

        // Detect Arabic text in Quranic Proof section
        if (isQuran) {
          const hasArabic = /[\u0600-\u06FF]/.test(trimmed);
          if (hasArabic) {
            return (
              <div 
                key={idx} 
                className="text-center font-serif py-4 text-[#C4A35A] text-xl sm:text-2xl leading-loose font-bold"
                style={{ fontFamily: 'Amiri, Georgia, serif' }}
              >
                {trimmed}
              </div>
            );
          }
        }

        return (
          <p key={idx} className="leading-relaxed">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

export default function AqeedahFirewall({ currentTheme, onBackToLanding }: AqeedahFirewallProps) {
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [savedRecords, setSavedRecords] = useState<SavedRefutation[]>(() => {
    try {
      const saved = localStorage.getItem('albab_aqeedah_saved');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBuildRefutation = async () => {
    if (!selectedChallenge) return;

    setLoading(true);
    setError(null);
    setStreamedText('');

    try {
      const response = await fetch('/api/labs/aqeedah-firewall', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ challengeKey: selectedChallenge })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (!reader) {
        throw new Error('Streaming API response not readable.');
      }

      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value, { stream: !done });
        setStreamedText(prev => prev + chunk);
        
        // Auto scrolls container if reading
        if (scrollRef.current) {
          scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Dialectical error. Failed to establish firewall connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToJournal = () => {
    if (!selectedChallenge || !streamedText) return;
    
    const challengeObj = CHALLENGES.find(c => c.id === selectedChallenge);
    const newRecord: SavedRefutation = {
      id: `aqe_${Date.now()}`,
      challengeId: selectedChallenge,
      challengeName: challengeObj?.name || selectedChallenge,
      text: streamedText,
      timestamp: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const updated = [newRecord, ...savedRecords];
    setSavedRecords(updated);
    localStorage.setItem('albab_aqeedah_saved', JSON.stringify(updated));
    showToast('Refutation successfully logged in Aqeedah Journal!');
  };

  const handleReset = () => {
    setSelectedChallenge(null);
    setStreamedText('');
    setError(null);
  };

  // Helper parser: breaks stream text down based on '##' headers
  const parseSectionsOfRefutation = (text: string) => {
    if (!text) return [];
    
    const rawParts = text.split(/##\s+/);
    const resolved: { header: string; content: string }[] = [];

    rawParts.forEach((part, index) => {
      const lines = part.split('\n');
      const headerLine = lines[0]?.trim();
      const contentLines = lines.slice(1).join('\n').trim();

      if (headerLine && contentLines) {
        resolved.push({
          header: headerLine,
          content: contentLines
        });
      } else if (!headerLine && contentLines && index === 0) {
        // Any introductory text
        resolved.push({
          header: 'INTRODUCTION',
          content: contentLines
        });
      }
    });

    return resolved;
  };

  const currentParsedSections = parseSectionsOfRefutation(streamedText);

  return (
    <div 
      className="min-h-screen pb-24 pt-20 font-sans text-[#1A1A1A] selection:bg-[#8B1A1A]/10 text-left"
      style={{ backgroundColor: '#F5F0E8' }}
    >
      {/* DARK MAROON HERO HEADER */}
      <header className="relative w-full py-14 px-6 md:px-12 text-center bg-[#2D0A0A] border-b border-[#C4A35A]/40 overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />
        <div className="max-w-4xl mx-auto space-y-5 relative z-10 flex flex-col items-center">
          
          <button 
            onClick={onBackToLanding}
            className="absolute top-0 left-0 text-white/70 hover:text-white transition-colors duration-200 text-xs font-mono uppercase tracking-widest flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-sm border border-white/15 hover:bg-white/20 select-none cursor-pointer"
          >
            ← Back to Campus
          </button>

          <span 
            className="block text-[#C4A35A] font-serif tracking-wide italic text-xs uppercase"
          >
            "Armed with Al-Ghazali. Sharpened by Ibn Taymiyyah."
          </span>

          <span 
            className="block text-[#C4A35A] antialiased tracking-wide font-serif select-none font-bold"
            style={{ fontFamily: 'Amiri, Georgia, serif', fontSize: '2.2rem', lineHeight: '1.2' }}
          >
            حِصْنُ الْعَقِيدَة
          </span>

          <h1 
            className="font-serif font-black text-3xl sm:text-4xl text-white tracking-tight uppercase"
            style={{ fontFamily: 'Cormorant Garamond, Amiri, Georgia, serif', fontWeight: 800 }}
          >
            Aqeedah Firewall
          </h1>
          
          <p className="text-stone-300 text-xs sm:text-sm max-w-2xl font-serif italic tracking-wide text-white/70">
            Refute modern philosophical challenges with Kalam and Logic
          </p>
        </div>
      </header>

      {/* TOAST TO NOTIFY SAVED ACTIONS */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-28 left-1/2 -translate-x-1/2 z-50 bg-[#8B1A1A] text-white border border-[#C4A35A]/50 px-6 py-3 rounded-sm shadow-2xl flex items-center gap-3 text-xs font-mono tracking-wider uppercase"
          >
            <Sparkles className="h-4 w-4 text-[#C4A35A] animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 mt-10">
        
        {/* MAIN LAYOUT */}
        <div className="space-y-8">

          {/* CHOOSE CHALLENGE CARDS SCREEN */}
          {!streamedText && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#FAF8F5] p-6 sm:p-10 border border-[#8B1A1A]/10 rounded-sm shadow-md space-y-8"
            >
              <div className="space-y-2 border-b border-stone-150 pb-4">
                <span className="text-[10px] font-mono tracking-[0.2em] text-[#8B1A1A] font-bold uppercase block">
                  Interactive Socratic Shield
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-black text-[#8B1A1A] uppercase">
                  Select your philosophical challenge:
                </h3>
              </div>

              {/* Grid 2Cols on Desktop, 1Col on Mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CHALLENGES.map((challenge) => {
                  const IconComponent = challenge.icon;
                  const isSelected = selectedChallenge === challenge.id;

                  return (
                    <button
                      key={challenge.id}
                      onClick={() => setSelectedChallenge(challenge.id)}
                      className={`p-4 rounded-sm border transition-all duration-300 pointer-events-auto cursor-pointer text-left flex items-start gap-4 select-none ${
                        isSelected 
                          ? 'bg-[#8B1A1A] text-white border-transparent shadow-md' 
                          : 'bg-[#F5F0E8] text-stone-800 border-stone-250 hover:border-[#C4A35A] hover:bg-stone-50'
                      }`}
                    >
                      <div className={`p-2.5 rounded-sm ${isSelected ? 'bg-white/15 text-[#C4A35A]' : 'bg-[#8B1A1A]/10 text-[#8B1A1A]'}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-serif font-black text-sm uppercase tracking-wide">
                          {challenge.name}
                        </h4>
                        <p className={`text-xs ${isSelected ? 'text-white/80' : 'text-stone-500'} font-mono`}>
                          "{challenge.descriptor}"
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* BUILD BUTTON APPEARS ON SELECTION */}
              {selectedChallenge && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="pt-4"
                >
                  <button
                    onClick={handleBuildRefutation}
                    className="w-full py-4.5 bg-[#8B1A1A] text-white hover:bg-[#2D0A0A] font-mono text-xs uppercase tracking-[0.2em] font-black rounded-sm border border-[#C4A35A]/50 cursor-pointer transition-all duration-300 shadow flex items-center justify-center gap-2.5 select-none"
                  >
                    <span>Build Refutation — أَقِمِ الْحُجَّةَ</span>
                    <ArrowRight className="h-4.5 w-4.5" />
                  </button>
                </motion.div>
              )}

              {/* RECENT ARCHIVES HISTORY */}
              {savedRecords.length > 0 && (
                <div className="border-t border-stone-200 pt-8 mt-5 space-y-4 text-left">
                  <h3 className="font-serif font-black text-xs uppercase tracking-wider text-[#8B1A1A] flex items-center gap-2">
                    <Bookmark className="h-4 w-4 text-[#C4A35A]" />
                    <span>Historical Refutations In Your Journal</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {savedRecords.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSelectedChallenge(item.challengeId);
                          setStreamedText(item.text);
                          setError(null);
                        }}
                        className="p-4 bg-white hover:bg-[#FAF8F5] border border-stone-200 hover:border-[#8B1A1A]/30 rounded-sm text-left transition-all duration-200 cursor-pointer pointer-events-auto flex justify-between items-start gap-3 shadow-xs"
                      >
                        <div className="space-y-1">
                          <p className="font-serif font-bold text-xs sm:text-sm text-stone-850">
                            Defense of {item.challengeName}
                          </p>
                          <p className="font-mono text-[9px] text-stone-400">
                            Logged: {item.timestamp}
                          </p>
                        </div>
                        <span className="text-[9px] uppercase font-bold font-mono text-[#8B1A1A]">
                          View
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          )}

          {/* LOADING STREAM SCREEN */}
          {loading && !streamedText && (
            <div className="bg-[#FAF8F5] border border-[#8B1A1A]/10 rounded-sm p-12 text-center shadow-lg space-y-6 py-16 flex flex-col items-center justify-center min-h-[350px]">
              <ShieldAlert className="h-10 w-10 text-[#8B1A1A] animate-pulse mb-2" />
              <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-[#8B1A1A] font-black animate-pulse">
                Initiating Dialectical Anti-Virus
              </h3>
              <p className="font-serif text-stone-500 text-sm italic max-w-sm mx-auto">
                Consulting Ghazalian principles and analytic syllogisms...
              </p>
            </div>
          )}

          {/* STREAM VIEW CONTAINER OR COMPLETE VIEW */}
          {(streamedText || loading) && (
            <div className="space-y-6">

              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-sm flex items-start gap-3 text-xs sm:text-sm">
                  <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold font-mono uppercase block text-[11px] mb-1">Firewall Interruption</span>
                    {error}
                  </div>
                </div>
              )}

              {/* STREAMING RENDER CONTAINER */}
              <div className="bg-[#FAF8F5] border border-[#8B1A1A]/15 rounded-sm p-6 sm:p-10 shadow-lg space-y-8">
                
                {/* STATUS BAR WITH ACTIVE PULSING */}
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${loading ? 'bg-amber-500 animate-ping' : 'bg-emerald-600'}`} />
                    <span className="text-[10px] font-mono tracking-wider text-stone-550 uppercase font-black">
                      {loading ? 'Synthesizing Stream — جَارٍ...' : 'Refutation Document Ready — كَامِلٌ'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-black text-[#8B1A1A] uppercase tracking-widest bg-[#8B1A1A]/5 px-2.5 py-1">
                    Defending: {CHALLENGES.find(c => c.id === selectedChallenge)?.name}
                  </span>
                </div>

                {/* THE PARSED SECTIONS */}
                <div className="space-y-8">
                  {currentParsedSections.map((sec, idx) => (
                    <motion.section 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3"
                    >
                      {/* Section header parsed strictly as required */}
                      {sec.header !== 'INTRODUCTION' && (
                        <h3 className="font-medium text-[#8B1A1A] border-b border-[#C4A35A]/50 pb-1.5 text-base sm:text-lg tracking-wide uppercase font-serif">
                          {sec.header}
                        </h3>
                      )}

                      {/* Content Renderer targeting monospace coding styles, Large Arabic Quran font, and Dark Maroon summary box */}
                      <SectionContentRenderer content={sec.content} header={sec.header} />
                    </motion.section>
                  ))}
                  
                  {/* Invisible anchor for dynamic scrolling */}
                  <div ref={scrollRef} className="h-2" />
                </div>
              </div>

              {/* POST STREAM ACTIONS BAR */}
              {!loading && streamedText && (
                <div className="flex flex-wrap items-center gap-3.5 pt-2">
                  <button
                    onClick={handleSaveToJournal}
                    className="flex items-center gap-2 bg-[#8B1A1A] text-white hover:bg-black font-mono text-xs uppercase tracking-[0.15em] font-bold px-6 py-4 rounded-sm border border-[#C4A35A]/45 transition-all duration-300 shadow cursor-pointer uppercase select-none pointer-events-auto"
                  >
                    <Save className="h-4 w-4 text-[#C4A35A]" />
                    <span>Save to Aqeedah Journal</span>
                  </button>

                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 bg-transparent text-stone-750 hover:bg-white border border-stone-250 font-mono text-xs uppercase tracking-[0.15em] font-bold px-6 py-4 rounded-sm transition-all duration-300 cursor-pointer select-none pointer-events-auto"
                  >
                    <RotateCcw className="h-4 w-4 text-stone-500" />
                    <span>Try Another Challenge</span>
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
