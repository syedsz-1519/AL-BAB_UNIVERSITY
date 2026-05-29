import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eye, BookOpen, Sparkles, Moon, Calendar, ArrowLeft, 
  Trash2, Heart, Brain, Bookmark, Star, Sparkle, AlertCircle, 
  BookMarked, HelpCircle, GraduationCap, Compass
} from 'lucide-react';

interface RuyaInterpreterProps {
  currentTheme: 'parchment' | 'space';
  onBackToLanding: () => void;
}

interface SymbolItem {
  symbol: string;
  meaning: string;
}

interface ArchetypeItem {
  archetype: string;
  manifestation: string;
}

interface DuaData {
  arabic: string;
  transliteration: string;
  meaning: string;
  when: string;
}

interface DreamResult {
  summary: string;
  dream_type: 'true_vision' | 'nafs_dream' | 'shaytan_dream';
  dream_type_reason: string;
  islamic: {
    symbols: SymbolItem[];
    interpretation: string;
    surah_yusuf: string;
    dua: DuaData;
  };
  jungian: {
    archetypes: ArchetypeItem[];
    shadow: string;
    unconscious_message: string;
    individuation: string;
  };
  synthesis: {
    agreement: string;
    divergence: string;
    wisdom: string;
  };
  isSimulated?: boolean;
}

interface JournalEntry {
  id: string;
  date: string;
  dreamText: string;
  state: string;
  timing: string;
  feeling: string;
  result: DreamResult;
}

