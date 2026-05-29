import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, ShieldCheck, Scale, ArrowRight, BookOpen, 
  RotateCcw, Save, AlertCircle, Bookmark, Compass, Award 
} from 'lucide-react';

interface MaqasidAnalyzerProps {
  currentTheme: 'parchment' | 'space';
  onBackToLanding: () => void;
}

interface MaqasidDetail {
  arabic: string;
  english: string;
  analysis: string;
  verdict: 'permissible' | 'impermissible' | 'disputed';
  evidence: string;
}

interface AnalysisResult {
  summary: string;
  maqasid: {
    deen: MaqasidDetail;
    nafs: MaqasidDetail;
    aql: MaqasidDetail;
    nasl: MaqasidDetail;
    maal: MaqasidDetail;
  };
  utilitarian: string;
  deontological: string;
  convergence: string;
  divergence: string;
  ruling: string;
  confidence: 'strong' | 'moderate' | 'weak';
}

const EXAMPLES = [
  "Is AI sentience morally significant in Islam?",
  "Should Muslims vote in secular elections?",
  "Is cryptocurrency halal?",
  "Climate change — Islamic obligation or optional?"
];

export default function MaqasidAnalyzer({ currentTheme, onBackToLanding }: MaqasidAnalyzerProps) {
  const [dilemma, setDilemma] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('albab_maqasid_saved');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExampleClick = (ex: string) => {
    setDilemma(ex);
    setError(null);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dilemma.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/labs/maqasid-analyzer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dilemma: dilemma.trim() })
      });

      if (!response.ok) {
        throw new Error(`Server diagnostic returned status ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setResult(data.result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    const newSave = {
      id: `maq_${Date.now()}`,
      dilemma,
      result,
      timestamp: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    };
    const updated = [newSave, ...savedAnalyses];
    setSavedAnalyses(updated);
    localStorage.setItem('albab_maqasid_saved', JSON.stringify(updated));
    showNotification('Analysis saved securely to the University local annals!');
  };

  const handleReset = () => {
    setDilemma('');
    setResult(null);
    setError(null);
  };

  const totalObjectives = [
    { key: 'deen', label: 'Deen', color: 'bg-[#8B1A1A]' },
    { key: 'nafs', label: 'Nafs', color: 'bg-[#C4A35A]' },
    { key: 'aql', label: 'Aql', color: 'bg-[#1E3A8A]' },
    { key: 'nasl', label: 'Nasl', color: 'bg-[#059669]' },
    { key: 'maal', label: 'Maal', color: 'bg-[#D97706]' }
  ];

  return (
    <div 
      className="min-h-screen pb-20 pt-0 font-sans text-[#1A1A1A] selection:bg-[#8B1A1A]/10 text-left"
      style={{ backgroundColor: '#F5F0E8' }}
    >
      {/* MAROON HEADER BOX */}
      <header className="relative pt-36 sm:pt-40 pb-12 px-6 md:px-12 text-center bg-[#8B1A1A] border-b border-[#C4A35A]/30 overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        <div className="max-w-4xl mx-auto space-y-4 relative z-10 flex flex-col items-center">
          <button 
            onClick={onBackToLanding}
            className="absolute top-28 sm:top-32 left-6 text-white/70 hover:text-white transition-colors duration-200 text-xs font-mono uppercase tracking-widest flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-sm border border-white/10 hover:bg-white/20 select-none cursor-pointer"
          >
            ← Back to Campus
          </button>

          <div className="flex justify-center items-center gap-3 mb-3">
            <div className="h-[1px] w-8 opacity-60 bg-white"></div>
            <span className="font-mono text-[10px] sm:text-xs tracking-[0.25em] text-[#C4A35A] uppercase font-bold text-center">AL-MAQASID SHARIAH ANALYZER</span>
            <div className="h-[1px] w-8 opacity-60 bg-white"></div>
          </div>

          {/* ARABIC CALLIGRAPHY ACCENT */}
          <span 
            className="block text-[#C4A35A] antialiased tracking-wide font-serif mb-2 select-none font-bold"
            style={{ fontFamily: 'Amiri, Georgia, serif', fontSize: '2.5rem', lineHeight: '1.2' }}
            dir="rtl"
          >
            مَقَاصِدُ الشَّرِيعَة
          </span>

          <h1 className="font-serif font-black text-2xl sm:text-3.5xl text-white tracking-wide leading-tight uppercase font-extrabold text-center">
            Maqasid Ethical Analyzer
          </h1>
          
          <p className="text-stone-200 text-xs sm:text-sm max-w-2xl font-serif italic tracking-wide text-center">
            Analyze any modern dilemma through the 5 essential objectives of Islamic Law.
          </p>
        </div>
      </header>

      {/* TOAST NOTIFICATION CONTAINER */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-28 left-1/2 -translate-x-1/2 z-50 bg-[#8B1A1A] text-white border border-[#C4A35A]/50 px-6 py-3.5 rounded-sm shadow-2xl flex items-center gap-3 text-xs font-mono tracking-wider uppercase"
          >
            <Sparkles className="h-4 w-4 text-[#C4A35A] animate-pulse" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 mt-10">
        <AnimatePresence mode="wait">
          
          {/* DILEMMA INPUT VIEW */}
          {!loading && !result && (
            <motion.div 
              id="analysis-form-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-[#FAF8F5] border border-[#8B1A1A]/10 rounded-sm p-6 sm:p-10 shadow-lg space-y-8"
            >
              <div className="space-y-3">
                <span className="text-[10px] font-mono tracking-[0.25em] text-[#8B1A1A] font-bold block uppercase">
                  Select a Dilemma or Write Your Own
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {EXAMPLES.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => handleExampleClick(ex)}
                      type="button"
                      className={`text-[11px] font-mono tracking-wide px-3.5 py-2.5 rounded-sm border transition-all duration-300 pointer-events-auto cursor-pointer text-left leading-relaxed max-w-full sm:max-w-md ${
                        dilemma === ex 
                          ? 'bg-[#8B1A1A] text-white border-transparent shadow-md font-bold' 
                          : 'bg-white text-stone-700 border-stone-250 hover:border-[#8B1A1A] hover:bg-stone-50'
                      }`}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAnalyze} className="space-y-6">
                <div className="space-y-2">
                  <label 
                    htmlFor="dilemma-textarea" 
                    className="font-mono text-[10px] font-black uppercase tracking-[0.15em] text-[#8B1A1A] block"
                  >
                    DESCRIBE YOUR ETHICAL DILEMMA
                  </label>
                  <textarea
                    id="dilemma-textarea"
                    required
                    rows={5}
                    placeholder="Type any modern ethical question, scenario, or dilemma..."
                    value={dilemma}
                    onChange={(e) => {
                      setDilemma(e.target.value);
                      setError(null);
                    }}
                    style={{ minHeight: '130px' }}
                    className="w-full bg-white border border-[#8B1A1A]/15 focus:border-[#8B1A1A] focus:ring-1 focus:ring-[#8B1A1A] rounded-sm p-4 font-serif text-sm sm:text-base leading-relaxed outline-none shadow-inner transition-colors duration-300"
                  />
                </div>

                {error && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-sm flex items-start gap-3 text-xs sm:text-sm">
                    <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold font-mono uppercase block text-[11px] mb-1">Analysis Aborted</span>
                      {error}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!dilemma.trim()}
                  className={`w-full py-4 bg-[#8B1A1A] text-white hover:bg-black font-mono text-xs uppercase tracking-[0.2em] font-black rounded-sm border border-[#C4A35A]/45 cursor-pointer select-none transition-all duration-300 shadow flex items-center justify-center gap-2.5 ${
                    !dilemma.trim() ? 'opacity-50 cursor-not-allowed bg-stone-450' : ''
                  }`}
                >
                  <span>Analyze through Maqasid — تَحْلِيلٌ</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* ARCHIVED ANALYSES (IF ANY) */}
              {savedAnalyses.length > 0 && (
                <div className="border-t border-stone-200 pt-8 mt-4 space-y-4">
                  <h3 className="font-serif font-black text-sm uppercase tracking-wider text-[#8B1A1A] flex items-center gap-2">
                    <Bookmark className="h-4 w-4 text-[#C4A35A]" />
                    <span>Your Previous Saved Scribe Determinations</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {savedAnalyses.map((item, idx) => (
                      <button
                        key={item.id || idx}
                        onClick={() => {
                          setDilemma(item.dilemma);
                          setResult(item.result);
                          setError(null);
                        }}
                        className="p-4 bg-white hover:bg-[#FAF8F5] border border-stone-200 hover:border-[#8B1A1A]/30 rounded-sm text-left transition-all duration-200 cursor-pointer pointer-events-auto flex justify-between items-start gap-4 shadow-sm"
                      >
                        <div className="space-y-1">
                          <p className="font-serif font-bold text-xs sm:text-sm text-stone-850 line-clamp-2 italic">
                            "{item.dilemma}"
                          </p>
                          <p className="font-mono text-[9px] text-stone-400">
                            Saved on {item.timestamp}
                          </p>
                        </div>
                        <span className={`text-[9px] font-mono font-bold uppercase py-0.5 px-2 rounded-sm ${
                          item.result.confidence === 'strong' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {item.result.confidence}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* LOADING SCREEN WITH SEQUENTIAL ANIMATIONS */}
          {loading && (
            <motion.div 
              id="maqasid-loading-view"
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[#FAF8F5] border border-[#8B1A1A]/10 rounded-sm p-12 text-center shadow-lg space-y-10 py-16 flex flex-col items-center justify-center min-h-[400px]"
            >
              <div className="space-y-3">
                <Compass className="h-10 w-10 text-[#8B1A1A] animate-spin mx-auto mb-2" />
                <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-[#8B1A1A] font-black">
                  Activating Maqasid Synthesis Engine
                </h3>
                <p className="font-serif text-stone-500 text-sm italic max-w-sm mx-auto">
                  Dividing legal values as mapped in Shatibi and Ghazali archives...
                </p>
              </div>

              {/* 5 SEQUENTIAL ANIMATING CIRCLES (PULSING LEFT TO RIGHT) */}
              <div className="space-y-4">
                <div className="flex justify-center items-center gap-4">
                  {totalObjectives.map((obj, i) => (
                    <motion.div
                      key={obj.key}
                      className="flex flex-col items-center gap-2"
                      initial={{ scale: 0.8 }}
                      animate={{ 
                        scale: [0.8, 1.25, 0.8],
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity, 
                        delay: i * 0.25,
                        ease: "easeInOut"
                      }}
                    >
                      <div className={`h-7 w-7 rounded-full ${obj.color} shadow-md border border-[#FAF8F5] flex items-center justify-center`} />
                    </motion.div>
                  ))}
                </div>

                {/* LABELS BELOW */}
                <div className="flex justify-center items-center gap-[30px] pt-1">
                  {totalObjectives.map((obj) => (
                    <span 
                      key={obj.key}
                      className="text-[9px] font-mono tracking-wider text-stone-550 uppercase font-black w-7 text-center"
                    >
                      {obj.label}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* RESULT DATA VIEW */}
          {!loading && result && (
            <motion.div 
              id="analysis-results-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              
              {/* SUMMARY HIGHLIGHT CARD */}
              <div className="bg-[#FAF8F5] border border-[#8B1A1A]/10 rounded-sm p-6 sm:p-8 shadow text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B1A1A] via-[#C4A35A] to-[#8B1A1A]" />
                <span className="text-[10px] font-mono tracking-[0.2em] text-[#8B1A1A] uppercase font-bold block mb-2.5">
                  Dilemma Restatement
                </span>
                <p className="font-serif italic font-semibold text-[#1A1A1A] text-lg sm:text-xl leading-relaxed max-w-3xl mx-auto">
                  "{result.summary}"
                </p>
              </div>

              {/* 5 MAQASID CARDS GRID */}
              <div className="space-y-3">
                <h3 className="font-mono text-[10px] uppercase font-black tracking-[0.2em] text-[#8B1A1A]">
                  Traditional Jurisprudential Lenses — الْأَقْسَامُ الْخَمْسَة
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(result.maqasid).map(([key, details]) => {
                    const mappedDetails = details as MaqasidDetail;
                    return (
                      <div 
                        key={key}
                        className="bg-white border-t-[3px] border-t-[#8B1A1A] border-l border-r border-b border-stone-200 p-5 rounded-r-md rounded-b-md shadow-sm xl:p-6 flex flex-col justify-between gap-4"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-baseline border-b border-stone-100 pb-2">
                            <div>
                              <span 
                                className="font-serif font-black block text-[#8B1A1A] text-lg leading-tight"
                                style={{ fontFamily: 'Amiri, Georgia, serif' }}
                              >
                                {mappedDetails.arabic}
                              </span>
                              <span className="text-[11px] font-mono tracking-wide text-stone-500 uppercase">
                                {mappedDetails.english}
                              </span>
                            </div>

                            {/* VERDICT BADGE */}
                            <span className={`text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-full border shrink-0 ${
                              mappedDetails.verdict === 'permissible' 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-250' 
                                : mappedDetails.verdict === 'impermissible'
                                ? 'bg-rose-50 text-rose-800 border-rose-250'
                                : 'bg-amber-50 text-amber-800 border-amber-250'
                            }`}>
                              {mappedDetails.verdict === 'permissible' && 'Permissible — جَائِزٌ'}
                              {mappedDetails.verdict === 'impermissible' && 'Impermissible — مَمْنُوعٌ'}
                              {mappedDetails.verdict === 'disputed' && 'Disputed — مُخْتَلَفٌ فِيهِ'}
                            </span>
                          </div>

                          <p className="text-[13px] text-stone-700 leading-relaxed font-serif">
                            {mappedDetails.analysis}
                          </p>
                        </div>

                        {mappedDetails.evidence && (
                          <div className="bg-stone-50 p-2.5 rounded-sm border border-stone-150 relative">
                            <p className="text-[11px] text-stone-550 italic leading-normal font-serif">
                              {mappedDetails.evidence}
                            </p>
                            <BookOpen className="h-3.5 w-3.5 text-[#C4A35A] absolute right-2.5 bottom-2 opacity-30" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* COMPARISON TABLE */}
              <div className="space-y-3">
                <h3 className="font-mono text-[10px] uppercase font-black tracking-[0.2em] text-[#8B1A1A]">
                  Compartal Ethics Contrast Board — الْأَخْلَاقُ الْمُقَارَنَةُ
                </h3>
                
                <div className="overflow-hidden border border-stone-250 rounded-sm shadow-sm bg-white">
                  <table className="w-full text-xs font-serif border-collapse">
                    <thead>
                      <tr className="bg-[#FAF8F5] border-b border-stone-250 text-stone-700 font-mono text-[10px] uppercase tracking-wider">
                        <th className="px-4 py-3.5 text-left font-black w-1/2 border-r border-stone-200">
                          Western Ethics Systems
                        </th>
                        <th className="px-4 py-3.5 text-left font-black w-1/2">
                          Islamic Legal Objectives Position
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      
                      {/* ROW 1: UTILITARIAN vs RULING */}
                      <tr>
                        <td className="px-4 py-3 border-r border-stone-200 leading-relaxed text-stone-750">
                          <span className="font-mono text-[9px] text-[#8B1A1A] block uppercase font-bold tracking-wider mb-0.5">
                            Utilitarian perspective (Consecution)
                          </span>
                          {result.utilitarian}
                        </td>
                        <td className="px-4 py-3 leading-relaxed text-stone-750">
                          <span className="font-mono text-[9px] text-[#C4A35A] block uppercase font-bold tracking-wider mb-0.5">
                            Unified Juristic Ruling (daleel based)
                          </span>
                          {result.ruling}
                        </td>
                      </tr>

                      {/* ROW 2: DEONTOLOGICAL vs RULING */}
                      <tr>
                        <td className="px-4 py-3 border-r border-stone-200 leading-relaxed text-stone-750">
                          <span className="font-mono text-[9px] text-[#8B1A1A] block uppercase font-bold tracking-wider mb-0.5">
                            Deontological perspective (Kantian Duty)
                          </span>
                          {result.deontological}
                        </td>
                        <td className="px-4 py-3 leading-relaxed text-stone-750">
                          <span className="font-mono text-[9px] text-[#C4A35A] block uppercase font-bold tracking-wider mb-0.5">
                            Unified Juristic Ruling (daleel based)
                          </span>
                          {result.ruling}
                        </td>
                      </tr>

                      {/* ROW 3: CONVERGENCE vs DIVERGENCE */}
                      <tr>
                        <td className="px-4 py-4 bg-teal-50/40 text-[#0f5132] border-r border-stone-200 border-b border-b-teal-150 leading-relaxed">
                          <span className="font-mono text-[9px] text-teal-850 block uppercase font-black tracking-wider mb-1">
                            Convergence point (Harmonious Agreement)
                          </span>
                          {result.convergence}
                        </td>
                        <td className="px-4 py-4 bg-amber-50/40 text-[#664d03] border-b border-b-amber-150 leading-relaxed">
                          <span className="font-mono text-[9px] text-amber-850 block uppercase font-black tracking-wider mb-1">
                            Divergence interface (Principled Departure)
                          </span>
                          {result.divergence}
                        </td>
                      </tr>

                    </tbody>
                  </table>
                </div>
              </div>

              {/* FINAL RULING BOX */}
              <div className="border border-[#8B1A1A] rounded-sm p-6 sm:p-8 bg-amber-50/10 relative overflow-hidden space-y-4">
                <div className="absolute top-0 right-0 py-1.5 px-3 bg-[#C4A35A]/15 text-stone-800 rounded-bl-sm border-l border-b border-[#C4A35A]/30">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[9px] uppercase tracking-wider font-bold">
                      Confidence Level:
                    </span>
                    <span className={`text-[10px] uppercase font-bold font-mono ${
                      result.confidence === 'strong' 
                        ? 'text-emerald-700' 
                        : result.confidence === 'moderate'
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }`}>
                      {result.confidence}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 border-b border-[#C4A35A]/15 pb-2.5">
                  <span className="font-mono text-[10px] tracking-[0.25em] text-[#8B1A1A] uppercase font-black block">
                    Adjudicated Shariah Verdict — نَتِيجَةُ الْحُكْمِ الْكُلِّيِّ
                  </span>
                  <h2 className="font-serif text-[#8B1A1A] font-bold text-xl sm:text-2xl leading-none">
                    Unified Shariah Determinate Framework
                  </h2>
                </div>

                {/* LARGE SERIF CORMORANT/AMIRI FEEL */}
                <p 
                  className="leading-relaxed text-[#1A1A1A] text-base sm:text-lg"
                  style={{ fontFamily: 'Cormorant Garamond, Amiri, Georgia, serif', fontWeight: 500 }}
                >
                  {result.ruling}
                </p>
              </div>

              {/* ACTION COMMAND BAR */}
              <div className="flex flex-wrap items-center gap-3.5 pt-4">
                
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-[#8B1A1A] text-white hover:bg-black font-mono text-xs uppercase tracking-[0.15em] font-bold px-5 py-3.5 rounded-sm border border-[#C4A35A]/40 transition-all duration-300 shadow cursor-pointer uppercase select-none pointer-events-auto"
                >
                  <Save className="h-4 w-4 text-[#C4A35A]" />
                  <span>Save Determination Document</span>
                </button>

                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 bg-transparent text-stone-750 hover:bg-white border border-stone-250 font-mono text-xs uppercase tracking-[0.15em] font-bold px-5 py-3.5 rounded-sm transition-all duration-300 cursor-pointer select-none pointer-events-auto"
                >
                  <RotateCcw className="h-4 w-4 text-stone-500" />
                  <span>Analyze Another Dilemma</span>
                </button>

              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
