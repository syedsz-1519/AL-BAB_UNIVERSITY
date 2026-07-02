import React, { useState } from 'react';
import { Sparkles, HelpCircle, FileText, Check, Copy, AlertCircle, RefreshCw } from 'lucide-react';

interface FiqhRulingProps {
  currentTheme: 'parchment' | 'space';
}

const TEMPLATE_QUESTIONS = [
  "What is the Islamic legal ruling on investing in standard stock indexes that contain mixed business revenues?",
  "Is the scientific laboratory synthesis of cultured cell meat considered halal for culinary use?",
  "What are the parameters of digital smart-contract automation under historical legal consensus (Ijma)?",
  "Is the trading of medical futures and optional derivatives permitted under classical transaction laws?"
];

export default function FiqhRuling({ currentTheme }: FiqhRulingProps) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ruling, setRuling] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const isSpace = currentTheme === 'space';

  const handleFetchRuling = async (textToSubmit?: string) => {
    const qValue = textToSubmit || question;
    if (!qValue.trim()) {
      setError('Prudent caution: Please formulate a structured enquiry first.');
      return;
    }

    if (textToSubmit) {
      setQuestion(textToSubmit);
    }

    setError('');
    setLoading(true);
    setRuling('');

    try {
      const response = await fetch('/api/fiqh-ruling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: qValue })
      });

      if (!response.ok) {
        throw new Error('Fatal: Albab fatwa council failed to return a ruling.');
      }

      const raw = await response.json();
      setRuling(raw.content);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate legal ruling.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = () => {
    if (!ruling) return;
    navigator.clipboard.writeText(ruling);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`p-6 sm:p-10 rounded border max-w-5xl mx-auto shadow-md transition-all duration-300 relative overflow-hidden
      ${isSpace 
        ? 'bg-space-dark/40 border-gold/15 text-white' 
        : 'bg-[#FAF8F5] border-crimson/10 text-charcoal'
      }
    `}>
      <div className="absolute top-4 right-6 opacity-5 pointer-events-none select-none text-9xl font-serif">
        فتوى
      </div>

      <div className="flex items-center gap-2 mb-4 px-3 py-1 w-fit rounded-full border text-[10px] font-mono tracking-[0.2em] uppercase
        dark:border-gold/20 dark:bg-gold/5 dark:text-gold-light border-crimson/15 bg-crimson/5 text-crimson"
      >
        <HelpCircle className="h-3.5 w-3.5 animate-pulse" />
        Juristic Fatwa Advisory System
      </div>

      <h2 className="font-serif font-black text-2xl sm:text-3xl tracking-wide">
        AI Fiqh Ruling Generator
      </h2>
      <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-2 max-w-3xl leading-relaxed">
        Input modern civil or ethical dilemmas. Our juristic expert AI system analyzes primary texts, traditional consensus (*Ijma*), and comparative methodologies across the Hanafi, Maliki, Shafi'i, and Hanbali schools to formulate standard structural verdicts.
      </p>

      {/* QUICK SELECT TEMPLATES */}
      <div className="mt-8">
        <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block mb-3 font-bold">
          Preformed Research Queries
        </span>
        <div className="flex flex-wrap gap-2">
          {TEMPLATE_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              disabled={loading}
              onClick={() => handleFetchRuling(q)}
              className="text-left py-2 px-3 border border-stone-200 dark:border-gold/10 hover:border-crimson dark:hover:border-gold hover:bg-stone-50/50 dark:hover:bg-space rounded text-xs leading-relaxed text-stone-600 dark:text-stone-300 font-serif cursor-pointer transition-all disabled:opacity-50"
            >
              "{q}"
            </button>
          ))}
        </div>
      </div>

      {/* QUERY FORMS */}
      <div className="mt-8 space-y-4">
        <label className="text-[10px] uppercase tracking-wider font-mono text-stone-400 block mb-1">
          Formulate Your Inquiry (Fiqh al-Muamalat Focus)
        </label>
        <textarea
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="E.g., What are the legal constraints regarding autonomous multi-agent liquid banking networks..."
          className={`w-full p-4 rounded text-sm sm:text-base font-serif border focus:outline-none transition-all resize-none shadow-inner
            ${isSpace 
              ? 'bg-space border-gold/20 text-gold-light focus:border-gold placeholder:text-stone-600' 
              : 'bg-white border-stone-300 text-charcoal focus:border-crimson placeholder:text-stone-400'
            }
          `}
        />

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded text-xs animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={() => handleFetchRuling()}
          disabled={loading || !question.trim()}
          className="font-mono text-xs uppercase bg-crimson dark:bg-gold text-white dark:text-space hover:bg-black hover:text-gold dark:hover:bg-white dark:hover:text-[#0B4628] border border-transparent font-bold tracking-widest px-8 py-4 rounded-sm shadow-md transition-all duration-300 cursor-pointer disabled:opacity-50 flex justify-center items-center gap-2 w-full"
        >
          <Sparkles className="h-4 w-4 shrink-0" />
          {loading ? 'Consulting the Juristic Board Council...' : 'Request Fatwa Ruling'}
        </button>
      </div>

      {/* DISPLAY RULING */}
      {(loading || ruling) && (
        <div className={`mt-10 rounded border transition-all duration-300 select-text overflow-hidden
          ${isSpace 
            ? 'bg-space-dark border-gold/20 shadow-inner' 
            : 'bg-white border-stone-200 shadow-md'
          }
        `}>
          {/* HEADER SHELF */}
          <div className="flex justify-between items-center bg-stone-100 dark:bg-space/35 px-6 py-4 border-b border-stone-250 dark:border-gold/15">
            <span className="font-mono text-[9px] uppercase tracking-wider text-stone-400 font-bold">
              Advisement Ledger Record
            </span>

            {ruling && !loading && (
              <button
                onClick={handleCopyText}
                className="flex items-center gap-1 text-xs font-mono text-stone-500 hover:text-crimson dark:hover:text-gold transition-colors cursor-pointer"
              >
                {copied ? <Check className="h-4.5 w-4.5 text-green-500 shrink-0" /> : <Copy className="h-4.5 w-4.5 shrink-0" />}
                <span>{copied ? 'Copied' : 'Copy Verdict'}</span>
              </button>
            )}
          </div>

          <div className="p-6 sm:p-8">
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <RefreshCw className="animate-spin h-8 w-8 text-gold" />
                <div className="font-serif italic animate-pulse text-sm text-stone-500">
                  Cross-referencing Hadith registers, resolving consensus structures, and designing legal disclaimers...
                </div>
              </div>
            )}

            {!loading && ruling && (
              <div className="prose max-w-none dark:prose-invert font-serif text-sm sm:text-base leading-relaxed text-justify space-y-4 whitespace-pre-line text-stone-700 dark:text-stone-200">
                {ruling}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
