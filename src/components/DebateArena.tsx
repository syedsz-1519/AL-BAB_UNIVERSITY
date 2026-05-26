import React, { useState } from 'react';
import { Sparkles, ArrowRight, BookOpen, AlertCircle, FileText, Languages } from 'lucide-react';

interface DebateArenaProps {
  currentTheme: 'parchment' | 'space';
}

const MADHABS = [
  { id: 'Hanafi', name: 'Hanafi (Rationalists of Kufa)' },
  { id: 'Maliki', name: 'Maliki (Traditionists of Medina)' },
  { id: 'Shafi\'i', name: 'Shafi\'i (Usul Systematizers)' },
  { id: 'Hanbali', name: 'Hanbali (Adherents of Text/Athari)' },
  { id: 'Zahiri', name: 'Zahiri (Literalists / Ibn Hazm)' },
  { id: 'Ash\'ari', name: 'Ash\'ari (Analytical Creed)' },
  { id: 'Maturidi', name: 'Maturidi (Rational Creed)' }
];

const TOPICS = [
  { id: 'finance', name: 'Trading of Cryptocurrencies & Decentralized Virtual Tokens' },
  { id: 'moon', name: 'Global Moon Sighting vs Local Horizons' },
  { id: 'organ_donation', name: 'Organ Transplantation and Modern Medical Utility' },
  { id: 'governance', name: 'Political Governance under Traditional Constitutional Law' },
  { id: 'attributes', name: 'Interpretation vs Affirmation of Transcendent Divine Attributes' }
];