export default function RuyaInterpreter({ currentTheme, onBackToLanding }: RuyaInterpreterProps) {
  // Input states
  const [state, setState] = useState('At peace');
  const [timing, setTiming] = useState('Before Fajr');
  const [feeling, setFeeling] = useState('Peaceful');
  const [dream, setDream] = useState('');

  // App lifecycle states
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DreamResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedJournal, setSavedJournal] = useState<JournalEntry[]>([]);
  const [showSavedList, setShowSavedList] = useState(false);

  // Load saved journal from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('albab_dreams_saved');
      if (saved) {
        setSavedJournal(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Error loading dream journal:', err);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dream.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/labs/ruya-interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dream,
          state,
          timing,
          feeling
        }),
      });

      if (!response.ok) {
        throw new Error('Could not connect to the dream interpretative engine');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred during interpretation');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToJournal = () => {
    if (!result || !dream.trim()) return;

    try {
      const newEntry: JournalEntry = {
        id: Math.random().toString(36).substring(2, 9),
        date: new Date().toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        dreamText: dream,
        state,
        timing,
        feeling,
        result
      };

      const updatedJournal = [newEntry, ...savedJournal];
      setSavedJournal(updatedJournal);
      localStorage.setItem('albab_dreams_saved', JSON.stringify(updatedJournal));
      alert('📝 Dream saved to your personal Dream Journal!');
    } catch (err) {
      console.error('Failed to save to journal:', err);
    }
  };

  const handleDeleteEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this journal entry?')) return;

    const filtered = savedJournal.filter(entry => entry.id !== id);
    setSavedJournal(filtered);
    localStorage.setItem('albab_dreams_saved', JSON.stringify(filtered));
  };

  const handleLoadEntry = (entry: JournalEntry) => {
    setDream(entry.dreamText);
    setState(entry.state);
    setTiming(entry.timing);
    setFeeling(entry.feeling);
    setResult(entry.result);
    setShowSavedList(false);
  };

  const handleReset = () => {
    setDream('');
    setState('At peace');
    setTiming('Before Fajr');
    setFeeling('Peaceful');
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-stone-900 pb-16 font-serif">
      {/* STARLIT HERO BANNER */}
      <div 
        className="relative bg-[#0A0F2E] text-white pt-36 sm:pt-40 pb-12 px-6 overflow-hidden border-b border-[#C4A35A]/50 flex flex-col items-center text-center"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.18) 1.2px, transparent 1.2px)',
          backgroundSize: '24px 24px'
        }}
      >
        {/* Soft floating decorative moons/stars in background */}
        <div className="absolute top-4 left-6 text-[#C4A35A]/20 pointer-events-none animate-pulse">
          <Moon className="w-16 h-16 transform -rotate-12" />
        </div>
        <div className="absolute bottom-4 right-10 text-[#C4A35A]/15 pointer-events-none">
          <Sparkles className="w-12 h-12" />
        </div>

        {/* Back navigation button */}
        <button 
          onClick={onBackToLanding}
          className="absolute top-28 sm:top-32 left-6 flex items-center gap-2 text-stone-300 hover:text-[#C4A35A] transition-colors font-mono text-xs uppercase bg-[#000]/30 py-1.5 px-3 rounded border border-stone-700/50 cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Campus</span>
        </button>

        {/* Journal toggle button on header */}
        <button 
          onClick={() => setShowSavedList(!showSavedList)}
          className="absolute top-28 sm:top-32 right-6 flex items-center gap-2 text-stone-300 hover:text-[#C4A35A] transition-colors font-mono text-xs uppercase bg-[#0A0F2E] hover:border-[#C4A35A] py-1.5 px-3.5 rounded border border-stone-700 cursor-pointer shadow-md"
        >
          <BookMarked className="w-4 h-4 text-[#C4A35A]" />
          <span>Journal ({savedJournal.length})</span>
        </button>

        <div className="max-w-2xl mt-4 flex flex-col items-center">
          <div className="flex justify-center items-center gap-3 mb-3">
            <div className="h-[1px] w-8 opacity-60 bg-white"></div>
            <span className="font-mono text-[10px] sm:text-xs tracking-[0.25em] text-[#C4A35A] uppercase font-bold text-center">AL-RUYA ONEIROMANCY PORTAL</span>
            <div className="h-[1px] w-8 opacity-60 bg-white"></div>
          </div>
          
          <h2 
            className="text-[#C4A35A] text-4xl sm:text-5xl font-bold mb-2 font-serif select-none" 
            style={{ fontFamily: 'Amiri, Georgia, serif' }}
            dir="rtl"
          >
            تَفْسِيرُ الرُّؤْيَا
          </h2>
          
          <h1 className="text-2xl sm:text-3.5xl font-serif tracking-normal mb-2 text-white font-medium text-center">
            Ru'ya Interpreter
          </h1>
          
          <p className="text-stone-300 text-xs sm:text-sm max-w-lg mx-auto font-sans font-light leading-relaxed text-center">
            Bismillahi ar-Rahman ar-Rahim. Analysed through the lens of Ibn Sirin and the wisdom of Carl Jung
          </p>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-5xl mx-auto px-4 mt-8">

        {/* ERROR BOX */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/10 border border-red-500/30 rounded-sm text-red-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-sans font-semibold text-sm">Philosophical Interruption</h3>
              <p className="text-xs leading-relaxed mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* JOURNAL LIST PANEL MODAL/TAB OVERLAY */}
        <AnimatePresence>
          {showSavedList && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#EFEAE0] border-2 border-[#C4A35A]/50 p-6 rounded-sm mb-8 shadow-lg"
            >
              <div className="flex justify-between items-center border-b border-[#C4A35A]/30 pb-3 mb-4">
                <h3 className="text-xl font-serif text-[#8B1A1A] flex items-center gap-2">
                  <BookMarked className="w-5 h-5 text-[#C4A35A]" />
                  <span>Your Dream Journal</span>
                </h3>
                <button 
                  onClick={() => setShowSavedList(false)}
                  className="font-mono text-xs uppercase hover:text-[#8B1A1A] transition-colors cursor-pointer border border-stone-400/40 px-2.5 py-1 rounded-xs bg-[#FAF8F5]"
                >
                  Close
                </button>
              </div>

              {savedJournal.length === 0 ? (
                <div className="text-center py-12 text-stone-500">
                  <BookOpen className="w-12 h-12 stroke-[1] mx-auto text-[#C4A35A]/40 mb-3" />
                  <p className="text-stone-600 font-sans text-sm">No dreaming scrolls have been written yet.</p>
                  <p className="text-xs text-stone-400 mt-1 font-sans">Interpret a dream and hit "Save to Dream Journal" to build your log.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {savedJournal.map((entry) => (
                    <div 
                      key={entry.id}
                      onClick={() => handleLoadEntry(entry)}
                      className="bg-[#FAF8F5] border border-[#C4A35A]/20 hover:border-[#8B1A1A]/40 p-4 rounded shadow-xs cursor-pointer transition-all flex flex-col justify-between gap-3 group"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="font-mono text-[11px] text-stone-400 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#C4A35A]" />
                            {entry.date}
                          </span>
                          <button 
                            onClick={(e) => handleDeleteEntry(entry.id, e)}
                            className="text-stone-400 hover:text-red-700 p-1 rounded-sm transition-colors cursor-pointer"
                            title="Delete this entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-stone-850 font-serif text-sm line-clamp-2 mt-2 leading-relaxed">
                          "{entry.dreamText}"
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs font-sans mt-1">
                        <span className="bg-[#8B1A1A]/5 text-[#8B1A1A] border border-[#8B1A1A]/10 px-2 py-0.5 rounded-sm">
                          State: {entry.state}
                        </span>
                        <span className="bg-[#C4A35A]/5 text-[#C4A35A] border border-[#C4A35A]/10 px-2 py-0.5 rounded-sm">
                          {entry.timing}
                        </span>
                        <span className="bg-[#0A0F2E]/5 text-[#0A0F2E] border border-[#0A0F2E]/10 px-2 py-0.5 rounded-sm">
                          Feeling: {entry.feeling}
                        </span>
                        <span className="ml-auto font-mono text-[10px] text-[#8B1A1A] bg-[#8B1A1A]/10 px-1.5 py-0.5 rounded uppercase">
                          {entry.result.dream_type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* INPUT INPUT FORM */}
        <AnimatePresence mode="wait">
          {!result && !loading && (
            <motion.form 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              onSubmit={handleSubmit}
              className="bg-[#EFEAE0] border-2 border-[#C4A35A]/30 rounded-sm shadow-md overflow-hidden p-6 sm:p-8"
              id="dream-interpret-form"
            >
              <h2 className="text-[#8B1A1A] text-xl sm:text-2xl font-semibold mb-6 border-b border-[#C4A35A]/20 pb-3 flex items-center gap-2">
                <Eye className="w-5.5 h-5.5 stroke-[1.8]" />
                <span>Submit Your Dreaming Matrix</span>
              </h2>

              {/* THREE DROPDOWNS ROW */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                
                {/* Dropdown 1 */}
                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-wider text-stone-500 font-sans font-bold mb-1.5">
                    Your emotional state right now
                  </label>
                  <div className="relative">
                    <select
                      id="input-current-state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#C4A35A]/40 text-stone-800 py-2.5 px-3 rounded-none outline-none focus:border-[#8B1A1A] transition-colors cursor-pointer appearance-none text-sm font-sans"
                    >
                      <option value="At peace">At peace</option>
                      <option value="Anxious">Anxious</option>
                      <option value="Grieving">Grieving</option>
                      <option value="Hopeful">Hopeful</option>
                      <option value="Confused">Confused</option>
                      <option value="Grateful">Grateful</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#8B1A1A]">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Dropdown 2 */}
                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-wider text-stone-500 font-sans font-bold mb-1.5">
                    When did you dream this?
                  </label>
                  <div className="relative">
                    <select
                      id="input-dream-timing"
                      value={timing}
                      onChange={(e) => setTiming(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#C4A35A]/40 text-stone-800 py-2.5 px-3 rounded-none outline-none focus:border-[#8B1A1A] transition-colors cursor-pointer appearance-none text-sm font-sans"
                    >
                      <option value="Before Fajr">Before Fajr</option>
                      <option value="After Fajr">After Fajr</option>
                      <option value="During daytime sleep">During daytime sleep</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#8B1A1A]">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Dropdown 3 */}
                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-wider text-stone-500 font-sans font-bold mb-1.5">
                    How did you feel inside the dream?
                  </label>
                  <div className="relative">
                    <select
                      id="input-dream-feeling"
                      value={feeling}
                      onChange={(e) => setFeeling(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#C4A35A]/40 text-stone-800 py-2.5 px-3 rounded-none outline-none focus:border-[#8B1A1A] transition-colors cursor-pointer appearance-none text-sm font-sans"
                    >
                      <option value="Fearful">Fearful</option>
                      <option value="Peaceful">Peaceful</option>
                      <option value="Confused">Confused</option>
                      <option value="Joyful">Joyful</option>
                      <option value="Sad">Sad</option>
                      <option value="Neutral">Neutral</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#8B1A1A]">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>

              </div>

              {/* TEXTAREA DESC */}
              <div className="flex flex-col mb-6">
                <label className="text-xs uppercase tracking-wider text-stone-500 font-sans font-bold mb-1.5">
                  Describe your dream in detail
                </label>
                <textarea
                  id="input-dream-description"
                  value={dream}
                  onChange={(e) => setDream(e.target.value)}
                  placeholder="Describe your dream in detail — people, places, colours, symbols, emotions..."
                  className="w-full bg-[#FAF8F5] border-2 border-[#C4A35A]/40 font-serif text-stone-900 placeholder-stone-400 p-4 outline-none focus:border-[#8B1A1A] transition-colors leading-relaxed text-sm sm:text-base min-h-[160px] resize-y"
                  required
                />
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                id="dream-submit-btn"
                disabled={!dream.trim()}
                className="w-full bg-[#0A0F2E] hover:bg-[#121c4e] text-white hover:text-[#C4A35A] py-4 px-6 border-b-4 border-[#C4A35A] font-serif font-semibold tracking-wide transition-all shadow-md active:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed text-center block cursor-pointer"
              >
                <span className="text-base font-medium">Interpret My Dream — </span>
                <span className="text-lg font-bold font-serif ml-1" style={{ fontFamily: 'Amiri, serif' }}>
                  فَسِّرْ رُؤْيَايَ
                </span>
              </button>

              <div className="mt-4 text-center">
                <p className="text-[11px] text-stone-400 font-sans font-light">
                  Classical dream interpretation (Tabir) is a highly guarded, scholarly path. Please handle your results as spiritual alerts.
                </p>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* LOADING SCREEN */}
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[#EFEAE0] border-2 border-[#C4A35A]/30 rounded-sm py-16 px-6 text-center shadow-md flex flex-col items-center justify-center min-h-[350px]"
            >
              {/* Spinning crescent moon SVG */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4.5, ease: "linear" }}
                className="w-16 h-16 text-[#0A0F2E] mb-6"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
                  <path d="M12 3a9 9 0 1 0 9 9 1.76 1.76 0 0 1-9-9z" fill="currentColor" fillOpacity="0.15" />
                </svg>
              </motion.div>

              <h3 className="text-xl font-serif text-[#8B1A1A] font-medium mb-2">
                Consulting Ibn Sirin...
              </h3>
              <p className="text-stone-500 font-sans text-xs max-w-sm leading-relaxed font-light">
                Decrypting traditional Arabic symbology from 'Kitab al-Tabir' and configuring Jungian psychological shadow variables.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RESULTS PANEL */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
              id="dream-interpretation-result"
            >

              {/* DREAM SUMMARY HEADER ARDUINO-STYLE SHARP BOX */}
              <div className="bg-[#FAF8F5] border-2 border-[#8B1A1A] p-6 text-center rounded-sm shadow-sm relative">
                {/* Floating ribbon or decorative corners */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#8B1A1A] text-[#FAF8F5] px-4 py-0.5 text-[10px] uppercase font-sans tracking-widest font-bold">
                  Synthesized Ledger
                </div>

                {/* 1. Summary italic centered */}
                <p className="italic text-lg sm:text-xl text-stone-800 font-serif leading-relaxed max-w-3xl mx-auto mb-4">
                  "{result.summary}"
                </p>

                {/* 2. Dream type badge */}
                <div className="flex flex-col items-center justify-center gap-1.5 mt-2">
                  {result.dream_type === 'true_vision' && (
                    <span className="bg-[#C4A35A] text-white font-sans text-xs sm:text-sm uppercase font-semibold px-4 py-1 rounded-full shadow-xs tracking-wide">
                      رُؤْيا صَالِحَة &mdash; True Vision
                    </span>
                  )}
                  {result.dream_type === 'nafs_dream' && (
                    <span className="bg-sky-700 text-white font-sans text-xs sm:text-sm uppercase font-semibold px-4 py-1 rounded-full shadow-xs tracking-wide">
                      حَدِيثُ النَّفْس &mdash; Nafs Dream
                    </span>
                  )}
                  {result.dream_type === 'shaytan_dream' && (
                    <span className="bg-stone-500 text-white font-sans text-xs sm:text-sm uppercase font-semibold px-4 py-1 rounded-full shadow-xs tracking-wide">
                      Seek refuge: أَعُوذُ بِاللَّهِ
                    </span>
                  )}
                  
                  {/* Reason below badge */}
                  <span className="text-stone-500 text-xs italic max-w-xl text-center leading-relaxed font-sans mt-1">
                    {result.dream_type_reason}
                  </span>
                </div>
              </div>

              {/* TWO COLUMN LENSES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                
                {/* LEFT COLUMN: ISLAMIC LENS */}
                <div className="bg-[#FAF8F5] border-2 border-[#C4A35A]/60 rounded-sm p-6 sm:p-7 flex flex-col justify-between shadow-xs">
                  <div>
                    {/* Header */}
                    <div className="flex items-center gap-2 border-b border-[#C4A35A]/30 pb-3 mb-4">
                      <GraduationCap className="w-5.5 h-5.5 text-[#8B1A1A]" />
                      <div>
                        <span className="text-[10px] text-stone-400 font-sans uppercase font-bold tracking-wider block">
                          Classical Scholar Lens
                        </span>
                        <h3 className="text-xl font-serif text-[#8B1A1A] font-semibold">
                          The Islamic Tradition (Ibn Sirin)
                        </h3>
                      </div>
                    </div>

                    {/* Symbols as small maroon pills */}
                    <div className="mb-5">
                      <h4 className="text-xs uppercase tracking-wider text-stone-500 font-sans font-bold mb-2">
                        Dream Symbols (تَأْوِيل)
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.islamic.symbols?.map((item, idx) => (
                          <div 
                            key={idx} 
                            className="bg-[#8B1A1A]/10 border border-[#8B1A1A]/20 rounded-md p-2 text-stone-800"
                          >
                            <span className="font-mono text-xs font-bold text-[#8B1A1A] block mb-0.5">
                              {item.symbol}
                            </span>
                            <span className="text-xs font-serif leading-snug block">
                              {item.meaning}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Interpretation Paragraph */}
                    <div className="mb-5">
                      <h4 className="text-xs uppercase tracking-wider text-stone-500 font-sans font-bold mb-1.5">
                        Traditional Exegesis
                      </h4>
                      <p className="text-sm font-serif leading-relaxed text-stone-800 text-justify">
                        {result.islamic.interpretation}
                      </p>
                    </div>

                    {/* Surah Yusuf note */}
                    <div className="mb-6 p-3 bg-[#EFEAE0]/50 border-l-2 border-[#8B1A1A] text-stone-700 italic text-xs leading-relaxed font-sans">
                      <strong className="text-stone-800 font-semibold block mb-0.5 not-italic">
                        Relation to Yusuf (عَلَيْهِ السَّلَامُ):
                      </strong>
                      "{result.islamic.surah_yusuf}"
                    </div>
                  </div>

                  {/* Dua box centered */}
                  <div className="mt-auto bg-[#8B1A1A]/5 border border-[#8B1A1A]/20 p-4 rounded-sm">
                    <span className="text-[10px] text-[#8B1A1A] uppercase tracking-widest font-sans font-bold block text-center mb-1">
                      RECOMMENDED DHIKR &bull; دُعَاء
                    </span>
                    
                    <p 
                      className="text-[#8B1A1A] font-serif text-xl sm:text-2xl text-center py-2 font-bold leading-normal"
                      style={{ fontFamily: 'Amiri, Georgia, serif' }}
                    >
                      {result.islamic.dua?.arabic}
                    </p>
                    
                    <p className="text-stone-500 italic text-[11px] text-center font-mono leading-relaxed mt-1">
                      "{result.islamic.dua?.transliteration}"
                    </p>
                    
                    <p className="text-stone-700 text-xs font-sans text-center mt-2 leading-relaxed px-1">
                      <strong className="text-stone-800 font-semibold">Meaning:</strong> {result.islamic.dua?.meaning}
                    </p>
                    
                    <div className="mt-2 text-center text-[10px] text-stone-400 font-sans italic border-t border-[#8B1A1A]/10 pt-1.5">
                      Recitation: {result.islamic.dua?.when}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: JUNGIAN LENS */}
                <div className="bg-[#0A0F2E] border-2 border-[#C4A35A] rounded-sm p-6 sm:p-7 text-white flex flex-col justify-between shadow-xs">
                  <div>
                    {/* Header */}
                    <div className="flex items-center gap-2 border-b border-stone-700 pb-3 mb-4">
                      <Compass className="w-5.5 h-5.5 text-[#C4A35A]" />
                      <div>
                        <span className="text-[10px] text-[#C4A35A] font-sans uppercase font-bold tracking-wider block">
                          Depth Psychoanalysis
                        </span>
                        <h3 className="text-xl font-serif text-white font-semibold">
                          Jungian Theory (Unconscious Self)
                        </h3>
                      </div>
                    </div>

                    {/* Archetypes as navy-gold pills */}
                    <div className="mb-5">
                      <h4 className="text-xs uppercase tracking-wider text-stone-400 font-sans font-bold mb-2">
                        Active Archetypes
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.jungian.archetypes?.map((item, idx) => (
                          <div 
                            key={idx} 
                            className="bg-slate-900 border border-[#C4A35A]/30 rounded-md p-2"
                          >
                            <span className="font-mono text-xs font-bold text-[#C4A35A] block mb-0.5">
                              {item.archetype}
                            </span>
                            <span className="text-xs font-sans text-stone-300 leading-snug block">
                              {item.manifestation}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shadow Elements */}
                    <div className="mb-5">
                      <h4 className="text-xs uppercase tracking-wider text-stone-400 font-sans font-bold mb-1">
                        The Psychoanalytical Shadow (الظِّل)
                      </h4>
                      <p className="text-xs sm:text-sm font-mono text-stone-300 leading-relaxed bg-[#000]/30 p-3 rounded-none border border-stone-800">
                        {result.jungian.shadow}
                      </p>
                    </div>

                    {/* Unconscious Message */}
                    <div className="mb-5">
                      <h4 className="text-xs uppercase tracking-wider text-stone-400 font-sans font-bold mb-1.5">
                        Urgent Unconscious Manifest
                      </h4>
                      <p className="text-sm font-sans text-stone-200 leading-relaxed text-justify">
                        {result.jungian.unconscious_message}
                      </p>
                    </div>
                  </div>

                  {/* Individuation Insight */}
                  <div className="mt-auto p-4 bg-[#C4A35A]/10 border border-[#C4A35A]/30 text-[#C4A35A] italic text-xs leading-relaxed font-sans">
                    <strong className="text-white font-semibold block mb-0.5 not-italic uppercase font-sans tracking-wide">
                      Individuation Path (Self-Evolution):
                    </strong>
                    "{result.jungian.individuation}"
                  </div>
                </div>

              </div>

              {/* 4. SYNTHESIS FULL-WIDTH */}
              <div className="bg-[#FAF8F5] border border-stone-300 rounded-sm p-6 sm:p-8 space-y-6">
                <h3 className="text-xl font-serif text-[#8B1A1A] font-bold border-b border-stone-300 pb-3 flex items-center gap-2">
                  <Sparkles className="w-5.5 h-5.5 text-[#C4A35A]" />
                  <span>Sublime Synthesis: Convergence of Lenses</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Agreement (teal) */}
                  <div className="border-l-4 border-teal-600 pl-4 py-1">
                    <h4 className="text-sm uppercase font-sans font-bold text-teal-850 mb-1">
                      Dialectical Convergence (Harmonization)
                    </h4>
                    <p className="text-xs sm:text-sm font-serif leading-relaxed text-stone-700 text-justify">
                      {result.synthesis.agreement}
                    </p>
                  </div>

                  {/* Divergence (amber) */}
                  <div className="border-l-4 border-amber-500 pl-4 py-1">
                    <h4 className="text-sm uppercase font-sans font-bold text-amber-850 mb-1">
                      Structural Divergence (Paradigm Boundary)
                    </h4>
                    <p className="text-xs sm:text-sm font-serif leading-relaxed text-stone-700 text-justify">
                      {result.synthesis.divergence}
                    </p>
                  </div>
                </div>

                {/* Unified Wisdom (gold bg box) */}
                <div className="bg-[#C4A35A]/10 border-l-4 border-[#C4A35A] p-5 sm:p-6 mt-4 rounded-r shadow-xs">
                  <h4 className="text-sm font-sans font-bold text-[#8B1A1A] uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    <Sparkle className="w-4 h-4 text-[#C4A35A] fill-[#C4A35A]" />
                    <span>Unified Practical Wisdom</span>
                  </h4>
                  <p className="text-sm sm:text-base font-serif text-stone-850 leading-relaxed text-justify">
                    {result.synthesis.wisdom}
                  </p>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleSaveToJournal}
                  id="save-to-journal-btn"
                  className="flex-1 bg-[#8B1A1A] hover:bg-[#a12323] text-white py-3.5 px-6 border-b-4 border-[#5E1010] font-sans text-stone-100 hover:text-white font-semibold transition-all rounded shadow cursor-pointer text-center flex items-center justify-center gap-2"
                >
                  <Bookmark className="w-4.5 h-4.5" />
                  <span>Save to Dream Journal</span>
                </button>

                <button
                  onClick={handleReset}
                  id="interpret-another-btn"
                  className="flex-1 bg-[#FAF8F5] hover:bg-[#EFEAE0] text-stone-800 py-3.5 px-6 border border-stone-400 font-sans font-semibold transition-all rounded shadow cursor-pointer text-center flex items-center justify-center gap-2"
                >
                  <Eye className="w-4.5 h-4.5" />
                  <span>Interpret Another Dream</span>
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
