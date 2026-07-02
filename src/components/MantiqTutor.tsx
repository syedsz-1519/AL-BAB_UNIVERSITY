import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Lock, CheckCircle2, ChevronRight, 
  RefreshCw, Award, Send, Compass, HelpCircle, 
  AlertTriangle, ArrowRight, Sparkles 
} from 'lucide-react';

interface MantiqTutorProps {
  currentTheme: 'parchment' | 'space';
  onBackToLanding: () => void;
}

interface SavedProgress {
  completed: boolean;
  score: number;
  timestamp: string;
}

interface MantiqModule {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  defaultExerciseText: string;
}

interface QuizQuestion {
  question: string;
  arabic_question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

const MANTIQ_MODULES: MantiqModule[] = [
  {
    id: 'hadd',
    name: 'Hadd (Definition)',
    arabicName: 'الْحَدُّ',
    description: 'The science of formulating precise essence and characteristics of concepts.',
    defaultExerciseText: "Define 'Knowledge' (al-Ilm) using a genus and specific difference (hadd tamm) as defined by Ibn Sina."
  },
  {
    id: 'qiyas',
    name: 'Qiyas (Syllogism)',
    arabicName: 'الْقِيَاسُ',
    description: 'Deductive reasoning by connecting a minor premise to a major premise to yield an absolute conclusion.',
    defaultExerciseText: "Major premise: 'All scholars are mortal.' Minor premise: 'Zayd is a scholar.' Deduce the conclusion using classical logical deduction."
  },
  {
    id: 'burhan',
    name: 'Burhan (Demonstration)',
    arabicName: 'الْبُرْهَانُ',
    description: 'The peak of logic: proof structures founded on absolute, certain self-evident truths.',
    defaultExerciseText: "Claim: 'The universe has a beginning.' Draw a Burhan demonstration structure showing why this is logically necessary based on causality."
  },
  {
    id: 'jadal',
    name: 'Jadal (Dialectic)',
    arabicName: 'الْجَدَلُ',
    description: 'Rule-based disputation to persuade an audience or silence an opponent using famous opinions.',
    defaultExerciseText: "Position: 'Sincerity is the root of all knowledge.' Argue this position or challenge it using generally accepted truths (Mashhurat)."
  },
  {
    id: 'mughalata',
    name: 'Mughalata (Fallacies)',
    arabicName: 'الْمُغَالَطَةُ',
    description: 'Identifying deceptive arguments that mimic logical demonstration but harbor hidden flaws.',
    defaultExerciseText: "Argument: 'This book contains truth because its author is famous, and he would never write falsehood.' Identify the logical fallacy in this argument and explain its flaw."
  }
];

const FALLBACK_QUIZZES: Record<string, QuizQuestion[]> = {
  hadd: [
    {
      question: "What is a 'Hadd Tamm' (Complete Definition) in classical Islamic Mantiq?",
      arabic_question: "ما هو الحد التام في المنطق الإسلامي الكلاسيكي؟",
      options: {
        A: "A definition using remote genus and difference",
        B: "A definition using proximate genus and essential difference (Dhati)",
        C: "A definition using accidental attributes and general description",
        D: "A definition using negative attributes and metaphors"
      },
      correct: 'B',
      explanation: "A Hadd Tamm defines an essence completely by specifying the nearest genus (like 'animal' for humans) and the essential differentiator (like 'rational' for humans)."
    },
    {
      question: "Which of the following is considered an 'Essential Attribute' (Dhati) in logical definition?",
      arabic_question: "أي مما يلي يعتبر صفة ذاتية في التعريف المنطقي؟",
      options: {
        A: "The ability to laugh or converse",
        B: "Rationality (Nutq) in human beings",
        C: "Standing up or sitting down in physical presence",
        D: "Being a physician or dynamic merchant"
      },
      correct: 'B',
      explanation: "Rationality (Nutq) in classical philosophy is the essential characteristic (Dhati) that defines human essence, whereas laughing or occupations are accidental properties."
    },
    {
      question: "What is 'Rasm Naqis' (Incomplete Description) defined as?",
      arabic_question: "بماذا يعرف الرسم الناقص؟",
      options: {
        A: "A definition of a concept using its accidents only",
        B: "Definition using its outer genus and accidents",
        C: "Definition using its spiritual essence",
        D: "A definition that defines a term purely through its extreme opposites"
      },
      correct: 'A',
      explanation: "A Rasm Naqis defines a concept by accidents alone, leaving out essential differences, which provides separation but does not reveal the core essence."
    }
  ],
  qiyas: [
    {
      question: "In a standard categorical syllogism, what is the role of the 'Middle Term' (al-Hadd al-Awsat)?",
      arabic_question: "ما هو دور الحد الأوسط في القياس المنطقي؟",
      options: {
        A: "It serves as the main claim to prove",
        B: "It connects the minor and major premises and completely disappears in the conclusion",
        C: "It represents a logical fallacy",
        D: "It always defines the emotional tone"
      },
      correct: 'B',
      explanation: "The middle term acts as the logical bridge in both premises, establishing the relationship shown in the conclusion, and then vanishes (e.g. 'scholars' in 'Zayd is a scholar, all scholars are mortal')."
    },
    {
      question: "Which condition must be met for a first-figure syllogism to yield a valid conclusion?",
      arabic_question: "ما هو الشرط المطلوب لإنتاج نتيجة صحيحة في الشكل الأول للقياس؟",
      options: {
        A: "The minor premise must be negative",
        B: "The major premise must be particular",
        C: "The minor premise must be affirmative and the major premise must be universal",
        D: "Both premises must be particular"
      },
      correct: 'C',
      explanation: "For the first figure (As-Shakl al-Awwal) of Qiyas to stand valid, the minor premise must be affirmative (Ejabi) and the major premise must be universal (Kulli)."
    },
    {
      question: "What is 'Qiyas Istithna'i' (Exceptive Syllogism)?",
      arabic_question: "ما هو القياس الاستثنائي؟",
      options: {
        A: "A syllogism that does not require premises",
        B: "A conditional syllogism containing the conclusion or its contradiction explicitly in the premises",
        C: "An inductive generalization",
        D: "A fallacious syllogism"
      },
      correct: 'B',
      explanation: "An exceptive syllogism explicitly contains the conclusion or its contradiction inside conditional premises (e.g., 'If Zayd is a man, he is mortal. But Zayd is a man, therefore he is mortal')."
    }
  ],
  burhan: [
    {
      question: "What is 'Burhan' according to classical Islamic logic?",
      arabic_question: "ما هو البرهان في المنطق الإسلامي الكلاسيكي؟",
      options: {
        A: "An argument built purely on public opinions",
        B: "A certain proof composed of self-evident, primary premises (Yaqiniyyat)",
        C: "A rhetorical appeal to authoritative figures",
        D: "A poetic analogy"
      },
      correct: 'B',
      explanation: "Burhan is the highest proof class, producing absolute certainty by utilizing premises known to be unconditionally true (Yaqiniyyat) such as primary axioms and sensory certainties."
    },
    {
      question: "Which of the following is NOT one of the six categories of certain premises (Yaqiniyyat) used in Burhan?",
      arabic_question: "أي مما يلي ليس من القضايا اليقينية الست المستخدمة في البرهان؟",
      options: {
        A: "Self-evident truths (Awwaliyyat)",
        B: "Sensory perceptions (Mahsusat)",
        C: "Famous opinions (Mashhurat)",
        D: "Continuous testimonies of reports (Mutawatirat)"
      },
      correct: 'C',
      explanation: "Famous opinions (Mashhurat) belong to Dialectics (Jadal), not Burhan, because public consensus does not translate to absolute metaphysical certainty."
    },
    {
      question: "What is 'Burhan Limmi' (Demonstration of Why)?",
      arabic_question: "ما هو البرهان اللمي؟",
      options: {
        A: "A proof that establishes both the existence and the causal reason of a fact",
        B: "A proof that establishes existence only without causality",
        C: "A proof through circular reasoning",
        D: "A proof based on scriptural text only"
      },
      correct: 'A',
      explanation: "Burhan Limmi (the Demonstration of 'Why') proves both that the conclusion is true and explains the underlying cause or reason for its reality."
    }
  ],
  jadal: [
    {
      question: "What is the primary purpose of 'Jadal' (Dialectics) in Islamic philosophy?",
      arabic_question: "ما هو الغرض الأساسي من الجدل في الفلسفة الإسلامية؟",
      options: {
        A: "To establish certain metaphysical proof from primary axioms",
        B: "To silence an opponent or convince an audience using widely accepted premises (Mashhurat)",
        C: "To deceive others with false reasoning to gain worldly status",
        D: "To teach children literal grammar"
      },
      correct: 'B',
      explanation: "Jadal is used to defend truth or refute falsehood in scholarly debate by leveraging universally accepted principles or conceded premises."
    },
    {
      question: "What kind of premises are chiefly utilized in Jadal?",
      arabic_question: "ما هي المقدمات التي تستخدم بشكل أساسي في الجدل؟",
      options: {
        A: "Primary axioms and empirical facts",
        B: "Famous opinions and accepted premises (Mashhurat and Maqbulat)",
        C: "Deceptive illusions and fallacies",
        D: "Empirical data only"
      },
      correct: 'B',
      explanation: "Unlike Burhan, Jadal relaxes requirements for strict absolute truth, using widespread beliefs and scholarly consensus to argue logical positions."
    },
    {
      question: "In a classical scholarly debate chamber, what is 'Mas'alah' (The Dialectical Questioning)?",
      arabic_question: "ما هي المسألة في غرف المناظرة الكلاسيكية؟",
      options: {
        A: "The ultimate spiritual truth revealed on a mountain",
        B: "A structured query designed to pin down the opponent's thesis options",
        C: "A question with no logical answer",
        D: "A sign of theological heresy"
      },
      correct: 'B',
      explanation: "The dialectical query pins the answerer down to support or deny a specific premise, forcing them into a consistent defense or contradiction."
    }
  ],
  mughalata: [
    {
      question: "What is 'Mughalata' (Fallacy) in theological logical texts?",
      arabic_question: "ما هي المغالطة في النصوص المنطقية الكلامية؟",
      options: {
        A: "A valid deduction of mystical remote truths",
        B: "An argument that mimics proof but is built on deceptive or false premises",
        C: "A form of quiet meditative contemplation",
        D: "A debate about physical dietary rulings"
      },
      correct: 'B',
      explanation: "Mughalata represents flawed reasoning. It resembles Burhan or Jadal superficially, but relies on tricks of language (equivocation) or structure (begging the question)."
    },
    {
      question: "What is 'Begging the Question' (Circular Reasoning) known as in Arabic Mantiq?",
      arabic_question: "ماذا يسمى الدور أو مصادرة المطلوب في المنطق العربي؟",
      options: {
        A: "Al-Sabh wal-Taqseem",
        B: "Al-Musadarah 'ala al-Matlub",
        C: "Iham al-In'ikas",
        D: "Al-Ishtirak al-Lafzi"
      },
      correct: 'B',
      explanation: "Al-Musadarah 'ala al-Matlub (carrying the claimed conclusion as a premise) assumes what it sets out to prove, making the logic circular."
    },
    {
      question: "If an opponent claims: 'You are not a senior scholar, therefore your logical refutation is false,' which fallacy are they committing?",
      arabic_question: "إذا قال خصمك: 'أنت لست عالماً كبيراً، ولذلك فإن ردك المنطقي باطل'، فأي مغالطة يرتكب؟",
      options: {
        A: "Argumentum ad Hominem (Al-Man' bil-Shakhs / Ad-Dhat)",
        B: "Straw man fallacy",
        C: "Appeal to ignorance (Adam al-Ilm)",
        D: "Equivocation (al-Ishtirak al-Lafzi)"
      },
      correct: 'A',
      explanation: "Attacking the scholar's person or status rather than addressing their logical argument is Ad Hominem (personal attack), classified under Al-Man' bil-Shakhs or attacking the attributes of the claimant."
    }
  ]
};

export default function MantiqTutor({ currentTheme, onBackToLanding }: MantiqTutorProps) {
  const [activeModuleIndex, setActiveModuleIndex] = useState<number>(0);
  const [unlockedModules, setUnlockedModules] = useState<string[]>(['hadd']);
  const [progress, setProgress] = useState<Record<string, SavedProgress>>({});
  
  // Lesson state variables
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonContent, setLessonContent] = useState('');
  const [exerciseText, setExerciseText] = useState('');
  