export default function DebateArena({ currentTheme }: DebateArenaProps) {
  const [madhabA, setMadhabA] = useState('Hanafi');
  const [madhabB, setMadhabB] = useState('Maliki');
  const [topic, setTopic] = useState('Trading of Cryptocurrencies & Decentralized Virtual Tokens');
  const [loading, setLoading] = useState(false);
  const [debateContent, setDebateContent] = useState<string>('');
  const [error, setError] = useState<string>('');

  const isSpace = currentTheme === 'space';

  const handleBeginMunazara = async () => {
    if (madhabA === madhabB) {
      setError('Prudent warning: Please choose separate, distinctive positions for full dialogic contrast.');
      return;
    }
    setError('');
    setLoading(true);
    setDebateContent('');

    try {
      const response = await fetch('/api/debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ madhabA, madhabB, topic })
      });

      if (!response.ok) {
        throw new Error('Fatal: System could not initiate the fatwa board debate.');
      }

      const resData = await response.json();
      setDebateContent(resData.content);
    } catch (err: any) {
      setError(err?.message || 'Academic debate generator offline.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-6 sm:p-10 rounded border max-w-5xl mx-auto shadow-md transition-all duration-300 relative overflow-hidden
      ${isSpace 
        ? 'bg-space-dark/40 border-gold/15 text-white' 
        : 'bg-[#FAF8F5] border-crimson/10 text-charcoal'
      }
    `}>
      {/* Editorial Watermark */}
      <div className="absolute top-4 right-6 opacity-5 pointer-events-none select-none text-9xl font-serif">
        مناظرة
      </div>

      <div className="flex items-center gap-2 mb-4 px-3 py-1 w-fit rounded-full border text-[10px] font-mono tracking-[0.2em] uppercase
        dark:border-gold/20 dark:bg-gold/5 dark:text-gold-light border-crimson/15 bg-crimson/5 text-crimson"
      >
        <Sparkles className="h-3 w-3 animate-pulse" />
        Academic Munazara Subsystem
      </div>

      <h2 className="font-serif font-black text-2xl sm:text-3xl tracking-wide">
        Scholarly Debate Arena
      </h2>
      <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-2 max-w-2xl leading-relaxed">
        Pledge research focus. Pair classic legal schools (*Madhabs*) or theological positions to evaluate modern conundrums through the strict lens of comparative root principles (*Usul*).
      </p>

      {/* INPUT CONTROLS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div>
          <label className="text-[10px] uppercase tracking-wider font-mono text-stone-400 block mb-2">
            First Scholarly Branch (A)
          </label>
          <select 
            value={madhabA}
            onChange={(e) => setMadhabA(e.target.value)}
            className={`w-full p-3 rounded font-serif text-sm border focus:outline-none transition-all
              ${isSpace 
                ? 'bg-space border-gold/20 text-gold-light focus:border-gold' 
                : 'bg-white border-stone-200 text-charcoal focus:border-crimson'
              }
            `}
          >
            {MADHABS.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-center pt-5">
          <div className="flex items-center gap-1 font-serif italic text-xs text-stone-400">
            <span>Versus</span>
            <ArrowRight className="h-3.5 w-3.5 animate-pulse text-gold" />
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider font-mono text-stone-400 block mb-2">
            Second Scholarly Branch (B)
          </label>
          <select 
            value={madhabB}
            onChange={(e) => setMadhabB(e.target.value)}
            className={`w-full p-3 rounded font-serif text-sm border focus:outline-none transition-all
              ${isSpace 
                ? 'bg-space border-gold/20 text-gold-light focus:border-gold' 
                : 'bg-white border-stone-200 text-charcoal focus:border-crimson'
              }
            `}
          >
            {MADHABS.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TOPIC DROPDOWN */}
      <div className="mt-6">
        <label className="text-[10px] uppercase tracking-wider font-mono text-stone-400 block mb-2">
          Jurisprudential / Theological Focus
        </label>
        <select 
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className={`w-full p-3 rounded font-serif text-sm border focus:outline-none transition-all
            ${isSpace 
              ? 'bg-space border-gold/20 text-gold-light focus:border-gold' 
              : 'bg-white border-stone-200 text-charcoal focus:border-crimson'
            }
          `}
        >
          {TOPICS.map((t) => (
            <option key={t.id} value={t.name}>{t.name}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* DEBATE TRIGGER BUTTON */}
      <button
        onClick={handleBeginMunazara}
        disabled={loading}
        className="mt-8 font-mono text-xs uppercase bg-crimson dark:bg-gold text-white dark:text-space hover:bg-black hover:text-gold dark:hover:bg-white dark:hover:text-[#8B0000] border border-transparent font-bold tracking-widest px-8 py-4 rounded-sm shadow-md transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:pointer-events-none w-full flex justify-center items-center gap-2"
      >
        <Languages className="h-4 w-4" />
        {loading ? 'Convening the Munazara Assemblies...' : 'Begin Munazara (Start Scholarly Debate)'}
      </button>

      {/* OUTPUT RESULT VIEW */}
      {(loading || debateContent) && (
        <div className={`mt-10 p-6 sm:p-8 rounded border border-dashed transition-all duration-300 relative
          ${isSpace 
            ? 'bg-space-dark border-gold/20 shadow-[inset_0_2px_12px_rgba(0,0,0,0.6)]' 
            : 'bg-white border-stone-300/40 shadow-inner'
          }
        `}>
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className={`animate-spin h-8 w-8 rounded-full border-2 border-t-transparent ${isSpace ? 'border-gold' : 'border-crimson'}`} />
              <div className="font-serif italic animate-pulse text-sm text-stone-500">
                Evaluating traditional texts, extracting scripture evidence, charting school methodologies...
              </div>
            </div>
          )}

          {!loading && debateContent && (
            <div className="prose max-w-none dark:prose-invert font-serif leading-relaxed text-sm sm:text-base animate-fade-in text-justify">
              <div className="font-mono text-[9px] uppercase tracking-wider mb-4 opacity-40 text-left border-b border-stone-200/10 pb-2">
                Drafted Live Decanonized Record
              </div>
              <div className="whitespace-pre-line space-y-4">
                {debateContent}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
