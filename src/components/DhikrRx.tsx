import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Wind, 
  Heart, 
  Flame, 
  UserMinus, 
  Crown, 
  Eye, 
  Cloud, 
  Sun,
  ShieldCheck,
  Brain,
  Sparkles,
  Award
} from 'lucide-react';

interface DhikrRxProps {
  currentTheme?: 'parchment' | 'space';
  onBackToLanding: () => void;
}

interface PrescriptionResult {
  dhikr: string;
  transliteration: string;
  meaning: string;
  repetition: string;
  secondaryDua: string;
  neuroscience: string;
  lifestyle: string;
  timeline: string;
}

const CLINICAL_EMOTIONS = [
  { 
    key: 'anxiety', 
    label: 'Anxiety', 
    arabic: 'قَلَق', 
    icon: Wind, 
    color: 'border-amber-500/25 text-amber-600',
    activeBg: 'bg-amber-500/10'
  },
  { 
    key: 'grief', 
    label: 'Grief', 
    arabic: 'حُزْن', 
    icon: Heart, 
    color: 'border-blue-500/25 text-blue-600',
    activeBg: 'bg-blue-500/10'
  },
  { 
    key: 'anger', 
    label: 'Anger', 
    arabic: 'غَضَب', 
    icon: Flame, 
    color: 'border-red-500/25 text-red-600',
    activeBg: 'bg-red-500/10'
  },
  { 
    key: 'loneliness', 
    label: 'Loneliness', 
    arabic: 'وَحْدَة', 
    icon: UserMinus, 
    color: 'border-purple-500/25 text-purple-600',
    activeBg: 'bg-purple-500/10'
  },
  { 
    key: 'arrogance', 
    label: 'Arrogance', 
    arabic: 'كِبْر', 
    icon: Crown, 
    color: 'border-orange-500/25 text-orange-600',
    activeBg: 'bg-orange-500/10'
  },
  { 
    key: 'envy', 
    label: 'Envy', 
    arabic: 'حَسَد', 
    icon: Eye, 
    color: 'border-green-500/25 text-green-600',
    activeBg: 'bg-green-500/10'
  },
  { 
    key: 'depression', 
    label: 'Depression', 
    arabic: 'اكْتِئَاب', 
    icon: Cloud, 
    color: 'border-stone-500/25 text-stone-600',
    activeBg: 'bg-stone-500/10'
  },
  { 
    key: 'gratitude', 
    label: 'Gratitude', 
    arabic: 'شُكْر', 
    icon: Sun, 
    color: 'border-teal-500/25 text-teal-600',
    activeBg: 'bg-teal-500/10'
  }
];