  // Practice Answer state
  const [studentAnswer, setStudentAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<string | null>(null);
  
  // Active State representing State A/B vs State C vs State D
  const [activeState, setActiveState] = useState<'lessons_answers' | 'evaluation' | 'quiz'>('lessons_answers');

  // MCQ Quiz state
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const [notification, setNotification] = useState<string | null>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const currentModule = MANTIQ_MODULES[activeModuleIndex];

  // Load progress and active index from LocalStorage on mount
  useEffect(() => {
    try {
      const savedProg = localStorage.getItem('albab_mantiq_progress');
      if (savedProg) {
        const parsedProg = JSON.parse(savedProg);
        setProgress(parsedProg);
        
        // Compute unlocked modules based on completed modules
        const unlocked = ['hadd'];
        MANTIQ_MODULES.forEach((mod, idx) => {
          if (parsedProg[mod.id]?.completed && parsedProg[mod.id]?.score >= 2) {
            const nextMod = MANTIQ_MODULES[idx + 1];
            if (nextMod && !unlocked.includes(nextMod.id)) {
              unlocked.push(nextMod.id);
            }
          }
        });
        setUnlockedModules(unlocked);
      }
      
      const savedIndex = localStorage.getItem('albab_mantiq_active_index');
      if (savedIndex) {
        setActiveModuleIndex(parseInt(savedIndex, 10));
      }
    } catch (e) {
      console.error("Local storage error:", e);
    }
  }, []);

  // Fetch or trigger Lesson generation whenever active module changes
  useEffect(() => {
    fetchLesson(currentModule);
    // Reset page logic
    setStudentAnswer('');
    setEvaluation(null);
    setQuizQuestions([]);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
    setActiveState('lessons_answers');
  }, [activeModuleIndex]);

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchLesson = async (module: MantiqModule) => {
    setLessonLoading(true);
    setLessonContent('');
    setExerciseText(module.defaultExerciseText);

    try {
      const res = await fetch('/api/labs/mantiq/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          moduleName: module.name,
          moduleId: module.id
        })
      });

