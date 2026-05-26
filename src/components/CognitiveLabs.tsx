import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Heart, HelpCircle, ShieldAlert, ShieldCheck, 
  Compass, Eye, Award, Brain, ChevronLeft, Send, 
  Trash2, BookOpen, Clock, AlertTriangle, ChevronRight, CheckCircle2,
  Lock, ArrowRight, UserCheck
} from 'lucide-react';

interface CognitiveLabsProps {
  currentTheme: 'parchment' | 'space';
  onNavigateToPortal?: () => void;
}

export default function CognitiveLabs({ currentTheme, onNavigateToPortal }: CognitiveLabsProps) {
  const isSpace = currentTheme === 'space';
  const [activeLab, setActiveLab] = useState<string | null>(null);
  
  // Session details stored locally
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [labsHistory, setLabsHistory] = useState<any[]>([]);
  const [showLoginPrompt, setShowLoginPrompt] = useState<boolean>(false);

  // General notification triggers
  const [globalNotification, setGlobalNotification] = useState<string | null>(null);

  useEffect(() => {
    // Check local session
    const email = localStorage.getItem('albab_logged_in_email');
    const name = localStorage.getItem('albab_logged_in_name');
    if (email) {
      setUserEmail(email);
      setUserName(name);
      fetchHistory(email);
    }
  }, []);

  const triggerNotification = (msg: string) => {
    setGlobalNotification(msg);
    setTimeout(() => setGlobalNotification(null), 4000);
  };

  const fetchHistory = async (email: string) => {
    try {
      const res = await fetch(`/api/labs/history/${email}`);
      if (res.ok) {
        const data = await res.json();
        setLabsHistory(data.history || []);
      }
    } catch (e) {
      console.warn("History fetch bypassed or failed offline:", e);
    }
  };

  // ----------------------------------------------------
  // FEATURE 1: NAFS ASSESSMENT ENGINE STATE & LOGIC
  // ----------------------------------------------------
  const [nafsStep, setNafsStep] = useState<number>(0); // 0 = start, 1 = quiz, 2 = loading, 3 = results
  const [nafsAnswers, setNafsAnswers] = useState<Record<number, string>>({});
  const [nafsReport, setNafsReport] = useState<string>('');
  
  const NAFS_QUESTIONS = [
    {
      q: "When a strong reactive temptation or illegal business option presents itself, what is your primary immediate response?",
      options: [
        { key: "A", text: "I feel pulled directly to satisfy it, sometimes finding justifications to bypass moral locks." },
        { key: "B", text: "I struggle severely. Even if I slip, my heart feels heavy with shame and guilt immediately after." },
        { key: "C", text: "By divine grace, my soul feels stabilized; I find it natural to step away with a peaceful heart." }
      ]
    },
    {
      q: "How do you internally construct your response after making an error, mistake, or slip in your character?",
      options: [
        { key: "A", text: "I repress the thought or ignore it, moving on quickly to avoid examining my actions." },
        { key: "B", text: "I engage in deep, sometimes distressing self-blame, analyzing my intentions and spiritual slippages." },
        { key: "C", text: "I turn immediately to God with sincere repentance (Tawbah), trusting divine mercy to restore balance." }
      ]
    },
    {
      q: "What is your primary state of mind when aligning with worship, silence, or meditative practices?",
      options: [
        { key: "A", text: "Dull, distracted, or finding ritual acts like a heavy chore that I want to finish quickly." },
        { key: "B", text: "Variable; I swing between deep connection and sudden waves of distraction, constantly pulling myself back." },
        { key: "C", text: "Serene and anchored; I feel tranquil presence and a clear sense of spiritual resting." }
      ]
    },
    {
      q: "When life deals you an extremely painful tragedy or sudden financial loss, how is your inner stability affected?",
      options: [
        { key: "A", text: "Extreme anger, questioning justice, or falling into deep despair and hopelessness." },
        { key: "B", text: "Intense sadness and distress, followed by checking my faults and praying for patience." },
        { key: "C", text: "Deep inner tranquility; crying might happen, but my heart remains fully content with our Lord's decree." }
      ]
    },
    {
      q: "How conscious are you of the subtle diseases of the heart (such as pride, self-complacency, or hidden envy)?",
      options: [
        { key: "A", text: "Rarely reflect on them; I assume my intentions are generally sound and focus on ritual forms." },
        { key: "B", text: "Highly vigilant; I constantly audit my heart, worrying if my good acts are secretly tainted by pride." },
        { key: "C", text: "Clearly aware; with grace, they are quickly neutralized by direct awareness and humility." }
      ]
    }
  ];

  const handleNafsQuizSelect = (optionKey: string) => {
    const updated = { ...nafsAnswers, [nafsStep - 1]: optionKey };
    setNafsAnswers(updated);
    if (nafsStep < NAFS_QUESTIONS.length) {
      setNafsStep(nafsStep + 1);
    } else {
      // Quiz complete, submit
      submitNafsAssessment(updated);
    }
  };

  const submitNafsAssessment = async (answersObj: Record<number, string>) => {
    setNafsStep(99); // Loading stage
    setNafsReport('');
    
    const formattedAnswersInput = NAFS_QUESTIONS.map((q, idx) => ({
      question: q.q,
      answer: q.options.find(o => o.key === answersObj[idx])?.text || "No selection"
    }));

    try {
      const res = await fetch('/api/labs/nafs-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: formattedAnswersInput })
      });

      if (!res.body) throw new Error("Stream returned empty reader");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      setNafsStep(100); // Result rendering stage

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setNafsReport(prev => prev + chunk);
      }
    } catch (err: any) {
      triggerNotification("Stream error: " + err.message);
      setNafsStep(0);
    }
  };

  // ----------------------------------------------------
  // FEATURE 2: ILM AL-MANTIQ AI TUTOR STATE & LOGIC
  // ----------------------------------------------------
  const [mantiqTab, setMantiqTab] = useState<'lessons' | 'practice' | 'quiz'>('lessons');
  const [selectedMantiqModule, setSelectedMantiqModule] = useState<string>('hadd');
  const [mantiqLessonText, setMantiqLessonText] = useState<string>('');
  const [mantiqLoading, setMantiqLoading] = useState<boolean>(false);
  
  // Practice states
  const [studentAnswer, setStudentAnswer] = useState<string>('');
  const [evaluationFeedback, setEvaluationFeedback] = useState<string>('');
  
  // MCQ Quiz state
  const [mantiqQuizQuestions, setMantiqQuizQuestions] = useState<any[]>([]);
  const [mantiqQuizAnswers, setMantiqQuizAnswers] = useState<Record<number, string>>({});
  const [mantiqQuizSubmitted, setMantiqQuizSubmitted] = useState<boolean>(false);

  const MANTIQ_MODULES = [
    { key: 'hadd', name: 'Al-Hadd (Scharp Definition)', desc: 'Formulating essential boundary definitions.' },
    { key: 'qiyas', name: 'Al-Qiyas (Syllogistic Dialectic)', desc: 'Validating premises to yield inevitable conclusions.' },
    { key: 'burhan', name: 'Al-Burhan (Scientific Demonstration)', desc: 'Deduction mapping utilizing certain sensory & rational proofs.' },
    { key: 'jadal', name: 'Al-Jadal (Academic Disputation)', desc: 'Formal debating on established societal or theological truths.' },
    { key: 'mughalata', name: 'Al-Mughalata (Sophistical Fallacies)', desc: 'Scanning linguistic or semantic flaws in logic tracks.' }
  ];

  const fetchMantiqLesson = async (moduleKey: string) => {
    setMantiqLoading(true);
    setMantiqLessonText('');
    setStudentAnswer('');
    setEvaluationFeedback('');
    setMantiqQuizQuestions([]);
    setMantiqQuizAnswers({});
    setMantiqQuizSubmitted(false);

    try {
      const res = await fetch('/api/labs/mantiq-tutor/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleKey })
      });
      if (res.ok) {
        const data = await res.json();
        setMantiqLessonText(data.content);
      }
    } catch (e: any) {
      triggerNotification("Failed parsing: " + e.message);
    } finally {
      setMantiqLoading(false);
    }
  };

  const submitMantiqPractice = async () => {
    if (!studentAnswer.trim()) return;
    setMantiqLoading(true);
    setEvaluationFeedback('');

    try {
      const res = await fetch('/api/labs/mantiq-tutor/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleKey: selectedMantiqModule,
          exerciseQuestion: "Formulate a formal syllogistic explanation for this module.",
          studentAnswer
        })
      });
      if (res.ok) {
        const data = await res.json();
        setEvaluationFeedback(data.feedback);
      }
    } catch (e: any) {
      triggerNotification("Evaluation failed: " + e.message);
    } finally {
      setMantiqLoading(false);
    }
  };

  const fetchMantiqQuiz = async () => {
    setMantiqLoading(true);
    setMantiqQuizQuestions([]);
    setMantiqQuizAnswers({});
    setMantiqQuizSubmitted(false);

    try {
      const res = await fetch('/api/labs/mantiq-tutor/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleKey: selectedMantiqModule })
      });
      if (res.ok) {
        const data = await res.json();
        setMantiqQuizQuestions(data.questions || []);
      }
    } catch (e: any) {
      triggerNotification("Quiz loading failed: " + e.message);
    } finally {
      setMantiqLoading(false);
    }
  };

  useEffect(() => {
    if (activeLab === 'mantiq') {
      fetchMantiqLesson(selectedMantiqModule);
    }
  }, [activeLab, selectedMantiqModule]);


  // ----------------------------------------------------
  // FEATURE 3: WASWAS CLINIC CHAT STATE & LOGIC
  // ----------------------------------------------------
  const [waswasInput, setWaswasInput] = useState<string>('');
  const [waswasMessage, setWaswasMessage] = useState<{role: 'user' | 'assistant', text: string}[]>([]);
  const [waswasStreamingText, setWaswasStreamingText] = useState<string>('');
  const [waswasLoading, setWaswasLoading] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [waswasMessage, waswasStreamingText]);

  const sendWaswasMessage = async () => {
    if (!waswasInput.trim()) return;
    const userMsg = waswasInput;
    setWaswasMessage(prev => [...prev, { role: 'user', text: userMsg }]);
    setWaswasInput('');
    setWaswasLoading(true);
    setWaswasStreamingText('');

    try {
      const res = await fetch('/api/labs/waswas-clinic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });

      if (!res.body) throw new Error("Parser error");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      setWaswasLoading(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setWaswasStreamingText(prev => prev + chunk);
      }

      // Append assistant's finished answer
      setWaswasMessage(prev => [...prev, { role: 'assistant', text: waswasStreamingText }]);
      setWaswasStreamingText('');
    } catch (err: any) {
      triggerNotification("Chat error: " + err.message);
      setWaswasLoading(false);
    }
  };


  // ----------------------------------------------------
  // FEATURE 4: MAQASID ETHICAL ANALYZER STATE & LOGIC
  // ----------------------------------------------------
  const [maqasidInput, setMaqasidInput] = useState<string>('');
  const [maqasidResult, setMaqasidResult] = useState<any | null>(null);
  const [maqasidLoading, setMaqasidLoading] = useState<boolean>(false);

  const SUGGESTED_DILEMMAS = [
    "Developing self-learning AI algorithms programmed to allocate healthcare, rationing liver transplants based on raw utilitarian age metrics.",
    "Utilizing central bank algorithmic currency models to completely restrict asset usage during ecological catastrophes.",
    "Applying high-frequency algorithmic trade liquidity reserves to leverage food commodities contracts globally."
  ];

  const submitMaqasidAnalysis = async (customText?: string) => {
    const textToSubmit = customText || maqasidInput;
    if (!textToSubmit.trim()) return;
    setMaqasidLoading(true);
    setMaqasidResult(null);

    try {
      const res = await fetch('/api/labs/maqasid-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dilemma: textToSubmit })
      });
      if (res.ok) {
        const data = await res.json();
        setMaqasidResult(data.result);
      }
    } catch (err: any) {
      triggerNotification("Analyzer failure: " + err.message);
    } finally {
      setMaqasidLoading(false);
    }
  };


  // ----------------------------------------------------
  // FEATURE 5: AQEEDAH FIREWALL STATE & LOGIC
  // ----------------------------------------------------
  const [activeChallenge, setActiveChallenge] = useState<string>('Problem of Evil');
  const [aqeedahOutput, setAqeedahOutput] = useState<string>('');
  const [aqeedahLoading, setAqeedahLoading] = useState<boolean>(false);

  const AQEEDAH_CHALLENGES = [
    "Problem of Evil",
    "Absolute Material Nihilism",
    "Darwinian Physicalism",
    "Simulation Theory",
    "Moral Relativism",
    "Existentialism",
    "Secular Humanism",
    "Postmodern Deconstruction",
    "Artificial Consciousness",
    "Radical Scientism"
  ];

  const constructShield = async () => {
    setAqeedahLoading(true);
    setAqeedahOutput('');

    try {
      const res = await fetch('/api/labs/aqeedah-firewall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeKey: activeChallenge })
      });

      if (!res.body) throw new Error("Parser failure");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setAqeedahOutput(prev => prev + chunk);
      }
    } catch (e: any) {
      triggerNotification("Firewall generation: " + e.message);
    } finally {
      setAqeedahLoading(false);
    }
  };


  // ----------------------------------------------------
  // FEATURE 6: RU'YA DREAM INTERPRETER STATE & LOGIC
  // ----------------------------------------------------
  const [dreamText, setDreamText] = useState<string>('');
  const [dreamReport, setDreamReport] = useState<any | null>(null);
  const [dreamLoading, setDreamLoading] = useState<boolean>(false);

  const interpretDream = async () => {
    if (!dreamText.trim()) return;
    setDreamLoading(true);
    setDreamReport(null);

    try {
      const res = await fetch('/api/labs/ruya-interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dream: dreamText })
      });
      if (res.ok) {
        const data = await res.json();
        setDreamReport(data);
      }
    } catch (err: any) {
      triggerNotification("Dream system error: " + err.message);
    } finally {
      setDreamLoading(false);
    }
  };


  // ----------------------------------------------------
  // FEATURE 7: DHIKR PRESCRIPTION ENGINE STATE & LOGIC
  // ----------------------------------------------------
  const [selectedEmotion, setSelectedEmotion] = useState<string>('anxiety');
  const [dhikrResult, setDhikrResult] = useState<any | null>(null);
  const [dhikrLoading, setDhikrLoading] = useState<boolean>(false);

  const CLINICAL_EMOTIONS = [
    { key: 'anxiety', label: 'Anxiety (Al-Qalaq)', bg: 'from-amber-500/10 to-transparent border-amber-500/25' },
    { key: 'grief', label: 'Deep Grief (Al-Huzn)', bg: 'from-blue-500/10 to-transparent border-blue-500/25' },
    { key: 'anger', label: 'Violent Anger (Al-Ghadab)', bg: 'from-red-500/10 to-transparent border-red-500/25' },
    { key: 'loneliness', label: 'Loneliness (Al-Wahshah)', bg: 'from-purple-500/10 to-transparent border-purple-500/25' },
    { key: 'arrogance', label: 'Arrogance (Al-Kibr)', bg: 'from-orange-500/10 to-transparent border-orange-500/25' },
    { key: 'envy', label: 'Envy (Al-Hasad)', bg: 'from-green-500/10 to-transparent border-green-500/25' },
    { key: 'depression', label: 'Spiritual Slump (Al-Khutwah)', bg: 'from-stone-500/10 to-transparent border-stone-500/25' },
    { key: 'gratitude', label: 'Deficient Gratitude', bg: 'from-teal-500/10 to-transparent border-teal-500/25' }
  ];

  const formulateDhikrRx = async (emotionKey: string) => {
    setSelectedEmotion(emotionKey);
    setDhikrLoading(true);
    setDhikrResult(null);

    try {
      const res = await fetch('/api/labs/dhikr-rx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emotionKey })
      });
      if (res.ok) {
        const data = await res.json();
        setDhikrResult(data.result);
      }
    } catch (e: any) {
      triggerNotification("Rx formulation bypass: " + e.message);
    } finally {
      setDhikrLoading(false);
    }
  };


  // ----------------------------------------------------
  // FEATURE 8: LOGICAL FALLACY SCANNER STATE & LOGIC
  // ----------------------------------------------------
  const [fallacyInput, setFallacyInput] = useState<string>('');
  const [fallacyReport, setFallacyReport] = useState<any | null>(null);
  const [fallacyLoading, setFallacyLoading] = useState<boolean>(false);

  const SUGGESTED_ARGUMENTS = [
    "No traditional rulings allow technology, because the early scholars did not possess servers, therefore servers represent direct religious innovative error.",
    "Either we fully accept secular artificial consciousness as our moral guide, or we fall completely backwards into pre-electronic dark ages.",
    "Traditionalists claim morality is objective; however, since people disagree about dietary details, absolute morality must represent a total fiction."
  ];

  const scanFallacy = async (textToScan?: string) => {
    const text = textToScan || fallacyInput;
    if (!text.trim()) return;
    setFallacyLoading(true);
    setFallacyReport(null);

    try {
      const res = await fetch('/api/labs/fallacy-scanner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ argument: text })
      });
      if (res.ok) {
        const data = await res.json();
        setFallacyReport(data);
      }
    } catch (e: any) {
      triggerNotification("Fallacy scanning failed: " + e.message);
    } finally {
      setFallacyLoading(false);
    }
  };


  // ----------------------------------------------------
  // ACADEMIC SAVE PERSISTENCE FLOW
  // ----------------------------------------------------
  const saveLabResult = async (featureName: string, input: string, outputObj: any) => {
    if (!userEmail) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      const res = await fetch('/api/labs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          featureName,
          input,
          output: outputObj
        })
      });
      if (res.ok) {
        triggerNotification(`Alhamdulillah! Your ${featureName} analysis has been securely stored in the Albab academic archives.`);
        fetchHistory(userEmail);
      }
    } catch (e: any) {
      triggerNotification("Save error: " + e.message);
    }
  };


  // THE COGNITIVE LABS DESIGNS INFO
  const COGNITIVE_LABS_MENU = [
    {
      id: 'nafs',
      title: 'Spiritual Nafs Assessment',
      icon: Brain,
      arabic: 'تزكية النفس',
      badge: 'Analytical Psychology',
      summary: '15-question diagnostic designed under Ibn al-Qayyim Tazkiyah concepts and modern CBT. Delivers 7-day Tazkiyah prescriptions.',
      color: 'border-rose-500/20 shadow-sm'
    },
    {
      id: 'mantiq',
      title: 'Ilm al-Mantiq AI Tutor',
      icon: Award,
      arabic: 'علم المنطق',
      badge: 'Classical Logic',
      summary: '5 lesson modules on classical Aristotelian-Islamic logic tracks. Complete lesson cards, submit essays for scholarly grading reviews.',
      color: 'border-emerald-500/20 shadow-sm'
    },
    {
      id: 'waswas',
      title: 'Waswas Cognitive Clinic',
      icon: Heart,
      arabic: 'علاج الوساوس',
      badge: 'Spiritual Therapy',
      summary: 'Compassionate therapeutic counseling system fusing classical Ighathat al-Lahfan advice with modern Acceptance & Commitment systems.',
      color: 'border-yellow-500/20 shadow-sm'
    },
    {
      id: 'maqasid',
      title: 'Maqasid Ethical Analyzer',
      icon: Compass,
      arabic: 'مقاصد الشريعة',
      badge: 'Juristic Ethics',
      summary: 'Input modern ethical bio-tech or tech dilemmas to map outcomes across 5 divine protective lenses against Western social paradigms.',
      color: 'border-sky-500/20 shadow-sm'
    },
    {
      id: 'aqeedah',
      title: 'Aqeedah Dialectical Firewall',
      icon: ShieldCheck,
      arabic: 'دروع العقيدة',
      badge: 'Rational Theology',
      summary: 'Refute 10 secular challenges (problem of evil, simulation theory, material nihilism) utilizing Ghazalian logic and formal syllogisms.',
      color: 'border-violet-505/20 shadow-sm'
    },
    {
      id: 'ruya',
      title: "Ru'ya Dream Interpreter",
      icon: Eye,
      arabic: 'تعبير الرؤيا',
      badge: 'Classical Interpretation',
      summary: 'Dual interpretive engine tracing deep classical Ibn Sirin dream patterns compiled alongside Carl Jung spiritual depth frameworks.',
      color: 'border-teal-500/20 shadow-sm'
    },
    {
      id: 'dhikr',
      title: 'Dhikr Spiritual Prescription',
      icon: Sparkles,
      arabic: 'صيدلية الأذكار',
      badge: 'Neurological Remedy',
      summary: 'Spiritual remedies for 8 distressing states (anxiety, grief, envy) integrating vagal-nerve biology and Sunnah lifestyle medicine.',
      color: 'border-amber-500/20 shadow-sm'
    },
    {
      id: 'fallacy',
      title: 'Mughalata Logical Scanner',
      icon: ShieldAlert,
      arabic: 'كاشف المغالطات',
      badge: 'Fallacy Detection',
      summary: 'Scan arguments and text clips to instantly flags structural, linguistic, or semantic fallacies with custom severity ratings.',
      color: 'border-indigo-500/20 shadow-sm'
    }
  ];

  return (
    <section 
      id="cognitive-labs" 
      className={`py-24 px-4 sm:px-6 md:px-12 transition-all duration-700
        ${isSpace ? 'bg-[#030611] text-white' : 'bg-[#FAF8F5] text-charcoal'}
      `}
    >
      <div className="max-w-7xl mx-auto">
        
        {/* GLOBAL NOTIFICATION TOAST */}
        {globalNotification && (
          <div className="fixed top-24 right-6 z-50 bg-[#8B1A1A] border border-gold/40 text-white font-mono text-xs py-3 px-5 shadow-2xl rounded-sm animate-bounce flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-gold" />
            <span>{globalNotification}</span>
          </div>
        )}

        {/* HEADER DESIGN */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 justify-center mb-4">
            <span className={`h-[1px] w-8 ${isSpace ? 'bg-gold' : 'bg-crimson'}`} />
            <span className={`text-xs font-bold tracking-[0.3em] uppercase font-mono ${isSpace ? 'text-gold-light' : 'text-crimson'}`}>
              COGNITIVE LABS SUBSYSTEMS
            </span>
            <span className={`h-[1px] w-8 ${isSpace ? 'bg-gold' : 'bg-crimson'}`} />
          </div>
          <h2 className="font-serif font-black text-3xl sm:text-4.5xl leading-tight mb-4">
            AI Scholarly Cognitive Laboratories
          </h2>
          <p className="text-sm md:text-base text-stone-500 max-w-2xl mx-auto leading-relaxed font-serif italic text-stone-400">
            "A synthesis of traditional Islamic sciences, classical logic, and modern intellectual psychology." Engaging interactive tools tailored to purify the soul (*Tazkiyah*), fortify beliefs (*Aqeedah*), and discipline reasoning (*Mantiq*).
          </p>

          {/* SCRIPTURAL GUEST WARNING & SESSION BAR */}
          <div className={`mt-8 inline-flex flex-wrap items-center justify-center gap-3 px-4 py-2.5 rounded border text-xs font-mono max-w-full
            ${userEmail 
              ? 'bg-[#8B1A1A]/10 border-gold/30 text-gold-light' 
              : 'bg-stone-500/5 border-stone-200 text-stone-500 dark:border-white/5 dark:text-stone-400'
            }
          `}>
            {userEmail ? (
              <>
                <UserCheck className="h-4 w-4 text-gold flex-shrink-0" />
                <span>Scholar Logged: <strong className="text-white dark:text-gold">{userName}</strong> ({userEmail})</span>
                <span className="text-gold opacity-50">•</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#8B1A1A]">Ledger Connected</span>
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5 text-stone-400 flex-shrink-0" />
                <span>Guest Evaluation Profile: Sandbox records stored in browser memory only.</span>
                <button 
                  onClick={() => {
                    const el = document.getElementById('scholarly');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                    onNavigateToPortal?.();
                  }}
                  className="underline text-crimson dark:text-gold font-bold hover:opacity-80 transition cursor-pointer"
                >
                  Authorize Student Login
                </button>
              </>
            )}
          </div>
        </div>

        {/* ----------------------------------------------------
            PORTFOLIO MAIN MENU DIRECTORY
           ---------------------------------------------------- */}
        {!activeLab ? (
          <div className="space-y-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {COGNITIVE_LABS_MENU.map((lab) => {
                const Icon = lab.icon;
                return (
                  <button
                    id={`lab-card-${lab.id}`}
                    key={lab.id}
                    onClick={() => {
                      setActiveLab(lab.id);
                      window.scrollTo({ top: document.getElementById('cognitive-labs')?.offsetTop || 300, behavior: 'smooth' });
                    }}
                    className={`group relative p-6 border rounded-sm text-left transition-all duration-300 flex flex-col justify-between cursor-pointer shadow-xs min-h-[300px] hover:scale-[1.01]
                      ${isSpace 
                        ? 'bg-space/40 hover:bg-[#090f23] border-gold/15 text-white' 
                        : 'bg-white hover:bg-[#FAF8F5] border-stone-200 text-charcoal'
                      }
                      ${lab.color}
                    `}
                  >
                    {/* Corner Accent Strips */}
                    <div className={`absolute top-0 bottom-0 left-0 w-[3px] transition-transform duration-300 scale-y-0 group-hover:scale-y-100
                      ${isSpace ? 'bg-gold' : 'bg-crimson'}
                    `} />

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`p-2.5 rounded-full border backdrop-blur-sm
                          ${isSpace ? 'bg-gold/5 border-gold/20 text-gold' : 'bg-crimson/5 border-crimson/15 text-crimson'}
                        `}>
                          <Icon className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                        </span>
                        <span className="text-xs font-serif italic text-stone-400 font-bold tracking-widest">
                          {lab.arabic}
                        </span>
                      </div>

                      <div className="mb-2">
                        <span className="text-[9px] uppercase font-mono tracking-widest bg-stone-500/5 px-2 py-0.5 rounded border border-stone-200/50 text-stone-500">
                          {lab.badge}
                        </span>
                      </div>

                      <h3 className="font-serif font-black text-xl tracking-wide leading-tight group-hover:text-gold transition-colors">
                        {lab.title}
                      </h3>
                      
                      <p className="text-xs text-stone-400 dark:text-stone-500 font-sans mt-3 leading-relaxed line-clamp-4">
                        {lab.summary}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-stone-200/10 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[#8B1A1A] font-bold group-hover:text-gold">
                      <span>Initiate Lab Session</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* SECURE SCHOLARLY ALIAS ARCHIVES SECTION */}
            {userEmail && (
              <div className={`p-8 border rounded-sm transition-all duration-300
                ${isSpace ? 'bg-space/20 border-gold/20' : 'bg-white border-stone-200'}
              `}>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200/10">
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-gold" />
                    <h3 className="font-serif font-bold text-lg tracking-wide">Academic Portfolio Journal Index</h3>
                  </div>
                  <span className="text-xs font-mono text-stone-400">Archived Cases: {labsHistory.length}</span>
                </div>

                {labsHistory.length === 0 ? (
                  <p className="text-xs font-serif text-stone-500 italic text-center py-6">
                    No active laboratory results saved to your scholarly covenant record yet. complete a lab above to document files.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                    {labsHistory.map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`p-4 border rounded-sm text-xs font-sans space-y-2
                          ${isSpace ? 'bg-[#090f23] border-white/5' : 'bg-stone-50 border-stone-200'}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono bg-[#8B1A1A] text-white px-2 py-0.5 text-[9px] uppercase font-semibold rounded-xs">
                            {item.featureName}
                          </span>
                          <span className="text-stone-400 font-serif italic flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="font-semibold text-stone-700 dark:text-stone-300 line-clamp-1">
                          Query: "{item.input}"
                        </p>
                        <div className="pt-2 border-t border-stone-200/5 max-h-[100px] overflow-y-auto text-stone-500 font-mono text-[10px] whitespace-pre-wrap">
                          {item.output.length > 200 ? item.output.slice(0, 200) + "..." : item.output}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ----------------------------------------------------
              ACTIVE INDIVIDUAL LABORATORY FRAME
             ---------------------------------------------------- */
          <div className="space-y-8">
            
            {/* LAB WRAPPER NAVIGATION BAR */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-200/10">
              <button
                onClick={() => {
                  setActiveLab(null);
                  // Reset states
                  setNafsStep(0);
                  setNafsAnswers({});
                  setNafsReport('');
                  setStudentAnswer('');
                  setEvaluationFeedback('');
                  setWaswasMessage([]);
                  setMaqasidResult(null);
                  setDreamReport(null);
                  setDhikrResult(null);
                  setFallacyReport(null);
                }}
                className={`font-mono text-xs uppercase flex items-center gap-2 font-bold cursor-pointer transition
                  ${isSpace ? 'text-gold-light hover:text-white' : 'text-crimson hover:text-stone-900'}
                `}
              >
                <ChevronLeft className="h-4 w-4" />
                Return to Cognitive Labs Directory
              </button>
              
              <div className="flex items-center gap-3">
                <span className="text-xs font-serif italic text-stone-400">Active Node:</span>
                <span className="font-mono text-xs bg-[#8B1A1A] text-white font-bold tracking-widest px-3 py-1 rounded-sm uppercase">
                  {COGNITIVE_LABS_MENU.find(l => l.id === activeLab)?.title}
                </span>
              </div>
            </div>

            {/* 1. NAFS ASSESSMENT INTERACTION VIEW */}
            {activeLab === 'nafs' && (
              <div className={`p-8 border rounded-sm max-w-3xl mx-auto transition-colors duration-500
                ${isSpace ? 'bg-space/40 border-gold/20' : 'bg-white border-stone-200'}
              `}>
                <div className="text-center mb-8">
                  <h3 className="font-serif font-black text-2xl tracking-wide mb-2 flex items-center justify-center gap-2 text-rose-800 dark:text-gold">
                    <Brain className="h-6 w-6" />
                    Spiritual Psychology Assessment Engine
                  </h3>
                  <p className="text-xs font-serif text-stone-400 max-w-xl mx-auto leading-relaxed">
                    Formulate your honest inner moral alignment across 5 cardinal psychological parameters to retrieve your Tazkiyah stage and therapeutic behavioral prescription.
                  </p>
                </div>

                {nafsStep === 0 && (
                  <div className="text-center py-6 space-y-6">
                    <div className="text-xs font-mono border p-4 rounded-sm bg-stone-500/5 text-stone-400 border-stone-200/20 max-w-md mx-auto">
                      <strong>Methodology</strong>: Blends classical Islamic Tazkiyah al-Nafs (purification of the soul) of Imam Ibn al-Qayyim with modern Cognitive Behavioral Therapy (CBT).
                    </div>
                    <button
                      onClick={() => setNafsStep(1)}
                      className="font-mono text-xs uppercase bg-[#8B1A1A] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-[#8B1A1A] text-white border border-[#8B1A1A] dark:border-gold font-bold tracking-widest px-8 py-3.5 rounded-sm transition cursor-pointer"
                    >
                      Begin Assessment
                    </button>
                  </div>
                )}

                {nafsStep > 0 && nafsStep <= NAFS_QUESTIONS.length && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between text-xs font-mono text-stone-400 pb-2 border-b border-stone-200/10">
                      <span>Parameter Index</span>
                      <span>Question {nafsStep} of {NAFS_QUESTIONS.length}</span>
                    </div>

                    <div className="py-4 font-serif text-lg text-stone-800 dark:text-stone-100 text-center font-bold">
                      "{NAFS_QUESTIONS[nafsStep - 1].q}"
                    </div>

                    <div className="space-y-3 pt-4">
                      {NAFS_QUESTIONS[nafsStep - 1].options.map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => handleNafsQuizSelect(opt.key)}
                          className={`w-full p-4 border rounded-sm text-left text-xs font-sans transition-all duration-300 hover:scale-[1.005] cursor-pointer flex items-center justify-between
                            ${isSpace 
                              ? 'bg-space/30 hover:bg-[#090f23] border-white/5 text-stone-200 hover:border-gold' 
                              : 'bg-stone-50 hover:bg-[#F2EFEA] border-stone-200 text-charcoal hover:border-crimson'
                            }
                          `}
                        >
                          <span className="font-semibold leading-relaxed max-w-[90%]">{opt.text}</span>
                          <span className="font-mono bg-[#8B1A1A] text-white text-[10px] py-1 px-2 rounded-full font-bold">
                            {opt.key}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {nafsStep === 99 && (
                  <div className="text-center py-12 space-y-4">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
                    <p className="font-mono text-xs text-stone-400">Analyzing responses under classical Tazkiyah & CBT principles...</p>
                  </div>
                )}

                {nafsStep === 100 && (
                  <div className="space-y-6">
                    <div className="p-6 md:p-8 bg-[#FAF2E5] dark:bg-[#070b18] border border-gold/30 text-charcoal dark:text-white rounded-sm font-sans relative overflow-hidden shadow-inner font-serif italic text-sm leading-relaxed whitespace-pre-line border-l-4 border-l-[#8B1A1A]">
                      {nafsReport}
                    </div>

                    <div className="flex justify-center gap-4 pt-4 border-t border-stone-200/5">
                      <button
                        onClick={() => saveLabResult("Nafs Assessment", "Completed 5-Parameter spiritually diagnostic", nafsReport)}
                        className="font-mono text-[10px] font-bold uppercase tracking-widest border border-gold px-6 py-3 rounded-sm text-gold hover:bg-gold hover:text-black transition cursor-pointer flex items-center gap-2"
                      >
                        <Award className="h-4 w-4" />
                        Save to Spiritual Ledger Journal
                      </button>
                      
                      <button
                        onClick={() => setNafsStep(0)}
                        className="font-mono text-[10px] font-bold uppercase tracking-widest border border-stone-300 dark:border-white/10 px-6 py-3 rounded-sm text-stone-400 hover:text-white transition cursor-pointer"
                      >
                        Retake Quiz
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. MANTIQ TUTOR INTERACTION VIEW */}
            {activeLab === 'mantiq' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* SELECTOR SIDE LIST */}
                <div className="lg:col-span-4 space-y-3">
                  <div className={`p-4 border rounded-sm font-sans space-y-1
                    ${isSpace ? 'bg-space/30 border-white/5' : 'bg-white border-stone-200'}
                  `}>
                    <p className="text-[10px] uppercase tracking-widest text-[#8B1A1A] font-bold font-mono text-center">Aristotelian study tracks</p>
                  </div>
                  {MANTIQ_MODULES.map((mod) => (
                    <button
                      key={mod.key}
                      onClick={() => {
                        setSelectedMantiqModule(mod.key);
                      }}
                      className={`w-full p-4 border rounded-sm text-left transition-all tracking-wide flex flex-col cursor-pointer
                        ${selectedMantiqModule === mod.key 
                          ? (isSpace ? 'border-amber-400 bg-amber-950/20' : 'border-crimson bg-crimson/5') 
                          : (isSpace ? 'bg-space hover:bg-[#090f23] border-white/5' : 'bg-white hover:bg-[#FAF8F5] border-stone-200')
                        }
                      `}
                    >
                      <h4 className="font-serif font-black text-sm">{mod.name}</h4>
                      <p className="text-[10px] text-stone-400 mt-1 line-clamp-1">{mod.desc}</p>
                    </button>
                  ))}
                </div>

                {/* WORK ENGINE WINDOW */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* TAB CONTROLLERS */}
                  <div className="flex border-b border-stone-200/10">
                    {(['lessons', 'practice', 'quiz'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => {
                          setMantiqTab(tab);
                          if (tab === 'quiz' && mantiqQuizQuestions.length === 0) {
                            fetchMantiqQuiz();
                          }
                        }}
                        className={`px-6 py-3 font-mono text-xs uppercase tracking-widest border-b-2 font-bold cursor-pointer transition
                          ${mantiqTab === tab 
                            ? 'border-[#8B1A1A] text-[#8B1A1A]' 
                            : 'border-transparent text-stone-400 hover:text-stone-300'
                          }
                        `}
                      >
                        {tab === 'lessons' ? 'Lesson Corpus' : tab === 'practice' ? 'Scholarly critique' : 'Mini Evaluation'}
                      </button>
                    ))}
                  </div>

                  {/* LOADING OVERLAY STATE */}
                  {mantiqLoading && (
                    <div className="text-center py-12 space-y-3">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
                      <p className="font-mono text-xs text-stone-400">Drafting Mantiq scrolls via Avicennian standards...</p>
                    </div>
                  )}

                  {!mantiqLoading && (
                    <>
                      {/* LESSON FRAME CORPUS */}
                      {mantiqTab === 'lessons' && (
                        <div className={`p-6 border rounded-sm text-sm font-sans leading-relaxed relative overflow-hidden shadow-inner whitespace-pre-wrap
                          ${isSpace ? 'bg-[#070b18] border-white/5 text-stone-200' : 'bg-white border-stone-200 text-charcoal'}
                        `}>
                          {mantiqLessonText}
                        </div>
                      )}

                      {/* PRACTICE / ESSAY CRITIQUE GRID */}
                      {mantiqTab === 'practice' && (
                        <div className="space-y-4">
                          <label className="block text-xs font-mono uppercase text-[#8B1A1A] font-bold">Exercise Thesis Submission</label>
                          <p className="text-xs font-serif text-stone-400 italic">
                            Construct a scholastic answer to the practice objective outlined inside the Lesson Corpus.
                          </p>
                          <textarea
                            value={studentAnswer}
                            onChange={(e) => setStudentAnswer(e.target.value)}
                            placeholder="Formulate your Avicennian logical proof or definition arguments here..."
                            rows={5}
                            className={`w-full p-4 text-xs font-sans rounded border focus:outline-none transition
                              ${isSpace 
                                ? 'bg-[#070b18] border-white/5 text-white placeholder-white/20 focus:border-gold' 
                                : 'bg-white border-stone-200 text-charcoal placeholder-stone-400 focus:border-crimson'
                              }
                            `}
                          />
                          <button
                            onClick={submitMantiqPractice}
                            disabled={!studentAnswer.trim()}
                            className="font-mono text-xs uppercase bg-[#8B1A1A] hover:bg-black hover:text-white text-white font-bold tracking-widest px-6 py-3.5 rounded-sm transition cursor-pointer disabled:opacity-40"
                          >
                            Submit Essay Critique
                          </button>

                          {evaluationFeedback && (
                            <div className="p-6 bg-[#FAF2E5] dark:bg-[#070b18] border border-gold/30 text-charcoal dark:text-white rounded-sm font-serif italic whitespace-pre-wrap">
                              {evaluationFeedback}
                            </div>
                          )}
                        </div>
                      )}

                      {/* MINI OBJECTIVE COMPONENT */}
                      {mantiqTab === 'quiz' && (
                        <div className="space-y-6">
                          {mantiqQuizQuestions.map((q, qIdx) => (
                            <div 
                              key={qIdx} 
                              className={`p-6 border rounded-sm text-xs font-sans space-y-4
                                ${isSpace ? 'bg-[#070b18] border-white/5' : 'bg-stone-50 border-stone-200'}
                              `}
                            >
                              <div className="font-bold text-stone-800 dark:text-stone-100 font-serif text-sm">
                                Q{qIdx + 1}: {q.question}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {q.options.map((opt: string, optIdx: number) => {
                                  const optLetter = ["A", "B", "C", "D"][optIdx];
                                  const isChecked = mantiqQuizAnswers[qIdx] === optLetter;
                                  return (
                                    <button
                                      key={optIdx}
                                      onClick={() => {
                                        if (mantiqQuizSubmitted) return;
                                        setMantiqQuizAnswers(prev => ({ ...prev, [qIdx]: optLetter }));
                                      }}
                                      className={`p-3 border rounded-sm text-left font-sans transition flex items-center justify-between cursor-pointer
                                        ${isChecked 
                                          ? 'border-[#8B1A1A] bg-[#8B1A1A]/5 font-bold text-[#8B1A1A]' 
                                          : 'border-stone-200 dark:border-white/5 text-stone-500 hover:bg-black/10'
                                        }
                                      `}
                                    >
                                      <span>{opt}</span>
                                      <span className="font-mono text-[9px] bg-stone-500/10 py-0.5 px-1.5 rounded-full font-bold">
                                        {optLetter}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                              
                              {mantiqQuizSubmitted && (
                                <div className="p-3 bg-gold/5 border border-gold/20 text-stone-500 font-serif leading-relaxed italic">
                                  <strong className={mantiqQuizAnswers[qIdx] === q.correct ? "text-emerald-500 font-semibold" : "text-red-500 font-semibold"}>
                                    {mantiqQuizAnswers[qIdx] === q.correct ? "Correct ✓" : `Incorrect. Correct: ${q.correct}`}
                                  </strong>
                                  <div className="mt-1">{q.explanation}</div>
                                </div>
                              )}
                            </div>
                          ))}

                          {!mantiqQuizSubmitted ? (
                            <button
                              onClick={() => setMantiqQuizSubmitted(true)}
                              className="font-mono text-xs uppercase bg-[#8B1A1A] hover:bg-black hover:text-white text-white font-bold tracking-widest px-6 py-3 rounded-sm transition cursor-pointer"
                            >
                              Finalize Core Evaluation
                            </button>
                          ) : (
                            <div className="flex gap-3">
                              <button
                                onClick={fetchMantiqQuiz}
                                className="font-mono text-xs uppercase border border-[#8B1A1A] text-[#8B1A1A] font-bold tracking-widest px-6 py-3 rounded-sm transition cursor-pointer"
                              >
                                Re-Generate Interactive Challenges
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* 3. WASWAS COGNITIVE CLINIC VIEW */}
            {activeLab === 'waswas' && (
              <div className={`p-6 border rounded-sm max-w-3xl mx-auto flex flex-col h-[520px] transition-colors
                ${isSpace ? 'bg-space/30 border-white/5' : 'bg-white border-stone-200'}
              `}>
                {/* Chat window viewport */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
                  
                  {/* COMPASS COMPANIONS INTRODUCTION MESSAGE */}
                  <div className={`p-4 border border-yellow-500/10 text-xs font-sans leading-relaxed rounded-sm rounded-bl-none
                    ${isSpace ? 'bg-yellow-950/10 text-stone-300' : 'bg-yellow-50 text-charcoal'}
                  `}>
                    <div className="flex items-center gap-2 mb-1">
                      <Heart className="h-4 w-4 text-amber-500" />
                      <strong>Waswas Compass Clinic Safeguard</strong>
                    </div>
                    Enter your thoughts, sudden theological doubts, or obsessive purification fears. Blends classical *Ighathat al-Lahfan* instructions with ACT strategies to validate, unhook, and settle hearts.
                  </div>

                  {waswasMessage.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`p-4 max-w-[85%] text-xs rounded-sm font-sans relative overflow-hidden leading-relaxed whitespace-pre-line
                        ${msg.role === 'user' 
                          ? 'bg-[#8B1A1A] text-white rounded-br-none' 
                          : (isSpace ? 'bg-[#070b18] border border-white/5 text-stone-200 rounded-bl-none' : 'bg-stone-100 border border-stone-200 text-charcoal rounded-bl-none')
                        }
                      `}>
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {waswasStreamingText && (
                    <div className="flex justify-start">
                      <div className={`p-4 max-w-[85%] text-xs rounded-sm font-sans rounded-bl-none leading-relaxed whitespace-pre-line
                        ${isSpace ? 'bg-[#070b18] border border-white/5 text-stone-200' : 'bg-stone-50 border border-stone-200 text-charcoal'}
                      `}>
                        {waswasStreamingText}
                      </div>
                    </div>
                  )}

                  {waswasLoading && (
                    <div className="flex justify-start">
                      <div className="p-4 rounded-full bg-stone-500/5 flex items-center gap-2 text-xs font-mono text-stone-400">
                        <span className="h-2 w-2 rounded-full bg-gold animate-ping" />
                        <span>Scribing remedy parameters...</span>
                      </div>
                    </div>
                  )}
                  <div ref={scrollRef} />
                </div>

                {/* Search input control */}
                <div className="flex items-center gap-3 pt-4 border-t border-stone-200/5">
                  <input
                    type="text"
                    value={waswasInput}
                    onChange={(e) => setWaswasInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendWaswasMessage()}
                    placeholder="Describe religious anxieties, loops, or intrusive whisperings..."
                    className={`flex-1 px-4 py-3 text-xs font-sans rounded border focus:outline-none transition
                      ${isSpace 
                        ? 'bg-[#070b18] border-white/5 text-white placeholder-white/20 focus:border-gold' 
                        : 'bg-white border-stone-200 text-charcoal placeholder-stone-400 focus:border-crimson'
                      }
                    `}
                  />
                  <button
                    onClick={sendWaswasMessage}
                    className="p-3 bg-[#8B1A1A] text-white hover:bg-black rounded-sm cursor-pointer transition flex justify-center items-center"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* 4. MAQASID ETHICAL ANALYZER VIEW */}
            {activeLab === 'maqasid' && (
              <div className="space-y-8">
                
                {/* DILEMMA TEXT CARD */}
                <div className={`p-6 border rounded-sm max-w-4xl mx-auto transition-colors
                  ${isSpace ? 'bg-space/30 border-white/5' : 'bg-white border-stone-200'}
                `}>
                  <h3 className="font-serif font-black text-xl mb-4 text-[#8B1A1A] flex items-center gap-2">
                    <Compass className="h-5 w-5" />
                    Bio-Tech & Structural Ethical Dilemma Formulator
                  </h3>
                  <textarea
                    value={maqasidInput}
                    onChange={(e) => setMaqasidInput(e.target.value)}
                    placeholder="Formulate your ethical bio-medical, algorithmic currency, artificial intelligence, or ecological regulatory scenario here..."
                    rows={4}
                    className={`w-full p-4 text-xs font-sans rounded border focus:outline-none transition mb-4
                      ${isSpace 
                        ? 'bg-[#070b18] border-white/5 text-white placeholder-white/20 focus:border-gold' 
                        : 'bg-[#FAF8F5] border-stone-200 text-charcoal placeholder-stone-400 focus:border-crimson'
                      }
                    `}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-stone-400">Sample scenarios:</span>
                      {SUGGESTED_DILEMMAS.map((d, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setMaqasidInput(d);
                            submitMaqasidAnalysis(d);
                          }}
                          className="font-mono text-[9px] uppercase bg-stone-500/10 border border-stone-500/20 px-2 py-1 rounded-sm text-stone-400 hover:text-white transition cursor-pointer"
                        >
                          Dilemma {i + 1}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => submitMaqasidAnalysis()}
                      disabled={maqasidLoading || !maqasidInput.trim()}
                      className="font-mono text-xs uppercase bg-[#8B1A1A] text-white hover:bg-black font-bold tracking-widest px-6 py-3.5 rounded-sm transition cursor-pointer disabled:opacity-40"
                    >
                      {maqasidLoading ? "Generating 5-Column Ledger..." : "Synthesize Maqasid Ledger"}
                    </button>
                  </div>
                </div>

                {maqasidLoading && (
                  <div className="text-center py-12 space-y-3">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
                    <p className="font-mono text-xs text-stone-400">Synthesizing modern philosophy grids against Shariah's protective objectives...</p>
                  </div>
                )}

                {/* PARSED RESULTS GRID SCROLLS */}
                {maqasidResult && (
                  <div className="space-y-6">
                    
                    {/* 5 COLUMN MAQASID LEDGER */}
                    <div>
                      <h4 className="font-mono text-xs uppercase text-[#8B1A1A] font-bold tracking-widest mb-4">
                        Maqasid Objective Alignment (5-Column Ledger Matrix)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {maqasidResult.lenses.map((lens: any, idx: number) => {
                          const isPermissible = lens.verdict.toLowerCase().includes("permissible") && !lens.verdict.toLowerCase().includes("im");
                          const isDisputed = lens.verdict.toLowerCase().includes("disputed") || lens.verdict.toLowerCase().includes("amber") || lens.verdict.toLowerCase().includes("doubtful");
                          const badgeColor = isPermissible 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                            : isDisputed 
                              ? "bg-amber-500/10 border-amber-500/20 text-amber-500" 
                              : "bg-red-500/10 border-red-500/20 text-red-500";
                          
                          return (
                            <div 
                              key={idx} 
                              className={`p-5 border rounded-sm text-xs font-sans space-y-3 relative overflow-hidden transition-all duration-300
                                ${isSpace ? 'bg-[#070b18]' : 'bg-white'}
                                ${isPermissible ? 'border-emerald-500/15' : isDisputed ? 'border-amber-500/15' : 'border-red-500/15'}
                              `}
                            >
                              <div className="flex items-center justify-between border-b pb-2 border-stone-200/5">
                                <span className="font-serif font-black text-stone-700 dark:text-stone-200">{lens.name}</span>
                              </div>
                              <p className="text-stone-400 font-serif leading-relaxed italic text-[11px] h-[100px] overflow-y-auto">
                                {lens.explanation}
                              </p>
                              <div className="flex justify-center pt-2">
                                <span className={`px-3 py-1 text-[9px] uppercase tracking-widest font-mono font-black rounded-full border ${badgeColor}`}>
                                  {lens.verdict}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* COMPARATIVE WESTERN ETHICS COLLATERAL */}
                    <div className={`p-6 border rounded-sm grid grid-cols-1 md:grid-cols-2 gap-6
                      ${isSpace ? 'bg-[#070b18] border-white/5' : 'bg-stone-50 border-stone-200'}
                    `}>
                      <div className="space-y-4">
                        <h5 className="font-serif font-black text-sm text-[#8B1A1A]">Western Secular Paradigms COMPARATIVE</h5>
                        <div className="space-y-3 text-xs font-sans text-stone-400">
                          <p>
                            <strong className="text-stone-300">Utilitarian Synthesis:</strong> {maqasidResult.comparative.utilitarian}
                          </p>
                          <p>
                            <strong className="text-stone-300">Kantian Deontological:</strong> {maqasidResult.comparative.deontology}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h5 className="font-serif font-black text-sm text-gold">Scholarly Integration Summary</h5>
                        <div className="space-y-3 text-xs font-sans text-stone-400">
                          <p>
                            <strong className="text-stone-300">Framework Convergence:</strong> {maqasidResult.comparative.convergence}
                          </p>
                          <p>
                            <strong className="text-stone-300">Irreconcilable Divergence:</strong> {maqasidResult.comparative.divergence}
                          </p>
                        </div>
                      </div>

                      <div className="col-span-1 md:col-span-2 pt-4 border-t border-stone-200/10 text-center font-serif text-sm italic text-stone-800 dark:text-gold bg-gold/5 p-4 rounded-sm border border-gold/25 leading-relaxed">
                        <strong>Canonical Scholarly Verdict:</strong> "{maqasidResult.comparative.finalRuling}"
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={() => saveLabResult("Maqasid Analyzer", maqasidInput, maqasidResult)}
                        className="font-mono text-xs uppercase bg-[#8B1A1A] hover:bg-black tracking-widest text-white px-8 py-3.5 rounded-sm transition cursor-pointer"
                      >
                        Save Ethical Analysis to Archives
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 5. AQEEDAH FIREWALL INTERACTION VIEW */}
            {activeLab === 'aqeedah' && (
              <div className="space-y-6">
                
                {/* SELECT CHALLENGE INPUT CARD */}
                <div className={`p-6 border rounded-sm max-w-2xl mx-auto transition-colors
                  ${isSpace ? 'bg-space/30 border-white/5' : 'bg-white border-stone-200'}
                `}>
                  <div className="text-center space-y-1 mb-6">
                    <h3 className="font-serif font-black text-xl text-violet-800 dark:text-gold flex items-center justify-center gap-2">
                      <ShieldCheck className="h-5 w-5 animate-pulse" />
                      Aqeedah Dialectical Shield Constructor
                    </h3>
                    <p className="text-xs text-stone-400 font-serif">
                      Fortify rational belief systems and formulate dialectical defenses against secular modernism.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <select
                      value={activeChallenge}
                      onChange={(e) => setActiveChallenge(e.target.value)}
                      className={`w-full sm:w-[320px] px-4 py-3 text-xs font-sans rounded border focus:outline-none transition
                        ${isSpace 
                          ? 'bg-[#070b18] border-white/5 text-white' 
                          : 'bg-white border-stone-200 text-charcoal'
                        }
                      `}
                    >
                      {AQEEDAH_CHALLENGES.map((ch, i) => (
                        <option key={i} value={ch}>{ch}</option>
                      ))}
                    </select>

                    <button
                      onClick={constructShield}
                      disabled={aqeedahLoading}
                      className="w-full sm:w-auto font-mono text-xs uppercase bg-[#8B1A1A] text-white hover:bg-black font-bold tracking-widest px-8 py-3.5 rounded-sm transition cursor-pointer"
                    >
                      {aqeedahLoading ? "Constructing Dialectics..." : "Erect Belief Firewall"}
                    </button>
                  </div>
                </div>

                {aqeedahLoading && (
                  <div className="text-center py-12 space-y-3">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
                    <p className="font-mono text-xs text-stone-400">Scribing Kalam refutations with logical syllogism proofs...</p>
                  </div>
                )}

                {/* DYNAMIC SHIELD RESULTS OUT */}
                {aqeedahOutput && (
                  <div className="max-w-3xl mx-auto space-y-6">
                    <div className={`p-6 md:p-8 border rounded-sm text-xs font-sans leading-relaxed whitespace-pre-line border-l-4 border-l-[#8B1A1A] relative shadow-inner
                      ${isSpace ? 'bg-[#070b18] border-white/5 text-stone-200' : 'bg-[#FAF2E5] border-stone-200 text-charcoal'}
                    `}>
                      {aqeedahOutput}
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={() => saveLabResult(`Aqeedah Firewall: ${activeChallenge}`, activeChallenge, aqeedahOutput)}
                        className="font-mono text-xs uppercase border border-gold text-gold hover:bg-gold hover:text-black tracking-widest px-8 py-3.5 rounded-sm transition cursor-pointer"
                      >
                        Commit to belief journal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 6. RU'YA DREAM SYSTEM INTERFACE VIEW */}
            {activeLab === 'ruya' && (
              <div className="space-y-8">
                
                {/* DREAM TEXT INPUT FORM CONTAINER */}
                <div className={`p-6 border rounded-sm max-w-3xl mx-auto transition-colors
                  ${isSpace ? 'bg-space/30 border-white/5' : 'bg-white border-stone-200'}
                `}>
                  <h3 className="font-serif font-black text-xl mb-3 text-teal-800 dark:text-gold flex items-center justify-center gap-2">
                    <Eye className="h-5 w-5" />
                    Prophetic Oneiromancy & Jungian Depth Synthesis
                  </h3>
                  <p className="text-xs font-serif text-stone-400 max-w-lg mx-auto text-center leading-relaxed mb-4">
                    Document dream sequences to trace symbols across traditional Ibn Sirin exegesis methodologies alongside Carl Jung's subconscious archetype schemas.
                  </p>

                  <textarea
                    value={dreamText}
                    onChange={(e) => setDreamText(e.target.value)}
                    placeholder="Describe specific occurrences, symbols, water bodies, actions, animals, or elements present inside your dreams with high sensory resolution..."
                    rows={4}
                    className={`w-full p-4 text-xs font-sans rounded border focus:outline-none transition mb-4
                      ${isSpace 
                        ? 'bg-[#070b18] border-white/5 text-white placeholder-white/20' 
                        : 'bg-[#FAF8F5] border-stone-200 text-charcoal placeholder-stone-400'
                      }
                    `}
                  />

                  <div className="flex justify-center">
                    <button
                      onClick={interpretDream}
                      disabled={dreamLoading || !dreamText.trim()}
                      className="font-mono text-xs uppercase bg-[#8B1A1A] text-white hover:bg-black font-bold tracking-widest px-8 py-3.5 rounded-sm transition cursor-pointer"
                    >
                      {dreamLoading ? "Consulting Scrolls..." : "Launch Dream Analysis"}
                    </button>
                  </div>
                </div>

                {dreamLoading && (
                  <div className="text-center py-12 space-y-3">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
                    <p className="font-mono text-xs text-stone-400">Decoding metaphors under Ibn Sirin and Archetypal methodologies...</p>
                  </div>
                )}

                {/* DOUBLE COLUMN DREAMS CARDS */}
                {dreamReport && (
                  <div className="max-w-4xl mx-auto space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Ibn Sirin card */}
                      <div className={`p-6 border rounded-sm text-xs font-sans leading-relaxed space-y-3 relative
                        ${isSpace ? 'bg-[#070b18] border-white/5 text-stone-200' : 'bg-stone-50 border-stone-200 text-charcoal'}
                      `}>
                        <h4 className="font-serif font-black text-sm text-[#8B1A1A] border-b pb-2 border-stone-200/5">Classical Islamic sirin model</h4>
                        <div className="italic font-serif whitespace-pre-wrap">{dreamReport.islamic}</div>
                      </div>

                      {/* Jungian card */}
                      <div className={`p-6 border rounded-sm text-xs font-sans leading-relaxed space-y-3 relative
                        ${isSpace ? 'bg-[#070b18] border-white/5 text-stone-200' : 'bg-stone-50 border-stone-200 text-charcoal'}
                      `}>
                        <h4 className="font-serif font-black text-sm text-teal-800 dark:text-teal-400 border-b pb-2 border-stone-200/5">Jungian Depth Psychoanalysis Archetype</h4>
                        <div className="italic font-serif whitespace-pre-wrap">{dreamReport.jungian}</div>
                      </div>
                    </div>

                    {/* Synthesis row */}
                    <div className={`p-6 border rounded-sm text-xs font-sans leading-relaxed space-y-3 relative overflow-hidden shadow-inner border-t-2 border-t-gold
                      ${isSpace ? 'bg-[#121c32] border-white/5 text-stone-200' : 'bg-[#FAF2E5] border-stone-200 text-charcoal'}
                    `}>
                      <h4 className="font-serif font-black text-sm leading-tight text-gold">Comparative Synthesis Framework</h4>
                      <p className="font-serif italic whitespace-pre-wrap">{dreamReport.synthesis}</p>
                      
                      <div className="mt-4 pt-4 border-t border-stone-200/10 text-center font-serif font-bold text-stone-600 dark:text-stone-300">
                        {dreamReport.dua}
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={() => saveLabResult("Dream Interpretation", dreamText, dreamReport)}
                        className="font-mono text-xs uppercase bg-[#8B1A1A] hover:bg-black tracking-widest text-white px-8 py-3.5 rounded-sm transition cursor-pointer"
                      >
                        Document in Dream Journal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 7. DHIKR PRESCRIPTION ENGINE VIEW */}
            {activeLab === 'dhikr' && (
              <div className="space-y-8">
                
                {/* EMOTIONAL STATES SELECTION GRID */}
                <div>
                  <h4 className="font-serif font-black text-center text-lg mb-6">Select a Distressed Emotional Slate</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    {CLINICAL_EMOTIONS.map((state) => (
                      <button
                        key={state.key}
                        onClick={() => formulateDhikrRx(state.key)}
                        className={`p-4 border rounded-sm text-center transition hover:scale-[1.01] flex flex-col items-center justify-center cursor-pointer min-h-[100px] bg-gradient-to-b
                          ${selectedEmotion === state.key
                            ? 'border-gold ring-1 ring-gold dark:bg-[#09152b] bg-amber-500/5 font-bold text-gold-light'
                            : (isSpace ? 'bg-space border-white/5 text-stone-300' : 'bg-white border-stone-200 text-charcoal')
                          }
                          ${state.bg}
                        `}
                      >
                        <span className="font-serif text-xs font-semibold">{state.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {dhikrLoading && (
                  <div className="text-center py-12 space-y-3">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
                    <p className="font-mono text-xs text-stone-400">Compiling spiritual vibration frequencies and neuro-biological remedies...</p>
                  </div>
                )}

                {/* DHIKR RX PRESCRIPTION SHEET DISPLAY */}
                {dhikrResult && (
                  <div className={`p-8 border rounded-sm max-w-3xl mx-auto relative overflow-hidden shadow-2xl border-l-4 border-l-amber-500/80 transition-colors
                    ${isSpace ? 'bg-[#080d1f] border-gold/20' : 'bg-[#FAF2E5] border-stone-300'}
                  `}>
                    
                    {/* Arabic decorative star watermark */}
                    <div className="absolute right-4 bottom-4 w-40 h-40 opacity-5 pointer-events-none arabesque-star bg-amber-500" />
                    
                    <div className="flex justify-between items-center border-b pb-4 mb-6 border-stone-200/10">
                      <span className="font-mono text-[10px] tracking-widest uppercase text-amber-500 font-bold">Spiritual Pharmacy Order Rx-409</span>
                      <span className="text-xs font-serif italic text-stone-400">Clinical-Vagal formulation</span>
                    </div>

                    <div className="space-y-6">
                      
                      {/* Heavy Calligraphy display font panel */}
                      <div className="text-center space-y-2 py-4 border-y border-stone-200/5">
                        <div className="text-3xl text-stone-800 dark:text-stone-100 font-serif font-black leading-loose text-amber-600 dark:text-gold select-all">
                          {dhikrResult.dhikr}
                        </div>
                        <div className="text-xs font-mono text-stone-400 tracking-wide font-medium">
                          {dhikrResult.transliteration}
                        </div>
                        <div className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed italic font-serif">
                          Meaning: "{dhikrResult.meaning}"
                        </div>
                        <div className="inline-block mt-3 px-3 py-1 rounded bg-[#8B1A1A]/15 border border-gold/30 font-mono text-[10px] text-gold-light uppercase font-bold tracking-widest">
                          {dhikrResult.repetition}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans text-stone-400 leading-relaxed">
                        <div className="space-y-2.5">
                          <h5 className="font-mono text-amber-500 font-bold uppercase tracking-widest text-[10px]">Cortisal & Vagal Biomechanics</h5>
                          <p className="font-serif italic border-l pl-3 border-[#8B1A1A]/40">
                            {dhikrResult.neuroscience}
                          </p>
                        </div>
                        
                        <div className="space-y-2.5">
                          <h5 className="font-mono text-amber-500 font-bold uppercase tracking-widest text-[10px]">Complementary lifestyle medicine</h5>
                          <p className="font-serif italic border-l pl-3 border-[#8B1A1A]/40">
                            {dhikrResult.lifestyle}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-stone-200/5 text-center leading-relaxed">
                        <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-[#8B1A1A]">Chronological Recovery Estimate: </span>
                        <span className="text-xs font-serif text-stone-600 dark:text-stone-300 font-bold">{dhikrResult.timeline}</span>
                      </div>
                    </div>

                    <div className="flex justify-center pt-6">
                      <button
                        onClick={() => saveLabResult(`Dhikr Rx: ${selectedEmotion}`, selectedEmotion, dhikrResult)}
                        className="font-mono text-xs uppercase border border-gold text-gold hover:bg-gold hover:text-black tracking-widest px-8 py-3.5 rounded-sm transition cursor-pointer"
                      >
                        Keep in personal clinical index
                      </button>
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* 8. LOGICAL FALLACY SCANNER VIEW */}
            {activeLab === 'fallacy' && (
              <div className="space-y-8">
                
                {/* ARGUMENT INPUT AREA CARD */}
                <div className={`p-6 border rounded-sm max-w-3xl mx-auto transition-colors
                  ${isSpace ? 'bg-space/30 border-white/5' : 'bg-white border-stone-200'}
                `}>
                  <h3 className="font-serif font-black text-xl mb-3 text-indigo-800 dark:text-gold flex items-center justify-center gap-2">
                    <ShieldAlert className="h-5 w-5" />
                    Mughalata Logical Scanner Index
                  </h3>
                  <p className="text-xs font-serif text-stone-400 max-w-lg mx-auto text-center leading-relaxed mb-4">
                    Paste an argumentative statement, debate thesis, or modern opinion block to scan for classical and contemporary structural reasoning fallacies.
                  </p>

                  <textarea
                    value={fallacyInput}
                    onChange={(e) => setFallacyInput(e.target.value)}
                    placeholder="Paste argumentative statements or paragraph blocks here..."
                    rows={4}
                    className={`w-full p-4 text-xs font-sans rounded border focus:outline-none transition mb-4
                      ${isSpace 
                        ? 'bg-[#070b18] border-white/5 text-white placeholder-white/20' 
                        : 'bg-[#FAF8F5] border-stone-200 text-charcoal placeholder-stone-400'
                      }
                    `}
                  />

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-stone-400">Load sample bias:</span>
                      {SUGGESTED_ARGUMENTS.map((a, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setFallacyInput(a);
                            scanFallacy(a);
                          }}
                          className="font-mono text-[9px] uppercase bg-stone-500/5 border border-stone-200/50 px-2.5 py-1 rounded-sm text-stone-400 hover:text-white transition cursor-pointer"
                        >
                          Bias Argument {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => scanFallacy()}
                      disabled={fallacyLoading || !fallacyInput.trim()}
                      className="font-mono text-xs uppercase bg-[#8B1A1A] text-white hover:bg-black font-bold tracking-widest px-6 py-3 rounded-sm transition cursor-pointer"
                    >
                      {fallacyLoading ? "Scanning syllogisms..." : "Scan For Mughalata Errors"}
                    </button>
                  </div>
                </div>

                {fallacyLoading && (
                  <div className="text-center py-12 space-y-3">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
                    <p className="font-mono text-xs text-stone-400">Inspecting semantic definitions and syllogistic structures for fatal gaps...</p>
                  </div>
                )}

                {/* SHOW SCAN CONVENTIONS RESULTS */}
                {fallacyReport && (
                  <div className="max-w-3xl mx-auto space-y-6">
                    <h4 className="font-mono text-xs uppercase text-[#8B1A1A] font-bold tracking-widest">
                      Logic Diagnostics Scanner Report
                    </h4>
                    
                    {fallacyReport.fallacies.length === 0 ? (
                      <div className="p-6 text-center text-xs font-mono border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 rounded-sm">
                        Absolute logical coherence achieved. No classical or modern fallacies found in this argument!
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {fallacyReport.fallacies.map((item: any, idx: number) => {
                          const isFatal = item.severity.toLowerCase() === 'fatal';
                          const isWeakening = item.severity.toLowerCase() === 'weakening';
                          const badge = isFatal 
                            ? "bg-red-500/10 border-red-500/20 text-red-500" 
                            : isWeakening 
                              ? "bg-amber-500/10 border-amber-500/20 text-amber-500" 
                              : "bg-blue-500/10 border-blue-500/20 text-blue-500";
                          return (
                            <div 
                              key={idx} 
                              className={`p-6 border rounded-sm text-xs font-sans space-y-3 relative overflow-hidden transition-all duration-300
                                ${isSpace ? 'bg-[#070b18] border-white/5' : 'bg-white border-stone-200'}
                              `}
                            >
                              <div className="flex items-center justify-between pb-2 border-b border-stone-200/5">
                                <span className="font-serif font-black text-sm">{item.name}</span>
                                <span className={`px-2.5 py-0.5 rounded-sm text-[8px] tracking-widest uppercase font-mono border font-bold ${badge}`}>
                                  {item.severity} severity
                                </span>
                              </div>
                              <p className="text-stone-500 italic font-serif">
                                Source sentence: <span className="text-stone-700 dark:text-stone-300">"{item.quote}"</span>
                              </p>
                              <p className="text-stone-400 leading-relaxed font-serif">
                                <strong className="text-stone-300">Scholarly Reason:</strong> {item.explanation}
                              </p>
                              <div className="p-3 bg-emerald-500/5 border border-emerald-500/15 text-stone-600 dark:text-stone-300 rounded font-serif italic">
                                <strong>Logic Correct Reformulation:</strong> {item.reformulation}
                              </div>
                            </div>
                          );
                        })}

                        <div className="flex justify-center pt-4">
                          <button
                            onClick={() => saveLabResult("Fallacy Scan", fallacyInput, fallacyReport)}
                            className="font-mono text-xs uppercase bg-[#8B1A1A] hover:bg-black tracking-widest text-white px-8 py-3.5 rounded-sm transition cursor-pointer"
                          >
                            Save Diagnostics to Covenant Log
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </section>
  );
}
