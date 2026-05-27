import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, BookOpen, Sparkles, HelpCircle, ShieldAlert, 
  ArrowRight, RefreshCw, Send, CheckCircle2, Bookmark,
  BookmarkCheck, Star, Sparkle, AlertTriangle, MessageSquare
} from 'lucide-react';

interface WaswasClinicProps {
  currentTheme: 'parchment' | 'space';
  onBackToLanding: () => void;
}

interface SavedSession {
  id: string;
  timestamp: string;
  userMessage: string;
  response: string;
  category: string;
}

export default function WaswasClinic({ currentTheme, onBackToLanding }: WaswasClinicProps) {
  const [inputText, setInputText] = useState('');
  const [category, setCategory] = useState('Doubts about Allah');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [isSessionSaved, setIsSessionSaved] = useState(false);
  const [showNotification, setShowNotification] = useState<string | null>(null);
  
  const responseEndRef = useRef<HTMLDivElement>(null);

  // Load session history from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('albab_waswas_sessions');
      if (saved) {
        setSavedSessions(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load waswas sessions:", e);
    }
  }, []);

  // Soft scroll to response
  useEffect(() => {
    if (isStreaming && responseEndRef.current) {
      responseEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [streamedResponse, isStreaming]);

  const triggerNotification = (msg: string) => {
    setShowNotification(msg);
    setTimeout(() => setShowNotification(null), 4000);
  };

  const handleChipClick = (text: string) => {
    setCategory(text);
    if (text === "Doubts about Allah") {
      setInputText("I keep having terrifying, intrusive thoughts questioning why Allah allows trials, and I fear these passing thoughts mean I have lost my faith or committed a sin.");
    } else if (text === "Religious OCD / purity") {
      setInputText("I spend hours repeating my Wudu and washing my hands because I keep feeling doubts that I did not wash correctly, which leaves me completely exhausted during my prayers.");
    } else if (text === "Existential fear of death") {
      setInputText("I have intense, paralyzing panics about death, the grave, and the afterlife. It consumes my thoughts, making me feel helpless, cold, and anxious.");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsStreaming(true);
    setHasSubmitted(true);
    setStreamedResponse('');
    setIsSessionSaved(false);

    try {
      const response = await fetch('/api/labs/waswas-clinic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: inputText, 
          category,
          email: localStorage.getItem('albab_logged_in_email') || 'visitor@albab.university'
        })
      });

      if (!response.ok) {
        throw new Error("Server returned error status " + response.status);
      }

      if (!response.body) {
        throw new Error("No readable stream in response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setStreamedResponse(prev => prev + chunk);
      }
    } catch (err: any) {
      console.error(err);
      triggerNotification("Stream error: " + err.message);
      
      // Resilient fallback simulated stream if server connection fails
      simulateStreamFallback();
    } finally {
      setIsStreaming(false);
    }
  };

  const simulateStreamFallback = async () => {
    setIsStreaming(true);
    setStreamedResponse('');
    
    let template = "";
    if (category === "Doubts about Allah") {
      template = `**ما تشعر به طبيعي — What You Feel Is Normal**
It is deeply comforting to know that experiencing these invasive thoughts or doubts about the Divine is actually normal and does not mean you have lost your faith. In fact, a companion once admitted to the Prophet (ﷺ) that he had thoughts too frightening to speak of, and the Prophet (ﷺ) responded: "That is pure faith" (Sahih Muslim 132), as it shows your heart is actively rejecting the whisper.

**الفهم الإسلامي — The Islamic Understanding**
Spiritual whispers, or *waswas*, are sent by Satan as a last resort when he realizes he cannot make a believer abandon their faith directly. He targets the most precious treasury—your heart—and the very presence of this struggle shows there is gold inside your heart that he is trying to steal. As Allah states in the Quran: "And if a whisper from Satan reaches you, then seek refuge in Allah. Indeed, He is the Hearing, the Knowing" (Surah Al-A'raf, 7:200).

**خطوات عملية — Your 3-Step Practice**
Step 1: **ACT Defusion & Labeling**: When a doubt arises, do not argue with it or try to logicalize it. Simply label it: "I am having an intrusive thought about Allah's attributes" or "This is my mind throwing a waswas message." Let it sit there like a background passenger in a bus; you don’t have to engage or steer towards it.
Step 2: **Sunnah Grounding & Physical Relief**: Perform a meticulous, mindful Wudu where you feel the cool water touching your skin, centering your physical presence in the real world. Follow it by invoking: "A'udhu billahi minash-shaytanir-rajim" and turning your head slightly to the left, mimicking the spiritual expulsion of doubt as instructed by the Messenger of Allah.
Step 3: **The Mirror Reframe of Ibn al-Qayyim**: In *Ighathat al-Lahfan*, Ibn al-Qayyim reminds us that the heart is like a polished mirror. Dust will settle on it occasionally, but the dust is not the mirror itself. The intrusive thoughts are merely clouds passing through the sky of your mind; they are not your identity, and your conscience's discomfort is proof of your underlying purity.

**دعاؤك — Your Prescribed Dua**
To comfort your soul, recite the protective prayer of the companions:
Arabic: آمَنْتُ بِاللَّهِ وَرُسُلِهِ
Transliteration: "Amantu billahi wa rusulihi"
Meaning: "I have believed in Allah and His Messengers."
Read this gently whenever a terrifying doubt asserts itself, making a conscious choice to disengage from the mental maze.

**كلمة أخيرة — A Closing Word**
Take a deep breath and rest in the knowledge that your pain over these thoughts is the clearest signature of your living, beating, and deeply sincere conscience.

If your symptoms are persistent or severe, please speak with a qualified mental health professional alongside your spiritual practice.`;
    } else if (category === "Religious OCD / purity") {
      template = `**ما تشعر به طبيعي — What You Feel Is Normal**
The exhausting loop of repeating your cleansing rituals and prayers is a profound pain, but it is deeply human. The Messenger of Allah (ﷺ) recognized this heavy burden and encouraged lighthearted ease, assuring the companions that religious practice is meant to build comfort, not distress: "The religion is ease, and no one makes the religion difficult except that it defeats them" (Sahih al-Bukhari).

**الفهم الإسلامي — The Islamic Understanding**
In Islamic theology, there is a specific whispers architect named *Khanzab* or *Walahan* who is assigned to contaminate the believer's Wudu and Salah using doubting thoughts. This obsessive loop stems from a sincere desire for perfection, which Satan exploits into a mechanism of spiritual burnout. Islam teaches that certainty is not removed by doubt (*Al-Yaqin la Yazulu bish-Shakk*), meaning your praise stands valid even if you feel unsure.

**خطوات عملية — Your 3-Step Practice**
Step 1: **ACT Acceptance & Exposure**: When the urge to repeat Wudu whispers "you missed a spot," accept the feeling of anxiety without obeying the action. Say to yourself: "I feel anxious that my wash was imperfect, and I am willing to carry this uncomfortable feeling of doubt onto my prayer rug."
Step 2: **Sunnah Sufficiency Rule**: Limit yourself strictly to washing each limb three times maximum, following the clear, final bounds set by the Sunnah. The Prophet (ﷺ) warned: "Whoever goes beyond this has done evil, transgressed, and done injustice" (Sunan an-Nasa'i). Over-washing is therefore the true error.
Step 3: **Spiritual Protection Reframe**: In *Ighathat al-Lahfan*, Ibn al-Qayyim asserts that excessive caution is a form of secret conceit where the person believes their self-invented standards are superior to the ease modeled by the Prophet (ﷺ). Accept the default state of cleanliness and bypass the impulse.

**دعاؤك — Your Prescribed Dua**
To lock your peace of mind, recite:
Arabic: اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ خَبَثِ الْوَسْوَاسِ رَبِّ اشْرَحْ لِي صَدْرِي
Transliteration: "Allahumma inni a'udhu bika min khabathil-waswas. Rabbi-shrah li sadri"
Meaning: "O Allah, I seek refuge in You from the malignancy of obsessive thoughts. My Lord, expand for me my chest."
Read this once before beginning Wudu to anchor your heart in divine guardianship.

**كلمة أخيرة — A Closing Word**
Your deep care for the validity of your acts of devotion shows your clean integrity; let go of the burden and trust that Allah receives your broken attempts with complete mercy.

If your symptoms are persistent or severe, please speak with a qualified mental health professional alongside your spiritual practice.`;
    } else {
      template = `**ما تشعر به طبيعي — What You Feel Is Normal**
The fear of death and the unknown path that lies ahead is a profound existential tremor that is completely normal for a believer to carry. The companions occasionally confessed to the Prophet (ﷺ) their deep anxieties about the final exit, and he comforted them with hope, stating: "Allah is more merciful to His servants than a mother is to her child" (Sahih al-Bukhari), establishing a sanctuary of love.

**الفهم الإسلامي — The Islamic Understanding**
In Islamic philosophy, the dread of the grave (*Al-Qabr*) is often an uncalibrated lens that looks only at punishment rather than reunification with the Beloved. Death is not an absolute end, but a clean passage (*Barzakh*) where the soul of the sincere is met by fragrant breezes and light. Intrusive panics are reminders to construct a beautiful homeland hereafter, but they must not paralyze your earthly assignment.

**خطوات عملية — Your 3-Step Practice**
Step 1: **ACT Grounding & Present Anchoring**: When death panic storms your mind, bring your awareness to the immediate present. Notice: "My chest is breathing, my feet are on the floor, and I am fully alive in this present second." Breathe slowly, letting the waves of fear wash over you without resisting, knowing anxiety rises then subsides.
Step 2: **Sunnah Sunset Meditation**: Sit quietly between Asr and Maghrib, looking outside at the natural cycle of the day ending. Softly recite: "Radhitu billahi Rabba" (I am content with Allah as my Lord). This grounds your timeline inside the divine diurnal rhythms.
Step 3: **Ibn al-Qayyim's Anchor Reframe**: In *Ighathat al-Lahfan*, Ibn al-Qayyim notes that the believer should navigate the world with the wing of fear and the wing of hope, but as one approaches the thoughts of the hereafter, the wing of Hope (*Raja'*) must be far larger. Reframe death as a return to the Source of absolute light and goodness.

**دعاؤك — Your Prescribed Dua**
To tranquilize your fear of the future, recite:
Arabic: اللَّهُمَّ اجْعَلْ خَيْرَ عُمُرِي آخِرَهُ وَخَيْرَ عَمَلِي خَوَاتِمَهُ
Transliteration: "Allahumma-j'al khayra 'umuri akhirahu wa khayra 'amali khawatimahu"
Meaning: "O Allah, make the best of my life its end, and the best of my deeds its final ones."
Recite this with deep presence as your night begins to secure peaceful rest.

**كلمة أخيرة — A Closing Word**
Your anxiety about meeting the Divine is testimony to a soul that honors the sacred values; sleep tonight in the warm protection of His unmeasured kindness.

If your symptoms are persistent or severe, please speak with a qualified mental health professional alongside your spiritual practice.`;
    }

    const words = template.split(" ");
    let i = 0;
    const interval = setInterval(() => {
      if (i < words.length) {
        setStreamedResponse(prev => prev + (prev ? " " : "") + words[i]);
        i++;
      } else {
        clearInterval(interval);
        setIsStreaming(false);
      }
    }, 45); // Speed multiplier of stream
  };

  const saveSession = async () => {
    if (!streamedResponse || isSessionSaved) return;

    const email = localStorage.getItem('albab_logged_in_email') || 'visitor@albab.university';
    const uid = email.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = new Date().toISOString();
    
    const newSession: SavedSession = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp,
      userMessage: inputText,
      response: streamedResponse,
      category
    };

    // 1. Try to post to the actual firebase backend route we will create in server.ts
    try {
      const res = await fetch('/api/labs/waswas/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, email, session: newSession })
      });
      
      if (res.ok) {
        setIsSessionSaved(true);
        triggerNotification("Session saved securely to your scholastic portfolio!");
      } else {
        throw new Error("Server failed with status " + res.status);
      }
    } catch (e) {
      console.warn("Server save failed. Falling back to robust LocalStorage persistence:", e);
      
      // Fallback local persistence
      const nextSessions = [newSession, ...savedSessions];
      setSavedSessions(nextSessions);
      localStorage.setItem('albab_waswas_sessions', JSON.stringify(nextSessions));
      setIsSessionSaved(true);
      triggerNotification("Session securely saved to your local offline journal!");
    }
  };

  const handleNewQuestion = () => {
    setInputText('');
    setStreamedResponse('');
    setHasSubmitted(false);
    setIsSessionSaved(false);
  };

  // Parser helper to split into headers
  const parseSections = (text: string) => {
    const sections = {
      normal: "",
      understanding: "",
      practice: "",
      dua: "",
      closing: "",
      disclaimer: "",
    };

    const headers = [
      { key: "normal", regex: /\*\*ما تشعر به طبيعي\s*—\s*What You Feel Is Normal\*\*/i },
      { key: "understanding", regex: /\*\*الفهم الإسلامي\s*—\s*The Islamic Understanding\*\*/i },
      { key: "practice", regex: /\*\*خطوات عملية\s*—\s*Your 3-Step Practice\*\*/i },
      { key: "dua", regex: /\*\*دعاؤك\s*—\s*Your Prescribed Dua\*\*/i },
      { key: "closing", regex: /\*\*كلمة أخيرة\s*—\s*A Closing Word\*\*/i },
    ];

    const indices = headers.map(h => ({
      key: h.key,
      index: text.search(h.regex),
      matchLength: text.match(h.regex)?.[0]?.length || 0
    })).filter(h => h.index !== -1).sort((a,b) => a.index - b.index);

    if (indices.length === 0) {
      return { ...sections, normal: text };
    }

    for (let i = 0; i < indices.length; i++) {
      const start = indices[i].index + indices[i].matchLength;
      const end = (i + 1 < indices.length) ? indices[i+1].index : text.length;
      let sectionText = text.substring(start, end).trim();
      
      if (indices[i].key === "closing") {
        const disclaimerIndex = sectionText.toLowerCase().indexOf("if your symptoms are persistent");
        if (disclaimerIndex !== -1) {
          sections.disclaimer = sectionText.substring(disclaimerIndex).trim();
          sectionText = sectionText.substring(0, disclaimerIndex).trim();
        }
      }

      sections[indices[i].key as keyof typeof sections] = sectionText;
    }

    return sections;
  };

  const parsed = parseSections(streamedResponse);

  return (
    <div 
      id="waswas-clinic-container"
      className="min-h-screen pt-28 pb-16 px-4 sm:px-6 md:px-12 arabesque-grid bg-[#F5F0E8] text-[#1A1A1A] font-sans selection:bg-[#8B1A1A]/10"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* BANNER NOTIFICATION */}
        <AnimatePresence>
          {showNotification && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#8B1A1A] text-white py-3 px-6 rounded-md shadow-xl border border-[#C4A35A]/30 flex items-center gap-3 text-xs md:text-sm font-mono tracking-wider uppercase"
            >
              <CheckCircle2 className="h-4 w-4 text-[#C4A35A] animate-bounce" />
              <span>{showNotification}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PAGE HEADER */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#8B1A1A]/5 rounded-sm border border-[#8B1A1A]/15 text-[10px] md:text-xs font-mono tracking-[0.2em] uppercase text-[#8B1A1A]">
            <Heart className="h-3.5 w-3.5 fill-[#8B1A1A] animate-pulse" />
            Albab Scholastic Sanctuary
          </div>

          <h1 className="font-serif font-black text-4xl sm:text-5xl md:text-6xl text-[#8B1A1A] tracking-tight">
            Waswas Clinic <span className="amiri text-[#C4A35A] font-normal font-sans ml-2">وَسْوَاس</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-[#555555] font-serif max-w-2xl mx-auto leading-relaxed italic">
            "A safe space for spiritual doubt and obsessive thoughts"
          </p>

          <div className="inline-block max-w-xl bg-amber-50 rounded-sm border border-amber-200 py-2.5 px-4 text-xs text-amber-800 leading-relaxed font-serif shadow-sm">
            <span className="font-bold underline">Disclaimer:</span> This is spiritual guidance, not a replacement for professional mental health care.
          </div>
        </header>

        {/* INTERACTIVE BOARD */}
        <div className="bg-[#FAF8F5] border border-[#8B1A1A]/10 p-6 sm:p-8 rounded-sm shadow-md space-y-6">
          
          {/* CHIPS AREA */}
          <div className="space-y-3">
            <label className="block text-[10px] font-mono uppercase tracking-widest text-stone-500 font-bold">
              Select or Pre-fill Spiritual Category
            </label>
            <div className="flex flex-wrap gap-2.5">
              {[
                "Doubts about Allah",
                "Religious OCD / purity",
                "Existential fear of death"
              ].map((chip) => {
                const isSelected = category === chip;
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleChipClick(chip)}
                    className={`px-4 py-2 text-xs md:text-sm font-serif rounded-sm border transition-all duration-300 cursor-pointer flex items-center gap-2
                      ${isSelected 
                        ? 'bg-[#8B1A1A] text-white border-transparent shadow-sm scale-[1.01]' 
                        : 'bg-white hover:bg-stone-50 text-stone-700 border-[#8B1A1A]/10'
                      }
                    `}
                  >
                    <Sparkle className={`h-3 w-3 ${isSelected ? 'text-[#C4A35A] animate-spin-slow' : 'text-stone-400'}`} />
                    {chip}
                  </button>
                );
              })}
            </div>
          </div>

          {/* QUESTION FORM */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="waswas-textarea" className="block text-[10px] font-mono uppercase tracking-widest text-[#8B1A1A] font-bold">
                Pour Out Your Intrusive Thoughts or Doubts
              </label>
              
              <textarea
                id="waswas-textarea"
                rows={5}
                required
                className="w-full min-h-[120px] bg-white border border-[#8B1A1A]/15 rounded-sm p-4 text-sm sm:text-base text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#8B1A1A] focus:ring-1 focus:ring-[#8B1A1A]/30 transition-all font-serif leading-relaxed resize-y shadow-inner"
                placeholder="Describe what is troubling your heart... write freely in any language."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>

            <button
              id="waswas-submit-btn"
              type="submit"
              disabled={isStreaming}
              className={`w-full py-3.5 px-6 font-mono text-xs md:text-sm uppercase tracking-widest font-bold text-white rounded-sm transition-all duration-300 cursor-pointer shadow-md hover:scale-[1.01] flex items-center justify-center gap-2.5
                ${isStreaming 
                  ? 'bg-stone-400 border-transparent cursor-not-allowed' 
                  : 'bg-[#8B1A1A] hover:bg-black text-[#F5F0E8] border border-[#C4A35A]/50'
                }
              `}
            >
              {isStreaming ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Streaming Sages Insights...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 text-[#C4A35A]" />
                  Seek Guidance — بِسْمِ اللَّه
                </>
              )}
            </button>
          </form>
        </div>

        {/* RESPONSE RENDER SHEET */}
        <AnimatePresence>
          {(hasSubmitted || streamedResponse) && (
            <motion.div
              id="waswas-response-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.6 }}
              className={`bg-white border-2 border-[#C4A35A]/30 rounded-sm p-6 sm:p-10 shadow-lg relative overflow-hidden space-y-8
                ${isStreaming ? 'bg-gradient-to-r from-amber-50/20 via-orange-50/20 to-yellow-50/20 bg-[length:200%_200%] animate-pulse' : ''}
              `}
            >
              {/* ORNAMENTAL FRAME */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B1A1A] via-[#C4A35A] to-[#8B1A1A]" />
              
              <div className="flex items-center justify-between border-b border-[#C4A35A]/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-[#8B1A1A]/5 p-2 rounded-sm border border-[#8B1A1A]/10">
                    <BookOpen className="h-5 w-5 text-[#8B1A1A]" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#8B1A1A]">Isla-Clinical Response</h3>
                    <p className="text-[9px] font-mono tracking-wider uppercase text-stone-500">Ibn al-Qayyim Method × ACT</p>
                  </div>
                </div>
                
                {isStreaming && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200/50 rounded-full">
                    <span className="w-1.5 h-1.5 bg-[#C4A35A] rounded-full animate-ping" />
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-700">Writing...</span>
                  </div>
                )}
              </div>

              {/* RENDER SECTIONS */}
              <div className="space-y-6 text-[#222222] font-serif leading-relaxed text-sm sm:text-base">
                
                {/* INTRODUCTORY CHUNK */}
                {parsed.normal && (
                  <div className="space-y-2">
                    {parsed.normal.includes("**ما تشعر به طبيعي") ? null : (
                      <p className="whitespace-pre-line text-stone-700 italic border-l-2 border-[#8B1A1A]/30 pl-4">{parsed.normal}</p>
                    )}
                  </div>
                )}

                {/* SECTION 1: WHAT YOU FEEL IS NORMAL */}
                {parsed.normal.includes("**") || parsed.understanding || parsed.practice || parsed.dua || parsed.closing ? (
                  <div className="space-y-6">
                    
                    {/* SECTION 1 CARD */}
                    {parsed.normal.includes("What You Feel Is Normal") && (
                      <div className="p-5 bg-gradient-to-br from-[#F5F0E8]/40 to-white border border-[#C4A35A]/20 rounded-sm">
                        <h4 className="font-serif font-bold text-base md:text-lg text-[#8B1A1A] mb-3 flex items-center justify-between">
                          <span>ما تشعر به طبيعي — What You Feel Is Normal</span>
                          <span className="text-xs text-[#C4A35A] tracking-widest font-sans font-normal opacity-75">PART 1</span>
                        </h4>
                        <p className="text-stone-800 whitespace-pre-line leading-relaxed">
                          {parsed.normal.split("**ما تشعر به طبيعي — What You Feel Is Normal**")[1]?.split("**")[0]?.trim() || streamedResponse.split("Normal**")[1]?.split("**")[0]?.trim()}
                        </p>
                      </div>
                    )}

                    {/* SECTION 2 CARD */}
                    {parsed.understanding && (
                      <div className="p-5 bg-[#FAF8F5] border border-[#8B1A1A]/10 rounded-sm">
                        <h4 className="font-serif font-bold text-base md:text-lg text-[#8B1A1A] mb-3 flex items-center justify-between">
                          <span>الفهم الإسلامي — The Islamic Understanding</span>
                          <span className="text-xs text-[#C4A35A] tracking-widest font-sans font-normal opacity-75">PART 2</span>
                        </h4>
                        <p className="text-stone-800 whitespace-pre-line leading-relaxed">
                          {parsed.understanding}
                        </p>
                      </div>
                    )}

                    {/* SECTION 3 CARD */}
                    {parsed.practice && (
                      <div className="p-5 bg-stone-50 border border-[#8B1A1A]/15 rounded-sm relative">
                        <div className="absolute top-4 right-4 text-[#C4A35A]/40">
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <h4 className="font-serif font-bold text-base md:text-lg text-[#8B1A1A] mb-4 flex items-center justify-between border-b border-stone-200 pb-2">
                          <span>خطوات عملية — Your 3-Step Practice</span>
                          <span className="text-xs text-[#C4A35A] tracking-widest font-sans font-normal opacity-75">PART 3</span>
                        </h4>
                        <div className="space-y-4 text-stone-800 leading-relaxed whitespace-pre-line">
                          {parsed.practice}
                        </div>
                      </div>
                    )}

                    {/* SECTION 4 CARD */}
                    {parsed.dua && (
                      <div className="p-5 border-2 border-dashed border-[#C4A35A]/30 bg-[#FFFDF9] rounded-sm text-center space-y-4">
                        <h4 className="font-serif font-bold text-base md:text-lg text-[#8B1A1A] flex items-center justify-center gap-2">
                          <Star className="h-4 w-4 fill-[#C4A35A] text-transparent" />
                          <span>دعاؤك — Your Prescribed Dua</span>
                          <Star className="h-4 w-4 fill-[#C4A35A] text-transparent" />
                        </h4>
                        <div className="py-2 space-y-3">
                          <div className="text-stone-850 text-base md:text-lg leading-relaxed whitespace-pre-line">
                            {parsed.dua}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SECTION 5 CARD */}
                    {parsed.closing && (
                      <div className="p-5 bg-[#8B1A1A]/5 border-l-4 border-[#8B1A1A] rounded-sm italic">
                        <h4 className="font-serif font-bold text-sm text-[#8B1A1A] not-italic uppercase tracking-widest mb-1.5">
                          كلمة أخيرة — A Closing Word
                        </h4>
                        <p className="text-stone-800 whitespace-pre-line leading-relaxed">
                          {parsed.closing}
                        </p>
                      </div>
                    )}

                  </div>
                ) : null}

                {/* END OF TEXT STREAM / DISCLAIMER CONTAINER */}
                {parsed.disclaimer && (
                  <div className="pt-4 border-t border-stone-200 mt-6 text-xs text-stone-500 font-mono tracking-wide leading-relaxed text-center italic">
                    {parsed.disclaimer}
                  </div>
                )}

                <div ref={responseEndRef} />
              </div>

              {/* POST-RESPONSE COMPLETED ACTION PANEL */}
              {!isStreaming && streamedResponse && (
                <div className="pt-6 border-t border-[#C4A35A]/20 flex flex-wrap gap-4 items-center justify-between">
                  {/* SESSION SAVE AND RESTART CHANNELS */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      id="save-session-btn"
                      onClick={saveSession}
                      disabled={isSessionSaved}
                      className={`px-5 py-2.5 font-mono text-xs uppercase tracking-widest font-bold rounded-sm shadow-sm transition-all duration-300 cursor-pointer flex items-center gap-2
                        ${isSessionSaved 
                          ? 'bg-stone-100 text-stone-600 border border-stone-200 cursor-not-allowed' 
                          : 'bg-[#8B1A1A] text-white hover:bg-black border border-[#C4A35A]/30'
                        }
                      `}
                    >
                      {isSessionSaved ? (
                        <>
                          <BookmarkCheck className="h-4 w-4 text-[#C4A35A]" />
                          Session Saved
                        </>
                      ) : (
                        <>
                          <Bookmark className="h-4 w-4 text-[#C4A35A]" />
                          Save this session
                        </>
                      )}
                    </button>

                    <button
                      id="new-question-btn"
                      onClick={handleNewQuestion}
                      className="px-5 py-2.5 bg-white text-stone-800 hover:bg-stone-100 font-mono text-xs uppercase tracking-widest font-bold rounded-sm border border-stone-300 transition-all duration-300 cursor-pointer flex items-center gap-2"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      New question
                    </button>
                  </div>

                  <span className="text-[10px] sm:text-xs font-mono text-stone-500 italic">
                    Albab Seminary Counseling Service
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* QUOTE AND MOTIVATION CARDS */}
        <div id="waswas-motivation" className="border-l-4 border-[#C4A35A] bg-[#FFFDFC] p-6 rounded-sm shadow-sm">
          <p className="font-serif font-bold text-stone-800 italic leading-relaxed text-sm sm:text-base">
            "Remember: Ibn al-Qayyim wrote — The heart will never find peace through sin, only through the remembrance of Allah."
          </p>
        </div>

        {/* RECENT HISTORIC SESSIONS TAB ONLY SHOWN TO VERIFIED SESSIONS */}
        {savedSessions.length > 0 && (
          <div className="bg-[#FAF8F5] border border-stone-200 p-6 rounded-sm space-y-4">
            <h3 className="font-serif font-bold text-lg text-[#8B1A1A] border-b border-stone-200 pb-2 flex items-center gap-2">
              <BookOpen className="h-4.5 w-4.5" />
              Your Saved Counseling History
            </h3>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {savedSessions.map((sess) => (
                <div key={sess.id} className="p-3.5 bg-white rounded-sm border border-stone-100 shadow-sm space-y-2 text-xs md:text-sm">
                  <div className="flex justify-between text-[10px] font-mono text-stone-500 uppercase">
                    <span>{sess.category}</span>
                    <span>{new Date(sess.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-stone-700 italic line-clamp-2">" {sess.userMessage} "</p>
                  <button 
                    onClick={() => {
                      setInputText(sess.userMessage);
                      setCategory(sess.category);
                      setStreamedResponse(sess.response);
                      setHasSubmitted(true);
                      setIsSessionSaved(true);
                      triggerNotification("Saved session loaded successfully.");
                    }}
                    className="text-[#8B1A1A] hover:underline font-mono text-[10px] tracking-widest font-bold uppercase block"
                  >
                    View entire Response × Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BACK CHANNEL BUTTON */}
        <div className="text-center pt-4">
          <button
            onClick={onBackToLanding}
            className="text-stone-600 hover:text-[#8B1A1A] transition-all font-mono text-xs uppercase tracking-widest font-bold inline-flex items-center gap-2 cursor-pointer"
          >
            ← Return to Divine Celestial Globe
          </button>
        </div>

      </div>
    </div>
  );
}