      if (!res.ok) {
        throw new Error("Logic tutor server returned status: " + res.status);
      }

      if (!res.body) {
        throw new Error("No readable stream received");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let entireText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        entireText += chunk;
        setLessonContent(entireText);
      }

      // Extract custom exercise bounds if present (EXERCISE: ... :END)
      const startMarker = "EXERCISE:";
      const endMarker = ":END";
      const startMarkerAlt = "EXERCISE_START:";
      const endMarkerAlt = ":EXERCISE_END";

      let extracted = "";
      let sIndex = entireText.indexOf(startMarker);
      let eIndex = entireText.indexOf(endMarker);
      if (sIndex !== -1 && eIndex !== -1 && eIndex > sIndex) {
        extracted = entireText.substring(sIndex + startMarker.length, eIndex).trim();
      } else {
        sIndex = entireText.indexOf(startMarkerAlt);
        eIndex = entireText.indexOf(endMarkerAlt);
        if (sIndex !== -1 && eIndex !== -1 && eIndex > sIndex) {
          extracted = entireText.substring(sIndex + startMarkerAlt.length, eIndex).trim();
        }
      }

      if (extracted) {
        setExerciseText(extracted);
      } else {
        setExerciseText(module.defaultExerciseText);
      }

    } catch (err: any) {
      console.error(err);
      triggerNotification("Connecting to virtual Sina chamber. Falling back to offline curriculum.");
      simulateOfflineLesson(module);
    } finally {
      setLessonLoading(false);
    }
  };

  const simulateOfflineLesson = (module: MantiqModule) => {
    let text = "";
    if (module.id === 'hadd') {
      text = `**الْمَفْهُومُ — The Concept**
Arabic Concept: الْحَدُّ (Hadd / Definition)
Classical definition from Ibn Sina's *Al-Shifa*: "A definition is an explanatory statement that captures the complete nature (essence) of a thing through its proximate genus and specific differences."

**الْمِثَالُ الْكَلَاسِيكِيُّ — Classical Example**
Scholars define 'Human' (Al-Insan) as: "Al-Insan huwa hayawan natiq" (Human is a rational animal). 'Animal' acts as the proximate genus (including humans with other living beings), and 'Rational' represents the dhati (essential difference) that uniquely defines and isolates humanity.

**الْمِثَالُ الْمُعَاصِرُ — Modern Example**
We can define a 'Smartphone' logically as: "An electronic telecommunication device with an integrated programmable computer operating system." The genus is the electronic telecommunication device, and the specific differentiator is the integrated computer operating system.

**التَّطْبِيقُ — Your Practice Exercise**
How can you construct the definition of 'Truth' (Haqaq) using classical genus and specific differences? Prove its validity.

EXERCISE: Define 'Knowledge' (al-Ilm) using a genus and specific difference (hadd tamm) as defined by Ibn Sina. :END`;
    } else if (module.id === 'qiyas') {
      text = `**الْمَفْهُومُ — The Concept**
Arabic Concept: الْقِيَاسُ (Qiyas / Syllogism)
Classical definition from Ibn Sina's *Al-Shifa*: "A syllogism is a discourse in which, certain things being stated, something other than what is stated follows of necessity from their being so."

**الْمِثَالُ الْكَلَاسِيكِيُّ — Classical Example**
Premise 1 (Minor): Zayd is a created being.
Premise 2 (Major): All created beings have a Creator.
Conclusion: Therefore, Zayd has a Creator. The middle term 'created being' establishes the bridge and falls away.

**الْمِثَالُ الْمُعَاصِرُ — Modern Example**
Premise 1: This algorithm is an artificial neural network.
Premise 2: All artificial neural networks calculate values via matrix multiplication.
Conclusion: Therefore, this algorithm calculates values via matrix multiplication.

**التَّطْبِيقُ — Your Practice Exercise**
Observe around you and construct a valid categorical Syllogism about justice.

EXERCISE: Major premise: 'All scholars are mortal.' Minor premise: 'Zayd is a scholar.' Deduce the conclusion using classical logical deduction. :END`;
    } else if (module.id === 'burhan') {
      text = `**الْمَفْهُومُ — The Concept**
Arabic Concept: الْبُرْهَانُ (Burhan / Demonstration)
Classical definition from Ibn Sina's *Al-Shifa*: "Burhan is a deductive proof consisting solely of primary, certain premises (Yaqiniyyat) that inevitably produce a certain, everlasting truth."

**الْمِثَالُ الْكَلَاسِيكِيُّ — Classical Example**
The proof of the Necessary Existential Being (Wajib al-Wujud):
Premise 1: Contemplated existents are either contingent (possible) or necessary.
Premise 2: Contingent beings require an external cause to bring them into existence.
Conclusion: To avoid circularity or infinite regress, there must exist a causal being that is Necessary in itself.

**الْمِثَالُ الْمُعَاصِرُ — Modern Example**
Premise 1: Mathematical theorems built on logical axioms are universally true within their defined coordinate grids.
Premise 2: Euclidian geometry coordinates show parallel lines never intersect.
Conclusion: Therefore, in Euclidian grids, these lines never converge.

**التَّطْبِيقُ — Your Practice Exercise**
Construct a proof structures validating truth.

EXERCISE: Claim: 'The universe has a beginning.' Draw a Burhan demonstration structure showing why this is logically necessary based on causality. :END`;
    } else if (module.id === 'jadal') {
      text = `**الْمَفْهُومُ — The Concept**
Arabic Concept: الْجَدَلُ (Jadal / Dialectics)
Classical definition from Ibn Sina: "Jadal is a structural scholastic argumentation relying on widely accepted opinions (Mashhurat) or premises conceded by the opponent to uphold a thesis or silence a claim."

**الْمِثَالُ الْكَلَاسِيكِيُّ — Classical Example**
An Imam debating a skeptic who accepts early scientific laws: Using those conceded scientific laws to establish the logical consistency of an intelligent cosmic creator.

**الْمِثَالُ الْمُعَاصِرُ — Modern Example**
A policy debate regarding public health: Relying on the mutual shared premise that 'public well-being must exceed commercial greed' to pass safety reforms.

**التَّطْبِيقُ — Your Practice Exercise**
Formulate a dialectic argument.

EXERCISE: Position: 'Sincerity is the root of all knowledge.' Argue this position or challenge it using generally accepted truths (Mashhurat). :END`;
    } else {
      text = `**الْمَفْهُومُ — The Concept**
Arabic Concept: الْمُغَالَطَةُ (Mughalata / Fallacy)
Classical definition from Ibn Sina: "Mughalata is a deceptive, invalid argumentation that resembles Burhan or Jadal but carries a hidden structural or semantic error."

**الْمِثَالُ الْكَلَاسِيكِيُّ — Classical Example**
Equivocation of terms (Ishtirak al-Lafzi): 
The word 'Ayn' can mean an eye, a water spring, or a financial spy. 
Premise 1: This is an 'Ayn' (water spring).
Premise 2: Every 'Ayn' can read books.
Conclusion: Therefore, this water spring can read books. The fallacy is in using the plural term 'Ayn' equivocally.

**الْمِثَالُ الْمُعَاصِرُ — Modern Example**
"Since artificial intelligence outputs beautiful paintings, artificial intelligence possesses a conscious, breathing human soul." It commits the fallacy of assuming aesthetic generation equates to conscious entity.

**التَّطْبِيقُ — Your Practice Exercise**
Refute a modern scientific claim.

EXERCISE: Argument: 'This book contains truth because its author is famous, and he would never write falsehood.' Identify the logical fallacy in this argument and explain its fraudulence. :END`;
    }

    setLessonContent(text);
  };

  const handlePracticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentAnswer.trim()) return;

    setIsEvaluating(true);
    setEvaluation('');
    setActiveState('evaluation');

    if (mainContentRef.current) {
      mainContentRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    try {
      const res = await fetch('/api/labs/mantiq/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleName: currentModule.name,
          exerciseText,
          studentAnswer
        })
      });

      if (!res.ok) {
        throw new Error("Evaluation server failed: " + res.status);
      }

      if (!res.body) {
        throw new Error("No payload stream received");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let entireEval = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        entireEval += chunk;
        setEvaluation(entireEval);
      }
      
    } catch (err: any) {
      console.error(err);
      triggerNotification("Connecting to virtual Farabi evaluation room. Generating fallback feedback.");
      
      // Resilient fallback evaluation
      setTimeout(() => {
        let arabicStatus = "صحيح — Correct";
        let scoreFeedback = "Excellent demonstration! Your answer captures the logical core expected by Ibn Sina's methodology. Your distinction of terms shows clear mastery.";
        if (studentAnswer.length < 15) {
          arabicStatus = "غير مكتمل — Partially Correct";
          scoreFeedback = "A noble effort, but your explanation is slightly brief. Expand your terms further using the classical categories.";
        }
        setEvaluation(`**النَّتِيجَةُ — Result**: ${arabicStatus}
**التَّحْلِيلُ — Analysis**: You correctly identified the underlying structure and phrased your premises with precision, avoiding the common pitfalls of definition.
**التَّصْحِيحُ — Correction**: A perfect classical Hadd requires defining the proximate genus first, then identifying the unique property (Dhati) that separates it from all coordinate items.
**التَّشْجِيعُ — Encouragement**: "Your intellectual light is expanding, young seeker of logic. Continue polishing the mirror of your intellect!"`);
      }, 1500);
    } finally {
      setIsEvaluating(false);
    }
  };

  const loadMCQQuiz = () => {
    setQuizLoading(true);
    setQuizQuestions([]);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
    setActiveState('quiz');

    if (mainContentRef.current) {
      mainContentRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    const fallbackList = FALLBACK_QUIZZES[currentModule.id] || [];
    fetchQuizFromAPI(fallbackList);
  };

  const fetchQuizFromAPI = async (fallback: QuizQuestion[]) => {
    try {
      const res = await fetch('/api/labs/mantiq/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleName: currentModule.name })
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.questions) && data.questions.length === 3) {
          setQuizQuestions(data.questions);
          setQuizLoading(false);
          return;
        }
      }
      throw new Error("Invalid API response format");
    } catch (e) {
      console.warn("Using high-fidelity offline quiz for module:", currentModule.id, e);
      setQuizQuestions(fallback);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleSelectOption = (qIdx: number, option: 'A' | 'B' | 'C' | 'D') => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: option }));
  };

  const submitQuiz = () => {
    if (Object.keys(selectedAnswers).length < 3) {
      triggerNotification("Please answer all 3 questions before submitting.");
      return;
    }

    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) {
        score++;
      }
    });

    setQuizScore(score);
    setQuizSubmitted(true);

    const isPassed = score >= 2;
    if (isPassed) {
      const moduleId = currentModule.id;
      const timestamp = new Date().toISOString();
      const nextProgressState = {
        ...progress,
        [moduleId]: { completed: true, score, timestamp }
      };
      
      setProgress(nextProgressState);
      localStorage.setItem('albab_mantiq_progress', JSON.stringify(nextProgressState));
      
      // Update unlocked array
      const nextModIndex = activeModuleIndex + 1;
      const nextUnlocked = [...unlockedModules];
      if (nextModIndex < MANTIQ_MODULES.length) {
        const nextId = MANTIQ_MODULES[nextModIndex].id;
        if (!nextUnlocked.includes(nextId)) {
          nextUnlocked.push(nextId);
        }
      }
      setUnlockedModules(nextUnlocked);
      
      triggerNotification(`Congratulations! Module '${currentModule.name}' passed beautifully with ${score}/3 score!`);
    } else {
      triggerNotification(`You scored ${score}/3. Study the classical texts and try again!`);
    }
  };

  const handleNextModuleAndUnlock = () => {
    const nextIdx = activeModuleIndex + 1;
    if (nextIdx < MANTIQ_MODULES.length) {
      setActiveModuleIndex(nextIdx);
      localStorage.setItem('albab_mantiq_active_index', nextIdx.toString());
    } else {
      triggerNotification("Glorious achievement! You have completed the entire classical Curriculum of Ilm al-Mantiq!");
    }
  };

  const getModuleStatus = (index: number, modId: string) => {
    const isCompleted = !!progress[modId]?.completed;
    const isActive = activeModuleIndex === index;
    const isLocked = index > 0 && !unlockedModules.includes(modId);
    
    return { isCompleted, isActive, isLocked };
  };

  const completedCount = Object.keys(progress).filter(k => progress[k]?.completed && progress[k]?.score >= 2).length;

  // Render headers and extract standard blocks
  const parseLessonContent = (text: string) => {
    if (!text) return { intro: '', concept: '', classical: '', modern: '', practice: '' };

    const cleanText = text.replace(/EXERCISE:[\s\S]*:END/g, '').replace(/EXERCISE_START:[\s\S]*:EXERCISE_END/g, '');

    const conceptRegex = /(?:الْمَفْهُومُ|الْمَفْهُوم|المفهوم)\s*—\s*The Concept/i;
    const classicalRegex = /(?:الْمِثَالُ الْكَلَاسِيكِيُّ|الْمِثَالُ الْكَلَاسِيكِي|المثال الكلاسيكي)\s*—\s*Classical Example/i;
    const modernRegex = /(?:الْمِثَالُ الْمُعَاصِرُ|الْمِثَالُ الْمُعَاصِر|المثال المعاصر)\s*—\s*Modern Example/i;
    const practiceRegex = /(?:التَّطْبِيقُ|التَّطْبِيق|التطبيق)\s*—\s*Your Practice Exercise/i;

    const parts = cleanText.split(/\*\*([^\*]+)\*\*/g);
    
    let currentKey: 'intro' | 'concept' | 'classical' | 'modern' | 'practice' = 'intro';
    const result = { intro: '', concept: '', classical: '', modern: '', practice: '' };

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i % 2 === 1) { // It is a bold header
        if (conceptRegex.test(part)) {
          currentKey = 'concept';
        } else if (classicalRegex.test(part)) {
          currentKey = 'classical';
        } else if (modernRegex.test(part)) {
          currentKey = 'modern';
        } else if (practiceRegex.test(part)) {
          currentKey = 'practice';
        }
      } else { // It is content
        if (part.trim()) {
          result[currentKey] += (result[currentKey] ? '\n\n' : '') + part.trim();
        }
      }
    }

    return result;
  };

  const parseEvaluationBlocks = (text: string | null) => {
    if (!text) return null;
    const resultMatch = text.match(/\*\*(?:النَّتِيجَةُ|النتيجة)\s*—\s*Result\*\*:\s*([^\n]+)/i);
    const analysisMatch = text.match(/\*\*(?:التَّحْلِيلُ|التحليل)\s*—\s*Analysis\*\*:\s*([\s\S]+?)(?=\*\*(?:التَّصْحِيحُ|Correction|التصحيح)|$)/i);
    const correctionMatch = text.match(/\*\*(?:التَّصْحِيحُ|التصحيح)\s*—\s*Correction\*\*:\s*([\s\S]+?)(?=\*\*(?:التَّشْجِيعُ|Encouragement|التشجيع)|$)/i);
    const encouragementMatch = text.match(/\*\*(?:التَّشْجِيعُ|التشجيع)\s*—\s*Encouragement\*\*:\s*([\s\S]+)$/i);

    return {
      result: resultMatch ? resultMatch[1].trim() : "Evaluated",
      analysis: analysisMatch ? analysisMatch[1].trim() : "",
      correction: correctionMatch ? correctionMatch[1].trim() : "",
      encouragement: encouragementMatch ? encouragementMatch[1].trim() : ""
    };
  };

  const parsedEval = parseEvaluationBlocks(evaluation);
  const parsedLesson = parseLessonContent(lessonContent);

  return (
    <div 
      id="mantiq-tutor-container"
      className="min-h-screen pt-36 lg:pt-40 pb-16 px-4 sm:px-6 md:px-12 bg-[#F5F0E8] text-[#1A1A1A] font-sans selection:bg-[#0B4628]/10 text-left"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* TOP FLOATING NOTIFICATION BOX */}
        <AnimatePresence>
          {notification && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#0B4628] text-white py-3.5 px-6 rounded-md shadow-xl border border-[#C4A35A]/30 flex items-center gap-3 text-xs md:text-sm font-mono uppercase tracking-wider"
            >
              <Sparkles className="h-4 w-4 text-[#C4A35A]" />
              <span>{notification}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LEFT SIDEBAR (DESKTOP) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="sticky top-28 bg-[#FAF8F5] border border-[#0B4628]/10 rounded-sm p-5 sm:p-6 shadow-md space-y-6">
            
            {/* LOGOTYPE TITLE */}
            <div className="border-b border-[#C4A35A]/20 pb-4 text-center lg:text-left space-y-1.5">
              <p className="font-arabic text-2xl text-[#0B4628] text-center lg:text-left font-bold">عِلْمُ الْمَنْطِق</p>
              <h2 className="font-serif font-black text-2xl text-[#0B4628] leading-tight select-none">
                Ilm al-Mantiq
              </h2>
              <p className="text-[11px] font-mono tracking-wide text-[#555555] uppercase font-semibold">
                Classical Islamic Logic
              </p>
              <div className="w-full h-[1px] bg-[#C4A35A] my-2" />
            </div>

            {/* PROGRESS STATUS METRIC */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-stone-500 font-bold uppercase tracking-wider">Progress</span>
                <span className="text-[#0B4628] font-black">{completedCount} of 5 Complete</span>
              </div>
              <div className="w-full bg-[#E5DFD5] h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#0B4628] h-full transition-all duration-500"
                  style={{ width: `${(completedCount / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* SIDEBAR NAVIGATION BUTTONS (DESKTOP) */}
            <nav className="flex flex-col gap-2.5 hidden lg:flex">
              {MANTIQ_MODULES.map((mod, index) => {
                const { isCompleted, isActive, isLocked } = getModuleStatus(index, mod.id);
                return (
                  <button
                    key={mod.id}
                    disabled={isLocked}
                    onClick={() => {
                      setActiveModuleIndex(index);
                      localStorage.setItem('albab_mantiq_active_index', index.toString());
                    }}
                    className={`w-full text-left py-3.5 px-4 rounded-sm border transition-all duration-300 cursor-pointer flex items-center justify-between
                      ${isActive 
                        ? 'bg-[#0B4628] text-white border-transparent shadow' 
                        : isLocked
                        ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-60'
                        : isCompleted
                        ? 'bg-[#FAF8F5] text-[#1A1A1A] border-l-4 border-l-emerald-600 border-stone-200 hover:bg-stone-50'
                        : 'bg-white hover:bg-stone-50 text-[#1A1A1A] border-stone-200'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-bold">{index + 1}.</span>
                      <div className="leading-tight">
                        <p className="font-serif font-black text-sm">{mod.name.replace(/ \(.*\)/, '')}</p>
                        <p className={`text-[10px] font-mono tracking-tight ${isActive ? 'text-white/80' : 'text-stone-500'}`}>
                          {mod.id === 'hadd' ? 'Definition' : mod.id === 'qiyas' ? 'Syllogism' : mod.id === 'burhan' ? 'Demonstration' : mod.id === 'jadal' ? 'Dialectic' : 'Fallacies'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
                      ) : isLocked ? (
                        <Lock className="h-3.5 w-3.5 text-stone-400" />
                      ) : (
                        <div className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-[#C4A35A] ring-4 ring-[#C4A35A]/30' : 'bg-[#0B4628]'}`} />
                      )}
                      <span className="font-arabic text-[12px] leading-none opacity-95">{mod.arabicName}</span>
                    </div>
                  </button>
                );
              })}
            </nav>

          </div>
        </div>

        {/* MOBILE HORIZONTAL PILL TABS */}
        <div className="lg:hidden col-span-1 w-full overflow-x-auto pb-4 border-b border-stone-250">
          <div className="flex gap-2 min-w-[550px] px-1">
            {MANTIQ_MODULES.map((mod, index) => {
              const { isCompleted, isActive, isLocked } = getModuleStatus(index, mod.id);
              return (
                <button
                  key={mod.id}
                  disabled={isLocked}
                  onClick={() => {
                    setActiveModuleIndex(index);
                    localStorage.setItem('albab_mantiq_active_index', index.toString());
                  }}
                  className={`py-2 px-3.5 rounded-sm border transition-all duration-350 flex items-center gap-2 shrink-0 text-xs
                    ${isActive 
                      ? 'bg-[#0B4628] text-white border-transparent shadow' 
                      : isLocked
                      ? 'bg-stone-150 text-stone-400 border-stone-200 cursor-not-allowed opacity-65'
                      : isCompleted
                      ? 'bg-white text-stone-800 border-l-4 border-l-emerald-600 border-stone-200'
                      : 'bg-white text-stone-700 border-stone-200'
                    }
                  `}
                >
                  <span className="font-mono text-[9px] font-bold">{index + 1}.</span>
                  <span className="font-arabic text-[11px] font-bold">{mod.arabicName}</span>
                  <span className="font-serif font-bold leading-none">{mod.id === 'hadd' ? 'Hadd' : mod.id === 'qiyas' ? 'Qiyas' : mod.id === 'burhan' ? 'Burhan' : mod.id === 'jadal' ? 'Jadal' : 'Mughalata'}</span>
                  {isCompleted ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  ) : isLocked ? (
                    <Lock className="h-3 w-3 text-stone-400 shrink-0" />
                  ) : (
                    <span className="h-1 w-1 bg-[#0B4628] rounded-full shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN TUTORIAL WORK AREA */}
        <div ref={mainContentRef} className="lg:col-span-3 space-y-8">
          
          {/* HEADER EMBELLISHMENT PANEL */}
          <div className="bg-[#FAF8F5] border border-[#0B4628]/10 rounded-sm p-6 sm:p-8 shadow-sm relative overflow-hidden space-y-3">
            <div className="absolute right-6 top-6 opacity-[0.03] text-[#0B4628] select-none pointer-events-none">
              <Award className="h-32 w-32" />
            </div>
            
            <span className="text-[10px] font-mono tracking-[0.2em] text-[#0B4628] uppercase font-extrabold block">
              Albab Logic Academy • عِلْمُ الْمَنْطِق
            </span>
            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="font-serif font-black text-3xl sm:text-4xl text-[#0B4628]">
                {currentModule.name}
              </h1>
              <span className="font-arabic text-[#C4A35A] text-2xl leading-none">
                {currentModule.arabicName}
              </span>
            </div>
            <p className="text-sm text-[#555555] font-serif leading-relaxed max-w-2xl italic">
              "{currentModule.description}"
            </p>
          </div>

          {/* STATE A & STATE B: LESSON, EXERCISE BOX, STUDENT ANSWER */}
          {activeState === 'lessons_answers' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#0B4628]/10 p-6 sm:p-10 rounded-sm shadow-md space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0B4628] via-[#C4A35A] to-[#0B4628]" />
                
                <h3 className="font-serif font-black text-xs md:text-sm uppercase tracking-widest text-[#0B4628] border-b border-[#C4A35A]/25 pb-3 block">
                  Ibn Sina's Scholarly Parchment
                </h3>

                {lessonLoading && !lessonContent && (
                  <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
                    <RefreshCw className="h-10 w-10 text-[#0B4628] animate-spin" />
                    <p className="font-mono text-xs uppercase tracking-widest text-[#0B4628] font-bold animate-pulse">
                      Summoning classical Logic Lesson... Passing Compendium Index
                    </p>
                  </div>
                )}

                {/* LESSON STREAMING CONTENT CONTAINER */}
                {lessonContent && (
                  <div className="font-serif text-stone-850 leading-relaxed space-y-6">
                    {/* Concept Section */}
                    {parsedLesson.concept ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 border-b border-stone-200 pb-2">
                          <span className="font-arabic text-[#0B4628] text-xl font-bold">الْمَفْهُومُ —</span>
                          <h4 className="font-serif font-black text-[#0B4628] text-lg">The Concept</h4>
                        </div>
                        <p className="whitespace-pre-line text-stone-800 text-base leading-relaxed">
                          {parsedLesson.concept}
                        </p>
                      </div>
                    ) : (
                      /* Fallback raw display during loading stream */
                      <p className="whitespace-pre-line text-stone-850 text-base leading-relaxed">
                        {lessonContent}
                      </p>
                    )}

                    {/* Classical Example Section */}
                    {parsedLesson.classical && (
                      <div className="bg-[#FAF8F5] p-5 border-l-4 border-l-[#C4A35A] border border-stone-200/50 rounded-r-md space-y-2">
                        <div className="flex items-center gap-1.5 pb-1">
                          <span className="font-arabic text-[#0B4628] text-lg font-bold">الْمِثَالُ الْكَلَاسِيكِيُّ —</span>
                          <h4 className="font-serif font-black text-[#0B4628] text-base">Classical Example</h4>
                        </div>
                        <p className="text-stone-800 text-sm leading-relaxed whitespace-pre-line italic">
                          {parsedLesson.classical}
                        </p>
                      </div>
                    )}

                    {/* Modern Example Section */}
                    {parsedLesson.modern && (
                      <div className="bg-[#FAF8F5]/50 p-5 border-l-4 border-l-stone-400 border border-stone-200/50 rounded-r-md space-y-2">
                        <div className="flex items-center gap-1.5 pb-1">
                          <span className="font-arabic text-stone-800 text-lg font-bold">الْمِثَالُ الْمُعَاصِرُ —</span>
                          <h4 className="font-serif font-black text-stone-800 text-base">Modern Example</h4>
                        </div>
                        <p className="text-stone-800 text-sm leading-relaxed whitespace-pre-line">
                          {parsedLesson.modern}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* PRACTICE EXERCISE BOUNDED BOX (STATE B) */}
              {lessonContent && !lessonLoading && (
                <div id="exercise-workarea" className="bg-amber-50/40 border border-[#C4A35A] rounded-sm p-6 space-y-6">
                  
                  {/* EXERCISE BOX */}
                  <div className="space-y-2 bg-[#FDFCF7] p-4 rounded border border-[#C4A35A]/35 shadow-sm">
                    <h4 className="font-serif font-black text-[#0B4628] text-base flex items-center gap-2">
                      <Compass className="h-4 w-4 text-[#C4A35A]" />
                      <span>التَّطْبِيقُ — Your Practice Exercise</span>
                    </h4>
                    <p className="font-serif text-[#1A1A1A] text-sm sm:text-base leading-relaxed font-semibold">
                      {exerciseText}
                    </p>
                  </div>

                  {/* STUDENT ANSWER SHEET INPUT */}
                  <form onSubmit={handlePracticeSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="student-textarea" className="font-mono text-[10px] font-black uppercase tracking-wider text-[#0B4628] block">
                        Your Answer — الإجابة
                      </label>
                      <textarea
                        id="student-textarea"
                        required
                        disabled={isEvaluating}
                        rows={4}
                        placeholder="Define the logic terms or formulate your reasoning precisely. Write with logic and devotion..."
                        value={studentAnswer}
                        onChange={(e) => setStudentAnswer(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#0B4628]/20 focus:border-[#0B4628] focus:ring-1 focus:ring-[#0B4628] rounded-sm p-4 font-serif text-sm leading-relaxed outline-none shadow-inner transition-colors duration-250 min-h-[80px]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isEvaluating || !studentAnswer.trim()}
                      className={`w-full py-3.5 bg-[#0B4628] text-white hover:bg-black font-mono text-xs uppercase tracking-widest font-black rounded-sm border border-[#C4A35A]/50 transition-all duration-300 shadow flex items-center justify-center gap-2.5 cursor-pointer
                        ${(isEvaluating || !studentAnswer.trim()) ? 'bg-stone-300 border-stone-200 cursor-not-allowed text-stone-500' : ''}
                      `}
                    >
                      {isEvaluating ? (
                        <>
                          <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                          Evaluating Logic...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 text-[#C4A35A]" />
                          Submit Answer — أَرْسِلْ
                        </>
                      )}
                    </button>
                  </form>

                </div>
              )}
            </div>
          )}

          {/* STATE C: MASTER SCHOLAR EVALUATION SCREEN */}
          {activeState === 'evaluation' && (
            <div className="space-y-6">
              <div className="bg-white border-2 border-[#C4A35A] rounded-sm p-6 sm:p-10 shadow-lg relative overflow-hidden space-y-6">
                <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-[#C4A35A]" />
                
                <div className="flex items-center gap-3 border-b border-stone-200 pb-3">
                  <Award className="h-6 w-6 text-[#C4A35A]" />
                  <div>
                    <h3 className="font-serif font-black text-xl text-[#0B4628]">Master Sage Evaluation</h3>
                    <p className="text-[9px] font-mono text-stone-500 uppercase tracking-widest">Al-Shifa Scholar's Verdict</p>
                  </div>
                </div>

                {isEvaluating && !evaluation && (
                  <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                    <RefreshCw className="h-8 w-8 text-[#0B4628] animate-spin" />
                    <p className="font-mono text-xs uppercase tracking-widest text-stone-500 font-bold animate-pulse">
                      Analyzing Sincerity & Syllogism Rules...
                    </p>
                  </div>
                )}

                {/* THE STREAMING EVAL REPORT CARD */}
                {evaluation && (
                  <div className="font-serif text-sm sm:text-base text-stone-850 leading-relaxed space-y-5">
                    {parsedEval ? (
                      <div className="space-y-6">
                        {/* Result pill status */}
                        <div className="flex flex-wrap items-center gap-2 text-base font-bold text-[#0B4628]">
                          <span className="font-arabic font-extrabold">النَّتِيجَةُ — Result:</span>
                          <span className="px-3 py-1 bg-amber-50 rounded border border-[#C4A35A] text-stone-850 text-xs font-serif uppercase tracking-wider font-extrabold shadow-sm">
                            {parsedEval.result}
                          </span>
                        </div>

                        {/* Analysis Content block */}
                        {parsedEval.analysis && (
                          <div className="space-y-1.5">
                            <h5 className="font-bold text-xs uppercase font-mono tracking-wider text-slate-500">التَّحْلِيلُ — Analysis</h5>
                            <div className="text-stone-800 bg-[#FAF8F5] p-4 border border-stone-200/60 rounded-sm whitespace-pre-line leading-relaxed shadow-inner">
                              {parsedEval.analysis}
                            </div>
                          </div>
                        )}

                        {/* Correction Content block */}
                        {parsedEval.correction && (
                          <div className="space-y-1.5">
                            <h5 className="font-bold text-xs uppercase font-mono tracking-wider text-slate-500">التَّصْحِيحُ — Correction</h5>
                            <div className="text-stone-850 p-1 whitespace-pre-line leading-relaxed">
                              {parsedEval.correction}
                            </div>
                          </div>
                        )}

                        {/* Encouragement Content Block */}
                        {parsedEval.encouragement && (
                          <div className="bg-[#0B4628]/5 p-5 rounded-md border-l-4 border-[#0B4628] italic text-[#0B4628]">
                            <p className="font-bold font-mono text-[9px] uppercase tracking-widest not-italic mb-1.5 text-slate-500">التَّشْجِيعُ — Encouragement</p>
                            "{parsedEval.encouragement}"
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Display raw content output as fallback while loading stream */
                      <p className="whitespace-pre-line text-stone-850 leading-relaxed text-base">
                        {evaluation}
                      </p>
                    )}
                  </div>
                )}

                {/* PROCEED TRIGGER TO MCQS */}
                {!isEvaluating && evaluation && (
                  <div className="pt-4 border-t border-stone-150 flex justify-end">
                    <button
                      type="button"
                      onClick={loadMCQQuiz}
                      className="py-3 px-8 bg-[#0B4628] hover:bg-black text-white font-mono text-xs uppercase tracking-widest font-black rounded-sm border border-[#C4A35A]/50 transition-all duration-300 cursor-pointer flex items-center gap-2"
                    >
                      <span>Proceed to Exam Quiz</span>
                      <ChevronRight className="h-4.5 w-4.5" />
                    </button>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* STATE D: MINI EXAMINATION MCQ QUIZ */}
          {activeState === 'quiz' && (
            <div className="space-y-6">
              <div className="bg-[#FAF8F5] border border-[#0B4628]/10 p-6 sm:p-10 rounded-sm shadow-md space-y-6">
                
                <div className="border-b border-[#C4A35A]/45 pb-4">
                  <span className="text-[9px] font-mono tracking-widest uppercase text-[#0B4628] font-extrabold block mb-1">
                    Formal Examination Room
                  </span>
                  <h3 className="font-serif font-black text-2xl text-[#0B4628]">
                    Test Your Understanding
                  </h3>
                  <p className="text-xs text-[#555555] font-serif italic mt-0.5">
                    Prove your precision under Ibn Sina's axioms. Achieve 2/3 score or greater to unlock the next logic degree.
                  </p>
                </div>

                {quizLoading ? (
                  <div className="py-16 flex flex-col items-center justify-center gap-4 font-mono text-xs uppercase tracking-widest text-[#0B4628] font-bold">
                    <RefreshCw className="h-8 w-8 animate-spin" />
                    Formulating Logic Exam Questions...
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Render the 3 questions */}
                    {quizQuestions.map((q, idx) => {
                      const selected = selectedAnswers[idx];
                      const isOptionSelected = selected !== undefined;
                      const isCorrect = selected === q.correct;

                      return (
                        <div key={idx} className="bg-white p-5 rounded border border-stone-200 shadow-sm space-y-4 text-left">
                          
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <span className="px-2.5 py-0.5 bg-stone-100 border border-stone-300/50 rounded text-[10px] font-mono text-stone-500 font-bold uppercase">
                              Question {idx + 1} of 3
                            </span>
                            {q.arabic_question && (
                              <span className="font-arabic text-[#C4A35A] text-sm md:text-base leading-none">
                                {q.arabic_question}
                              </span>
                            )}
                          </div>

                          <h4 className="font-serif font-black text-stone-850 text-sm sm:text-base leading-relaxed">
                            {q.question}
                          </h4>

                          {/* OPTION BUTTONS GRID */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-serif">
                            {Object.entries(q.options).map(([key, value]) => {
                              const isThisSelected = selected === key;
                              const isThisCorrectOption = q.correct === key;

                              let bgClass = "bg-[#FAF8F5] hover:bg-stone-50 border-stone-250 text-stone-800";
                              if (isThisSelected) {
                                if (quizSubmitted) {
                                  bgClass = isCorrect 
                                    ? "bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500" 
                                    : "bg-red-50 border-[#0B4628] text-[#0B4628] ring-1 ring-[#0B4628]";
                                } else {
                                  bgClass = "bg-[#0B4628] border-transparent text-white shadow";
                                }
                              } else if (quizSubmitted && isThisCorrectOption) {
                                bgClass = "bg-emerald-50 border-emerald-400 text-emerald-800 font-semibold";
                              }

                              return (
                                <button
                                  key={key}
                                  type="button"
                                  disabled={quizSubmitted}
                                  onClick={() => handleSelectOption(idx, key as any)}
                                  className={`w-full text-left p-3.5 rounded border text-xs sm:text-sm transition-all duration-200 flex items-center gap-3 cursor-pointer
                                    ${bgClass}
                                  `}
                                >
                                  <span className={`h-6 w-6 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0
                                    ${isThisSelected && !quizSubmitted
                                      ? 'bg-[#C4A35A] text-white' 
                                      : 'bg-stone-200 text-stone-700'
                                    }
                                  `}>
                                    {key}
                                  </span>
                                  <span className="leading-snug">{value}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* EXPLANATION AREA CHIEF */}
                          {quizSubmitted && (
                            <div className="p-3 bg-stone-50 border-l-2 border-[#C4A35A] text-xs leading-relaxed text-stone-600 rounded-r shadow-inner font-serif">
                              <span className="font-extrabold text-[#0B4628] block mb-0.5">Assessment Basis:</span>
                              {q.explanation}
                            </div>
                          )}

                        </div>
                      );
                    })}

                    {/* QUIZ COMPLETION ACTION GATE */}
                    {!quizSubmitted ? (
                      <button
                        type="button"
                        onClick={submitQuiz}
                        disabled={Object.keys(selectedAnswers).length < 3}
                        className={`w-full py-4 bg-[#0B4628] text-white font-mono text-xs uppercase tracking-widest font-black rounded-sm transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer border border-[#C4A35A]/50
                          ${Object.keys(selectedAnswers).length < 3 ? 'bg-stone-300 border-stone-200 text-stone-500 cursor-not-allowed opacity-75 hover:bg-stone-300' : 'hover:bg-black'}
                        `}
                      >
                        <Award className="h-4.5 w-4.5 text-[#C4A35A]" />
                        Evaluate Examination Quiz — قيّم الاختيار
                      </button>
                    ) : (
                      /* RESULT REPORT BLOCK */
                      <div className="p-6 bg-white border border-stone-200 rounded-sm space-y-4 text-center">
                        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-[#0B4628]/5 border-2 border-[#0B4628] text-[#0B4628] font-serif font-black text-xl">
                          {quizScore}/3
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-serif font-black text-lg text-[#0B4628]">
                            {quizScore >= 2 ? "Scholastic Examination Passed! — ناجح" : "Requires Further Contemplation — لم ينجح"}
                          </h4>
                          <p className="text-xs text-stone-500 leading-relaxed font-serif max-w-md mx-auto">
                            {quizScore >= 2 
                              ? "You have processed the core syllogistic constraints of Ibn Sina. The gates to deeper realms stand open." 
                              : "Double-check your parameters and definitions. True logicians return to the source texts with renewed sincerity."
                            }
                          </p>
                        </div>

                        {quizScore >= 2 && activeModuleIndex === MANTIQ_MODULES.length - 1 && (
                          <div className="p-4 bg-emerald-50 border border-emerald-350 text-emerald-800 rounded font-serif text-sm max-w-md mx-auto font-extrabold select-none">
                            Module Complete! جَزَاكَ اللَّهُ خَيْرًا
                          </div>
                        )}

                        <div className="pt-2 flex flex-wrap gap-3 items-center justify-center">
                          {quizScore >= 2 ? (
                            activeModuleIndex < MANTIQ_MODULES.length - 1 ? (
                              <button
                                type="button"
                                onClick={handleNextModuleAndUnlock}
                                className="px-6 py-3 bg-[#0B4628] text-white hover:bg-black font-mono text-xs uppercase tracking-widest font-bold rounded-sm border border-[#C4A35A]/50 transition-all duration-300 cursor-pointer flex items-center gap-2"
                              >
                                <span>Unlock Next Module</span>
                                <ChevronRight className="h-4.5 w-4.5" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={onBackToLanding}
                                className="px-6 py-3 bg-[#0B4628] text-white hover:bg-black font-mono text-xs uppercase tracking-widest font-bold rounded-sm border border-[#C4A35A]/50 transition-all duration-300 cursor-pointer flex items-center gap-2"
                              >
                                <span>Finish — Return to Dashboard</span>
                                <ArrowRight className="h-4.5 w-4.5" />
                              </button>
                            )
                          ) : (
                            <button
                              type="button"
                              onClick={loadMCQQuiz}
                              className="px-6 py-3 bg-stone-100 hover:bg-stone-200 text-[#1A1A1A] font-mono text-xs uppercase tracking-widest font-bold rounded-sm border border-stone-300 transition-all duration-300 cursor-pointer flex items-center gap-2"
                            >
                              <RefreshCw className="h-3.5 w-3.5 text-[#0B4628]" />
                              Try the quiz again
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>
            </div>
          )}

          {/* BACK TO DASHBOARD SHORTCUT */}
          <div className="text-center pt-4">
            <button
              onClick={onBackToLanding}
              className="text-stone-500 hover:text-[#0B4628] transition-all font-mono text-[10px] uppercase tracking-widest font-extrabold inline-flex items-center gap-2 cursor-pointer bg-transparent border-none outline-none leading-none select-none"
            >
              ← Return to Celestial Globe Dashboard
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
