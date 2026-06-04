import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, X, Send, Sparkles, Move, Play, RefreshCw, 
  HelpCircle, GraduationCap, ChevronDown, Check, AlertCircle, BookOpen,
  Quote, BookMarked, Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isSimulated?: boolean;
}

interface AlbabAIBotProps {
  currentTheme: 'parchment' | 'space';
}

export default function AlbabAIBot({ currentTheme }: AlbabAIBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Assalamu Alaikum, beloved seeker of knowledge! 🌙\n\nI am **ALBAB AI**, your official guide at Albab Islamic University (AIU).\n\nI can assist you with:\n- Our **13 academic courses** — Quran, Hadith, Fiqh, Logic, Philosophy, and more\n- **Cognitive Labs** — Waswas Clinic, Mantiq Tutor, Maqasid Analyzer, Nafs Assessment\n- **Admissions** guidance and Student Portal navigation\n- Any **Islamic knowledge** question — Tafseer, Fiqh, Aqeedah, and beyond\n\n*Admissions for Summer Covenant 2026 are now open!*\n\nHow may I serve you today? JazakAllahu Khairan.",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [queryMode, setQueryMode] = useState<'corpus' | 'curriculum'>('corpus');

  // ACADEMIC CITATION HELPER STATES
  const [isCitationOpen, setIsCitationOpen] = useState(false);
  const [selectedCitationType, setSelectedCitationType] = useState<'quran' | 'hadith'>('quran');
  const [citationStyle, setCitationStyle] = useState<'traditional' | 'chicago' | 'apa' | 'mla' | 'harvard'>('traditional');
  
  // Custom manual citation form states
  const [citeSurahNumber, setCiteSurahNumber] = useState('2');
  const [citeAyahNumber, setCiteAyahNumber] = useState('255');
  const [citeTranslator, setCiteTranslator] = useState('Sahih International');
  
  const [citeHadithCollection, setCiteHadithCollection] = useState('Sahih al-Bukhari');
  const [citeHadithNumber, setCiteHadithNumber] = useState('1');
  const [citeHadithNarrator, setCiteHadithNarrator] = useState('Umar ibn al-Khattab');
  const [citeHadithBookName, setCiteHadithBookName] = useState('Book of Faith');
  
  // Toast alert for successful copies
  const [citationToast, setCitationToast] = useState<string | null>(null);
  const [contextMessageId, setContextMessageId] = useState<string | null>(null);
  
  // DRAG STATE (using absolute viewport client coordinates so it never floats off-screen or breaks layouts!)
  const [botPos, setBotPos] = useState<{ left?: number; top?: number }>(() => {
    try {
      const saved = localStorage.getItem('albab_bot_pos_absolute');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const dragConstraintsRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<HTMLDivElement>(null);

  // External event listener to allow other screen buttons to open the AlBab Scholar AI chat bubble
  useEffect(() => {
    const handleOpenExternal = () => {
      setIsOpen(true);
    };
    window.addEventListener('open-albab-bot', handleOpenExternal);
    return () => {
      window.removeEventListener('open-albab-bot', handleOpenExternal);
    };
  }, []);

  // Responsive repositioning safeguard for screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (botPos.left !== undefined && botPos.top !== undefined) {
        const left = Math.max(16, Math.min(botPos.left, window.innerWidth - 80));
        const top = Math.max(16, Math.min(botPos.top, window.innerHeight - 80));
        if (left !== botPos.left || top !== botPos.top) {
          setBotPos({ left, top });
        }
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [botPos]);

  // Suggestions for fast contextual inquiries
  const SUGGESTIONS = [
    { label: "📚 Courses", query: "What courses does Albab University offer?" },
    { label: "⚖️ Fiqh", query: "How does the Fiqh Iftaa Council work?" },
    { label: "🧠 Waswas", query: "What is the Waswas Recovery Clinic?" },
    { label: "📝 Admissions", query: "How do I apply for admissions at AIU?" },
    { label: "📜 Hadith", query: "Explain the Hadith Isnad Mapper" },
    { label: "🌙 Maqasid", query: "What are the 5 Maqasid al-Shariah?" },
    { label: "🔥 Aqeedah", query: "Tell me about the Aqeedah Firewall feature" },
    { label: "✨ Nafs", query: "How does the Nafs Assessment Engine work?" }
  ];

  // Auto scroll to chat bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Handle send message
  const handleSendMessage = async (textToSend?: string) => {
    const rawQuery = textToSend || inputText;
    if (!rawQuery.trim() || isLoading) return;

    const userMessageStr = rawQuery.trim();
    if (!textToSend) setInputText('');

    // Append User Message
    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: 'user',
      text: userMessageStr,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Build conversation history format for the server API call
      const history = messages.slice(-10).map(msg => ({
        role: msg.role,
        text: msg.text
      }));

      const res = await fetch('/api/albab-bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessageStr,
          history,
          mode: queryMode
        })
      });

      if (!res.ok) {
        throw new Error(`Scholastic server returned ${res.status}`);
      }

      const data = await res.json();
      
      const botMsg: Message = {
        id: `bot_${Date.now()}`,
        role: 'model',
        text: data.text || "I am currently meditating on your question. Please rephrase or query again soon, beloved seeker.",
        timestamp: new Date(),
        isSimulated: data.isSimulated
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.error("AI Assistant transmission failure:", err);
      
      // Robust, informative fallback if server is starting or disconnected
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        role: 'model',
        text: `**System Notice:** Connecting with celestial AI servers...\n\n_I encountered a short pipeline synchronization lag:_ "${err.message}". However, as a scholar of AlBab, I can happily assist you offline too! Ask me about comparative Fiqh or how to submit a thesis.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: "Assalamu Alaikum! AI systems have been cleared and synchronized. How can I assist you on the path of scholars today?",
        timestamp: new Date()
      }
    ]);
  };

  // Track dragging end coordinates to persist positions using absolute viewport metrics
  const handleDragEnd = () => {
    if (botRef.current) {
      const rect = botRef.current.getBoundingClientRect();
      // Keep it within screen margins beautifully
      const left = Math.max(16, Math.min(rect.left, window.innerWidth - 80));
      const top = Math.max(16, Math.min(rect.top, window.innerHeight - 80));
      const newPos = { left, top };
      setBotPos(newPos);
      try {
        localStorage.setItem('albab_bot_pos_absolute', JSON.stringify(newPos));
      } catch (e) {
        console.warn("Could not save absolute bot coordinate:", e);
      }
    }
  };

  const isSpace = currentTheme === 'space';

  return (
    <>
      {/* Invisible overlay that acts as boundaries for dragging if needed */}
      <div ref={dragConstraintsRef} className="fixed inset-0 pointer-events-none z-[9990]" />

      {/* DRAGGABLE ROOT WIDGET WINDOW */}
      <motion.div
        ref={botRef}
        drag={!isOpen}
        dragConstraints={dragConstraintsRef}
        dragMomentum={false}
        dragElastic={0.08}
        onDragEnd={handleDragEnd}
        style={botPos.left !== undefined && botPos.top !== undefined ? {
          left: botPos.left,
          top: botPos.top,
          position: 'fixed',
          bottom: 'auto',
          right: 'auto'
        } : {
          bottom: '2rem',
          right: '2rem',
          position: 'fixed'
        }}
        whileDrag={{ scale: 1.05 }}
        className="fixed z-[9995] select-none text-charcoal dark:text-white"
      >
        <div className="relative group/bot flex flex-col items-center">
          {/* DRAG HANDLE GUIDE / MOVE HINT */}
          <div className="absolute -top-7 bg-slate-900/90 backdrop-blur-sm text-[9px] font-mono uppercase text-gold-light px-2.5 py-0.5 rounded-full opacity-0 group-hover/bot:opacity-100 pointer-events-none transition-all duration-300 flex items-center gap-1.5 shadow-xl border border-gold/20">
            <Move className="h-2.5 w-2.5 animate-pulse" /> Drag Anywhere
          </div>

          {/* Rotating Celestial Astrolabe rings on hover */}
          {!isOpen && (
            <>
              <span className="absolute inset-[-12px] border border-dashed border-gold/15 dark:border-gold/30 rounded-full animate-[spin_40s_linear_infinite] opacity-0 group-hover/bot:opacity-100 pointer-events-none transition-opacity duration-500" />
              <span className="absolute inset-[-6px] border border-crimson/10 dark:border-gold/15 rounded-full animate-[spin_20s_linear_infinite_reverse] opacity-0 group-hover/bot:opacity-100 pointer-events-none transition-opacity duration-300" />
            </>
          )}

          {/* FLOATING TRIGGER BUTTON */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsOpen(!isOpen)}
            className={`h-16 w-16 rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.25)] cursor-grab active:cursor-grabbing relative overflow-hidden border transition-all duration-300
              ${isSpace 
                ? 'bg-gradient-to-tr from-[#8b1a1a] via-[#c21a2e] to-[#f47382] border-gold/30 hover:border-gold shadow-gold/10' 
                : 'bg-gradient-to-tr from-[#7c1414] via-[#a82525] to-[#c73e3e] border-[#8b1a1a]/25 hover:border-crimson shadow-crimson/15'
              }
            `}
            title="ALBAB AI"
          >
            {/* Ambient internal shimmer */}
            <span className="absolute inset-0 bg-white/10 rounded-2xl animate-pulse pointer-events-none" />
            
            {isOpen ? (
              <X className="h-6 w-6 text-white stroke-[2.5] transition-transform duration-300 rotate-90" />
            ) : (
              <div className="relative flex flex-col items-center justify-center text-white">
                <BookOpen className="h-7 w-7 text-white stroke-[2] drop-shadow-md animate-[pulse_2s_infinite]" />
                <span className="text-[8.5px] font-mono mt-0.5 tracking-widest uppercase font-black text-white/95">AIU</span>
                <span className="absolute -top-1.5 -right-1.5 h-3 w-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-ping" />
                <span className="absolute -top-1.5 -right-1.5 h-3 w-3 bg-emerald-400 rounded-full border-2 border-slate-900 shadow-sm" />
              </div>
            )}
          </motion.button>
        </div>

        {/* CHAT WINDOW BOX - ANIMATED EXPANSION */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ type: 'spring', damping: 22, stiffness: 220 }}
              className={`absolute bottom-20 right-0 w-[385px] sm:w-[420px] h-[600px] rounded-2xl flex flex-col border overflow-hidden select-text pointer-events-auto transition-all duration-300
                ${isSpace 
                  ? 'bg-[#04081cd8] border-gold/20 text-gold-light shadow-[0_25px_60px_rgba(212,163,89,0.18)] backdrop-blur-xl ring-1 ring-gold/10' 
                  : 'bg-[#fafaf6f2] border-stone-300/80 text-charcoal shadow-[0_25px_60px_rgba(139,26,26,0.12)] backdrop-blur-xl ring-1 ring-[#8b1a1a]/5'
                }
              `}
            >
              {/* SCHOLARLY ANTIQUE CORNERS DECORATION */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-gold/30 dark:border-gold/50 pointer-events-none rounded-tl-2xl z-20" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-gold/30 dark:border-gold/50 pointer-events-none rounded-tr-2xl z-20" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-gold/30 dark:border-gold/50 pointer-events-none rounded-bl-2xl z-20" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-gold/30 dark:border-gold/50 pointer-events-none rounded-br-2xl z-20" />

              {/* HEADER CONTAINER */}
              <div className={`p-4 flex items-center justify-between border-b relative z-10
                ${isSpace 
                  ? 'bg-gradient-to-r from-[#030614] via-[#040a24] to-[#030614] border-gold/15' 
                  : 'bg-gradient-to-r from-stone-100 via-stone-50 to-stone-100 border-stone-200/80'
                }
              `}>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {/* Reliable monogram image seal fallback */}
                    <div className="h-10 w-10 rounded-full border border-gold/30 flex items-center justify-center bg-gradient-to-tr from-[#8b1a1a] to-[#c73e3e] relative overflow-hidden shadow-inner">
                      <span className="text-xs font-bold text-gold-light font-serif">الب</span>
                      <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6GPkUINYomPqZtlU7xopLCQf3q2nN-uUtfe1o0-i5-PYC9iizfy-0wzrokp8ZPsjwLw73OXyCEdL6yFr3uEb8pGYC1RHOHQADviljCbiMBXz7dn_ODjpxpQqyCH0IAfxdN4L-0H5a5HhTMbMpnVUet1SZ4jv33EnJ5hiAGRvpTQBIY9SfPkb6QEK-q5kZ06lCsprBWndsJOg3Q8bnWR_Bd-YSHR1sc4dBtaDowmYtYkMfqOkVQmsnr_F4sh4V_rnuzy8iOO-MdNYs" 
                        alt="Albab Logo" 
                        className="absolute inset-0 h-full w-full object-cover rounded-full z-10 transition-opacity duration-300"
                        onError={(e) => {
                          e.currentTarget.classList.add('opacity-0');
                        }}
                      />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                  </div>
                  <div>
                    <h4 className="font-serif font-black text-[13.5px] tracking-wide leading-none text-crimson dark:text-gold-light flex items-center gap-1">
                      <span>ALBAB AI</span>
                      <Sparkles className="h-3 w-3 text-gold/80" />
                    </h4>
                    <span className="text-[9.5px] font-mono tracking-wider uppercase text-stone-500 dark:text-gold/60 mt-1 block">Live Academic Scribe</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 mx-1.5">
                  <button 
                    onClick={() => {
                      setIsCitationOpen(!isCitationOpen);
                      setContextMessageId(null);
                    }}
                    title="Academic Citation Helper"
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      isCitationOpen 
                        ? 'bg-crimson/15 text-crimson dark:bg-gold/20 dark:text-gold' 
                        : 'hover:bg-stone-200/50 dark:hover:bg-slate-800/80 text-stone-500 dark:text-gold/70'
                    }`}
                  >
                    <BookMarked className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={clearChat}
                    title="Clear Conversation"
                    className="p-2 rounded-lg hover:bg-stone-200/50 dark:hover:bg-slate-800/80 transition-colors text-stone-500 dark:text-gold/70"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-stone-200/50 dark:hover:bg-slate-800/80 transition-colors text-stone-500 dark:text-gold/70"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* DATABASE MODE TOGGLE SUB-BAR */}
              <div className={`px-4 py-2.5 flex items-center justify-between border-b text-[10px] uppercase font-mono tracking-wider z-10
                ${isSpace 
                  ? 'bg-[#060a22]/90 border-gold/10' 
                  : 'bg-stone-50/90 border-stone-200/60'
                }
              `}>
                <span className={isSpace ? 'text-gold/50' : 'text-stone-500'}>Scope of Query:</span>
                <div className="flex gap-1 bg-black/10 dark:bg-black/35 p-0.5 rounded-md border border-stone-200/5 dark:border-gold/5">
                  <button 
                    onClick={() => setQueryMode('corpus')}
                    className={`px-2 py-0.5 rounded text-[9px] transition-all cursor-pointer ${
                      queryMode === 'corpus'
                        ? isSpace 
                          ? 'bg-gold/20 text-gold-light border border-gold/30 font-bold' 
                          : 'bg-crimson/15 text-crimson border border-crimson/25 font-bold'
                        : isSpace 
                          ? 'text-slate-500 hover:text-slate-300' 
                          : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    University Corpus
                  </button>
                  <button 
                    onClick={() => setQueryMode('curriculum')}
                    className={`px-2 py-0.5 rounded text-[9px] transition-all cursor-pointer ${
                      queryMode === 'curriculum'
                        ? isSpace 
                          ? 'bg-gold/20 text-gold-light border border-gold/30 font-bold' 
                          : 'bg-crimson/15 text-crimson border border-crimson/25 font-bold'
                        : isSpace 
                          ? 'text-slate-500 hover:text-slate-300' 
                          : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    Curriculum
                  </button>
                </div>
              </div>

              {/* MESSAGES VIEWPORT */}
              <div 
                className="flex-1 p-4 overflow-y-auto space-y-4 font-serif text-[13px] leading-relaxed custom-scrollbar relative z-10"
                style={{
                  backgroundColor: isSpace ? '#030511' : '#fafaf5',
                  backgroundImage: isSpace 
                    ? `radial-gradient(rgba(212, 163, 89, 0.045) 1px, transparent 1px), radial-gradient(rgba(212, 163, 89, 0.02) 1px, transparent 1px)` 
                    : `radial-gradient(rgba(139, 26, 26, 0.035) 1px, transparent 1px)`,
                  backgroundSize: '24px 24px',
                  backgroundPosition: '0 0, 12px 12px'
                }}
              >
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex gap-3 max-w-[88%] ${
                      msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                    }`}
                  >
                    {/* Character Avatar Indicator */}
                    {msg.role !== 'user' && (
                      <div className="h-8 w-8 rounded-full border border-gold/25 flex items-center justify-center flex-shrink-0 bg-gradient-to-tr from-[#8b1a1a] to-[#c73e3e] dark:from-[#2a060a] dark:to-[#4a0d13] relative overflow-hidden shadow-md">
                        <span className="text-[10px] font-bold text-gold-light font-serif">الب</span>
                        <img 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6GPkUINYomPqZtlU7xopLCQf3q2nN-uUtfe1o0-i5-PYC9iizfy-0wzrokp8ZPsjwLw73OXyCEdL6yFr3uEb8pGYC1RHOHQADviljCbiMBXz7dn_ODjpxpQqyCH0IAfxdN4L-0H5a5HhTMbMpnVUet1SZ4jv33EnJ5hiAGRvpTQBIY9SfPkb6QEK-q5kZ06lCsprBWndsJOg3Q8bnWR_Bd-YSHR1sc4dBtaDowmYtYkMfqOkVQmsnr_F4sh4V_rnuzy8iOO-MdNYs" 
                          alt="Assistant" 
                          className="absolute inset-0 h-full w-full object-cover rounded-full z-10 transition-opacity duration-300"
                          onError={(e) => {
                            e.currentTarget.classList.add('opacity-0');
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="space-y-1 select-text">
                      {/* Message Bubble with elegant framing */}
                      <div className={`p-3.5 rounded-2xl shadow-[0_2px_8px_rgb(0,0,0,0.04)] border relative overflow-hidden
                        ${msg.role === 'user'
                          ? isSpace 
                            ? 'bg-gradient-to-br from-gold/15 to-gold/5 border-gold/35 text-gold-light rounded-tr-none' 
                            : 'bg-gradient-to-br from-[#8b1a1a]/10 to-[#8b1a1a]/5 border-crimson/20 text-[#4c0d0d] rounded-tr-none'
                          : isSpace 
                            ? 'bg-[#080d2c]/90 border-gold/15 border-l-2 border-l-gold text-white rounded-tl-none' 
                            : 'bg-white border-stone-200/80 border-l-2 border-l-crimson text-stone-850 rounded-tl-none'
                        }
                      `}>
                        {/* Scholarly watermark icon in background for scholarly responses */}
                        {msg.role !== 'user' && (
                          <div className={`absolute right-1.5 top-1.5 opacity-[0.035] pointer-events-none select-none text-gold ${isSpace ? 'text-gold' : 'text-crimson'}`}>
                            <Sparkles className="h-9 w-9" />
                          </div>
                        )}

                        {msg.role === 'user' ? (
                          <div className="text-xs md:text-[13px] leading-relaxed break-words whitespace-pre-wrap font-serif">
                            {msg.text}
                          </div>
                        ) : (
                          <FormattedText text={msg.text} isSpace={isSpace} />
                        )}
                      </div>

                      {/* Info & Status row */}
                      <div className={`text-[9.5px] font-mono uppercase tracking-wider mt-1.5 flex items-center gap-1.5 flex-wrap ${
                        msg.role === 'user' ? 'justify-end text-neutral-500' : 'text-neutral-400'
                      }`}>
                        <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {msg.isSimulated && (
                          <span className="text-[8px] bg-crimson/10 dark:bg-gold/10 text-crimson dark:text-gold px-1 rounded border border-gold/10">Sandbox</span>
                        )}
                        {msg.role !== 'user' && (
                          <button
                            onClick={() => {
                              const found = extractReferences(msg.text);
                              if (found.length > 0) {
                                const first = found[0];
                                setSelectedCitationType(first.type);
                                if (first.type === 'quran') {
                                  setCiteSurahNumber(first.data.surah);
                                  setCiteAyahNumber(first.data.ayah);
                                } else {
                                  setCiteHadithCollection(first.data.collection);
                                  setCiteHadithNumber(first.data.number);
                                }
                              }
                              setContextMessageId(msg.id);
                              setIsCitationOpen(true);
                            }}
                            title="Generate Academic Reference"
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-neutral-500 hover:text-crimson dark:text-gold/60 dark:hover:text-gold border border-stone-200/40 dark:border-slate-700/50 cursor-pointer transition-colors"
                          >
                            <Quote className="h-2 w-2" />
                            <span>Cite Reference</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Loader / Thinking state */}
                {isLoading && (
                  <div className="flex items-center gap-2.5 text-stone-500 dark:text-gold/60 text-xs font-mono py-2 pl-11">
                    <span className="h-2 w-2 rounded-full bg-crimson dark:bg-gold animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-crimson dark:bg-gold animate-bounce delay-100" />
                    <span className="h-2 w-2 rounded-full bg-crimson dark:bg-gold animate-bounce delay-200" />
                    <span className="ml-1.5 tracking-wider uppercase text-[9.5px] font-bold">Consulting jurisprudential guides...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* QUICK SUGGESTIONS CAROUSEL */}
              <div className={`px-4 py-2.5 border-t flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none z-10
                ${isSpace ? 'border-gold/10 bg-[#020512]/95' : 'border-stone-200 bg-stone-50/95'}
              `}>
                {SUGGESTIONS.map((tag, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(tag.query)}
                    className={`text-[10px] font-serif border px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer hover:scale-[1.03] active:scale-[0.98]
                      ${isSpace 
                        ? 'bg-slate-900/90 border-gold/15 text-gold-light hover:bg-gold/15 hover:border-gold' 
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100 hover:border-crimson'
                      }
                    `}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>

              {/* CHAT INPUT AREA */}
              <div className={`p-3.5 border-t flex items-center gap-2.5 z-10
                ${isSpace ? 'border-gold/10 bg-[#020512]/95' : 'border-stone-200 bg-stone-50/95'}
              `}>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask ALBAB AI..."
                  disabled={isLoading}
                  className={`flex-1 text-xs px-3.5 py-3 rounded-xl border leading-relaxed outline-none focus:ring-1 transition-all duration-200
                    ${isSpace 
                      ? 'bg-[#04081c]/90 border-gold/20 text-white placeholder-slate-500 focus:border-gold focus:ring-gold/30 shadow-inner' 
                      : 'bg-white border-stone-200 text-charcoal placeholder-stone-400 focus:border-crimson focus:ring-crimson/20 shadow-inner'
                    }
                  `}
                />
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputText.trim()}
                  className={`p-3 rounded-xl cursor-pointer font-bold flex items-center justify-center transition-all duration-300
                    ${isSpace 
                      ? 'bg-gold text-space hover:bg-white disabled:bg-slate-800 disabled:text-slate-500' 
                      : 'bg-crimson text-white hover:bg-black disabled:bg-stone-200 disabled:text-stone-400'
                    }
                  `}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              {/* CITATION HELPER DRAWER OVERLAY */}
              <AnimatePresence>
                {isCitationOpen && (
                  <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 24, stiffness: 220 }}
                    className={`absolute inset-0 z-30 flex flex-col shadow-2xl overflow-hidden rounded-2xl
                      ${isSpace 
                        ? 'bg-[#030614] border-l border-gold/15 text-gold-light' 
                        : 'bg-[#fafaf6] border-l border-stone-300 text-charcoal'
                      }
                    `}
                  >
                    {/* Drawer Header */}
                    <div className={`p-4 flex items-center justify-between border-b relative z-10
                      ${isSpace ? 'border-gold/15 bg-slate-950/60' : 'border-stone-200 bg-stone-100'}
                    `}>
                      <div className="flex items-center gap-2">
                        <BookMarked className={`h-4 w-4 ${isSpace ? 'text-gold' : 'text-crimson'}`} />
                        <h5 className="font-serif font-black text-[13px] tracking-wide uppercase">
                          Academic Citation Helper
                        </h5>
                      </div>
                      <button
                        onClick={() => {
                          setIsCitationOpen(false);
                          setContextMessageId(null);
                        }}
                        className="p-1 rounded-md hover:bg-stone-200/50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer text-stone-500 dark:text-gold/70"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Drawer Body (Scrollable contents) */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs relative z-10">
                      
                      {/* Toast Alert Inside Drawer */}
                      {citationToast && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-sans text-[11px] text-center"
                        >
                          {citationToast}
                        </motion.div>
                      )}

                      {/* Dynamic Context Extraction Banner if opened from a specific message */}
                      {contextMessageId && (() => {
                        const matchedMsg = messages.find(m => m.id === contextMessageId);
                        if (!matchedMsg) return null;
                        const foundInline = extractReferences(matchedMsg.text);
                        
                        return (
                          <div className={`p-3 rounded-lg border flex flex-col gap-2
                            ${isSpace ? 'bg-indigo-950/20 border-gold/10' : 'bg-stone-50 border-stone-200'}
                          `}>
                            <span className="font-mono text-[9px] uppercase tracking-wider text-stone-500 dark:text-gold/50">
                              Extracted from message:
                            </span>
                            <p className="italic text-[11px] line-clamp-2 text-stone-600 dark:text-stone-300">
                              "{matchedMsg.text.replace(/\*\*/g, '')}"
                            </p>
                            
                            {foundInline.length > 0 ? (
                              <div className="space-y-1.5 mt-1">
                                <span className="text-[10px] font-bold text-stone-500 dark:text-gold/70 flex items-center gap-1">
                                  <Sparkles className="h-3 w-3 text-gold" /> Auto-detected references:
                                </span>
                                <div className="flex flex-col gap-1">
                                  {foundInline.map((ref, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => {
                                        setSelectedCitationType(ref.type);
                                        if (ref.type === 'quran') {
                                          setCiteSurahNumber(ref.data.surah);
                                          setCiteAyahNumber(ref.data.ayah);
                                        } else {
                                          setCiteHadithCollection(ref.data.collection);
                                          setCiteHadithNumber(ref.data.number);
                                        }
                                      }}
                                      className={`px-2.5 py-1.5 rounded text-left border flex items-center justify-between text-[11px] font-serif transition-all cursor-pointer
                                        ${isSpace
                                          ? 'bg-slate-900/60 hover:bg-gold/10 border-gold/10 hover:border-gold/30'
                                          : 'bg-white hover:bg-crimson/5 border-stone-200 hover:border-crimson/20'
                                        }
                                      `}
                                    >
                                      <span className="font-medium">{ref.label}</span>
                                      <span className={`text-[10px] uppercase font-mono tracking-wider font-bold ${isSpace ? 'text-gold' : 'text-crimson'}`}>Load</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="text-[10px] italic text-amber-600 dark:text-amber-400">
                                No explicit scriptural verses or Hadith keywords auto-detected in this text. Use the builder below to manually configure coordinates.
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Builder Type Selector */}
                      <div className="space-y-1">
                        <label className="font-mono uppercase text-[9px] text-stone-500 dark:text-gold/50 tracking-wider">
                          Scriptural Source Class:
                        </label>
                        <div className="grid grid-cols-2 gap-1 bg-black/10 dark:bg-black/25 p-0.5 rounded-lg border border-stone-200/5">
                          <button
                            onClick={() => setSelectedCitationType('quran')}
                            className={`py-1.5 rounded-md font-serif text-xs font-bold transition-all cursor-pointer ${
                              selectedCitationType === 'quran'
                                ? isSpace
                                  ? 'bg-gold/20 text-gold-light border border-gold/20'
                                  : 'bg-white text-crimson shadow-sm border border-stone-200'
                                : 'text-stone-400 hover:text-stone-600 dark:text-slate-500 dark:hover:text-slate-300'
                            }`}
                          >
                            The Noble Quran
                          </button>
                          <button
                            onClick={() => setSelectedCitationType('hadith')}
                            className={`py-1.5 rounded-md font-serif text-xs font-bold transition-all cursor-pointer ${
                              selectedCitationType === 'hadith'
                                ? isSpace
                                  ? 'bg-gold/20 text-gold-light border border-gold/20'
                                  : 'bg-white text-crimson shadow-sm border border-stone-200'
                                : 'text-stone-400 hover:text-stone-600 dark:text-slate-500 dark:hover:text-slate-300'
                            }`}
                          >
                            Prophetic Hadith
                          </button>
                        </div>
                      </div>

                      {/* Dynamic Fields for Quran / Hadith */}
                      {selectedCitationType === 'quran' ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="font-mono text-[9px] text-stone-500 dark:text-gold/50 tracking-wider uppercase">
                                Surah Chapter:
                              </label>
                              <select
                                value={citeSurahNumber}
                                onChange={(e) => setCiteSurahNumber(e.target.value)}
                                className={`w-full p-2 rounded-lg border font-serif text-xs outline-none focus:ring-1
                                  ${isSpace
                                    ? 'bg-[#04081c] border-gold/15 text-white focus:border-gold'
                                    : 'bg-white border-stone-200 text-charcoal focus:border-crimson'
                                  }
                                `}
                              >
                                <option value="1">1. Al-Fatihah</option>
                                <option value="2">2. Al-Baqarah</option>
                                <option value="3">3. Al-Imran</option>
                                <option value="4">4. An-Nisa</option>
                                <option value="5">5. Al-Ma'idah</option>
                                <option value="6">6. Al-An'am</option>
                                <option value="7">7. Al-A'raf</option>
                                <option value="8">8. Al-Anfal</option>
                                <option value="9">9. At-Tawbah</option>
                                <option value="12">12. Yusuf</option>
                                <option value="18">18. Al-Kahf</option>
                                <option value="19">19. Maryam</option>
                                <option value="24">24. An-Nur</option>
                                <option value="36">36. Ya-Sin</option>
                                <option value="55">55. Ar-Rahman</option>
                                <option value="56">56. Al-Waqi'ah</option>
                                <option value="67">67. Al-Mulk</option>
                                <option value="112">112. Al-Ikhlas</option>
                                <option value="113">113. Al-Falaq</option>
                                <option value="114">114. An-Nas</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="font-mono text-[9px] text-stone-500 dark:text-gold/50 tracking-wider uppercase">
                                Ayah (Verse):
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="286"
                                value={citeAyahNumber}
                                onChange={(e) => setCiteAyahNumber(e.target.value)}
                                className={`w-full p-2 rounded-lg border font-mono text-xs outline-none focus:ring-1
                                  ${isSpace
                                    ? 'bg-[#04081c] border-gold/15 text-white focus:border-gold'
                                    : 'bg-white border-stone-200 text-charcoal focus:border-crimson'
                                  }
                                `}
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="font-mono text-[9px] text-stone-500 dark:text-gold/50 tracking-wider uppercase">
                              Academic Translation Source:
                            </label>
                            <select
                              value={citeTranslator}
                              onChange={(e) => setCiteTranslator(e.target.value)}
                              className={`w-full p-2 rounded-lg border font-serif text-xs outline-none focus:ring-1
                                ${isSpace
                                  ? 'bg-[#04081c] border-gold/15 text-white focus:border-gold'
                                  : 'bg-white border-stone-200 text-charcoal focus:border-crimson'
                                }
                              `}
                            >
                              <option value="Sahih International">Sahih International (Standard)</option>
                              <option value="A.J. Arberry">A.J. Arberry (Classical Scholarly)</option>
                              <option value="Abdullah Yusuf Ali">Abdullah Yusuf Ali</option>
                              <option value="Marmaduke Pickthall">Marmaduke Pickthall</option>
                              <option value="Muhammad Asad">Muhammad Asad (The Message of The Qur'an)</option>
                            </select>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="font-mono text-[9px] text-stone-500 dark:text-gold/50 tracking-wider uppercase">
                              Hadith Compilation / Book:
                            </label>
                            <select
                              value={citeHadithCollection}
                              onChange={(e) => setCiteHadithCollection(e.target.value)}
                              className={`w-full p-2 rounded-lg border font-serif text-xs outline-none focus:ring-1
                                ${isSpace
                                  ? 'bg-[#04081c] border-gold/15 text-white focus:border-gold'
                                  : 'bg-white border-stone-200 text-charcoal focus:border-crimson'
                                }
                              `}
                            >
                              <option value="Sahih al-Bukhari">Sahih al-Bukhari</option>
                              <option value="Sahih Muslim">Sahih Muslim</option>
                              <option value="Sunan al-Tirmidhi">Sunan al-Tirmidhi</option>
                              <option value="Sunan Abi Dawud">Sunan Abi Dawud</option>
                              <option value="Sunan Ibn Majah">Sunan Ibn Majah</option>
                              <option value="Sunan al-Nasa'i">Sunan al-Nasa'i</option>
                              <option value="Al-Muwatta of Imam Malik">Al-Muwatta (Imam Malik)</option>
                              <option value="Riyadh as-Salihin">Riyadh as-Salihin</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="font-mono text-[9px] text-stone-500 dark:text-gold/50 tracking-wider uppercase">
                                Hadith Number:
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. 248"
                                value={citeHadithNumber}
                                onChange={(e) => setCiteHadithNumber(e.target.value)}
                                className={`w-full p-2 rounded-lg border font-mono text-xs outline-none focus:ring-1
                                  ${isSpace
                                    ? 'bg-[#04081c] border-gold/15 text-white focus:border-gold'
                                    : 'bg-white border-stone-200 text-charcoal focus:border-crimson'
                                  }
                                `}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-mono text-[9px] text-stone-500 dark:text-gold/50 tracking-wider uppercase">
                                Narrating Companion:
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Abu Hurairah"
                                value={citeHadithNarrator}
                                onChange={(e) => setCiteHadithNarrator(e.target.value)}
                                className={`w-full p-2 rounded-lg border font-serif text-xs outline-none focus:ring-1
                                  ${isSpace
                                    ? 'bg-[#04081c] border-gold/15 text-white focus:border-gold'
                                    : 'bg-white border-stone-200 text-charcoal focus:border-crimson'
                                  }
                                `}
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="font-mono text-[9px] text-stone-500 dark:text-gold/50 tracking-wider uppercase">
                              Section/Book Title:
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Book of Knowledge"
                              value={citeHadithBookName}
                              onChange={(e) => setCiteHadithBookName(e.target.value)}
                              className={`w-full p-2 rounded-lg border font-serif text-xs outline-none focus:ring-1
                                ${isSpace
                                  ? 'bg-[#04081c] border-gold/15 text-white focus:border-gold'
                                  : 'bg-white border-stone-200 text-charcoal focus:border-crimson'
                                }
                              `}
                            />
                          </div>
                        </div>
                      )}

                      {/* Style selection dropdown */}
                      <div className="space-y-1 border-t pt-3 border-stone-200 dark:border-slate-800">
                        <label className="font-mono text-[9px] text-stone-500 dark:text-gold/50 tracking-wider uppercase">
                          Scholarly Formatting Standard:
                        </label>
                        <select
                          value={citationStyle}
                          onChange={(e) => setCitationStyle(e.target.value as any)}
                          className={`w-full p-2 rounded-lg border font-serif text-xs outline-none focus:ring-1
                            ${isSpace
                              ? 'bg-[#04081c] border-gold/15 text-white focus:border-gold'
                              : 'bg-white border-stone-200 text-charcoal focus:border-crimson'
                            }
                          `}
                        >
                          <option value="traditional">Traditional Islamic Scribe Format</option>
                          <option value="chicago">Chicago Manual of Style (17th Ed.)</option>
                          <option value="apa">APA (7th Edition)</option>
                          <option value="mla">MLA (9th Edition)</option>
                          <option value="harvard">Harvard Standard Style</option>
                        </select>
                      </div>

                      {/* Format Preview Section */}
                      <div className="space-y-2 border-t pt-3 border-stone-200 dark:border-slate-800">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-500 dark:text-gold/50 font-bold block">
                          Formatted Citation Preview:
                        </span>
                        <div className={`p-3.5 rounded-xl border font-serif text-[11.5px] leading-relaxed relative select-all
                          ${isSpace 
                            ? 'bg-[#050921]/90 border-gold/15 text-gold-light' 
                            : 'bg-amber-50/10 border-stone-250 text-stone-850 bg-stone-50/40'
                          }
                        `}>
                          {generateCitationString({
                            type: selectedCitationType,
                            style: citationStyle,
                            quranData: { surah: citeSurahNumber, ayah: citeAyahNumber, translator: citeTranslator },
                            hadithData: { collection: citeHadithCollection, number: citeHadithNumber, narrator: citeHadithNarrator, bookName: citeHadithBookName }
                          })}
                        </div>
                      </div>

                    </div>

                    {/* Drawer Action Bar */}
                    <div className={`p-4 border-t flex gap-2 relative z-10
                      ${isSpace ? 'border-gold/10 bg-slate-950/80' : 'border-stone-200 bg-stone-50'}
                    `}>
                      <button
                        onClick={() => {
                          const resultStr = generateCitationString({
                            type: selectedCitationType,
                            style: citationStyle,
                            quranData: { surah: citeSurahNumber, ayah: citeAyahNumber, translator: citeTranslator },
                            hadithData: { collection: citeHadithCollection, number: citeHadithNumber, narrator: citeHadithNarrator, bookName: citeHadithBookName }
                          });
                          navigator.clipboard.writeText(resultStr);
                          setCitationToast("Citation copied to clipboard successfully!");
                          setTimeout(() => setCitationToast(null), 3000);
                        }}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:opacity-90
                          ${isSpace 
                            ? 'bg-gold text-[#04081c]' 
                            : 'bg-crimson text-white'
                          }
                        `}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Citation</span>
                      </button>

                      <button
                        onClick={() => {
                          const resultStr = generateCitationString({
                            type: selectedCitationType,
                            style: citationStyle,
                            quranData: { surah: citeSurahNumber, ayah: citeAyahNumber, translator: citeTranslator },
                            hadithData: { collection: citeHadithCollection, number: citeHadithNumber, narrator: citeHadithNarrator, bookName: citeHadithBookName }
                          });
                          setInputText(prev => prev ? `${prev}\n\n[Reference: ${resultStr}]` : `[Reference: ${resultStr}]`);
                          setIsCitationOpen(false);
                          setContextMessageId(null);
                        }}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold border cursor-pointer transition-all
                          ${isSpace 
                            ? 'border-gold/20 hover:border-gold/50 text-gold-light hover:bg-gold/5' 
                            : 'border-stone-200 hover:bg-stone-150 text-stone-600'
                          }
                        `}
                        title="Insert reference into text input"
                      >
                        Insert Reference
                      </button>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

// PREMIUM FORMATTED TEXT RENDERER FOR AIU SCHOLASTIC RESPONSE MESSAGES
function FormattedText({ text, isSpace }: { text: string; isSpace: boolean }) {
  // Split message by double newlines to discover paragraphs
  const paragraphs = text.split('\n\n');

  return (
    <div className="space-y-3 font-serif">
      {paragraphs.map((para, pIdx) => {
        // If paragraph is a bullet list (each line begins with - or * or index)
        const lines = para.split('\n');
        const isList = lines.every(line => {
          const trimmedLine = line.trim();
          if (!trimmedLine) return true; // empty lines inside list blocks are fine
          return trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ') || /^\d+\.\s/.test(trimmedLine);
        });

        if (isList && lines.length > 0) {
          return (
            <ul key={pIdx} className="list-none pl-1 space-y-1.5 my-2">
              {lines.map((line, lIdx) => {
                const trimmed = line.trim();
                if (!trimmed) return null;
                const cleaned = trimmed.replace(/^[-*]\s+|\d+\.\s+/, '');
                const bulletSymbol = trimmed.startsWith('- ') || trimmed.startsWith('* ') ? '•' : trimmed.match(/^\d+\./)?.[0] || '•';
                return (
                  <li key={lIdx} className="flex gap-2.5 text-[12.5px] leading-relaxed items-start">
                    <span className={`font-mono font-black select-none text-xs shrink-0 mt-[1.5px] ${isSpace ? 'text-gold' : 'text-crimson'}`}>
                      {bulletSymbol}
                    </span>
                    <span className="flex-1 text-inherit">{parseInlineFormatting(cleaned, isSpace)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // Just regular line, but could be a heading
        const trimmed = para.trim();
        if (trimmed.startsWith('### ')) {
          return (
            <h5 key={pIdx} className={`font-serif font-bold text-xs uppercase tracking-wider mt-3 mb-1.5 ${isSpace ? 'text-gold-light' : 'text-crimson'}`}>
              {parseInlineFormatting(trimmed.substring(4), isSpace)}
            </h5>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h4 key={pIdx} className={`font-serif font-black text-[13px] tracking-wide mt-4 mb-2 pb-1 border-b ${isSpace ? 'text-gold-light border-gold/10' : 'text-crimson border-crimson/10'}`}>
              {parseInlineFormatting(trimmed.substring(3), isSpace)}
            </h4>
          );
        }

        // Standard paragraph
        return (
          <p key={pIdx} className="text-[12.5px] leading-relaxed break-words font-serif text-inherit text-justify">
            {parseInlineFormatting(para, isSpace)}
          </p>
        );
      })}
    </div>
  );
}

// Inline formatting parser that safely handles **bold** and *italics* WITHOUT external library conflicts.
function parseInlineFormatting(text: string, isSpace: boolean): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|\*.*?\*)/g;
  const segments = text.split(regex);

  segments.forEach((segment, idx) => {
    if (segment.startsWith('**') && segment.endsWith('**')) {
      const clean = segment.substring(2, segment.length - 2);
      parts.push(
        <strong key={idx} className={`font-bold tracking-normal ${isSpace ? 'text-gold-light drop-shadow-[0_0_8px_rgba(234,179,8,0.15)]' : 'text-[#8b1a1a]'}`}>
          {clean}
        </strong>
      );
    } else if (segment.startsWith('*') && segment.endsWith('*')) {
      const clean = segment.substring(1, segment.length - 1);
      parts.push(
        <em key={idx} className="italic tracking-normal opacity-90">
          {clean}
        </em>
      );
    } else {
      parts.push(segment);
    }
  });

  return parts;
}

// INTELLIGENT SCRIPTURE & HADITH PARSER FOR SCHOLASTIC CHATS
interface ExtractedRef {
  type: 'quran' | 'hadith';
  label: string;
  data: any;
}

function extractReferences(text: string): ExtractedRef[] {
  const refs: ExtractedRef[] = [];
  if (!text) return refs;
  
  // 1. Identify Quran Chapter:Verse (including common terms like Quran 2:255, Surah 3:19, or coordinates 5:3)
  const quranRegex = /\b(?:Quran|Surah)?\s*([1-9]\d{0,2}):([1-9]\d{0,2})\b/gi;
  let match;
  const seenQuran = new Set<string>();
  
  while ((match = quranRegex.exec(text)) !== null) {
    const surahNum = match[1];
    const ayahNum = match[2];
    const key = `${surahNum}:${ayahNum}`;
    
    // Bounds check to avoid matching timestamps (e.g. 11:30 PM inside text)
    const sInt = parseInt(surahNum);
    const aInt = parseInt(ayahNum);
    if (sInt >= 1 && sInt <= 114 && aInt >= 1 && aInt <= 286) {
      if (!seenQuran.has(key)) {
        seenQuran.add(key);
        refs.push({
          type: 'quran',
          label: `Quran [Surah ${surahNum}, Ayah ${ayahNum}]`,
          data: { surah: surahNum, ayah: ayahNum }
        });
      }
    }
  }

  // 2. Identify Hadith Compilations
  const hadithSources = [
    { name: 'Sahih al-Bukhari', keywords: [/Bukhari/i, /al-Bukhari/i] },
    { name: 'Sahih Muslim', keywords: [/Muslim/i, /Sahih Muslim/i] },
    { name: 'Sunan al-Tirmidhi', keywords: [/Tirmidhi/i, /al-Tirmidhi/i] },
    { name: 'Sunan Abi Dawud', keywords: [/Abi Dawud/i, /Abu Dawud/i, /Abu Dawood/i] },
    { name: 'Sunan Ibn Majah', keywords: [/Ibn Majah/i, /Ibn Maajah/i] },
    { name: 'Sunan al-Nasa\'i', keywords: [/Nasa'i/i, /al-Nasa'i/i, /Nasai/i] },
    { name: 'Al-Muwatta', keywords: [/Muwatta/i, /Imam Malik/i] },
    { name: 'Riyadh as-Salihin', keywords: [/Riyadh/i, /Riyad/i, /Salihin/i] }
  ];

  // Pick up numbers near hadith keywords
  const numRegex = /(?:Hadith|number|#)?\s*([1-9]\d{0,4})/i;
  
  hadithSources.forEach(src => {
    const matchedKeyword = src.keywords.some(kw => kw.test(text));
    if (matchedKeyword) {
      let hadithNum = '1';
      const numMatch = text.match(numRegex);
      if (numMatch) {
         hadithNum = numMatch[1];
      }
      refs.push({
        type: 'hadith',
        label: `${src.name} (Hadith #${hadithNum})`,
        data: { collection: src.name, number: hadithNum }
      });
    }
  });

  return refs;
}

