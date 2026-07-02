import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, CheckCircle2, Save, RotateCcw } from 'lucide-react';
import SectionMetaTags from './SectionMetaTags';

interface WaswasClinicProps {
  currentTheme: 'parchment' | 'space';
  onBackToLanding: () => void;
}

interface SavedSession {
  id: string;
  timestamp: string;
  userMessage: string;
  response: string;
}

const CHIPS_PREFILL: Record<string, { prompt: string; fallbackText: string }> = {
  "Doubts about the existence of Allah": {
    prompt: "I keep having terrifying, intrusive thoughts questioning why Allah allows trials, and I fear these passing thoughts mean I have lost my faith or committed a sin.",
    fallbackText: `**مَا تَشْعُرُ بِهِ طَبِيعِيٌّ — What You Feel Is Normal**
It is deeply comforting to know that experiencing these invasive thoughts or doubts about the Divine is actually normal and does not mean you have lost your faith. In fact, a companion once admitted to the Prophet (ﷺ) that he had thoughts too frightening to speak of, and the Prophet (ﷺ) responded: "That is pure faith" (Sahih Muslim 132), as it shows your heart is actively rejecting the whisper.

**الْفَهْمُ الْإِسْلَامِيُّ — The Islamic Understanding**
Spiritual whispers, or *waswas*, are sent by Satan as a last resort when he realizes he cannot make some believers abandon their faith directly. He targets the most precious treasury — your heart — and the very presence of this struggle shows there is gold inside your heart that he is trying to steal. As Allah states in the Quran: "And if a whisper from Satan reaches you, then seek refuge in Allah. Indeed, He is the Hearing, the Knowing" (Surah Al-A'raf, 7:200).

**خُطُوَاتٌ عَمَلِيَّةٌ — Your 3-Step Practice**
Step 1: **ACT Defusion & Labeling**: When a doubt arises, do not argue with it or try to logicalize it. Simply label it: "I am having an intrusive thought about Allah's attributes." Let it sit there in the background of your mind like a passenger in a vehicle; you don't have to steer toward it or answer its questions.
Step 2: **Sunnah Grounding & Physical Relief**: Perform a mindful, silent Wudu where you feel the cool water touching your skin, centering your physical presence in the real world. Follow it by invoking: "A'udhu billahi minash-shaytanir-rajim" and turn your head slightly to the left, mimicking the spiritual expulsion of doubt as instructed by the Prophet (ﷺ).
Step 3: **The Mirror Reframe of Ibn al-Qayyim**: In *Ighathat al-Lahfan*, Ibn al-Qayyim reminds us that the heart is like a polished mirror. Dust will settle on it occasionally, but the dust is not the mirror itself. The intrusive thoughts are merely clouds passing through the sky of your mind; they are not your identity.

**دُعَاؤُكَ — Your Prescribed Dua**
To comfort your soul, recite the protective prayer of the companions:

آمَنْتُ بِاللَّهِ وَرُسُلِهِ

Transliteration: "Amantu billahi wa rusulihi"
Meaning: "I have believed in Allah and His Messengers."
Read this gently whenever a doubt asserts itself, making a conscious choice to disengage from the mental maze.

**كَلِمَةٌ أَخِيرَةٌ — A Closing Word**
Take a deep breath and rest in the knowledge that your pain over these thoughts is the clearest signature of your living, beating, and deeply sincere conscience.

If your symptoms are persistent or severe, please speak with a qualified mental health professional alongside your spiritual practice.`
  },
  "Religious OCD — purity and prayer doubts": {
    prompt: "I spend hours repeating my Wudu and washing my hands because I keep feeling doubts that I did not wash correctly, which leaves me completely exhausted during my prayers.",
    fallbackText: `**مَا تَشْعُرُ بِهِ طَبِيعِيٌّ — What You Feel Is Normal**
The exhausting loop of repeating your cleansing rituals and prayers is a profound pain, but it is deeply human. The Messenger of Allah (ﷺ) recognized this heavy burden and encouraged lighthearted ease, assuring the companions that religious practice is meant to build comfort, not distress: "The religion is ease, and no one makes the religion difficult except that it defeats them" (Sahih al-Bukhari).

**الْفَهْمُ الْإِسْلَامِيُّ — The Islamic Understanding**
In Islamic theology, there is a specific whispers architect named *Khanzab* or *Walahan* who is assigned to contaminate the believer's Wudu and Salah using doubting thoughts. This obsessive loop stems from a sincere desire for perfection, which Satan exploits into a mechanism of spiritual burnout. Islam teaches that certainty is not removed by doubt (*Al-Yaqin la Yazulu bish-Shakk*), meaning your praise stands valid even if you feel unsure.

**خُطُوَاتٌ عَمَلِيَّةٌ — Your 3-Step Practice**
Step 1: **ACT Acceptance & Exposure**: When the urge to repeat Wudu whispers "you missed a spot," accept the feeling of anxiety without obeying the action. Say to yourself: "I feel anxious that my wash was imperfect, and I am willing to carry this uncomfortable feeling of doubt onto my prayer rug."
Step 2: **Sunnah Sufficiency Rule**: Limit yourself strictly to washing each limb three times maximum, following the clear, final bounds set by the Sunnah. The Prophet (ﷺ) warned: "Whoever goes beyond this has done evil, transgressed, and done injustice" (Sunan an-Nasa'i). Over-washing is therefore the true error.
Step 3: **Spiritual Protection Reframe**: In *Ighathat al-Lahfan*, Ibn al-Qayyim asserts that excessive caution is a form of secret conceit where the person believes their self-invented standards are superior to the ease modeled by the Prophet (ﷺ). Accept the default state of cleanliness and bypass the impulse.

**دُعَاؤُكَ — Your Prescribed Dua**
To lock your peace of mind, recite:

اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ خَبَثِ الْوَسْوَاسِ

Transliteration: "Allahumma inni a'udhu bika min khabathil-waswas"
Meaning: "O Allah, I seek refuge in You from the malignancy of obsessive thoughts."
Read this once before beginning Wudu to anchor your heart in divine guardianship.

**كَلِمَةٌ أَخِيرَةٌ — A Closing Word**
Your deep care for the validity of your acts of devotion shows your clean integrity; let go of the burden and trust that Allah receives your broken attempts with complete mercy.

If your symptoms are persistent or severe, please speak with a qualified mental health professional alongside your spiritual practice.`
  },
  "Fear of death and the unknown": {
    prompt: "I have intense, paralyzing panics about death, the grave, and the afterlife. It consumes my thoughts, making me feel helpless, cold, and anxious.",
    fallbackText: `**مَا تَشْعُرُ بِهِ طَبِيعِيٌّ — What You Feel Is Normal**
The fear of death and the unknown path that lies ahead is a profound existential tremor that is completely normal for a believer to carry. The companions occasionally confessed to the Prophet (ﷺ) their deep anxieties about the final exit, and he comforted them with hope, stating: "Allah is more merciful to His servants than a mother is to her child" (Sahih al-Bukhari), establishing a sanctuary of love.

**الْفَهْمُ الْإِسْلَامِيُّ — The Islamic Understanding**
In Islamic philosophy, the dread of the grave (*Al-Qabr*) is often an uncalibrated lens that looks only at punishment rather than reunification with the Beloved. Death is not an absolute end, but a clean passage (*Barzakh*) where the soul of the sincere is met by fragrant breezes and light. Intrusive panics are reminders to construct a beautiful homeland hereafter, but they must not paralyze your earthly assignment.

**خُطُوَاتٌ عَمَلِيَّةٌ — Your 3-Step Practice**
Step 1: **ACT Grounding & Present Anchoring**: When death panic storms your mind, bring your awareness to the immediate present. Notice: "My chest is breathing, my feet are on the floor, and I am fully alive in this present second." Breathe slowly, letting the waves of fear wash over you without resisting, knowing anxiety rises then subsides.
Step 2: **Sunnah Sunset Meditation**: Sit quietly between Asr and Maghrib, looking outside at the natural cycle of the day ending. Softly recite: "Radhitu billahi Rabba" (I am content with Allah as my Lord). This grounds your timeline inside the divine diurnal rhythms.
Step 3: **Ibn al-Qayyim's Anchor Reframe**: In *Ighathat al-Lahfan*, Ibn al-Qayyim notes that the believer should navigate the world with the wing of fear and the wing of hope, but as one approaches the thoughts of the hereafter, the wing of Hope (*Raja'*) must be far larger. Reframe death as a return to the Source of absolute light and goodness.

**دُعَاؤُكَ — Your Prescribed Dua**
To tranquilize your fear of the future, recite:

اللَّهُمَّ اجْعَلْ خَيْرَ عُمُرِي آخِرَهُ وَخَيْرَ عَمَلِي خَوَاتِمَهُ

Transliteration: "Allahumma-j'al khayra 'umuri akhirahu wa khayra 'amali khawatimahu"
Meaning: "O Allah, make the best of my life its end, and the best of my deeds its final ones."
Recite this with deep presence as your night begins to secure peaceful rest.

**كَلِمَةٌ أَخِيرَةٌ — A Closing Word**
Your anxiety about meeting the Divine is testimony to a soul that honors the sacred values; sleep tonight in the warm protection of His unmeasured kindness.

If your symptoms are persistent or severe, please speak with a qualified mental health professional alongside your spiritual practice.`
  }
};