// High fidelity backup prescriptions when server is busy
const FALLBACK_RX: Record<string, PrescriptionResult> = {
  anxiety: {
    dhikr: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    transliteration: "Hasbunallahu wa ni'mal-Wakeel",
    meaning: "Sufficient for us is Allah, and He is the best Disposer of affairs.",
    repetition: "Repeat 100 times after Morning and Night prayers.",
    secondaryDua: "Ya Hayyu Ya Qayyum bi Rahmatika astagheeth (O Ever-Living, O Self-Sustaining, by Your mercy I seek helper).",
    neuroscience: "Rhythmic vocalization of guttural and dental Arabic phonemes stimulates the auricular branch of the vagus nerve. This directly activates the parasympathetic division of the nervous system, drastically downregulating cardiac output, lowering systemic blood pressure, and reducing amygdaloidal anxiety signaling.",
    lifestyle: "Engage in tactile grounding (Tasbih touching), restrict blue light exposure after Isha, and walk barefoot after Fajr.",
    timeline: "Localized neurological calm within 15 minutes; structural neuroplastic stress transformation in 21 days."
  },
  grief: {
    dhikr: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    transliteration: "La ilaha illa Anta subhanaka inni kuntu minaz-zalimeen",
    meaning: "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.",
    repetition: "Repeat 100 times during late third of the night.",
    secondaryDua: "Allahumma inni a'udhu bika minal-hammi wal-huzn (O Allah, I seek refuge in You from sadness and worry).",
    neuroscience: "The resonance patterns of the 'Lafz al-Jalalah' (الله) promote diaphragmatic deep breathing, increasing CO2 threshold in the bloodstream to offset anxiety-induced hyperventilating. It promotes frontal lobe cortex activity, reducing emotional despair.",
    lifestyle: "Voluntary fasting on Mondays and Thursdays, and attending communal support structures.",
    timeline: "Emotional centering within 24 hours of consistent practice; long-term grief stabilization within 40 days."
  },
  anger: {
    dhikr: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
    transliteration: "A'udhu billahi minash-Shaytanir-rajeem",
    meaning: "I seek refuge in Allah from the rejected Satan.",
    repetition: "Repeat 33 times slowly during high physiological arousal.",
    secondaryDua: "Allahumma-ghfir li dhanbi, wa adh-hib ghaydha qalbi (O Allah, forgive my sin and remove anger from my heart).",
    neuroscience: "Invoking voluntary refuge activates the prefrontal cortex, which exerts inhibitory control over the amygdala's primitive anger cascade. This halts adrenaline release and promotes logical behavioral reassessment.",
    lifestyle: "Perform instant wudu (hydrotherapy decreases sympathetic drive), sit down or lie down instantly as advised by the Sunnah.",
    timeline: "Inhibition of emergency adrenaline surge within 60 seconds; lasting emotional composure in 14 days."
  },
  loneliness: {
    dhikr: "أَنِّي مَسَّنِيَ الضُّرُّ وَأَنتَ أَرْحَمُ الرَّاحِمِينَ",
    transliteration: "Annee massaniyad-durru wa Anta arhamur-rahimeen",
    meaning: "Indeed, adversity has touched me, and You are the most merciful of the merciful.",
    repetition: "Repeat 70 times after Maghrib.",
    secondaryDua: "Ya Anis al-Mustawahisheen, ya Rafi' al-Darajat (O Companion of the lonely, O Exalter of ranks).",
    neuroscience: "Reframing isolation as singular spiritual solitude (KhALWAH) re-wires default-mode-network (DMN) pathways from ruminating loneliness into contemplative serenity, triggering dopamine release through positive attachment simulation.",
    lifestyle: "Join a classical circles of knowledge, serve local orphans or elderly, and pray in congregation.",
    timeline: "Reduction of social anxiety/isolation symptoms in 3 days; deep heart tranquility in 28 days."
  },
  arrogance: {
    dhikr: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
    transliteration: "Subhanallahi wa bihamdihi, Subhanallahil-Adheem",
    meaning: "Glory be to Allah and His praise, Glory be to Allah the Supreme.",
    repetition: "Repeat 100 times daily with deliberate focus on your own smallness.",
    secondaryDua: "Allahumma inni a'udhu bika an ushrika bika wa ana a'lam (O Allah, keep me from pride or association).",
    neuroscience: "Meditative submissiveness decreases hyperactivity in ego-centric neural networks (precuneus and posterior cingulate cortex). This dissolves egotistic defense mechanisms and fosters genuine mental flexibility.",
    lifestyle: "Serve food to others manually, sit on the floor without elevated cushions, and practice regular tactile charity.",
    timeline: "Humility feedback loop within 1 week; complete ego transformation in 40 days."
  },
  envy: {
    dhikr: "مَا شَاءَ اللَّهُ لَا قُوَّةَ إِلَّا بِاللَّهِ",
    transliteration: "Ma sha' Allah, la quwwata illa billah",
    meaning: "What Allah has willed [has occurred]; there is no power except in Allah.",
    repetition: "Repeat 33 times immediately when encountering blessing of others.",
    secondaryDua: "Allahumma barik lahum wa la tadhurrani (O Allah, bless them and protect me from malicious envy).",
    neuroscience: "Affirmative blessing of competitors acts as cognitive override therapy, rewiring neural circuits in the insular cortex that regulate envy and relative deprivation. Suppresses bitter envious thoughts.",
    lifestyle: "Actively make silent duas for the success of those you feel envious of, and focus on journaling your own blessings.",
    timeline: "Dissolution of internal heart resentment within 2 days of active prayer; true heart-comfort in 30 days."
  },
  depression: {
    dhikr: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ",
    transliteration: "La hawla wa la quwwata illa billahil-Aliyyil-Adheem",
    meaning: "There is no power nor strength except via Allah, the Most High, the Supreme.",
    repetition: "Repeat 100 times throughout the day.",
    secondaryDua: "Allahumma inni a'udhu bika minal-'ajzi wal-kasali (O Allah, seek refuge from weakness and lethargy).",
    neuroscience: "Proclaiming self-surrender releases dopaminergic signals by removing the crushing expectation of absolute individual control over outcomes. Activates endorphins and relieves emotional lethargy.",
    lifestyle: "Establish clean circadian sleep, perform vigorous physical exercise, and consume traditional talbina (barley porridge).",
    timeline: "Anti-depressive energy boost in 48 hours; full biochemical balance within 3 weeks."
  },
  gratitude: {
    dhikr: "الْحَمْدُ لِلَّهِ حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ",
    transliteration: "Alhamdu lillahi hamdan katheeran tayyiban mubarakan feeh",
    meaning: "Praise be to Allah, abundant, pure, and blessed praise.",
    repetition: "Repeat 50 times morning and evening.",
    secondaryDua: "Allahumma a'inni 'ala dhikrika wa shukrika wa husni 'ibadatik (O Allah, support me to remember and thank You).",
    neuroscience: "Gratitude meditation stimulates the release of both serotonin and dopamine. It activates the prefrontal neuro-network that regulates positive memories and resilient baseline confidence, buffering future despair.",
    lifestyle: "Maintain a daily morning gratitude ledger, offer voluntary charity, and smile at the creation of God.",
    timeline: "Substantial elevating of baseline happiness index in 24 hours; true spiritual alignment forever."
  }
};

