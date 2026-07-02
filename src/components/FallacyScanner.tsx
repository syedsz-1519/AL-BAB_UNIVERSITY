import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, Search, HelpCircle, Sparkles, Check, 
  AlertTriangle, Save, RotateCcw, ArrowLeft, Trash2, BookOpen
} from 'lucide-react';

interface FallacyItem {
  id: number;
  classical_name: string;
  classical_category: string;
  modern_name: string;
  quote: string;
  explanation: string;
  severity: 'fatal' | 'weakening' | 'minor';
  correction: string;
}

interface MantiqPrinciple {
  arabic: string;
  explanation: string;
}

interface ScanResult {
  summary: string;
  quality: 'strong' | 'moderate' | 'weak' | 'fallacious';
  assessment: string;
  fallacies: FallacyItem[];
  valid_points: string[];
  corrected: string;
  mantiq_principle: MantiqPrinciple;
}

interface SavedReport {
  id: string;
  date: string;
  argumentText: string;
  result: ScanResult;
}

interface FallacyScannerProps {
  currentTheme: 'parchment' | 'space';
  onBackToLanding: () => void;
}

const PRESETS = [
  {
    label: "Slippery Slope",
    text: "Music is haram because it leads to sin, sin leads to kufr, so music leads to kufr."
  },
  {
    label: "Appeal to Authority",
    text: "This great scholar said X therefore X is true."
  },
  {
    label: "Ad Absurdum",
    text: "If we allow this, soon everything will be allowed."
  }
];