// MULTI-STYLE ACADEMIC CITATION GENERATION TEMPLATES
function generateCitationString({
  type,
  style,
  quranData,
  hadithData
}: {
  type: 'quran' | 'hadith';
  style: 'traditional' | 'chicago' | 'apa' | 'mla' | 'harvard';
  quranData?: { surah: string; ayah: string; translator: string };
  hadithData?: { collection: string; number: string; narrator: string; bookName: string };
}): string {
  const suwarNames: Record<string, { arabic: string; latin: string }> = {
    "1": { latin: "Al-Fatihah", arabic: "الفاتحة" },
    "2": { latin: "Al-Baqarah", arabic: "البقرة" },
    "3": { latin: "Al-Imran", arabic: "آل عمران" },
    "4": { latin: "An-Nisa", arabic: "النساء" },
    "5": { latin: "Al-Ma'idah", arabic: "المائدة" },
    "6": { latin: "Al-An'am", arabic: "الأنعام" },
    "7": { latin: "Al-A'raf", arabic: "الأعراف" },
    "8": { latin: "Al-Anfal", arabic: "الأنفال" },
    "9": { latin: "At-Tawbah", arabic: "التوبة" },
    "12": { latin: "Yusuf", arabic: "يوسف" },
    "18": { latin: "Al-Kahf", arabic: "الكهف" },
    "19": { latin: "Maryam", arabic: "مريم" },
    "24": { latin: "An-Nur", arabic: "النور" },
    "36": { latin: "Ya-Sin", arabic: "يس" },
    "55": { latin: "Ar-Rahman", arabic: "الرحمن" },
    "56": { latin: "Al-Waqi'ah", arabic: "الواقعة" },
    "67": { latin: "Al-Mulk", arabic: "الملك" },
    "112": { latin: "Al-Ikhlas", arabic: "الإخلاص" },
    "113": { latin: "Al-Falaq", arabic: "الفلق" },
    "114": { latin: "An-Nas", arabic: "الناس" }
  };

  const getSurahName = (num: string) => {
    return suwarNames[num]?.latin || `Surah #${num}`;
  };

  if (type === 'quran') {
    const s = quranData?.surah || '2';
    const a = quranData?.ayah || '255';
    const trans = quranData?.translator || 'Sahih International';
    const sName = getSurahName(s);

    switch (style) {
      case 'traditional':
        return `📖 Traditional Isnad Scribe: The Divine Word of the Qur'an [${sName} (${s}:${a})], transmitted as Hafs 'an 'Asim recitation, rendered according to the ${trans} translation.`;
      case 'chicago':
        return `The Qur'an. Translated by ${trans}. Surah ${sName} ${s}:${a}.`;
      case 'apa':
        return `The Qur'an (${trans}, Trans.). Surah ${sName} (${s}:${a}).`;
      case 'mla':
        return `The Qur'an. Translated by ${trans}, Surah ${sName}, ${s}:${a}.`;
      case 'harvard':
        return `The Qur'an (n.d.) Translated by ${trans}. Surah ${sName} ${s}:${a}.`;
      default:
        return `The Qur'an, Surah ${sName} (${s}:${a}).`;
    }
  } else {
    // Hadith
    const col = hadithData?.collection || 'Sahih al-Bukhari';
    const num = hadithData?.number || '1';
    const narr = hadithData?.narrator || 'Umar ibn al-Khattab';
    const bName = hadithData?.bookName || 'Book of Faith';

    switch (style) {
      case 'traditional':
        return `📜 Traditional Isnad-Chain: Narrated by the noble companion ${narr}. Verified and recorded by Imam al-Bukhari in his seminal compilation [${col}], ${bName}, Hadith #${num}. Certified under high-grade authentic (*Sahih*) transmission standards.`;
      case 'chicago':
        return `${col.split(' ').pop()}, ${narr.split(' ').shift()}. *${col}*. Narrated by ${narr}, ${bName}, Hadith ${num}.`;
      case 'apa':
        return `${col.split(' ').pop()}, ${narr.charAt(0)}. (n.d.). *${col}* (Hadith ${num}). Narrated by ${narr}. ${bName}.`;
      case 'mla':
        return `${col.split(' ').pop()}, ${narr}. *${col}*. Narrated by ${narr}, ${bName}, Hadith ${num}.`;
      case 'harvard':
        return `${col.split(' ').pop()} (n.d.) *${col}*, Hadith ${num}. Narrated by ${narr}. ${bName}.`;
      default:
        return `${col}, Hadith #${num} (Narrated by ${narr}).`;
    }
  }
}
