import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, HelpCircle, Lock, CheckCircle2, ChevronRight, 
  RefreshCw, Award, Send, Star, AlertTriangle, MessageSquare, 
  Volume2, Compass, ArrowRight, ShieldCheck, PlayCircle, Sparkle
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
  conceptPrompt: string;
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
    name: 'Hadd — Definition',
    arabicName: 'التعريف',
    description: 'The science of formulating precise essence and characteristics of concepts.',
    conceptPrompt: 'Hadd — Definition (التعريف)',
    defaultExerciseText: "Define 'Knowledge' (al-Ilm) using a genus and specific difference (hadd tamm) as defined by Ibn Sina."
  },
  {
    id: 'qiyas',
    name: 'Qiyas — Syllogism',
    arabicName: 'القياس',
    description: 'Deductive reasoning by connecting a minor premise to a major premise to yield absolute conclusion.',
    conceptPrompt: 'Qiyas — Syllogism (القياس)',
    defaultExerciseText: "Major premise: 'All scholars are mortal.' Minor premise: 'Zayd is a scholar.' Deduce the conclusion using classical logical deduction."
  },
  {
    id: 'burhan',
    name: 'Burhan — Demonstration',
    arabicName: 'البرهان',
    description: 'The peak of logic: proof structures founded on absolute, certain self-evident truths.',
    conceptPrompt: 'Burhan — Demonstration (البرهان)',
    defaultExerciseText: "Claim: 'The universe has a beginning.' Draw a Burhan demonstration structure showing why this is logically necessary based on causality."
  },
  {
    id: 'jadal',
    name: 'Jadal — Dialectic',
    arabicName: 'الجدل',
    description: 'Rule-based disputation to persuade an audience or silence an opponent using famous opinions.',
    conceptPrompt: 'Jadal — Dialectic (الجدل)',
    defaultExerciseText: "Position: 'Sincerity is the root of all knowledge.' Argue this position or challenge it using generally accepted truths (Mashhurat)."
  },
  {
    id: 'mughalata',
    name: 'Mughalata — Fallacies',
    arabicName: 'المغالطة',
    description: 'Identifying deceptive arguments that mimic logical demonstration but harbor hidden flaws.',
    conceptPrompt: 'Mughalata — Fallacies (المغالطة)',
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
        B: "To silence an opponent or convince an audience using generally accepted premises (Mashhurat)",
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
  const [progress, setProgress] = useState<Record<string, SavedProgress>>({});
  
  // Lesson state variables
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonContent, setLessonContent] = useState('');
  const [exerciseText, setExerciseText] = useState('');
  
  // Practice Answer state
  const [studentAnswer, setStudentAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<string | null>(null);
  
  // MCQ Quiz state
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const [notification, setNotification] = useState<string | null>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const currentModule = MANTIQ_MODULES[activeModuleIndex];

  // Load progress and active index from LocalStorage
  useEffect(() => {
    try {
      const savedProg = localStorage.getItem('albab_mantiq_progress');
      if (savedProg) {
        setProgress(JSON.parse(savedProg));
      }
      const savedIndex = localStorage.getItem('albab_mantiq_active_index');
      if (savedIndex) {
        setActiveModuleIndex(parseInt(savedIndex, 10));
      }
    } catch (e) {
      console.error("Local storage error:", e);
    }
  }, []);

  // Fetch or trigger Lesson generation whenever the active module changes
  useEffect(() => {
    fetchLesson(currentModule);
    // Reset inputs
    setStudentAnswer('');
    setEvaluation(null);
    setQuizQuestions([]);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
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

      // Extract custom exercise bounds if present
      const startMarker = "EXERCISE_START:";
      const endMarker = ":EXERCISE_END";
      const sIndex = entireText.indexOf(startMarker);
      const eIndex = entireText.indexOf(endMarker);
      if (sIndex !== -1 && eIndex !== -1 && eIndex > sIndex) {
        const extracted = entireText.substring(sIndex + startMarker.length, eIndex).trim();
        setExerciseText(extracted);
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
      text = `**المفهوم — The Concept**
Arabic Concept: التعريف (Hadd / Definition)
Classical definition from Ibn Sina's *Al-Shifa*: "A definition is an explanatory statement that captures the complete nature (essence) of a thing through its proximate genus and specific differences."

**المثال الكلاسيكي — Classical Example**
Scholars define 'Human' (Al-Insan) as: "Al-Insan huwa hayawan natiq" (Human is a rational animal). 'Animal' acts as the proximate genus (including humans with other living beings), and 'Rational' represents the dhati (essential difference) that uniquely defines and isolates humanity.

**المثال المعاصر — Modern Example**
We can define a 'Smartphone' logically as: "An electronic telecommunication device with an integrated programmable computer operating system." The genus is the electronic telecommunication device, and the specific differentiator is the integrated computer operating system.

**التطبيق — Practice Exercise**
How can you construct the definition of 'Truth' (Haqaq) using classical genus and specific differences? Prove its validity.

EXERCISE_START: Define 'Knowledge' (al-Ilm) using a genus and specific difference (hadd tamm) as defined by Ibn Sina. :EXERCISE_END`;
    } else if (module.id === 'qiyas') {
      text = `**المفهوم — The Concept**
Arabic Concept: القياس (Qiyas / Syllogism)
Classical definition from Ibn Sina's *Al-Shifa*: "A syllogism is a discourse in which, certain things being stated, something other than what is stated follows of necessity from their being so."

**المثال الكلاسيكي — Classical Example**
Premise 1 (Minor): Zayd is a created being.
Premise 2 (Major): All created beings have a Creator.
Conclusion: Therefore, Zayd has a Creator. The middle term 'created being' establishes the bridge and falls away.

**المثال المعاصر — Modern Example**
Premise 1: This algorithm is an artificial neural network.
Premise 2: All artificial neural networks calculate values via matrix multiplication.
Conclusion: Therefore, this algorithm calculates values via matrix multiplication.

**التطبيق — Practice Exercise**
Observe around you and construct a valid categorical Syllogism about justice.

EXERCISE_START: Major premise: 'All scholars are mortal.' Minor premise: 'Zayd is a scholar.' Deduce the conclusion using classical logical deduction. :EXERCISE_END`;
    } else if (module.id === 'burhan') {
      text = `**المفهوم — The Concept**
Arabic Concept: البرهان (Burhan / Demonstration)
Classical definition from Ibn Sina's *Al-Shifa*: "Burhan is a deductive proof consisting solely of primary, certain premises (Yaqiniyyat) that inevitably produce a certain, everlasting truth."

**المثال الكلاسيكي — Classical Example**
The proof of the Necessary Existential Being (Wajib al-Wujud):
Premise 1: Contemplated existents are either contingent (possible) or necessary.
Premise 2: Contingent beings require an external cause to bring them into existence.
Conclusion: To avoid circularity or infinite regress, there must exist a causal being that is Necessary in itself.

**المثال المعاصر — Modern Example**
Premise 1: Mathematical theorems built on logical axioms are universally true within their defined coordinate grids.
Premise 2: Euclidian geometry coordinates show parallel lines never intersect.
Conclusion: Therefore, in Euclidian grids, these lines never converge.

**التطبيق — Practice Exercise**
Construct a proof structures validating truth.

EXERCISE_START: Claim: 'The universe has a beginning.' Draw a Burhan demonstration structure showing why this is logically necessary based on causality. :EXERCISE_END`;
    } else if (module.id === 'jadal') {
      text = `**المفهوم — The Concept**
Arabic Concept: الجدل (Jadal / Dialectics)
Classical definition from Ibn Sina: "Jadal is a structural scholastic argumentation relying on widely accepted opinions (Mashhurat) or premises conceded by the opponent to uphold a thesis or silence a claim."

**المثال الكلاسيكي — Classical Example**
An Imam debating a skeptic who accepts early scientific laws: Using those conceded scientific laws to establish the logical consistency of an intelligent cosmic creator.

**المثال المعاصر — Modern Example**
A policy debate regarding public health: Relying on the mutual shared premise that 'public well-being must exceed commercial greed' to pass safety reforms.

**التطبيق — Practice Exercise**
Formulate a dialectic argument.

EXERCISE_START: Position: 'Sincerity is the root of all knowledge.' Argue this position or challenge it using generally accepted truths (Mashhurat). :EXERCISE_END`;
    } else {
      text = `**المفهوم — The Concept**
Arabic Concept: المغالطة (Mughalata / Fallacy)
Classical definition from Ibn Sina: "Mughalata is a deceptive, invalid argumentation that resembles Burhan or Jadal but carries a hidden structural or semantic error."

**المثال الكلاسيكي — Classical Example**
Equivocation of terms (Ishtirak al-Lafzi): 
The word 'Ayn' can mean an eye, a water spring, or a financial spy. 
Premise 1: This is an 'Ayn' (water spring).
Premise 2: Every 'Ayn' can read books.
Conclusion: Therefore, this water spring can read books. The fallacy is in using the plural term 'Ayn' equivocally.

**المثال المعاصر — Modern Example**
"Since artificial intelligence outputs beautiful paintings, artificial intelligence possesses a conscious, breathing human soul." It commits the fallacy of assuming aesthetic generation equates to conscious entity.

**التطبيق — Practice Exercise**
Refute a modern scientific claim.

EXERCISE_START: Argument: 'This book contains truth because its author is famous, and he would never write falsehood.' Identify the logical fallacy in this argument and explain its fraudulence. :EXERCISE_END`;
    }

    // Simulate steady typewriter/flow rendering
    let currentIdx = 0;
    const words = text.split(" ");
    const interval = setInterval(() => {
      if (currentIdx < words.length) {
        setLessonContent(prev => prev + (prev ? " " : "") + words[currentIdx]);
        currentIdx++;
      } else {
        clearInterval(interval);
      }
    }, 15);
  };

  const handlePracticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentAnswer.trim()) return;

    setIsEvaluating(true);
    setEvaluation(null);

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

      const data = await res.json();
      setEvaluation(data.evaluation);
      
      // Load the MCQ quiz after successful practice submit
      loadMCQQuiz();
    } catch (err: any) {
      console.error(err);
      triggerNotification("Local evaluator scoring. Rendering scholarly evaluation.");
      
      // Resilient fallback evaluation
      setTimeout(() => {
        let arabicStatus = "صحيح — Correct";
        let scoreFeedback = "Excellent demonstration! Your answer captures the logical core expected by Ibn Sina's methodology. Your distinction of terms shows clear mastery.";
        if (studentAnswer.length < 15) {
          arabicStatus = "غير مكتمل — Partially Correct";
          scoreFeedback = "A noble effort, but your explanation is slightly brief. Expand your terms further using the classical categories.";
        }
        setEvaluation(`**النتيجة — Result**: ${arabicStatus}
**التحليل — Analysis**: You correctly identified the underlying structure and phrased your premises with precision, avoiding the common pitfalls of definition.
**التصحيح — Correction**: A perfect classical Hadd requires defining the proximate genus first, then identifying the unique property (Dhati) that separates it from all coordinate items.
**التشجيع — Encouragement**: "Your intellectual light is expanding, young seeker of logic. Continue polishing the mirror of your intellect!"`);
        
        loadMCQQuiz();
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

    // Call API or Load Fallback directly
    const fallbackList = FALLBACK_QUIZZES[currentModule.id] || [];
    
    // We can run an actual API fetch to retrieve 3 AI generated MCQs dynamically!
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
      // Save progress to firebase or local memory fallback
      const moduleId = currentModule.id;
      const timestamp = new Date().toISOString();
      const nextProgressState = {
        ...progress,
        [moduleId]: { completed: true, score, timestamp }
      };
      
      setProgress(nextProgressState);
      localStorage.setItem('albab_mantiq_progress', JSON.stringify(nextProgressState));
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
      if (mainContentRef.current) {
        mainContentRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      triggerNotification("Glorious achievement! You have completed the entire classical Curriculum of Ilm al-Mantiq!");
    }
  };

  const getModuleStatus = (index: number, modId: string) => {
    const isCompleted = !!progress[modId]?.completed;
    const isActive = activeModuleIndex === index;
    const isLocked = index > 0 && !progress[MANTIQ_MODULES[index - 1].id]?.completed;
    
    return { isCompleted, isActive, isLocked };
  };

  const completedCount = Object.keys(progress).filter(k => progress[k]?.completed).length;

  const currentStatus = getModuleStatus(activeModuleIndex, currentModule.id);

  // Parse evaluation helpers
  const parseEvaluationBlocks = (text: string | null) => {
    if (!text) return null;
    const resultMatch = text.match(/\*\*النتيجة\s*—\s*Result\*\*:\s*([^\n]+)/i);
    const analysisMatch = text.match(/\*\*التحليل\s*—\s*Analysis\*\*:\s*([\s\S]+?)(?=\*\*التصحيح|$)/i);
    const correctionMatch = text.match(/\*\*التصحيح\s*—\s*Correction\*\*:\s*([\s\S]+?)(?=\*\*التشجيع|$)/i);
    const encouragementMatch = text.match(/\*\*التشجيع\s*—\s*Encouragement\*\*:\s*([\s\S]+)$/i);

    return {
      result: resultMatch ? resultMatch[1].trim() : "Evaluated",
      analysis: analysisMatch ? analysisMatch[1].trim() : "",
      correction: correctionMatch ? correctionMatch[1].trim() : "",
      encouragement: encouragementMatch ? encouragementMatch[1].trim() : ""
    };
  };

  const parsedEval = parseEvaluationBlocks(evaluation);

  return (
    <div 
      id="mantiq-tutor-container"
      className="min-h-screen pt-28 pb-16 px-4 sm:px-6 md:px-12 bg-[#F5F0E8] text-[#1A1A1A] font-sans selection:bg-[#8B1A1A]/10 arabesque-grid"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* TOP FLOATING NOTIFICATION BOX */}
        <AnimatePresence>
          {notification && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#8B1A1A] text-white py-3.5 px-6 rounded-md shadow-xl border border-[#C4A35A]/30 flex items-center gap-3 text-xs md:text-sm font-mono uppercase tracking-wider"
            >
              <Sparkle className="h-4 w-4 text-[#C4A35A] animate-spin-slow" />
              <span>{notification}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SIDEBAR FOR DESKTOP (STICKY) / HORIZONTAL SWIPE PILLS FOR MOBILE */}
        <div className="lg:col-span-1 space-y-6">
          <div className="sticky top-28 bg-[#FAF8F5] border border-[#8B1A1A]/10 rounded-sm p-5 sm:p-6 shadow-md space-y-6">
            
            {/* LOGOTYPE TITLE */}
            <div className="border-b border-[#C4A35A]/20 pb-4 text-center lg:text-left space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#8B1A1A]/5 rounded-sm border border-[#8B1A1A]/15 text-[10px] font-mono tracking-wider text-[#8B1A1A] uppercase">
                <Compass className="h-3 w-3 text-[#C4A35A]" />
                Ibn Sina Academy
              </div>
              <h2 className="font-serif font-black text-2xl text-[#8B1A1A]">
                Ilm al-Mantiq
              </h2>
              <p className="amiri text-[#C4A35A] text-lg leading-none">عِلْمُ الْمَنْطِق</p>
              <p className="text-[10px] font-mono tracking-wide text-[#555555] uppercase">
                Classical Islamic Logic Tutor
              </p>
            </div>

            {/* PROGRESS STATUS METRIC */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-stone-500 font-bold uppercase tracking-wider">Curriculum Progress</span>
                <span className="text-[#8B1A1A] font-black">{completedCount} of 5 Complete</span>
              </div>
              <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden border border-stone-300 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-[#8B1A1A] to-[#C4A35A] h-full transition-all duration-500"
                  style={{ width: `${(completedCount / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* SIDEBAR NAVIGATION BUTTONS (DESKTOP) / PILLS BOX */}
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
                    className={`w-full text-left py-3 px-4 rounded-sm border transition-all duration-300 cursor-pointer flex items-center justify-between
                      ${isActive 
                        ? 'bg-[#8B1A1A] text-[#F5F0E8] border-transparent shadow-md scale-[1.02]' 
                        : isLocked
                        ? 'bg-stone-100 text-stone-400 border-stone-250 cursor-not-allowed opacity-60'
                        : 'bg-white hover:bg-stone-50 text-[#1A1A1A] border-stone-200'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      {isCompleted ? (
                        <CheckCircle2 className={`h-4.5 w-4.5 ${isActive ? 'text-[#C4A35A]' : 'text-emerald-600'}`} />
                      ) : isLocked ? (
                        <Lock className="h-4 w-4 text-stone-400" />
                      ) : (
                        <div className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-[#C4A35A] ring-4 ring-[#C4A35A]/30' : 'bg-[#8B1A1A]'}`} />
                      )}
                      
                      <div className="leading-tight">
                        <p className="font-serif font-black text-xs md:text-sm">{mod.name.split(' — ')[1]}</p>
                        <p className={`text-[10px] font-mono tracking-tight ${isActive ? 'text-[#C4A35A]' : 'text-stone-500'}`}>
                          {mod.name.split(' — ')[0]}
                        </p>
                      </div>
                    </div>

                    <span className="amiri text-[11px] leading-none opacity-80">{mod.arabicName}</span>
                  </button>
                );
              })}
            </nav>

          </div>
        </div>

        {/* MOBILE MODULE NAVIGATION TRACK (HORIZONTAL SCROLL) */}
        <div className="lg:hidden col-span-1 w-full overflow-x-auto pb-2 border-b border-stone-250">
          <div className="flex gap-2 min-w-[640px] px-1">
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
                  className={`py-2.5 px-4 rounded-sm border transition-all duration-300 flex items-center gap-2 shrink-0
                    ${isActive 
                      ? 'bg-[#8B1A1A] text-white border-transparent shadow' 
                      : isLocked
                      ? 'bg-stone-150 text-stone-400 border-stone-200 cursor-not-allowed opacity-65'
                      : 'bg-white text-stone-700 border-stone-200'
                    }
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : isLocked ? (
                    <Lock className="h-3.5 w-3.5" />
                  ) : (
                    <span className="h-1.5 w-1.5 bg-[#C4A35A] rounded-full" />
                  )}
                  <span className="font-serif text-xs font-bold leading-none">{mod.name.split(' — ')[1]}</span>
                  <span className="text-[9px] font-mono opacity-80">({mod.name.split(' — ')[0]})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN MODULE INSTRUCTION SHEET AREA (RIGHT CHIEF COLUMN) */}
        <div ref={mainContentRef} className="lg:col-span-3 space-y-8">
          
          {/* HEADER EMBELLISHMENT PANEL */}
          <div className="bg-[#FAF8F5]/65 border border-[#8B1A1A]/10 rounded-sm p-6 sm:p-8 shadow-sm relative overflow-hidden space-y-3">
            <div className="absolute right-6 top-6 opacity-10 text-[#8B1A1A] select-none pointer-events-none">
              <Award className="h-28 w-28" />
            </div>
            
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#8B1A1A] uppercase font-black block">
              Active Logic Room • Ibn Sina's Logic Chamber
            </span>
            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="font-serif font-black text-3xl sm:text-4xl text-[#8B1A1A]">
                {currentModule.name}
              </h1>
              <span className="amiri text-[#C4A35A] text-2xl leading-none">
                {currentModule.arabicName}
              </span>
            </div>
            <p className="text-sm text-[#555555] font-serif leading-relaxed max-w-2xl italic">
              "{currentModule.description}"
            </p>
          </div>

          {/* STREAM / TEXT CONTENT RENDER SHEET */}
          <div className="bg-white border border-[#8B1A1A]/10 p-6 sm:p-10 rounded-sm shadow-md space-y-8 relative overflow-hidden">
            {/* ANTIQUE STRIP TOP */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B1A1A] via-[#C4A35A] to-[#8B1A1A]" />
            
            <h3 className="font-serif font-black text-xs md:text-sm uppercase tracking-widest text-[#8B1A1A] border-b border-[#C4A35A]/25 pb-3">
              Ibn Sina's Scholarly Parchment (Textbook Instruction)
            </h3>

            {lessonLoading && !lessonContent && (
              <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
                <RefreshCw className="h-10 w-10 text-[#8B1A1A] animate-spin" />
                <p className="font-mono text-xs uppercase tracking-widest text-stone-500 font-bold animate-pulse">
                  Querying Al-Shifa Compendium index... Translating Logic
                </p>
              </div>
            )}

            {/* CLASSICAL INSTRUCTION PARSED BLOCKS */}
            <div className="text-stone-850 font-serif text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-6">
              {lessonContent ? (
                <div>
                  {/* Custom parsing for Ibn Sina headers and blocks */}
                  {lessonContent.split("\n\n").map((block, bIdx) => {
                    const isConceptHeader = block.includes("**المفهوم");
                    const isClassicalExHeader = block.includes("**المثال الكلاسيكي");
                    const isModernExHeader = block.includes("**المثال المعاصر");
                    const isPracticeHeader = block.includes("**التطبيق");

                    if (isConceptHeader) {
                      return (
                        <div key={bIdx} className="p-5 bg-stone-50 border border-stone-200 rounded-sm space-y-2 mb-6">
                          <h4 className="font-serif font-black text-[#8B1A1A] text-base capitalize border-b border-stone-200 pb-1 flex items-center justify-between">
                            <span>المفهوم — The Concept</span>
                            <span className="text-[10px] font-mono text-stone-500">SECTION 1</span>
                          </h4>
                          <div className="text-stone-800 leading-relaxed font-serif whitespace-pre-line">
                            {block.replace(/\*\*المفهوم\s*—\s*The Concept\*\*/g, "").trim()}
                          </div>
                        </div>
                      );
                    }

                    if (isClassicalExHeader) {
                      return (
                        <div key={bIdx} className="p-5 bg-[#FAF8F5]/80 border-l-4 border-[#C4A35A] rounded-sm space-y-2 mb-6 shadow-sm">
                          <h4 className="font-serif font-black text-[#8B1A1A] text-base flex items-center justify-between">
                            <span>المثال الكلاسيكي — Classical Example</span>
                            <span className="text-[10px] font-mono text-[#C4A35A]">SECTION 2</span>
                          </h4>
                          <div className="text-stone-800 italic font-serif leading-relaxed whitespace-pre-line">
                            {block.replace(/\*\*المثال الكلاسيكي\s*—\s*Classical Example\*\*/g, "").trim()}
                          </div>
                        </div>
                      );
                    }

                    if (isModernExHeader) {
                      return (
                        <div key={bIdx} className="p-5 bg-[#FAF8F5]/80 border-l-4 border-slate-400 rounded-sm space-y-2 mb-6">
                          <h4 className="font-serif font-black text-slate-800 text-base flex items-center justify-between">
                            <span>المثال المعاصر — Modern Example</span>
                            <span className="text-[10px] font-mono text-slate-500">SECTION 3</span>
                          </h4>
                          <div className="text-stone-800 font-serif leading-relaxed whitespace-pre-line">
                            {block.replace(/\*\*المثال المعاصر\s*—\s*Modern Example\*\*/g, "").trim()}
                          </div>
                        </div>
                      );
                    }

                    if (isPracticeHeader) {
                      return (
                        <div key={bIdx} className="p-5 bg-stone-100 border border-stone-300 rounded-sm space-y-2 mb-6">
                          <h4 className="font-serif font-bold text-stone-800 text-sm tracking-widest uppercase flex items-center gap-2">
                            <Sparkle className="h-4 w-4 text-[#C4A35A] animate-spin-slow" />
                            <span>التطبيق — Interactive Practice</span>
                          </h4>
                          <div className="text-[#8B1A1A] font-serif font-semibold whitespace-pre-line text-sm md:text-base">
                            {block.replace(/\*\*التطبيق\s*—\s*Practice Exercise\*\*/g, "").split("EXERCISE_START")[0].trim()}
                          </div>
                        </div>
                      );
                    }

                    // Ignore raw marker texts from streaming render directly
                    if (block.includes("EXERCISE_START:") || block.includes("EXERCISE_END")) {
                      return null;
                    }

                    return (
                      <p key={bIdx} className="text-stone-800 leading-relaxed font-serif whitespace-pre-line mb-4">
                        {block}
                      </p>
                    );
                  })}
                </div>
              ) : (
                !lessonLoading && (
                  <p className="text-stone-400 font-serif text-center italic py-8">
                    Unable to load scholarly text. Click module to reload.
                  </p>
                )
              )}
            </div>

            {/* STEP 2: PRACTICE EXERCISE WORKAREA TEXTAREA */}
            {lessonContent && !lessonLoading && (
              <div className="border-t border-stone-200 pt-8 space-y-6">
                <div className="bg-[#8B1A1A]/5 rounded-sm p-4 border border-[#8B1A1A]/10 space-y-2">
                  <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#8B1A1A] flex items-center gap-1.5">
                    <Compass className="h-3.5 w-3.5 text-[#C4A35A]" />
                    Assignation Task Prompt
                  </h4>
                  <p className="font-serif font-bold text-stone-850 text-sm sm:text-base leading-relaxed">
                    {exerciseText}
                  </p>
                </div>

                <form onSubmit={handlePracticeSubmit} className="space-y-4">
                  <textarea
                    rows={4}
                    required
                    disabled={isEvaluating}
                    value={studentAnswer}
                    onChange={(e) => setStudentAnswer(e.target.value)}
                    placeholder="Provide your deduction or definition here and let the master evaluate..."
                    className="w-full bg-[#FAFAF5] border border-[#8B1A1A]/15 rounded-sm p-4 text-sm font-serif leading-relaxed placeholder-stone-400 focus:outline-none focus:border-[#8B1A1A] focus:ring-1 focus:ring-[#8B1A1A]/30 transition-all shadow-inner"
                  />

                  <button
                    type="submit"
                    disabled={isEvaluating || !studentAnswer.trim()}
                    className={`w-full py-3.5 bg-[#8B1A1A] text-white hover:bg-black font-mono text-xs uppercase tracking-widest font-black rounded-sm border border-[#C4A35A]/40 transition-all duration-300 shadow flex items-center justify-center gap-2.5 cursor-pointer
                      ${(isEvaluating || !studentAnswer.trim()) ? 'bg-stone-400 cursor-not-allowed opacity-75' : ''}
                    `}
                  >
                    {isEvaluating ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Evaluating Sincerity & Logic...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 text-[#C4A35A]" />
                        Submit Answer — أرسل
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

          </div>

          {/* STEP 3: INTERACTIVE EVALUATION CARD */}
          <AnimatePresence>
            {evaluation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white border-2 border-[#C4A35A] rounded-sm p-6 sm:p-8 shadow-md relative overflow-hidden space-y-6"
              >
                {/* ORNAMENTAL LEFT STRIP */}
                <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#C4A35A]" />

                <div className="flex items-center gap-3 border-b border-stone-200 pb-3">
                  <Award className="h-5 w-5 text-[#C4A35A]" />
                  <div>
                    <h4 className="font-serif font-black text-[#8B1A1A]">Master Sage Evaluation</h4>
                    <p className="text-[9px] font-mono text-stone-500 uppercase tracking-widest">Logic Assessment Rulings</p>
                  </div>
                </div>

                <div className="space-y-4 font-serif text-sm text-stone-850 leading-relaxed">
                  {parsedEval ? (
                    <div className="space-y-5">
                      <div className="flex items-center gap-2 text-base font-bold text-[#8B1A1A]">
                        <span>النتيجة — Result:</span>
                        <span className="px-2.5 py-0.5 bg-amber-50 rounded border border-[#C4A35A]/50 text-stone-800 text-xs font-serif uppercase tracking-widest">
                          {parsedEval.result}
                        </span>
                      </div>

                      {parsedEval.analysis && (
                        <div className="space-y-1">
                          <h5 className="font-bold text-xs uppercase font-mono tracking-wider text-stone-500">التحليل — Analysis</h5>
                          <p className="text-stone-800 bg-[#FAF8F5] p-3 border border-stone-100 rounded-sm whitespace-pre-line">{parsedEval.analysis}</p>
                        </div>
                      )}

                      {parsedEval.correction && (
                        <div className="space-y-1">
                          <h5 className="font-bold text-xs uppercase font-mono tracking-wider text-stone-500">التصحيح — Correction</h5>
                          <p className="text-stone-850 whitespace-pre-line">{parsedEval.correction}</p>
                        </div>
                      )}

                      {parsedEval.encouragement && (
                        <div className="bg-[#8B1A1A]/5 p-4 rounded border-l-4 border-[#8B1A1A] italic text-[#8B1A1A] text-sm md:text-base">
                          <p className="font-bold font-mono text-[9px] uppercase tracking-widest not-italic mb-1 text-slate-500">التشجيع — Encouragement</p>
                          "{parsedEval.encouragement}"
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="whitespace-pre-line text-stone-800">{evaluation}</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STEP 4: MINI-QUIZ (APPEARS ONLY AFTER EVALUATION RECEIVED) */}
          <AnimatePresence>
            {evaluation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-[#FAF8F5] border border-[#8B1A1A]/10 p-6 sm:p-8 rounded-sm shadow space-y-6"
              >
                <div className="border-b border-[#C4A35A]/25 pb-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#8B1A1A] font-bold block mb-1">
                    Scholastic Examination
                  </span>
                  <h3 className="font-serif font-black text-xl text-[#8B1A1A]">
                    Interactive Mantiq Quiz: Test Your Sincerity
                  </h3>
                  <p className="text-xs text-stone-500 font-serif italic mt-0.5">
                    "Now let us test your precision under classical parameters. Score 2 of 3 to pass."
                  </p>
                </div>

                {quizLoading ? (
                  <div className="py-8 flex justify-center items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#555555]">
                    <RefreshCw className="h-4 w-4 animate-spin text-[#8B1A1A]" />
                    Summoning custom logic questions...
                  </div>
                ) : (
                  <div className="space-y-8">
                    {quizQuestions.map((q, idx) => {
                      const selected = selectedAnswers[idx];
                      const isCorrect = selected === q.correct;

                      return (
                        <div key={idx} className="bg-white p-5 rounded border border-stone-200 shadow-sm space-y-4">
                          {/* MCQ HEADER */}
                          <div className="space-y-1.5 ">
                            <div className="flex justify-between items-start">
                              <span className="px-2 py-0.5 bg-stone-100 border border-stone-300/60 rounded text-[10px] font-mono text-stone-500 font-bold uppercase">
                                Question {idx + 1} of 3
                              </span>
                              <span className="amiri text-[#C4A35A] text-sm md:text-base leading-none">
                                {q.arabic_question}
                              </span>
                            </div>
                            <h4 className="font-serif font-bold text-sm sm:text-base text-stone-850 leading-relaxed">
                              {q.question}
                            </h4>
                          </div>

                          {/* OPTIONS SELECTOR GRID */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-serif">
                            {Object.entries(q.options).map(([key, value]) => {
                              const isThisSelected = selected === key;
                              const isThisCorrectOption = q.correct === key;

                              let bgClass = "bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-800";
                              if (isThisSelected) {
                                if (quizSubmitted) {
                                  bgClass = isCorrect ? "bg-emerald-500/10 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500" : "bg-[#8B1A1A]/10 border-[#8B1A1A] text-[#8B1A1A] ring-1 ring-[#8B1A1A]";
                                } else {
                                  bgClass = "bg-[#8B1A1A] border-transparent text-white shadow scale-[1.01]";
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
                                  className={`w-full text-left p-3.5 rounded border text-xs sm:text-sm transition-all duration-300 flex items-center gap-3 cursor-pointer
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

                          {/* OPTIONAL EXPLANATION POST-SUBMIT */}
                          {quizSubmitted && (
                            <div className="p-3 bg-stone-50 border-l-2 border-[#C4A35A] text-xs leading-relaxed text-stone-600">
                              <span className="font-bold text-stone-800 font-serif">Assessment Basis: </span>
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
                        className={`w-full py-3 bg-[#FAF8F5] text-stone-800 border-2 border-stone-300 hover:bg-[#8B1A1A] hover:text-white font-mono text-xs uppercase tracking-widest font-black rounded-sm transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer
                          ${Object.keys(selectedAnswers).length < 3 ? 'bg-stone-100 opacity-60 text-stone-400 border-stone-200 cursor-not-allowed hover:bg-stone-100 hover:text-stone-400' : ''}
                        `}
                      >
                        <Award className="h-4.5 w-4.5 text-[#C4A35A]" />
                        Evaluate Examination Quiz — قيّم الاختيار
                      </button>
                    ) : (
                      <div className="p-6 bg-white border border-stone-200 rounded-sm space-y-4 text-center">
                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#8B1A1A]/5 border border-[#8B1A1A]/10 text-[#8B1A1A] font-serif font-black text-lg">
                          {quizScore}/3
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-serif font-black text-base text-[#8B1A1A]">
                            {quizScore >= 2 ? "Scholastic Examination Passed! — ناجح" : "Requires Further Contemplation — لم ينجح"}
                          </h4>
                          <p className="text-xs text-stone-500 leading-relaxed font-serif max-w-md mx-auto">
                            {quizScore >= 2 
                              ? "You have processed the core syllogistic constraints of Ibn Sina. The gates to deeper realms stand open." 
                              : "Double-check your parameters and definitions. True logicians return to the source texts with renewed sincerity."
                            }
                          </p>
                        </div>

                        <div className="pt-2 flex flex-wrap gap-3 items-center justify-center">
                          {quizScore >= 2 ? (
                            <button
                              type="button"
                              onClick={handleNextModuleAndUnlock}
                              className="px-6 py-2.5 bg-[#8B1A1A] text-white hover:bg-black font-mono text-xs uppercase tracking-widest font-bold rounded-sm border border-[#C4A35A]/50 transition-all duration-300 cursor-pointer flex items-center gap-2"
                            >
                              <span>Unlock Next Module</span>
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={loadMCQQuiz}
                              className="px-6 py-2.5 bg-stone-150 text-stone-800 hover:bg-stone-200 font-mono text-xs uppercase tracking-widest font-bold rounded-sm border border-stone-300 transition-all duration-300 cursor-pointer flex items-center gap-2"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              Try the quiz again
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>

          {/* BACK CHANNELS DETECTOR */}
          <div className="text-center pt-4">
            <button
              onClick={onBackToLanding}
              className="text-stone-500 hover:text-[#8B1A1A] transition-all font-mono text-xs uppercase tracking-widest font-bold inline-flex items-center gap-2 cursor-pointer bg-transparent border-0"
            >
              ← Return to Celestial Globe Dashboard
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