export default function WaswasClinic({ currentTheme, onBackToLanding }: WaswasClinicProps) {
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [isSessionSaved, setIsSessionSaved] = useState(false);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  
  const responseEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll logic
  useEffect(() => {
    if ((isStreaming || isLoadingResponse) && responseEndRef.current) {
      responseEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [streamedResponse, isStreaming, isLoadingResponse]);

  const triggerNotification = (msg: string) => {
    setShowNotification(msg);
    setTimeout(() => setShowNotification(null), 3000);
  };

  const handleChipClick = (chip: string) => {
    setInputText(CHIPS_PREFILL[chip].prompt);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsStreaming(true);
    setIsLoadingResponse(true);
    setHasSubmitted(true);
    setStreamedResponse('');
    setIsSessionSaved(false);

    try {
      const response = await fetch('/api/labs/waswas-clinic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: inputText })
      });

      setIsLoadingResponse(false);

      if (!response.ok || !response.body) {
        throw new Error("Stream connection failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        accumulatedText += chunk;
        setStreamedResponse(accumulatedText);
      }
    } catch (err: any) {
      console.warn("Server streaming unavailable, playing resilient local sage simulator:", err);
      setIsLoadingResponse(false);
      
      // Determine falls back
      let template = CHIPS_PREFILL["Doubts about the existence of Allah"].fallbackText;
      const lower = inputText.toLowerCase();
      if (lower.includes("wudu") || lower.includes("purity") || lower.includes("prayer") || lower.includes("wash") || lower.includes("ocd")) {
        template = CHIPS_PREFILL["Religious OCD — purity and prayer doubts"].fallbackText;
      } else if (lower.includes("death") || lower.includes("grave") || lower.includes("afterlife") || lower.includes("dying") || lower.includes("unknown")) {
        template = CHIPS_PREFILL["Fear of death and the unknown"].fallbackText;
      } else {
        // Search inside chips
        const matchedConfig = Object.entries(CHIPS_PREFILL).find(([key]) => lower.includes(key.toLowerCase()) || key.toLowerCase().split(" ").some(word => word.length > 4 && lower.includes(word)));
        if (matchedConfig) {
          template = matchedConfig[1].fallbackText;
        }
      }

      // Live simulated stream
      const words = template.split(" ");
      let i = 0;
      let accumulatedSimulatedStr = "";
      const timer = setInterval(() => {
        if (i < words.length) {
          accumulatedSimulatedStr += (accumulatedSimulatedStr ? " " : "") + words[i];
          setStreamedResponse(accumulatedSimulatedStr);
          i++;
        } else {
          clearInterval(timer);
          setIsStreaming(false);
        }
      }, 50);
      return;
    } finally {
      setIsLoadingResponse(false);
      // If we didn't fallback stream words, shut off the streaming state when fetching ends
      if (streamedResponse && !isStreaming) {
        setIsStreaming(false);
      }
    }
  };

  useEffect(() => {
    // Stop loading when response comes in
    if (streamedResponse && isLoadingResponse) {
      setIsLoadingResponse(false);
    }
  }, [streamedResponse, isLoadingResponse]);

  const saveSession = () => {
    if (!streamedResponse || isSessionSaved) return;

    try {
      const saved = localStorage.getItem('albab_waswas_sessions');
      const sessions: SavedSession[] = saved ? JSON.parse(saved) : [];
      
      const newSession: SavedSession = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        userMessage: inputText,
        response: streamedResponse
      };

      localStorage.setItem('albab_waswas_sessions', JSON.stringify([newSession, ...sessions]));
      setIsSessionSaved(true);
      triggerNotification("Saved ✓");
    } catch (e) {
      console.error(e);
      triggerNotification("Failed to save session");
    }
  };

  const handleAskAnother = () => {
    setInputText('');
    setStreamedResponse('');
    setHasSubmitted(false);
    setIsSessionSaved(false);
    setIsStreaming(false);
    setIsLoadingResponse(false);
  };

  // Character evaluation helper
  const isPredominantlyArabic = (str: string) => {
    const arabicCharCount = (str.match(/[\u0600-\u06FF]/g) || []).length;
    const totalCharCount = str.replace(/\s/g, '').length;
    if (totalCharCount === 0) return false;
    return (arabicCharCount / totalCharCount) > 0.35;
  };

  const renderFormattedResponse = (text: string) => {
    if (!text) return null;
    const parts = text.split("**");
    
    return parts.map((part, index) => {
      // Even indices are plain text paragraphs
      if (index % 2 === 0) {
        if (!part.trim()) return null;
        const paragraphs = part.split("\n\n");
        return (
          <div key={index} className="space-y-4">
            {paragraphs.map((p, pIdx) => {
              if (!p.trim()) return null;
              const isArabic = isPredominantlyArabic(p);
              
              if (isArabic) {
                return (
                  <p 
                    key={pIdx} 
                    className="font-arabic text-2xl md:text-3xl text-[#0B4628] text-center leading-loose py-4 italic font-bold my-4 bg-[#FFFDF9]/60 border border-[#C4A35A]/15 rounded-sm p-4"
                    dir="rtl"
                  >
                    {p.trim()}
                  </p>
                );
              } else {
                return (
                  <p 
                    key={pIdx} 
                    className="font-serif text-[15px] leading-[1.7] text-stone-800 whitespace-pre-line"
                  >
                    {p}
                  </p>
                );
              }
            })}
          </div>
        );
      } else {
        // Odd indices are headers
        return (
          <h4 
            key={index} 
            className="font-serif font-medium text-lg text-[#0B4628] mt-6 border-b-[0.5px] border-[#C4A35A] pb-[0.3rem] mb-3 uppercase tracking-wide flex items-center gap-1.5"
          >
            <span className="text-[#C4A35A] text-xs">◆</span> {part.trim()}
          </h4>
        );
      }
    });
  };

  return (
    <div 
      id="waswas-clinic-viewport"
      className="min-h-screen bg-[#F5F0E8] text-[#1A1A1A] font-sans pt-36 md:pt-40 pb-20 px-4 md:px-12 arabesque-grid selection:bg-[#0B4628]/10"
    >
      <SectionMetaTags 
        title="Spiritual Waswas Clinic" 
        description="Explore traditional Islamic psychology cognitive tools to manage and alleviate obsessive spiritual doubts (waswas), Religious OCD, and anxiety using classical and contemporary insights."
        sectionId="waswas-clinic"
      />
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* BACK BUTTON */}
        <button 
          onClick={onBackToLanding}
          className="flex items-center gap-1.5 text-xs text-[#0B4628]/70 hover:text-[#0B4628] font-mono tracking-wider uppercase transition-colors duration-200 cursor-pointer self-start"
        >
          ← Back to Sanctum
        </button>

        {/* TOAST NOTIFICATION */}
        <AnimatePresence>
          {showNotification && (
            <motion.div 
              initial={{ opacity: 0, y: -20, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: -20, x: "-50%" }}
              className="fixed top-24 left-1/2 z-50 bg-[#0B4628] text-white py-2.5 px-6 rounded-sm shadow-xl border border-[#C4A35A]/35 flex items-center gap-2 text-xs font-mono tracking-wider uppercase font-bold"
            >
              <CheckCircle2 className="h-4 w-4 text-[#C4A35A]" />
              <span>{showNotification}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HEADER SECTION */}
        <div className="max-w-4xl mx-auto mb-10 text-center animate-fade-in" id="waswas-header-card">
          <div className="flex justify-center items-center gap-3 mb-3">
            <div className="h-[1px] w-8 opacity-60 bg-[#0B4628]"></div>
            <span className="font-mono text-xs tracking-[0.25em] text-[#C4A35A] uppercase font-bold">AL-NAFSI CLINICAL GATE</span>
            <div className="h-[1px] w-8 opacity-60 bg-[#0B4628]"></div>
          </div>

          <h1 className="font-arabic text-3xl sm:text-4xl md:text-5xl text-[#0B4628] leading-none mb-2 select-none font-bold" style={{ fontFamily: 'Amiri, Georgia, serif' }} dir="rtl">
            وَسْوَاسٌ وَشِفَاء
          </h1>
          <h2 className="font-serif font-bold text-xl sm:text-2xl text-stone-800 mb-2">
            Waswas Clinic
          </h2>
          <p className="text-[#555555] text-xs sm:text-sm leading-relaxed max-w-lg mx-auto font-serif italic mb-4">
            A safe space for spiritual doubt, obsessive thoughts, and the whispers of Shaytan
          </p>
          <div className="flex justify-center pt-1 pb-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-50 border border-amber-200/50 rounded-full text-[10px] text-amber-800 leading-none font-sans font-medium">
              Spiritual guidance only — not a replacement for professional mental health care
            </span>
          </div>
        </div>

        {/* MAIN BODY BOARD */}
        <AnimatePresence mode="wait">
          {!hasSubmitted ? (
            <motion.div
              key="input-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* PRE-FILL CHIPS */}
              <div className="flex flex-wrap gap-2 justify-center" id="prefill-chips-row">
                {Object.keys(CHIPS_PREFILL).map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleChipClick(chip)}
                    className="px-4 py-2.5 text-xs font-serif rounded-sm border border-[#C4A35A]/30 bg-[#FFFDF9] hover:bg-stone-50 text-stone-700 active:scale-95 transition-all duration-200 cursor-pointer shadow-sm text-center"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* INPUT CONTENT FORM */}
              <form onSubmit={handleFormSubmit} className="bg-[#FFFDF9] border border-[#C4A35A]/35 rounded-sm p-6 space-y-4 shadow-sm">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[#0B4628] tracking-wider uppercase font-mono">
                    SHARE WHAT TROUBLES YOUR HEART
                  </label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    maxLength={1000}
                    rows={6}
                    placeholder="Write freely... in any language. This space is safe and without judgment."
                    className="w-full min-h-[140px] px-3.5 py-3 text-[14px] bg-[#FFFDF9] border border-[#0B4628]/20 focus:border-[#0B4628] focus:ring-1 focus:ring-[#0B4628]/20 rounded-sm font-serif placeholder:font-serif placeholder:italic text-stone-850 outline-none transition-colors duration-200"
                  />
                  <div className="flex justify-end pr-0.5">
                    <span className="text-[10px] text-stone-500 font-mono">
                      {inputText.length} / 1000
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-full bg-[#0B4628] text-white py-3.5 px-6 rounded-sm shadow-md font-mono tracking-widest text-[11px] font-bold uppercase transition-all hover:bg-[#0B4628]/90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Seek Guidance — بِسْمِ اللَّه
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="output-board"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* LOADING OR RESPONSE RENDER BLOCK */}
              <div className="bg-[#FFFDF9] border border-[#C4A35A]/35 rounded-sm p-6 md:p-8 shadow-sm space-y-6">
                
                {/* LOADER */}
                {(isLoadingResponse || (isStreaming && !streamedResponse)) && (
                  <div className="flex flex-col items-center justify-center py-12 space-y-5" id="waswas-loading-box">
                    <motion.div
                      animate={{
                        scale: [0.95, 1.1, 0.95],
                        opacity: [0.5, 0.9, 0.5],
                      }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="w-14 h-14 rounded-full bg-[#0B4628]/10 border border-[#0B4628] flex items-center justify-center"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#0B4628]" />
                    </motion.div>
                    <div className="text-center space-y-2">
                      <p className="font-serif text-base font-medium text-[#0B4628]">
                        Consulting the wisdom of Ibn al-Qayyim...
                      </p>
                      <p className="font-arabic text-xl text-[#0B4628] italic leading-relaxed" dir="rtl">
                        اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ
                      </p>
                    </div>
                  </div>
                )}

                {/* OUTPUT STREAM */}
                {streamedResponse && (
                  <div className="font-serif text-[15px] leading-[1.7] text-stone-850 space-y-4" id="streamed-results-box">
                    {renderFormattedResponse(streamedResponse)}
                    <div ref={responseEndRef} />
                  </div>
                )}

                {/* POST RESPONSE CARD & CONTROLS */}
                {!isLoadingResponse && (!isStreaming || (streamedResponse && streamedResponse.includes("persistent or severe"))) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="pt-6 border-t border-stone-200/60 space-y-6"
                  >
                    {/* IBN AL-QAYYIM CARD */}
                    <div className="border-l-3 border-[#C4A35A] bg-[#FFFDF9] p-4 text-xs md:text-sm font-serif italic text-stone-650 rounded-r-sm shadow-sm border border-y-[#C4A35A]/15 border-r-[#C4A35A]/15">
                      <p className="leading-relaxed">
                        "Ibn al-Qayyim wrote — The heart will not find rest and joy except through the remembrance of Allah."
                      </p>
                    </div>

                    {/* BUTTON ACTIONS */}
                    <div className="grid grid-cols-2 gap-3" id="response-actions-row">
                      <button
                        type="button"
                        onClick={saveSession}
                        disabled={isSessionSaved}
                        className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-sm font-mono tracking-wider font-bold text-[10px] md:text-xs uppercase border border-[#C4A35A]/40 bg-[#FFFDF9] hover:bg-stone-50 active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed transition-all cursor-pointer text-stone-700"
                      >
                        <Save className="h-3.5 w-3.5" />
                        {isSessionSaved ? "Saved ✓" : "Save Session"}
                      </button>

                      <button
                        type="button"
                        onClick={handleAskAnother}
                        className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-sm font-mono tracking-wider font-bold text-[10px] md:text-xs uppercase text-white bg-[#0B4628] hover:bg-[#0B4628]/90 active:scale-95 transition-all cursor-pointer"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Ask Another
                      </button>
                    </div>
                  </motion.div>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