export default function FallacyScanner({ currentTheme, onBackToLanding }: FallacyScannerProps) {
  const [argumentText, setArgumentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [jsonError, setJsonError] = useState<boolean>(false);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [showSavedList, setShowSavedList] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load saved fallacy scan reports on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('albab_fallacies_saved');
      if (saved) {
        setSavedReports(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load saved fallacy reports:', e);
    }
  }, []);

  const handleTextChange = (text: string) => {
    if (text.length <= 2000) {
      setArgumentText(text);
      if (errorStatus && text.trim().length >= 50) {
        setErrorStatus(null);
      }
    }
  };

  const handleSelectExample = (text: string) => {
    setArgumentText(text);
    setErrorStatus(null);
    setResult(null);
    setJsonError(false);
  };

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = argumentText.trim();
    
    // Validation constraint
    if (trimmed.length < 50) {
      setErrorStatus("The scholarly argument must be at least 50 characters long to execute a valid syllogistic scan.");
      return;
    }

    setLoading(true);
    setErrorStatus(null);
    setResult(null);
    setJsonError(false);

    try {
      const response = await fetch('/api/labs/fallacy/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ argument: trimmed })
      });

      if (!response.ok) {
        const errPayload = await response.json().catch(() => ({}));
        throw new Error(errPayload.error || "API call unsuccessful");
      }

      const data = await response.json();
      if (data && data.result) {
        setResult(data.result);
      } else {
        throw new Error("Invalid schema received");
      }
    } catch (err: any) {
      console.error("Scanner exception:", err);
      setErrorStatus(err?.message || "An unexpected dynamic error occurred inside the Fallacy Scanner laboratory.");
      setJsonError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = () => {
    if (!result || !argumentText.trim()) return;

    try {
      const newEntry: SavedReport = {
        id: Math.random().toString(36).substring(2, 9),
        date: new Date().toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        argumentText: argumentText,
        result
      };

      const updated = [newEntry, ...savedReports];
      setSavedReports(updated);
      localStorage.setItem('albab_fallacies_saved', JSON.stringify(updated));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save fallacy report:', err);
    }
  };

  const handleDeleteReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this fallacy report?')) return;

    const filtered = savedReports.filter(entry => entry.id !== id);
    setSavedReports(filtered);
    localStorage.setItem('albab_fallacies_saved', JSON.stringify(filtered));
  };

  const handleLoadReport = (entry: SavedReport) => {
    setArgumentText(entry.argumentText);
    setResult(entry.result);
    setJsonError(false);
    setErrorStatus(null);
    setShowSavedList(false);
  };

  const handleResetScanner = () => {
    setArgumentText('');
    setResult(null);
    setJsonError(false);
    setErrorStatus(null);
  };

  // Badge mapping for argument quality
  const getQualityBadgeDetails = (quality: 'strong' | 'moderate' | 'weak' | 'fallacious') => {
    switch (quality) {
      case 'strong':
        return {
          label: "Logically Sound — سَلِيمٌ",
          containerClass: "bg-emerald-100 text-emerald-800 border-emerald-300 font-serif"
        };
      case 'moderate':
        return {
          label: "Needs Strengthening — يَحْتَاجُ",
          containerClass: "bg-amber-100 text-[#B06000] border-amber-300 font-serif"
        };
      case 'weak':
        return {
          label: "Significant Weaknesses — ضَعِيفٌ",
          containerClass: "bg-orange-100 text-orange-850 border-orange-300 font-serif"
        };
      case 'fallacious':
        return {
          label: "Fallacious — مُغَالَطٌ",
          containerClass: "bg-red-100 text-[#0B4628] border-red-350 font-serif"
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-stone-900 pb-16 font-serif select-text">
      {/* Dynamic Keyframe style block for `ti-search` left-to-right translation and animation */}
      <style>{`
        @keyframes slideSearch {
          0% { transform: translateX(-40px); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateX(40px); opacity: 0; }
        }
        .ti-search-anim {
          animation: slideSearch 2s infinite linear;
        }
      `}</style>

      {/* HEADER HERO COVER */}
      <div 
        className="relative bg-[#0B4628] text-white pt-36 sm:pt-40 pb-14 px-6 overflow-hidden border-b-2 border-[#C4A35A] flex flex-col items-center text-center shadow-lg"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1.2px, transparent 1.2px)',
          backgroundSize: '20px 20px'
        }}
      >
        {/* Back navigation button */}
        <button 
          onClick={onBackToLanding}
          className="absolute top-28 sm:top-32 left-6 flex items-center gap-2 text-stone-300 hover:text-[#C4A35A] transition-colors font-mono text-xs uppercase bg-[#000]/30 py-1.5 px-3.5 rounded border border-stone-600/30 cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Campus</span>
        </button>

        {/* Saved archive directory toggle */}
        <button 
          onClick={() => setShowSavedList(!showSavedList)}
          className="absolute top-28 sm:top-32 right-6 flex items-center gap-2 text-stone-300 hover:text-[#C4A35A] transition-colors font-mono text-xs uppercase bg-[#000]/20 hover:border-[#C4A35A] py-1.5 px-3.5 rounded border border-stone-600/30 cursor-pointer shadow-md"
        >
          <BookOpen className="w-4 h-4 text-[#C4A35A]" />
          <span>Scans Journal ({savedReports.length})</span>
        </button>

        <div className="max-w-2xl mt-4 flex flex-col items-center">
          <div className="flex justify-center items-center gap-3 mb-3">
            <div className="h-[1px] w-8 opacity-60 bg-white"></div>
            <span className="font-mono text-[10px] sm:text-xs tracking-[0.25em] text-[#C4A35A] uppercase font-bold text-center">AL-MANTIQ COGNITIVE LAB</span>
            <div className="h-[1px] w-8 opacity-60 bg-white"></div>
          </div>

          <span className="font-arabic text-3xl sm:text-4xl md:text-5xl text-[#C4A35A] block mb-2 font-bold tracking-wide leading-none select-none" style={{ fontFamily: 'Amiri, Georgia, serif' }} dir="rtl">
            كَاشِفُ الْمُغَالَطَات
          </span>
          <h1 className="text-2xl sm:text-3.5xl font-serif tracking-normal mb-2 text-white font-black cormorant leading-tight">
            Logical Fallacy Scanner
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm max-w-xl mx-auto font-sans font-light leading-relaxed text-center">
            Test any Islamic argument with classical Mantiq and modern critical thinking
          </p>
        </div>
      </div>

      {/* CONTAINER */}
      <div className="max-w-4xl mx-auto px-4 mt-8">

        {/* ARCHIVED REPORTS OVERLAY / MODAL LIST */}
        <AnimatePresence>
          {showSavedList && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#EFEAE0] border-2 border-[#C4A35A]/50 p-6 rounded-sm mb-8 shadow-md"
            >
              <div className="flex justify-between items-center border-b border-[#C4A35A]/30 pb-3 mb-4">
                <h3 className="text-lg font-serif font-bold text-[#0B4628] flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-[#C4A35A]" />
                  <span>Scribe Analytical Archives</span>
                </h3>
                <button 
                  onClick={() => setShowSavedList(false)}
                  className="font-mono text-xs uppercase hover:text-[#0B4628] transition-colors cursor-pointer border border-stone-400/40 px-3 py-1 rounded bg-[#FAF8F5]"
                >
                  Close
                </button>
              </div>

              {savedReports.length === 0 ? (
                <div className="text-center py-10 text-stone-500">
                  <HelpCircle className="w-10 h-10 stroke-[1.2] mx-auto text-[#C4A35A] opacity-60 mb-3" />
                  <p className="font-sans text-xs">No logical scan rolls have been filed yet.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {savedReports.map((rec) => (
                    <div 
                      key={rec.id}
                      onClick={() => handleLoadReport(rec)}
                      className="bg-[#FAF8F5] border border-[#C4A35A]/30 hover:border-[#0B4628]/70 p-4 rounded-sm shadow-xs cursor-pointer transition-all flex flex-col gap-2 group"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-[10px] text-stone-400 tracking-wide">
                          Saved: {rec.date}
                        </span>
                        <button 
                          onClick={(e) => handleDeleteReport(rec.id, e)}
                          className="text-stone-400 hover:text-[#0B4628] p-0.5 rounded cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-stone-800 font-serif text-sm italic line-clamp-2 leading-relaxed">
                        "{rec.argumentText}"
                      </p>
                      <div className="flex items-center justify-between border-t border-stone-200/50 pt-2 mt-1">
                        <span className={`text-[10px] font-sans font-bold uppercase rounded px-2 py-0.5 border ${getQualityBadgeDetails(rec.result.quality)?.containerClass}`}>
                          {rec.result.quality}
                        </span>
                        <span className="font-mono text-[10px] text-[#0B4628] hover:underline font-bold">
                          Load analysis &rarr;
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* INPUT ARGUMENT FORM CONTAINER */}
        <AnimatePresence mode="wait">
          {!result && !loading && (
            <motion.form 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              onSubmit={handleScanSubmit}
              className="bg-[#EFEAE0] border-2 border-[#C4A35A]/30 rounded-sm shadow-md p-6 sm:p-8"
              id="fallacy-scanner-form"
            >
              <h2 className="text-[#0B4628] text-xl font-serif font-bold mb-5 border-b border-[#C4A35A]/20 pb-3 flex items-center gap-2">
                <ShieldAlert className="w-5.5 h-5.5 text-[#C4A35A]" />
                <span>Submit Syllogism for Inspection</span>
              </h2>

              {/* THREE EXAMPLE CHIPS ROW */}
              <div className="mb-6">
                <span className="block text-[11px] font-mono tracking-wider text-stone-500 uppercase font-bold mb-2">
                  Select a classic argument to evaluate:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectExample(p.text)}
                      className="text-left bg-[#FAF8F5] hover:bg-[#FAF8F5]/80 active:bg-stone-200/20 px-3 py-3 rounded border border-stone-300 font-serif text-xs leading-relaxed transition-all text-stone-700 cursor-pointer shadow-xs group"
                    >
                      <div className="font-mono text-[9px] uppercase tracking-wider font-bold text-[#0B4628] group-hover:text-[#C4A35A] mb-1">
                        {p.label}
                      </div>
                      <span className="italic">"{p.text}"</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* MONOSPACE TEXTAREA */}
              <div className="flex flex-col mb-4">
                <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase font-bold mb-1.5" htmlFor="input-mantiq-argument">
                  Paste Scholarly Syllogism/Argument
                </label>
                <div className="relative">
                  <textarea
                    id="input-mantiq-argument"
                    value={argumentText}
                    onChange={(e) => handleTextChange(e.target.value)}
                    placeholder="Paste any Islamic argument, fatwa claim, or religious social media post..."
                    className="w-full min-h-[190px] p-4 bg-[#FAF8F5] border-2 border-[#C4A35A]/30 font-mono text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:border-[#0B4628] focus:ring-0 outline-none transition-colors leading-relaxed"
                    maxLength={2000}
                    required
                  />
                  {/* Character Counter */}
                  <div className="absolute bottom-3 right-3 text-[10px] font-mono font-bold text-stone-450 bg-[#FAF8F5]/90 px-1 border border-stone-200 rounded">
                    {argumentText.length} / 2000
                  </div>
                </div>
              </div>

              {/* INLINE ERROR DISPLAY */}
              {errorStatus && (
                <div className="bg-orange-50 border border-orange-200 text-orange-800 p-3 text-xs mb-4 rounded-sm flex items-start gap-2.5 leading-relaxed font-sans">
                  <AlertTriangle className="w-4.5 h-4.5 text-[#B06000] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Validation Error:</span> {errorStatus}
                  </div>
                </div>
              )}

              {/* ACTION SUBMIT BUTTON */}
              <button
                type="submit"
                id="sumbit-scan-btn"
                disabled={argumentText.trim().length === 0}
                className="w-full bg-[#0B4628] hover:bg-[#105C35] text-stone-100 hover:text-white py-3.5 px-6 border-b-4 border-[#052C18] font-sans font-bold tracking-wider transition-all shadow active:translate-y-px disabled:opacity-40 disabled:cursor-not-allowed select-none text-center cursor-pointer flex items-center justify-center gap-2 uppercase text-sm"
              >
                <span>Scan for Fallacies — افْحَصِ الْحُجَّةَ</span>
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* LOADING BOX AND ANIMATED TRANSLATION SEARCH */}
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[#EFEAE0] border-2 border-[#C4A35A]/30 rounded-sm py-16 px-6 text-center shadow-md flex flex-col items-center justify-center min-h-[300px]"
            >
              <div className="relative w-44 h-12 bg-stone-100 border border-stone-300 rounded mb-6 flex items-center justify-center overflow-hidden">
                <div className="absolute top-0 bottom-0 left-2 right-2 border-b border-stone-300/65 flex items-center justify-between pointer-events-none">
                  <span className="text-[8px] font-mono text-stone-300">[</span>
                  <span className="text-[8px] font-mono text-stone-300">]</span>
                </div>
                {/* Searching transition */}
                <div className="ti-search-anim absolute text-[#0B4628]">
                  <Search className="w-7 h-7" />
                </div>
              </div>

              <h3 className="text-lg font-serif font-bold text-[#0B4628] mb-1">
                Scanning with classical Mantiq...
              </h3>
              <p className="text-stone-500 font-sans text-xs max-w-sm leading-relaxed font-light">
                Classifying premises, checking for verbal sophistry (Mughalata fi al-Lafz) and conceptual inconsistencies (Mughalata fi al-Ma'na).
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RELIABLE JSON PARSE RETRY ERROR COMPONENT */}
        {jsonError && (
          <div className="bg-red-50 border border-red-200 text-red-900 p-6 rounded shadow-sm text-center font-sans space-y-4">
            <AlertTriangle className="w-12 h-12 text-[#0B4628] mx-auto opacity-80" />
            <h3 className="text-lg font-bold font-serif text-[#0B4628]">Logical Parse Suspension</h3>
            <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
              We encountered a disruption compiling the scholarly JSON ledger from our mantiq engine. This can happen with complex inputs. Let's try again!
            </p>
            <button
              onClick={handleScanSubmit}
              className="px-5 py-2.5 bg-[#0B4628] text-white text-xs font-bold uppercase rounded hover:bg-[#105C35] cursor-pointer"
            >
              Re-scan Argument
            </button>
          </div>
        )}

        {/* COMPREHENSIVE OUTPUT RESULTS PANEL */}
        <AnimatePresence>
          {result && !loading && !jsonError && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
              id="fallacy-results-matrix"
            >
              {/* 1. KEY SUMMARY & CALIBER BADGE */}
              <div className="bg-[#FAF8F5] border-2 border-[#0B4628] p-6 text-center rounded-sm shadow-xs relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#0B4628] text-[#FAF8F5] px-4 py-0.5 text-[9px] uppercase font-sans tracking-widest font-semibold border border-[#C4A35A]">
                  Syllogistic Quality
                </div>

                <p className="italic text-base sm:text-lg text-stone-800 font-serif leading-relaxed max-w-2xl mx-auto mb-4">
                  "{result.summary}"
                </p>

                <div className="flex flex-col items-center justify-center gap-1">
                  {/* Quality Caliber Badge */}
                  {(() => {
                    const badge = getQualityBadgeDetails(result.quality);
                    if (!badge) return null;
                    return (
                      <span className={`px-4 py-1.5 rounded-full border text-xs sm:text-sm font-bold tracking-wide uppercase shadow-xs ${badge.containerClass}`}>
                        {badge.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* 2. SCHOLASTIC ASSESSMENT */}
              <div className="bg-[#FAF8F5] border border-stone-300 p-5 rounded-sm shadow-xs">
                <span className="block text-[10px] font-mono tracking-wider text-stone-500 uppercase font-bold mb-1">
                  Metalyitical Evaluation (Scribe Note):
                </span>
                <p className="font-sans text-stone-800 text-sm leading-relaxed text-justify">
                  {result.assessment}
                </p>
              </div>

              {/* 3. FALLACIES DETECTED SECTION */}
              <div className="space-y-4">
                <h3 className="text-xl font-serif text-[#0B4628] font-bold border-b border-[#C4A35A]/30 pb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-[#C4A35A]" />
                    <span>Fallacies Detected — الْمُغَالَطَاتُ</span>
                  </span>
                  <span className="text-xs font-mono text-stone-500 font-normal">
                    ({result.fallacies.length})
                  </span>
                </h3>

                {result.fallacies.length === 0 ? (
                  /* celebration card */
                  <div className="bg-emerald-50 border-2 border-double border-emerald-300 rounded p-6 text-center shadow-xs">
                    <Sparkles className="w-10 h-10 text-[#C4A35A] mx-auto' animate-pulse mb-3 block" />
                    <h4 className="font-serif font-bold text-emerald-900 text-lg mb-1">
                      No major fallacies found. Masha'Allah — الْحُجَّةُ سَلِيمَةٌ
                    </h4>
                    <p className="font-sans text-stone-600 text-xs max-w-md mx-auto leading-relaxed">
                      Syllogism follows valid deductions and categorizations. The reasoning satisfies logical rigor.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {result.fallacies.map((fal, idx) => (
                      <div 
                        key={fal.id || idx}
                        className="bg-[#FAF8F5] border border-stone-300 rounded p-5 shadow-xs space-y-4"
                      >
                        {/* FALLACY HIGH CONTROL BAR */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/60 pb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-[#0B4628] text-white flex items-center justify-center font-mono text-xs font-bold leading-none">
                              {idx + 1}
                            </span>
                            <span className="font-serif font-bold text-[#0B4628] text-sm tracking-wide">
                              {fal.classical_name}
                            </span>
                            <span className="font-mono text-[10px] text-stone-400">
                              ({fal.classical_category})
                            </span>
                          </div>

                          {/* Severity badge */}
                          <div>
                            {fal.severity === 'fatal' && (
                              <span className="bg-red-50 text-red-800 border border-red-200 text-[10px] font-mono tracking-wide uppercase px-2 py-0.5 rounded font-semibold">
                                Fatal Syllogism Fault
                              </span>
                            )}
                            {fal.severity === 'weakening' && (
                              <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-mono tracking-wide uppercase px-2 py-0.5 rounded font-semibold">
                                Weakening Premise
                              </span>
                            )}
                            {fal.severity === 'minor' && (
                              <span className="bg-stone-100 text-stone-600 border border-stone-200 text-[10px] font-mono tracking-wide uppercase px-2 py-0.5 rounded font-semibold">
                                Minor Oversight
                              </span>
                            )}
                          </div>
                        </div>

                        {/* MODERN NOMENCLATURE */}
                        <div>
                          <span className="block text-[8px] font-mono text-stone-400 uppercase tracking-widest leading-none mb-1">
                            Modern Equivalent term:
                          </span>
                          <span className="text-[#0B4628] text-sm font-sans font-bold block">
                            {fal.modern_name}
                          </span>
                        </div>

                        {/* EXACT QUOTE BOX: monospace, light gray bg, red left border */}
                        <div className="bg-stone-100 border-l-4 border-l-[#0B4628] p-2.5 text-stone-800 text-[11px] font-mono italic leading-relaxed">
                          "{fal.quote}"
                        </div>

                        {/* EXPLANATION */}
                        <div className="text-stone-700 text-xs sm:text-sm font-sans leading-relaxed">
                          {fal.explanation}
                        </div>

                        {/* CORRECTION BLOCK: green left border */}
                        <div className="border-l-4 border-l-emerald-600 bg-emerald-50/50 p-3 rounded-r-md">
                          <span className="font-semibold text-emerald-800 text-xs font-sans tracking-wide block mb-1">
                            How to fix:
                          </span>
                          <p className="text-stone-700 text-xs font-sans leading-relaxed">
                            {fal.correction}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. LOGICALLY SOUND FOUNDATIONS (VALID POINTS): teal border-l / checklist */}
              {result.valid_points && result.valid_points.length > 0 && (
                <div className="bg-teal-50/50 border-l-4 border-l-teal-600 border-stone-300 rounded p-5 font-sans space-y-3 shadow-xs">
                  <h4 className="text-[#0d5952] font-serif font-bold text-sm uppercase tracking-wider flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-teal-600" />
                    <span>Logically Sound Foundations Detected</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-stone-700 leading-relaxed">
                    {result.valid_points.map((pt, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-teal-600 font-bold select-none shrink-0 mt-0.5">✓</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 5. CORRECTED ARGUMENT: gold bg with maroon bold text */}
              <div className="bg-[#C4A35A]/15 border-2 border-[#C4A35A] rounded p-6 shadow-sm space-y-3">
                <span className="text-[10px] font-sans font-bold text-[#0B4628] uppercase tracking-widest block border-b border-[#C4A35A]/30 pb-1.5">
                  Argument Strengthened — الْحُجَّةُ الْمُصَوَّبَةُ
                </span>
                <p className="text-[#0B4628] font-serif font-semibold text-base sm:text-lg italic leading-relaxed">
                  "{result.corrected}"
                </p>
              </div>

              {/* 6. MANTIQ PRINCIPLE COMPONENT */}
              <div className="bg-[#FAF8F5] border border-stone-300 p-6 rounded text-center space-y-3 shadow-xs">
                <span className="block text-[8px] font-mono tracking-widest text-stone-500 uppercase font-bold">
                  Rule of Ash-Shifa Applied:
                </span>
                <h3 className="font-arabic text-2xl sm:text-3xl text-[#0B4628] font-bold text-center leading-normal" style={{ fontFamily: 'Amiri, serif' }}>
                  {result.mantiq_principle.arabic}
                </h3>
                <p className="font-sans text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
                  {result.mantiq_principle.explanation}
                </p>
              </div>

              {/* 7. RE-ACTION ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleSaveReport}
                  disabled={saveSuccess}
                  className="flex-1 bg-[#0B4628] hover:bg-[#105C35] text-white py-3.5 px-6 border-b-4 border-[#052C18] font-sans font-bold tracking-wider transition-all rounded shadow cursor-pointer text-center flex items-center justify-center gap-2"
                >
                  <Save className="w-4.5 h-4.5 text-[#C4A35A]" />
                  <span>{saveSuccess ? "Report Saved to Archive Scribe!" : "Save Report"}</span>
                </button>

                <button
                  onClick={handleResetScanner}
                  className="flex-1 bg-[#FAF8F5] hover:bg-[#EFEAE0] text-stone-850 py-3.5 px-6 border border-stone-400 font-sans font-bold transition-all rounded shadow cursor-pointer text-center flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4.5 h-4.5" />
                  <span>Scan Another Argument</span>
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
