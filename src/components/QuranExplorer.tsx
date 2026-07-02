import React, { useState } from 'react';
import { BookOpen, Search, Type, Bookmark, BookmarkCheck, FileText, AlertCircle, Sparkles } from 'lucide-react';
import SectionMetaTags from './SectionMetaTags';

interface QuranExplorerProps {
  currentTheme: 'parchment' | 'space';
  onBookmarkAdd?: (id: string, label: string) => void;
  bookmarkedKeys?: string[];
}

export default function QuranExplorer({ currentTheme, onBookmarkAdd, bookmarkedKeys = [] }: QuranExplorerProps) {
  const [surah, setSurah] = useState<number>(2);
  const [ayah, setAyah] = useState<number>(255);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [arabicSize, setArabicSize] = useState<number>(30); // in pixels
  const [results, setResults] = useState<{
    arabic: string;
    translation: string;
    tafseer: string;
    hadiths: string[];
    curriculumLinks: string[];
  } | null>({
    arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ",
    translation: "Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep.",
    tafseer: "Classic Tafseer Ibn Katheer: This is Ayat al-Kursi, the greatest single verse in the entire Holy Book of Allah. It comprises ten complete, majestic statements regarding absolute monotheism (Tawheed).\n\n1. His self-living state (Al-Hayy) combined with active cosmic management (Al-Qayyum) means His life is completely free of any flaws or exhaustions.\n2. Neither fatigue nor natural sleep touches Him as He possesses ultimate custody of the outer and inner realms.",
    hadiths: [
      "Sahih Muslim, Hadith 810: The Prophet (ﷺ) declared Ayat al-Kursi as the greatest verse of the Quran in a dialogue with Ubayy ibn Ka'b.",
      "Sunan al-Nasai: 'Whoever recites Ayat al-Kursi after every obligatory prayer, nothing stands between him and entering Paradise except death.'"
    ],
    curriculumLinks: ["Aqeedah (Classical Creeds)", "Tafseer Studies", "Uloom al-Qur'an"]
  });

  const isSpace = currentTheme === 'space';
  const verseKey = `${surah}:${ayah}`;
  const isBookmarked = bookmarkedKeys.includes(verseKey);

  const handleSearchVerse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (surah < 1 || surah > 114) {
      setError('Please provide a valid Surah number from 1 to 114.');
      return;
    }
    if (ayah < 1 || ayah > 286) {
      setError('Please provide an authentic Ayah range.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/quran-explorer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surah, ayah })
      });

      if (!response.ok) {
        throw new Error('Scripture core link returned error or was unresponsive.');
      }

      const raw = await response.json();
      setResults(raw);
    } catch (err: any) {
      setError(err?.message || 'Failed to search classical Quran databases.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkToggle = () => {
    if (onBookmarkAdd) {
      onBookmarkAdd(verseKey, `Surah ${surah}:${ayah} Archive`);
    }
  };

  return (
    <div className={`p-6 sm:p-10 rounded border max-w-5xl mx-auto shadow-md transition-all duration-300 relative
      ${isSpace 
        ? 'bg-space-dark/40 border-gold/15 text-white' 
        : 'bg-[#FAF8F5] border-crimson/10 text-charcoal'
      }
    `}>
      <SectionMetaTags 
        title="Quranic Exegesis and Translation Explorer" 
        description="Search classical Surahs and Ayahs, and explore traditional Tafseer exegesis, related prophetic Hadiths, and university curriculum alignments."
        sectionId="quran-explorer"
      />
      <div className="absolute top-4 right-6 opacity-5 pointer-events-none select-none text-9xl font-serif">
        قرآن
      </div>

      <div className="flex items-center gap-2 mb-4 px-3 py-1 w-fit rounded-full border text-[10px] font-mono tracking-[0.2em] uppercase
        dark:border-gold/20 dark:bg-gold/5 dark:text-gold-light border-crimson/15 bg-crimson/5 text-crimson"
      >
        <BookOpen className="h-3 w-3 animate-pulse" />
        Interactive Exegesis Module
      </div>

      <h2 className="font-serif font-black text-2xl sm:text-3xl tracking-wide">
        Quran Verse & Tafseer Explorer
      </h2>
      <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-2 max-w-3xl leading-relaxed">
        Key in the coordinates of any verse. Retrieve high-vibe classical exegesis (*Tafseer Ibn Katheer style*), authentic Hadith ties, and direct intellectual maps linking modern science to our Islamic curriculum.
      </p>

      {/* SEARCH FORM PANEL */}
      <form onSubmit={handleSearchVerse} className="mt-8 flex flex-wrap gap-4 items-end bg-[#F3EFE9] dark:bg-space/40 p-5 rounded-sm border dark:border-white/5 border-black/5">
        <div className="w-24">
          <label className="text-[9px] uppercase tracking-wider font-mono text-stone-400 block mb-1">
            Surah Index
          </label>
          <input 
            type="number"
            min={1}
            max={114}
            value={surah}
            onChange={(e) => setSurah(parseInt(e.target.value) || 1)}
            className={`w-full p-2.5 rounded font-mono text-center text-sm border focus:outline-none transition-all
              ${isSpace 
                ? 'bg-space-dark border-gold/20 text-gold-light focus:border-gold' 
                : 'bg-white border-stone-300 text-charcoal focus:border-crimson'
              }
            `}
          />
        </div>

        <div className="w-24">
          <label className="text-[9px] uppercase tracking-wider font-mono text-stone-400 block mb-1">
            Ayah Index
          </label>
          <input 
            type="number"
            min={1}
            max={286}
            value={ayah}
            onChange={(e) => setAyah(parseInt(e.target.value) || 1)}
            className={`w-full p-2.5 rounded font-mono text-center text-sm border focus:outline-none transition-all
              ${isSpace 
                ? 'bg-space-dark border-gold/20 text-gold-light focus:border-gold' 
                : 'bg-white border-stone-300 text-charcoal focus:border-crimson'
              }
            `}
          />
        </div>

        <div className="flex-1 min-w-[150px]">
          <button
            type="submit"
            disabled={loading}
            className="w-full font-mono text-xs uppercase bg-crimson dark:bg-gold text-white dark:text-space hover:bg-black hover:text-gold dark:hover:bg-white dark:hover:text-[#0B4628] border border-transparent font-bold tracking-widest py-3 rounded-sm transition-all duration-300 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Search className="h-3.5 w-3.5" />
            {loading ? 'Consulting Repositories...' : 'Explore Verse'}
          </button>
        </div>

        {/* FONT RESIZE PANEL */}
        <div className="flex items-center gap-1.5 border border-stone-300/40 dark:border-gold/20 p-1.5 rounded bg-white/50 dark:bg-space-dark">
          <span className="text-[9px] font-mono text-stone-400 px-1">Arabic Text Size:</span>
          <button 
            type="button"
            onClick={() => setArabicSize(Math.max(20, arabicSize - 4))}
            className="p-1 px-2 border border-stone-300 rounded dark:border-gold/20 text-xs font-mono hover:bg-stone-100 dark:hover:bg-space cursor-pointer"
          >
            A-
          </button>
          <button 
            type="button"
            onClick={() => setArabicSize(Math.min(50, arabicSize + 4))}
            className="p-1 px-2 border border-stone-300 rounded dark:border-gold/20 text-xs font-mono hover:bg-stone-100 dark:hover:bg-space cursor-pointer"
          >
            A+
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* CORE DISPLAY */}
      {results && !loading && (
        <div className="mt-10 space-y-8 animate-fade-in">
          {/* HEADER METADATA & BOOKMARK */}
          <div className="flex justify-between items-center border-b border-stone-200 dark:border-gold/10 pb-4">
            <h3 className="font-serif italic font-bold text-lg text-crimson dark:text-gold-light">
              Surah Al-Qur'an (Chapter {surah}, Verse {ayah})
            </h3>
            
            <button
              onClick={handleBookmarkToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs font-mono transition-all duration-300 cursor-pointer
                ${isBookmarked
                  ? 'bg-gold/10 text-gold border-gold/40'
                  : 'text-stone-400 hover:text-crimson hover:border-crimson dark:hover:text-gold border-stone-300/40'
                }
              `}
            >
              {isBookmarked ? <BookmarkCheck className="h-4 w-4 text-gold shrink-0" /> : <Bookmark className="h-4 w-4 shrink-0" />}
              <span>{isBookmarked ? 'Bookmarked' : 'Add to Archive'}</span>
            </button>
          </div>

          {/* ARABIC CHRONOLOGY */}
          <div className="p-8 py-10 rounded-sm text-center border bg-white dark:bg-space-dark border-stone-200/50 dark:border-gold/10 relative">
            <div className="absolute top-2 left-2 text-[8px] font-mono tracking-widest text-[#0B4628] dark:text-gold opacity-40 uppercase">
              Original Arabized Script
            </div>
            <div 
              className="font-serif leading-loose text-center text-stone-800 dark:text-white mb-6 select-all font-medium py-3" 
              style={{ fontSize: `${arabicSize}px`, fontFamily: 'Amiri, serif' }}
              dir="rtl"
            >
              {results.arabic}
            </div>
            <div className="w-24 h-0.5 bg-gold/30 mx-auto my-6" />
            <p className="font-sans italic text-sm text-stone-600 dark:text-stone-300 max-w-2xl mx-auto leading-relaxed text-center px-4">
              "{results.translation}"
            </p>
          </div>

          {/* ANALYSIS BENTO DUO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* TAFSEER PORTAL */}
            <div className="md:col-span-2 p-6 sm:p-8 rounded border bg-amber-500/[0.02] dark:bg-space-dark/20 border-stone-200 dark:border-gold/15">
              <div className="flex items-center gap-2 mb-4 font-mono text-[10px] uppercase tracking-wider text-crimson dark:text-gold-light font-bold">
                <FileText className="h-4 w-4 shrink-0 text-gold" />
                Seminary Tafseer Framework (Exegesis)
              </div>
              <div className="prose max-w-none dark:prose-invert font-serif leading-relaxed text-sm sm:text-base text-justify whitespace-pre-wrap text-stone-700 dark:text-stone-250">
                {results.tafseer}
              </div>
            </div>

            {/* CURRICULUM CLUSTERS & RELATED PROPHETIC HADITHS */}
            <div className="space-y-6">
              {/* CURRICULUM LINKS */}
              <div className="p-5 sm:p-6 rounded border bg-[#FAF8F5] dark:bg-space-dark/50 border-stone-200 dark:border-gold/10">
                <div className="flex items-center gap-2 mb-3 font-mono text-[9px] uppercase tracking-wider text-stone-500 font-bold">
                  <Sparkles className="h-3.5 w-3.5 text-crimson dark:text-gold" />
                  Albab Curriculum Map
                </div>
                <div className="flex flex-wrap gap-2">
                  {results.curriculumLinks && results.curriculumLinks.map((link, idx) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-1 rounded bg-stone-100 dark:bg-space border border-stone-200/50 dark:border-gold/15 text-xs font-mono dark:text-gold-light"
                    >
                      {link}
                    </span>
                  ))}
                  {(!results.curriculumLinks || results.curriculumLinks.length === 0) && (
                    <span className="text-stone-400 font-serif italic text-xs">General Islamic Sciences</span>
                  )}
                </div>
              </div>

              {/* HADITH SHIELD */}
              <div className="p-5 sm:p-6 rounded border bg-[#FAF8F5] dark:bg-space-dark/50 border-stone-200 dark:border-gold/10 space-y-4">
                <div className="font-mono text-[9px] uppercase tracking-wider text-stone-500 font-bold border-b dark:border-gold/10 pb-2">
                  Authenticated Prophet Narration Support
                </div>
                {results.hadiths && results.hadiths.length > 0 ? (
                  <ul className="space-y-4">
                    {results.hadiths.map((h, hidx) => (
                      <li key={hidx} className="text-xs sm:text-xs leading-relaxed text-stone-600 dark:text-stone-300 font-serif border-l-2 border-gold/40 pl-3 italic">
                        {h}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs italic font-serif text-stone-400">
                    Prophetic wisdom integrations rendered comprehensively within exegesis sheet text.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className={`animate-spin h-8 w-8 rounded-full border-2 border-t-transparent ${isSpace ? 'border-gold' : 'border-crimson'}`} />
          <div className="font-serif italic animate-pulse text-sm text-stone-500">
            Scanning manuscripts, lining up translations, building AI intellectual curriculum networks...
          </div>
        </div>
      )}
    </div>
  );
}