export default function DhikrRx({ currentTheme, onBackToLanding }: DhikrRxProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [prescription, setPrescription] = useState<PrescriptionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isSpace = currentTheme === 'space';

  const handleFormulateRx = async () => {
    if (!selectedEmotion) {
      setErrorMsg("Please select an emotional state above to synthesize your prescription.");
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);
    setPrescription(null);

    try {
      // Step 5 support: If user loaded the Anthropic API Key we can fetch it or fall back to Gemini server api
      const customKey = ((import.meta as any).env?.VITE_NEXT_PUBLIC_ANTHROPIC_API_KEY as string) || '';
      
      const response = await fetch("/api/labs/dhikr-rx", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(customKey ? { "x-api-key": customKey } : {})
        },
        body: JSON.stringify({ emotionKey: selectedEmotion })
      });

      if (!response.ok) {
        throw new Error("Local server error");
      }

      const data = await response.json();
      if (data && data.result) {
        setPrescription(data.result);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (e) {
      console.warn("Express backend call issues or off-line. Formulating local high-fidelity scriptural prescription...", e);
      // Fallback to high fidelity prebaked data
      setTimeout(() => {
        const localMatched = FALLBACK_RX[selectedEmotion] || FALLBACK_RX["anxiety"];
        setPrescription(localMatched);
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen py-16 px-4 sm:px-6 md:px-12 arabesque-grid pt-28 transition-colors duration-500
      ${isSpace ? 'bg-[#040815] text-white' : 'bg-[#FAF8F5] text-charcoal'}
    `}>
      {/* HEADER SECTION */}
      <div className="max-w-4xl mx-auto mb-10 text-center animate-fade-in">
        <button 
          onClick={onBackToLanding}
          className={`inline-flex items-center gap-2 text-xs font-mono tracking-widest uppercase transition-colors mb-6 group cursor-pointer focus:outline-none bg-transparent border-none
            ${isSpace ? 'text-gold hover:text-white' : 'text-[#8B1A1A] hover:text-[#C4A35A]'}
          `}
        >
          <ArrowLeft className="h-3.5 w-3.5 transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to University Center</span>
        </button>

        <div className="flex justify-center items-center gap-3 mb-2">
          <div className={`h-0.5 w-8 opacity-60 ${isSpace ? 'bg-gold' : 'bg-[#8B1A1A]'}`}></div>
          <span className="font-mono text-xs tracking-[0.25em] text-[#C4A35A] uppercase font-bold">AL-NURSING MEDICAL CENTER</span>
          <div className={`h-0.5 w-8 opacity-60 ${isSpace ? 'bg-gold' : 'bg-[#8B1A1A]'}`}></div>
        </div>

        <h1 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl tracking-tight mb-1 cormorant text-[#8B1A1A] dark:text-gold">
          وَصْفَةُ الذِّكْر
        </h1>
        <h2 className="font-serif font-bold text-xl sm:text-2xl text-stone-800 dark:text-white mb-2">
          Dhikr Prescription Engine
        </h2>
        <p className="max-w-xl mx-auto font-sans text-stone-500 dark:text-stone-400 text-xs sm:text-sm leading-relaxed italic">
          Where Sunnah meets neuroscience — prescribed for your heart and soul.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* HOW FEELING SECTION */}
        <div className={`rounded-lg border p-6 md:p-8 shadow-md transition-colors
          ${isSpace ? 'bg-[#070d1e] border-gold/15' : 'bg-[#FAF6EF] border-stone-200/80'}
        `}>
          <h3 className="font-serif text-lg font-bold text-[#8B1A1A] dark:text-gold text-center mb-6">
            How are you feeling right now?
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CLINICAL_EMOTIONS.map((state) => {
              const StateIcon = state.icon;
              const isSelected = selectedEmotion === state.key;
              return (
                <button
                  key={state.key}
                  onClick={() => {
                    setSelectedEmotion(state.key);
                    setErrorMsg(null);
                  }}
                  className={`p-4 border rounded relative flex flex-col items-center justify-center cursor-pointer min-h-[110px] transition-all transform duration-300
                    ${isSelected 
                      ? `border-[#8B1A1A] dark:border-gold scale-105 shadow-md bg-[#8B1A1A] text-white dark:bg-gold dark:text-black` 
                      : `${isSpace ? 'bg-[#0a1228] border-white/5 hover:border-gold/30 text-stone-300' : 'bg-white border-stone-200 hover:border-[#8B1A1A]/30 text-charcoal'}`
                    }
                  `}
                >
                  <StateIcon className={`h-6 w-6 mb-2 ${isSelected ? 'text-white dark:text-black' : state.color}`} />
                  <span className="font-serif text-sm font-black tracking-tight leading-none">
                    {state.label}
                  </span>
                  <span className="font-serif text-[11px] mt-1.5 opacity-80 leading-none block select-none">
                    {state.arabic}
                  </span>
                </button>
              );
            })}
          </div>

          {errorMsg && (
            <div className="mt-4 text-center text-xs font-serif text-[#C5221F] bg-red-100/50 py-2 rounded">
              {errorMsg}
            </div>
          )}

          <div className="mt-8">
            <button
              onClick={handleFormulateRx}
              disabled={isLoading || !selectedEmotion}
              className="w-full bg-[#8B1A1A] dark:bg-gold hover:bg-[#A32222] dark:hover:bg-amber-400 text-white dark:text-black py-4 px-6 rounded border border-none shadow font-serif text-sm tracking-widest font-bold uppercase cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white dark:border-black border-t-transparent" />
                  <span>Synthesizing Spiritual Matrix...</span>
                </>
              ) : (
                <span>Get My Prescription — اصْرِف الْوَصْفَة</span>
              )}
            </button>
          </div>
        </div>

        {/* LOADING STATE PLACEHOLDER */}
        {isLoading && (
          <div className="text-center py-10 space-y-4 animate-pulse">
            <Brain className="h-10 w-10 mx-auto text-[#C4A35A] animate-bounce" />
            <p className="font-mono text-xs text-stone-400">Compiling classical Prophetic tradition with modern neuro-biological biomarkers...</p>
          </div>
        )}

        {/* PRESCRIPTION OUTPUT SHEET */}
        {prescription && !isLoading && (
          <div className={`p-8 border rounded-lg max-w-3xl mx-auto relative overflow-hidden shadow-2xl border-l-4 border-l-[#8B1A1A] dark:border-l-gold transition-colors
            ${isSpace ? 'bg-[#080d1f] border-gold/20' : 'bg-white border-stone-200/80'}
          `}>
            {/* Arabic watermark */}
            <div className={`absolute right-4 bottom-4 w-32 h-32 opacity-5 pointer-events-none arabesque-star ${isSpace ? 'bg-gold' : 'bg-[#8B1A1A]'}`} />
            
            <div className="flex justify-between items-center border-b pb-4 mb-6 border-stone-200/10">
              <span className="font-mono text-[9px] tracking-widest uppercase text-[#C4A35A] font-bold">Spiritual Pharmacy Order Rx-786</span>
              <span className="text-[10px] font-serif italic text-stone-400">Sunnah-Vagal Interventions</span>
            </div>

            <div className="space-y-6">
              
              {/* PRIMARY MEDICAMENT */}
              <div className="text-center space-y-2 py-4 border-y border-stone-200/5">
                <span className="block text-[8px] font-mono tracking-widest text-stone-400 uppercase">PRIMARY DHIKR PRESCRIBED</span>
                
                <div className="text-3xl text-[#8B1A1A] dark:text-gold font-serif font-black leading-loose select-all font-serif py-1">
                  {prescription.dhikr}
                </div>
                
                <div className="text-xs font-mono text-stone-500 tracking-wide font-medium">
                  "{prescription.transliteration}"
                </div>
                
                <div className="text-xs text-stone-600 dark:text-stone-300 max-w-md mx-auto leading-relaxed italic font-serif">
                  Meaning: "{prescription.meaning}"
                </div>
                
                <div className="inline-block mt-3 px-3 py-1 rounded bg-[#8B1A1A]/10 border border-gold/30 font-mono text-[9px] text-[#C4A35A] uppercase font-bold tracking-widest">
                  {prescription.repetition}
                </div>
              </div>

              {/* SECONDARY DU'A */}
              {prescription.secondaryDua && (
                <div className={`p-4 rounded border ${isSpace ? 'bg-space border-gold/10' : 'bg-stone-50 border-stone-200'} space-y-1`}>
                  <span className="text-[8px] font-mono tracking-widest text-[#C4A35A] uppercase font-bold block">SECONDARY SUNNAH RECOMMENDATION</span>
                  <p className="font-serif italic text-sm text-stone-700 dark:text-stone-200 leading-relaxed">
                    {prescription.secondaryDua}
                  </p>
                </div>
              )}

              {/* DUAL COGNITIVE SCIENCE ANALYSIS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-stone-500 dark:text-stone-400">
                <div className="space-y-2">
                  <h4 className="font-mono text-[#C4A35A] font-bold uppercase tracking-widest text-[9px] flex items-center gap-1">
                    <Brain className="h-3.5 w-3.5" />
                    <span>Neuro-Biological Mechanism</span>
                  </h4>
                  <p className="font-sans leading-relaxed border-l-2 pl-3 border-[#8B1A1A]/40 dark:border-gold/30 text-stone-600 dark:text-stone-300">
                    {prescription.neuroscience}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-mono text-[#C4A35A] font-bold uppercase tracking-widest text-[9px] flex items-center gap-1">
                    <Award className="h-3.5 w-3.5" />
                    <span>Sunnah Lifestyle Tool</span>
                  </h4>
                  <p className="font-sans leading-relaxed border-l-2 pl-3 border-[#8B1A1A]/40 dark:border-gold/30 text-stone-600 dark:text-stone-300">
                    {prescription.lifestyle}
                  </p>
                </div>
              </div>

              {/* TIMELINE OUTCOME */}
              <div className="pt-4 border-t border-stone-200/5 text-center leading-relaxed">
                <span className="font-mono text-[9px] uppercase font-bold tracking-widest text-[#C4A35A]">Chronological Recovery expectation: </span>
                <span className="text-xs font-serif text-stone-700 dark:text-stone-200 font-bold">{prescription.timeline}</span>
              </div>
            </div>

            <div className="flex justify-center pt-6">
              <button
                onClick={() => {
                  try {
                    const storageKey = `users/albab_scribe_user/dhikr_prescriptions`;
                    const currentPrescriptions = JSON.parse(localStorage.getItem(storageKey) || "[]");
                    const record = {
                      id: `rx_${Date.now()}`,
                      selectedEmotion,
                      prescription,
                      created_at: new Date().toISOString()
                    };
                    currentPrescriptions.unshift(record);
                    localStorage.setItem(storageKey, JSON.stringify(currentPrescriptions));
                    
                    alert("Prescription documented in your Personal Scribal archives!");
                  } catch (e) {
                    console.error("Local storage error:", e);
                  }
                }}
                className={`font-mono text-[10px] uppercase border tracking-widest px-8 py-3.5 rounded-sm transition cursor-pointer bg-transparent focus:outline-none
                  ${isSpace ? 'border-gold text-gold hover:bg-gold hover:text-black' : 'border-[#8B1A1A] text-[#8B1A1A] hover:bg-[#8B1A1A] hover:text-white'}
                `}
              >
                Keep in personal medical index
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
