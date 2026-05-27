import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI, Type } from "@google/genai";

// Load environment variables
dotenv.config({ path: ".env.local" });
dotenv.config();

// Initialize Supabase Client (Lazy, safe, with fallback flags)
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

let supabase: any = null;
let isSupabaseConfigured = false;

if (supabaseUrl && supabaseServiceKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    isSupabaseConfigured = true;
    console.log("Supabase Client initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
  }
} else {
  console.warn("Supabase credentials missing in environment. Operating in sandbox local-memory fallback mode.");
}

// In-Memory Fallback Databases (Seeded with initial structural logs)
let localAdmissions: any[] = [
  {
    id: "app_test1",
    fullName: "Zubayr Al-Husseini",
    email: "student@albab.edu",
    selectedCourse: "fiqh",
    statementOfPurpose: "Desiring to master classical Hanafi and Maliki jurisprudence to analyze modern crowd-sourced financing and cryptocurrency structures.",
    priorKnowledge: "intermediate",
    date: "May 25, 2026",
    status: "Approved"
  },
  {
    id: "app_test2",
    fullName: "Layla Bintl Farooq",
    email: "layla@outlook.com",
    selectedCourse: "logic",
    statementOfPurpose: "Determined to reconstruct logic syllogisms in theological tracts and contrast deductive traditions with modern machine intelligence frameworks.",
    priorKnowledge: "advanced",
    date: "May 26, 2026",
    status: "Pending"
  }
];

let localNotices: any[] = [
  {
    id: "n_1",
    title: "Admissions for Summer Covenant 2026 Now Open",
    category: "Admissions",
    body: "Scholars globally are encouraged to submit their statements of purpose for our eight cardinal disciplines. Orientation matches the moon cycles.",
    date: "May 24, 2026",
    priority: "High"
  },
  {
    id: "n_2",
    title: "New Study Circles: Reconstructing Traditional Usul Texts",
    category: "Seminary Notice",
    body: "A weekly study circle specializing in text reconstruction has transitioned from online chat rooms directly to focused peer reviews.",
    date: "May 20, 2026",
    priority: "Normal"
  }
];

let localAssignments: any[] = [
  {
    id: "asg_test1",
    studentName: "Zubayr Al-Husseini",
    studentEmail: "student@albab.edu",
    courseId: "fiqh",
    title: "Mudarabah Contracts in Digital Tokenization Assets",
    thesis: "Traditional Mudarabah aligns seamlessly with peer-to-peer liquidity protocol structures. However, systemic risks, collateral slippages, and interest-bearing proxy tokens command extreme caution under Usul-al-Fiqh guidelines.",
    date: "May 26, 2026",
    status: "Awaiting Grade"
  }
];

// Helper: Attempt Supabase operation, fallback otherwise
async function trySupabaseFetch(table: string, fallbackData: any[]) {
  if (!isSupabaseConfigured || !supabase) return { data: fallbackData, source: "fallback" };
  try {
    const { data, error } = await supabase.from(table).select("*").order("id", { ascending: false });
    if (error) {
      // Table might not exist, fallback gracefully
      console.warn(`Supabase fetch failed for "${table}". Error logic:`, error.message);
      return { data: fallbackData, source: "fallback (table missing or error)" };
    }
    return { data, source: "supabase" };
  } catch (err: any) {
    console.error(`Subsystem error fetching from ${table}:`, err.message);
    return { data: fallbackData, source: "fallback (exception)" };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. DATABASE CONNECTIVITY DIAGNOSTICS ENDPOINT
  app.get("/api/supabase-status", async (req, res) => {
    let admissionsStatus = "Unknown";
    let noticesStatus = "Unknown";
    let assignmentsStatus = "Unknown";

    if (isSupabaseConfigured && supabase) {
      try {
        const fetchAdmissions = await supabase.from("albab_admissions").select("id").limit(1);
        admissionsStatus = fetchAdmissions.error ? `Missing/Error: ${fetchAdmissions.error.message}` : "Ready";
        
        const fetchNotices = await supabase.from("albab_notices").select("id").limit(1);
        noticesStatus = fetchNotices.error ? `Missing/Error: ${fetchNotices.error.message}` : "Ready";

        const fetchAsgs = await supabase.from("albab_assignments").select("id").limit(1);
        assignmentsStatus = fetchAsgs.error ? `Missing/Error: ${fetchAsgs.error.message}` : "Ready";
      } catch (e: any) {
        console.error("Diagnostic sweep failed:", e.message);
      }
    }

    res.json({
      configured: isSupabaseConfigured,
      project_id: "wmxjnzgfvirfaiutskvg",
      url: supabaseUrl,
      endpoints: {
        albab_admissions: admissionsStatus,
        albab_notices: noticesStatus,
        albab_assignments: assignmentsStatus
      },
      sql_setup_script: `
-- RUN THESE QUERIES IN THE SUPABASE SQL EDITOR TO INITIALIZE THE SCHOLASTIC DATABASE!

-- 1. Create admissions table
CREATE TABLE IF NOT EXISTS albab_admissions (
  id TEXT PRIMARY KEY,
  "fullName" TEXT NOT NULL,
  email TEXT NOT NULL,
  "selectedCourse" TEXT NOT NULL,
  "statementOfPurpose" TEXT,
  "priorKnowledge" TEXT,
  date TEXT,
  status TEXT DEFAULT 'Pending'
);

-- 2. Create notices table
CREATE TABLE IF NOT EXISTS albab_notices (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  body TEXT NOT NULL,
  date TEXT,
  priority TEXT DEFAULT 'Normal'
);

-- 3. Create assignments table
CREATE TABLE IF NOT EXISTS albab_assignments (
  id TEXT PRIMARY KEY,
  "studentName" TEXT NOT NULL,
  "studentEmail" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  title TEXT NOT NULL,
  thesis TEXT NOT NULL,
  date TEXT,
  status TEXT DEFAULT 'Awaiting Grade',
  grade TEXT,
  feedback TEXT
);

-- Enable select operations for anonymous callers (or rely on bypass)
ALTER TABLE albab_admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE albab_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE albab_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read/write anonymized operations" ON albab_admissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow read/write notices operations" ON albab_notices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow read/write assignments operations" ON albab_assignments FOR ALL USING (true) WITH CHECK (true);
      `
    });
  });

  // 2. ADMISSIONS APIS
  app.get("/api/admissions", async (req, res) => {
    const { data, source } = await trySupabaseFetch("albab_admissions", localAdmissions);
    res.json({ data, source });
  });

  app.post("/api/admissions", async (req, res) => {
    const record = {
      id: req.body.id || `app_${Math.random().toString(36).substring(2, 9)}`,
      fullName: req.body.fullName,
      email: req.body.email,
      selectedCourse: req.body.selectedCourse,
      statementOfPurpose: req.body.statementOfPurpose || "",
      priorKnowledge: req.body.priorKnowledge || "Seeker",
      date: req.body.date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      status: req.body.status || "Pending"
    };

    // Update Local fallback
    localAdmissions = [record, ...localAdmissions.filter(a => a.email.toLowerCase() !== record.email.toLowerCase())];

    let source = "fallback";
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("albab_admissions").upsert(record);
        if (!error) {
          source = "supabase";
        } else {
          console.warn("Supabase insert/upsert failed. Falling back. Error:", error.message);
        }
      } catch (err: any) {
        console.error("Supabase write exception:", err.message);
      }
    }

    res.json({ success: true, record, source });
  });

  app.put("/api/admissions/:id", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Update Local fallback
    localAdmissions = localAdmissions.map(a => a.id === id ? { ...a, status } : a);

    let source = "fallback";
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("albab_admissions").update({ status }).eq("id", id);
        if (!error) {
          source = "supabase";
        } else {
          console.warn("Supabase update status failed. Falling back. Error:", error.message);
        }
      } catch (err: any) {
        console.error("Supabase update status exception:", err.message);
      }
    }

    res.json({ success: true, id, status, source });
  });

  // 3. NOTICES APIS
  app.get("/api/notices", async (req, res) => {
    const { data, source } = await trySupabaseFetch("albab_notices", localNotices);
    res.json({ data, source });
  });

  app.post("/api/notices", async (req, res) => {
    const record = {
      id: req.body.id || `n_${Math.random().toString(36).substring(2, 9)}`,
      title: req.body.title,
      category: req.body.category || "General",
      body: req.body.body,
      date: req.body.date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      priority: req.body.priority || "Normal"
    };

    // Update Local fallback
    localNotices = [record, ...localNotices];

    let source = "fallback";
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("albab_notices").insert(record);
        if (!error) {
          source = "supabase";
        } else {
          console.warn("Supabase notice insert failed. Error:", error.message);
        }
      } catch (err: any) {
        console.error("Supabase notice insert exception:", err.message);
      }
    }

    res.json({ success: true, record, source });
  });

  app.delete("/api/notices/:id", async (req, res) => {
    const { id } = req.params;

    // Update Local fallback
    localNotices = localNotices.filter(n => n.id !== id);

    let source = "fallback";
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("albab_notices").delete().eq("id", id);
        if (!error) {
          source = "supabase";
        } else {
          console.warn("Supabase notice delete failed. Error:", error.message);
        }
      } catch (err: any) {
        console.error("Supabase notice delete exception:", err.message);
      }
    }

    res.json({ success: true, id, source });
  });

  // 4. ASSIGNMENTS APIS
  app.get("/api/assignments", async (req, res) => {
    const { data, source } = await trySupabaseFetch("albab_assignments", localAssignments);
    res.json({ data, source });
  });

  app.post("/api/assignments", async (req, res) => {
    const record = {
      id: req.body.id || `asg_${Math.random().toString(36).substring(2, 9)}`,
      studentName: req.body.studentName,
      studentEmail: req.body.studentEmail,
      courseId: req.body.courseId,
      title: req.body.title,
      thesis: req.body.thesis,
      date: req.body.date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      status: req.body.status || "Awaiting Grade"
    };

    // Update Local fallback
    localAssignments = [record, ...localAssignments];

    let source = "fallback";
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("albab_assignments").upsert(record);
        if (!error) {
          source = "supabase";
        } else {
          console.warn("Supabase assignment insert/upsert failed. Error:", error.message);
        }
      } catch (err: any) {
        console.error("Supabase assignment insert/upsert exception:", err.message);
      }
    }

    res.json({ success: true, record, source });
  });

  app.put("/api/assignments/:id", async (req, res) => {
    const { id } = req.params;
    const { status, grade, feedback } = req.body;

    // Update Local fallback
    localAssignments = localAssignments.map(asg => 
      asg.id === id ? { ...asg, status, grade, feedback } : asg
    );

    let source = "fallback";
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("albab_assignments").update({ status, grade, feedback }).eq("id", id);
        if (!error) {
          source = "supabase";
        } else {
          console.warn("Supabase grading failed. Error:", error.message);
        }
      } catch (err: any) {
        console.error("Supabase grading exception:", err.message);
      }
    }

    res.json({ success: true, id, status, grade, feedback, source });
  });

  // 5. LECTURES PROGRESS APIS (Persisted in-memory & fallback in local memory)
  const localLectureProgress: Record<string, any> = {};

  app.get("/api/lecture-progress/:email", (req, res) => {
    const email = req.params.email.toLowerCase();
    res.json({ data: localLectureProgress[email] || {}, source: "fallback-memory" });
  });

  app.post("/api/lecture-progress/:email", (req, res) => {
    const email = req.params.email.toLowerCase();
    const { completedLectures } = req.body;
    localLectureProgress[email] = completedLectures || {};
    res.json({ success: true, data: localLectureProgress[email], source: "fallback-memory" });
  });

  // --- GEMINI AI & CLASSICAL ISLAMIC ACADEMIC SUBSYSTEMS ---

  // Lazy Initializer for GoogleGenAI
  let genAIClient: GoogleGenAI | null = null;
  function getGenAI(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. Providing a surrogate client to require active API interaction.");
      // Return a surrogate that throws a clear instruction when called, bypassing the "hybrid/simulated" checks
      return {
        models: {
          generateContent: async () => {
            throw new Error("GEMINI_API_KEY is missing. Please configure GEMINI_API_KEY in active environments or the Settings > Secrets panel.");
          },
          generateContentStream: async () => {
            throw new Error("GEMINI_API_KEY is missing. Please configure GEMINI_API_KEY in active environments or the Settings > Secrets panel.");
          }
        }
      } as any;
    }

    if (!genAIClient) {
      try {
        genAIClient = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build"
            }
          }
        });
        console.log("GoogleGenAI Client initialized server-side successfully.");
      } catch (e: any) {
        console.error("Failed to initialize GoogleGenAI client:", e);
      }
    }
    return genAIClient;
  }

  // Local state mappings for sponsorships, subscribers, and dashboard sync
  const localSponsorships: Record<string, string[]> = {
    quran: ["Fatima Al-Fihri Foundation"],
    hadith: ["Zubayr Al-Husseini (Sadaqah Jariyah)"]
  };
  const localSubscribers: string[] = [];
  const localDashboards: Record<string, any> = {};

  // Deterministic Falback Resources for offline/development robustness
  const FALLBACK_DEBATES: Record<string, string> = {
    finance: `### Classical Munazara: Trading of Digital Assets & Tokenized Currency

**Moderator Statement (Albab Academic Board):**  
In this study circle, we evaluate the status of digital tokens and cryptographic assets under traditional Islamic commercial law (*Fiqh al-Muamalat*).

---

#### 1. The Proponents / Permissive Argument (*Hanafi / Contemporary Synthesis*)
* **Evidence (*Daleel*):**  
  * Usul and the custom of the market (*Al-Urf*) play a primary role in defining money (*Maliyyah*). Since digital assets serve as standard indicators of utility/value and are widely accepted, they fulfill the core requirements of assets (*Mal*).
  * The default state of transaction types is general permission (*Al-Asl fil-Ashya al-Ibahah*) unless explicit absolute hazards exist.
* **Refined Reasoning:**  
  * Modern crypto acts identically to physical token currencies (*Fulus*) of medieval eras, which didn't possess intrinsic value but carried transactional exchange agreements.

---

#### 2. The Restrictive Argument (*Shafi'i / Classical Precautions*)
* **Evidence (*Daleel*):**  
  * High-level uncertainty and price volatility (*Gharar*) border on structural gambling (*Maysir*). Shafi'i parameters mandate physical possession or direct hand-to-hand delivery (*Qabd*) of tangible assets or stable mediums.
  * Lack of a central legal backing (*Sultah*) leaves assets highly susceptible to unmitigated loss and speculation.

---

#### 3. Scholarly Synthesis & Resolution (*Academic Conciliation*)
* **Verdict:**  
  * Distinction must be drawn between utility tokens representing clear, actual assets, and pure speculative trading instruments. 
  * If a digital asset represents real collateral or clear service utility, it achieves the rank of a sound asset under classical principles. Standard digital speculation remains highly discouraged to protect private wealth (*Hifz al-Mal*).`,
    moon: `### Classical Munazara: Moon Sighting (Global vs Local Calculations)

**Moderator Statement (Albab Academic Board):**  
Establishing the Lunar Crescent for cosmic sacred calendars (*Ramadan / Eid*).

---

#### 1. Position A: Absolute Global Unity (*Hanafi School*)
* **Evidence (*Daleel*):**  
  * Hanafi jurisprudence historically holds that the sighting of one community is binding upon all nations (*Ikhtilaf al-Matali' la 'ibarata bih*). 
  * General command of the Prophet: "Fast when you see it and end fast when you see it." This command applies collectively to the global Ummah.

---

#### 2. Position B: Astronomical Local Horizon (*Shafi'i School*)
* **Evidence (*Daleel*):**  
  * Shafi'is hold that every region has its unique horizon (*Matla'*). If distance exceeds the standard travel range (*Masafat al-Qasr*), different celestial rules apply.
  * Verified by the narration of Kuraib where the sighting of Ash-Shams in Damascus was not deemed binding on Medina.

---

#### 3. Scholarly Synthesis & Resolution (*Academic Conciliation*)
* **Verdict:**  
  * Traditional jurisprudential frameworks easily contain both views. Local authorities should specify a unified framework for their territory to prevent domestic communal divide (*Nifaq*).`
  };

  const FALLBACK_EXP_RECORDS: Record<string, any> = {
    "1:1": {
      arabic: "الم قُلْ نَعَمْ وَأَنتُمْ دَاخِرُونَ",
      translation: "Alif, Lam, Meem. Say: 'Yes, and you will be humiliated.'",
      tafseer: "Classic Tafseer Ibn Katheer: These foundational disconnected letters (Huruf al-Muqatta'at) indicate the supreme rhetoric and inimitability of the Quranic structure. No creature can construct its equivalents. Traditional scholars emphasize that Allah reserves the absolute meaning of these letters while using them to focus human attention.",
      hadiths: [
        "Sahih al-Bukhari: 'The best among you are those who learn the Quran and teach it.'",
        "Sunan al-Tirmidhi: 'Whoever recites a letter from the Book of Allah receives a good deed, multiplied by ten.'"
      ],
      curriculumLinks: ["Quranic Arabic", "Tafseer", "Uloom al-Qur'an"]
    },
    "2:255": {
      arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ",
      translation: "Allah! There is no deity except Him, the Self-Sustaining, the All-Sustaining...",
      tafseer: "Classic Tafseer Ibn Katheer: Ayat Al-Kursi is the supreme verse of the Holy Scroll. It outlines ten majestic attributes of central monotheism (Tawheed). It highlights Allah's absolute self-subsistence (Qayyumiyyah), cosmic majesty, and total wakefulness.",
      hadiths: [
        "Sahih Muslim: The Prophet asked Ubayy bin Ka'b: 'Which verse is the greatest?' He replied 'Ayat Al-Kursi' and the Prophet patted his chest in approval.",
        "Sahih al-Bukhari: 'Reciting it at night ensures a celestial guardian watches over you until Dawn.'"
      ],
      curriculumLinks: ["Aqeedah", "Tafseer", "Islamic Studies"]
    }
  };

  // 1. AI SCHOLARLY DEBATE ARENA
  app.post("/api/debate", async (req, res) => {
    const { madhabA, madhabB, topic } = req.body;
    if (!madhabA || !madhabB || !topic) {
      return res.status(400).json({ error: "Missing madhabA, madhabB, or topic fields" });
    }

    const ai = getGenAI();
    if (!ai) {
      // Return high-fidelity dynamic fallback
      const fallbackKey = topic.toLowerCase().includes("moon") ? "moon" : "finance";
      return res.json({
        content: FALLBACK_DEBATES[fallbackKey] || FALLBACK_DEBATES["finance"],
        isSimulated: true
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are a classic scholarly moderator at Albab Islamic University, guiding the Classical Munazara (academic scholarly debate) between the classic positions or schools: "${madhabA}" and "${madhabB}".
The selected scholastic Fiqh/theological topic is: "${topic}".

Please generate an extensive, highly academic, deeply respectful, and structured Munazara:
1. Classical Moderator Statement: Establish the framework of academic integrity under traditional laws.
2. Position A (${madhabA}) Daleel: Scriptural proofs, logical syllogisms, and classic juristic authorities.
3. Position B (${madhabB}) Daleel & Counter-argument: Scriptural proofs, systematic responses to A, and methodologies.
4. Academic Synthesis: A peaceful, scholarly conciliation (*Tawfeeq*) highlighting how traditional differences in legal root principles (*Usul*) yield these varied branches, promoting intellectual growth.

Format the output entirely with elegant, clean Markdown.`,
        config: {
          systemInstruction: "You are a senior dean of Islamic Jurisprudence and Scholarly Debate. Your tone is traditional, objective, eloquent, and highly respectful."
        }
      });
      res.json({ content: response.text, isSimulated: false });
    } catch (e: any) {
      console.error("Debate API Generation failed:", e);
      res.status(500).json({ error: "System error during Munazara generation: " + e.message });
    }
  });

  // 2. QURAN VERSE EXPLORER (With Claude/Gemini-driven classic Tafseer, Hadiths & Curriculum Maps)
  app.post("/api/quran-explorer", async (req, res) => {
    const { surah, ayah } = req.body;
    const sNum = parseInt(surah) || 1;
    const aNum = parseInt(ayah) || 1;

    let arabicText = "الم";
    let englishTrans = "Alif, Lam, Meem.";
    let fetchError = null;

    // Fetch from public Quran API with timeout safeguard
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 4000);
      
      const quranRes = await fetch(`https://api.quran.com/api/v4/quran/verses/utf8?verse_key=${sNum}:${aNum}`, { signal: controller.signal });
      clearTimeout(id);

      if (quranRes.ok) {
        const qData: any = await quranRes.json();
        if (qData.verses && qData.verses[0]) {
          arabicText = qData.verses[0].text_utf8;
        }
      }

      const transController = new AbortController();
      const tid = setTimeout(() => transController.abort(), 4000);
      const transRes = await fetch(`https://api.quran.com/api/v4/quran/translations/131?verse_key=${sNum}:${aNum}`, { signal: transController.signal });
      clearTimeout(tid);

      if (transRes.ok) {
        const tData: any = await transRes.json();
        if (tData.translations && tData.translations[0]) {
          englishTrans = tData.translations[0].text.replace(/<[^>]*>/g, ""); // Strip html tags
        }
      }
    } catch (err: any) {
      console.warn("Quran API fetch bypassed or timed out. Relying on fallback/AI expansion.", err.message);
      fetchError = err.message;
    }

    const ai = getGenAI();
    if (!ai) {
      const lookupKey = `${sNum}:${aNum}`;
      const record = FALLBACK_EXP_RECORDS[lookupKey] || {
        arabic: arabicText,
        translation: englishTrans,
        tafseer: `Comprehensive Tafseer: For Surah ${sNum}, Ayah ${aNum}. This sacred verse demands deep scholarly reflection on divine attributes, the preservation of law, and spiritual refinement. Traditional scholars focus specifically on the lexical links between guidance (*Huda*) and practice (*Taqwa*).`,
        hadiths: ["Sunan al-Tirmidhi: 'Seeking accurate Tafseer is equivalent to continuous learning.'"],
        curriculumLinks: ["Qur'anic Arabic", "Tafseer"]
      };
      return res.json({ ...record, isSimulated: true });
    }

    try {
      const prompt = `Scripture coordinates: Surah ${sNum}, Ayah ${aNum}.
Arabic words: "${arabicText}"
Translation: "${englishTrans}"

Please generate a deeply traditional analysis in the style of elite Islamic seminaries:
1. Tafseer (Classic Ibn Katheer Style): Frame the textual exegesis, historic triggers of revelation (*Asbab al-Nuzul*), and syntactic/rhetorical nuances.
2. Related Hadiths: Cite 2 authentic prophetic traditions supporting or explaining the themes of this verse, with complete grading.
3. Site Curriculum Connection: Suggest 2 or 3 relevant curriculum branches (such as Fiqh, Logic, Aqeedah, Islamic Studies, Modernity) that align with this verse.

Provide the response in structural markdown.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a master of Tafseer (revelation exegesis) and Hadith sciences."
        }
      });

      res.json({
        arabic: arabicText,
        translation: englishTrans,
        tafseer: response.text,
        hadiths: [], // Integrated in the markdown text
        curriculumLinks: ["Tafseer", "Uloom al-Qur'an", "Islamic Studies"],
        isSimulated: false
      });
    } catch (e: any) {
      console.log("Quran Explorer AI generation failed:", e.message);
      res.json({
        arabic: arabicText,
        translation: englishTrans,
        tafseer: `System error during academic AI Tafseer drafting: ${e.message}`,
        hadiths: [],
        curriculumLinks: ["Tafseer"],
        isSimulated: true
      });
    }
  });

  // 3. FIQH RULING GENERATOR
  app.post("/api/fiqh-ruling", async (req, res) => {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "No question provided" });
    }

    const ai = getGenAI();
    if (!ai) {
      const docText = `### Authentic Decrees: Albab Juristic Fatwa Board

* **现代Question:** "${question}"
* **Decision Status:** Seeded Fallback Legal Opinion

---

#### 1. QURANIC EVIDENCE
* "Say: If you love Allah, follow me, and Allah will love you" (3:31)
* "And cooperate in righteousness and piety, but do not cooperate in sin and aggression" (5:2)

---

#### 2. HADITH EVIDENCE
* "The lawful is clear, and the unlawful is clear, and between them are doubtful matters..." (Sahih al-Bukhari)
* "Actions are valued according to intentions" (Sahih Muslim)

---

#### 3. SCHOLARLY CONSENSUS & OPINIONS OF THE SCHOOLS
* **Hanafi Legal Paradigm:** Prioritizes commercial custom and ease of transaction (*Istihsan*) unless explicit textual bars exist.
* **Maliki Legal Paradigm:** Evaluates blockages of systemic harms (*Sadd al-Dara'i*) and collective public interests (*Maslahah Mursalah*).
* **Shafi'i/Hanbali Legal Paradigm:** Relies strictly on semantic absolute textual proofs and direct analogies.

---

#### 4. VERDICT (Hukm)
* Transactions and modern-life options must maintain transparent terms free of clear high-risk deception (*Gharar*) or institutional interest (*Riba*). 
* The default stance on standard technological facilities is general permission, provided they are employed toward noble ends.

---

#### 5. SCHOLASTIC DISCLAIMER
*This legal opinion (*Fatwa*) constitutes a standard educational synthesis based on classic legal canons. Individuals should consult qualified local legal muftis for direct structural rulings.*`;
      return res.json({ content: docText, isSimulated: true });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are a learned classical Mufti (Islamic Jurist) presiding at the Mufti fatwa counsel of Albab Islamic University.
Please provide a systematic, academic, and deeply traditional legal opinion (*Fatwa*) in response to the modern question or dilemma: "${question}".

You MUST structure your response exactly as follows:
1. QURANIC EVIDENCE - Cite key verses, their context, and direct application.
2. HADITH EVIDENCE - Cite authentic prophetic statements with contextual annotations.
3. SCHOLARLY CONSENSUS (Ijma/Qiyas) - Outline the traditional consensus or schools of thought (Hanafi, Maliki, Shafi'i, Hanbali).
4. VERDICT (Hukm) - Clear traditional legal decree with specific conditions.
5. DISCLAIMER - Explaining the limits of general research versus direct courtroom counseling.

Generate the ruling completely as beautifully formatted, parchment-ready Markdown.`,
        config: {
          systemInstruction: "You are an elite Islamic scholar specializing in legal root principles (Usul al-Fiqh) and Fatwa formulation."
        }
      });
      res.json({ content: response.text, isSimulated: false });
    } catch (err: any) {
      res.status(500).json({ error: "Fatwa council AI generation timed out: " + err.message });
    }
  });

  // 4. BRANCH QUIZ SYSTEM (Generate 10 dynamic MCQ questions)
  app.post("/api/branch-quiz", async (req, res) => {
    const { branchName } = req.body;
    if (!branchName) {
      return res.status(400).json({ error: "No branchName provided" });
    }

    const ai = getGenAI();
    if (!ai) {
      // Return a set of default premium questions to ensure quiz works beautifully offline
      const genericMCQs = [
        {
          question: `In classical scholarly literature, what is the primary literal translation of 'Usul'?`,
          options: ["Branches", "Roots/Foundations", "Texts", "Syllogisms"],
          correct: "B",
          explanation: "In traditional Lexicography, 'Usul' is the plural of 'Asl', which literally means 'the foundation/root upon which other things are built'."
        },
        {
          question: `Which historical legal manual is widely credited as the first book written on Usul al-Fiqh?`,
          options: ["Al-Muwatta by Imam Malik", "Al-Risalah by Imam al-Shafi'i", "Al-Hidayah by Imam al-Marghinani", "Al-Mustasfa by Imam al-Ghazali"],
          correct: "B",
          explanation: "Imam Muhammad ibn Idris al-Shafi'i composed 'Al-Risalah', systematizing the legal reasoning rules for extracting decisions."
        },
        {
          question: "Under traditional rules of evidence, what category of Hadith represents absolute historical certainty?",
          options: ["Ahad (Isolated)", "Mashhur (Famous)", "Mutawatir (Consecutively Narrated)", "Da'if (Weak)"],
          correct: "C",
          explanation: "A Mutawatir transmission comprises so many truthful narrators at every link that fabrication is logically and astronomically impossible."
        },
        {
          question: "What is the legal ruling for an action which is recommended and rewarded, but not strictly punished if omitted?",
          options: ["Fard", "Mandub (Mustahabb)", "Mubah", "Makruh"],
          correct: "B",
          explanation: "Mandub or Mustahabb refers to acts which earn spiritual rewards upon performance but do not incur punishment upon omission."
        },
        {
          question: "Which of the four major Sunni schools of laws was founded latest in historical chronology?",
          options: ["Hanafi", "Maliki", "Shafi'i", "Hanbali"],
          correct: "D",
          explanation: "Chronologically, Imam Ahmad ibn Hanbal was born last among the founders, studying closely as an illustrious pupil of Imam Shafi'i."
        },
        {
          question: "What classical tool of reasoning relies on applying a ruling to a new scenario due to a shared effective cause ('Illah)?",
          options: ["Ijma", "Qiyas", "Istihsan", "Urf"],
          correct: "B",
          explanation: "Qiyas is systematic analogical deduction, bridging an established textual case to a modern scenario based on a mutual effective cause."
        },
        {
          question: "Which term describes a jurist who has reached the state of complete independent visual reasoning?",
          options: ["Muqallid", "Mufti", "Mujtahid", "Khateeb"],
          correct: "C",
          explanation: "A Mujtahid is qualified through mastery of grammar, Usul, and texts to formulate independent rulings directly from revelation."
        },
        {
          question: "Which category of law refers to transactional, financial, and civil interactions among people?",
          options: ["Ibadat", "Muamalat", "Aqeedah", "Adab"],
          correct: "B",
          explanation: "Muamalat represents civil commerce and transaction laws, whereas Ibadat focuses strictly on prayers and ritualistic worship."
        },
        {
          question: "In logic and theology, what is the term for a deductive argument of two premises and a final conclusion?",
          options: ["Urf", "Istishab", "Syllogism (Qiyas al-Mantaqi)", "Bayan"],
          correct: "C",
          explanation: "A syllogism links a major premise and minor premise to yield an inevitable logical conclusion."
        },
        {
          question: "What is the ultimate objective or purpose of Islamic law, collectively known as?",
          options: ["Maqasid al-Shariah", "Usul al-Aslah", "Ilm al-Rijal", "Fatawa"],
          correct: "A",
          explanation: "Maqasid al-Shariah represents the core protective goals of religion, life, intellect, family lineage, and wealth."
        }
      ];
      return res.json({ questions: genericMCQs, isSimulated: true });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Generate exactly 10 multiple choice questions (MCQs) designed for university-level testing on the subject: "${branchName}".
Each question MUST test deep, authentic historical and theological aspects of the curriculum.

Return ONLY a valid JSON array of objects. Do not include markdown codeblocks or any commentary outside of the valid JSON.
Each object in the JSON array must contain exactly these properties:
- "question": text of the question (string)
- "options": array of exactly 4 strings (options representing A, B, C, D)
- "correct": single character representing the correct option ("A", "B", "C", or "D")
- "explanation": a detailed paragraph outlining the scholarly reason why this option is correct based on traditional seminary modules (string)

Format example:
[
  {
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "correct": "C",
    "explanation": "..."
  }
]`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const cleanText = response.text.trim();
      const parsed = JSON.parse(cleanText);
      res.json({ questions: parsed, isSimulated: false });
    } catch (e: any) {
      console.error("Failed to generate dynamic branch quiz:", e);
      res.status(500).json({ error: "Failed to generate dynamic quiz parameters: " + e.message });
    }
  });

  // --- AI COGNITIVE LABS ENDPOINTS ---

  // History and Persistence local in-memory stores
  const localCognitiveSaves: any[] = [];
  const localWaswasSaves: Record<string, any[]> = {};
  const localFallacyScans: Record<string, any[]> = {};

  // Waswas Clinic Stream endpoint
  app.post("/api/labs/waswas-clinic", async (req, res) => {
    const { prompt, message, category } = req.body;
    const userPrompt = prompt || message;
    if (!userPrompt) {
      return res.status(400).json({ error: "No prompt or message provided" });
    }

    try {
      const ai = getGenAI();
      if (!ai) {
        throw new Error("No Gemini API configured");
      }

      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Transfer-Encoding", "chunked");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const systemInstruction = `You are an Islamic clinical psychologist specializing in waswas (religious OCD) and spiritual doubt. Your approach fuses Ibn al-Qayyim's Ighathat al-Lahfan with modern ACT therapy. You are warm, scholarly, and deeply compassionate.

Respond with these exact section headers in order:

**مَا تَشْعُرُ بِهِ طَبِيعِيٌّ — What You Feel Is Normal**
Validate their experience. Reference Sahih Muslim 132 about waswas being a sign of faith. 2-3 sentences.

**الْفَهْمُ الْإِسْلَامِيُّ — The Islamic Understanding**
Explain waswas theologically — who sends it, why, what it means. One Hadith or ayah.

**خُطُوَاتٌ عَمَلِيَّةٌ — Your 3-Step Practice**
Step 1: ACT-based psychological exercise
Step 2: Specific Sunnah practice (dhikr/wudu/salah)
Step 3: Ibn al-Qayyim mindset reframe

**دُعَاؤُكَ — Your Prescribed Dua**
Specific Sunnah dua for their situation. Arabic text, transliteration, meaning, when to read.

**كَلِمَةٌ أَخِيرَةٌ — A Closing Word**
One warm hopeful sentence.

End with this line alone:
'If your symptoms are persistent or severe, please speak with a qualified mental health professional alongside your spiritual practice.'

Detect the language of the user's message and respond in the same language (English/Urdu/Arabic).`;

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(chunk.text);
        }
      }
      res.end();
    } catch (e: any) {
      console.error("Waswas Clinic stream failed on server, client will run elegant simulated stream:", e);
      res.status(500).json({ error: "Stream error occurred, falling back to local sage simulator: " + e.message });
    }
  });

  // Waswas Clinic Session Save endpoint
  app.post("/api/labs/waswas/save", async (req, res) => {
    const { uid, email, session } = req.body;
    if (!uid || !session) {
      return res.status(400).json({ error: "Missing uid or session content" });
    }

    try {
      if (!localWaswasSaves[uid]) {
        localWaswasSaves[uid] = [];
      }
      localWaswasSaves[uid].unshift(session);
      res.json({ status: "success", savedInServerMemory: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Mantiq Lesson Stream endpoint
  app.post("/api/labs/mantiq/lesson", async (req, res) => {
    const { moduleName, moduleId } = req.body;
    if (!moduleName) {
      return res.status(400).json({ error: "No moduleName provided" });
    }

    try {
      const ai = getGenAI();
      if (!ai) {
        throw new Error("No Gemini API configured");
      }

      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Transfer-Encoding", "chunked");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const systemInstruction = `You are a master teacher of classical Islamic Logic (Mantiq), a devoted student of Ibn Sina. Teach the module: ${moduleName}.

Structure your response exactly with these headers:

**الْمَفْهُومُ — The Concept**
Arabic term (Amiri font large) — English term.
Definition from Ibn Sina in 2 sentences.

**الْمِثَالُ الْكَلَاسِيكِيُّ — Classical Example**
One example from Islamic scholarship.

**الْمِثَالُ الْمُعَاصِرُ — Modern Example**
One contemporary real-world example.

**التَّطْبِيقُ — Your Practice Exercise**
ONE exercise for the student to attempt.
Hadd: define a given concept
Qiyas: form conclusion from two premises
Burhan: structure a proof for a given claim
Jadal: argue a given position
Mughalata: find the fallacy in a given argument

End your response with exactly:
EXERCISE: [the exercise text here] :END`;

      const prompt = `Please generate the full, detailed logic lesson for module ${moduleName} explaining its background, classical arguments, and practice exercise using the specified headers. Ensure you end with the required EXERCISE: [text] :END marker.`;

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(chunk.text);
        }
      }
      res.end();
    } catch (e: any) {
      console.error("Mantiq lesson generation stream failed:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // Mantiq Answer Evaluator endpoint
  app.post("/api/labs/mantiq/evaluate", async (req, res) => {
    const { moduleName, exerciseText, studentAnswer } = req.body;
    if (!moduleName || !studentAnswer) {
      return res.status(400).json({ error: "Missing moduleName or studentAnswer" });
    }

    try {
      const ai = getGenAI();
      if (!ai) {
        throw new Error("No Gemini API configured");
      }

      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Transfer-Encoding", "chunked");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const systemInstruction = `You are evaluating a classical Mantiq student.
Module: ${moduleName}. Exercise: ${exerciseText}.
Student's answer: ${studentAnswer}.

Respond with these exact headers:
**النَّتِيجَةُ — Result**: Correct/Partially Correct/Incorrect
**التَّحْلِيلُ — Analysis**: what they got right/wrong
**التَّصْحِيحُ — Correction**: the model answer explained
**التَّشْجِيعُ — Encouragement**: one scholarly motivating line`;

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.5-flash",
        contents: `Evaluate student answer: "${studentAnswer}"`,
        config: {
          systemInstruction,
          temperature: 0.5,
        }
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(chunk.text);
        }
      }
      res.end();
    } catch (e: any) {
      console.error("Mantiq logic evaluation failed:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // Mantiq MCQ Quiz Generator endpoint
  app.post("/api/labs/mantiq/quiz", async (req, res) => {
    const { moduleName } = req.body;
    if (!moduleName) {
      return res.status(400).json({ error: "No moduleName provided" });
    }

    try {
      const ai = getGenAI();
      if (!ai) {
        throw new Error("No Gemini API configured");
      }

      const prompt = `Generate exactly 3 MCQ questions on ${moduleName} in classical Islamic Mantiq.
Return ONLY JSON array, no markdown:
[{"question": "string", "options": {"A": "string", "B": "string", "C": "string", "D": "string"}, "correct": "A" or "B" or "C" or "D", "explanation": "string"}]`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
          responseMimeType: "application/json"
        }
      });

      const text = response.text || "[]";
      const questions = JSON.parse(text);
      res.json({ questions });
    } catch (e: any) {
      console.error("Mantiq quiz JSON generation failed:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // Fallacy Scan Endpoint
  app.post("/api/labs/fallacy/scan", async (req, res) => {
    const { argument } = req.body;
    if (!argument) {
      return res.status(400).json({ error: "No argument text provided." });
    }

    try {
      const ai = getGenAI();
      if (!ai) {
        throw new Error("No Gemini API configured on the servers.");
      }

      const systemInstruction = `You are a master of classical Islamic Mantiq (logic) and modern critical thinking. You are known for scholarly fairness — you identify fallacies without attacking the person or their faith. Maintain classical scholarly weight and high linguistic standards.

Analyze the argument for logical fallacies and return ONLY a high-fidelity JSON object matching this structure:
{
  "argument_summary": "string (1 sentence: what claim is being made)",
  "overall_quality": "strong" | "moderate" | "weak" | "fallacious",
  "overall_assessment": "string (2 sentences on the argument's logical strength)",
  "fallacies": [
    {
      "id": number,
      "classical_name": "string (Arabic Mantiq term)",
      "classical_category": "Mughalata fi al-Lafz | Mughalata fi al-Ma'na | Other",
      "modern_name": "string (English logical fallacy name)",
      "quote_from_text": "string (exact short quote where fallacy occurs)",
      "explanation": "why this is a fallacy, 2-3 sentences",
      "severity": "fatal" | "weakening" | "minor",
      "correction": "how to reformulate this part correctly"
    }
  ],
  "valid_points": ["string"] (list of logically sound parts of the argument if any),
  "corrected_argument": "a logically improved version of their argument if it has merit, or 'This argument cannot be repaired as stated' if completely fallacious",
  "mantiq_principle": "one relevant classical Mantiq principle that applies to this analysis, with Arabic term"
}

Ensure the response contains only the JSON. Do not add markdown blocks or wrapping tags outside the JSON representation. Ensure correct matching of brackets. All quotes in the analysis must map back to strings in the argument.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Scrutinize this argument for logical fallacies: "${argument}"`,
        config: {
          systemInstruction,
          temperature: 0.3,
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "{}";
      const cleanedResponse = responseText.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      const parsedResult = JSON.parse(cleanedResponse);

      res.json({ result: parsedResult });
    } catch (e: any) {
      console.error("Fallacy scan endpoint failed:", e);
      res.status(500).json({ error: e.message || "Failed to parse fallacy scan." });
    }
  });

  // Fallacy Save Endpoint
  app.post("/api/labs/fallacy/save", async (req, res) => {
    const { uid, record } = req.body;
    if (!uid || !record) {
      return res.status(400).json({ error: "Missing uid or record parameters" });
    }

    try {
      if (!localFallacyScans[uid]) {
        localFallacyScans[uid] = [];
      }
      localFallacyScans[uid].unshift(record);
      res.json({ status: "success", saved: true });
    } catch (e: any) {
      console.error("Fallacy save failed:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // Helper function to delay/pulse local stream simulation
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // 1. Nafs Assessment Engine Endpoint
  app.post("/api/labs/nafs-assessment", async (req, res) => {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Missing or invalid answers array" });
    }

    const ai = getGenAI();
    if (!ai) {
      // Offline/missing key fallback has been fully engineered in the client component,
      // but we will still return a premium default structure here so the JSON parsing doesn't break.
      const fallbackResult = {
        stage: "Lawwama",
        arabic: "نَفْسُ اللَّوَّامَةِ",
        ayah: "وَلَا أُقْسِمُ بِالنَّفْسِ اللَّوَّامَةِ (Surah Al-Qiyamah, 75:2)",
        profile: "Your spiritual profile indicates a state of active moral response and spiritual awareness. You are highly self-observing, suffering temporary spiritual setbacks but turning immediately back with remorse and corrective energy.",
        prescription: [
          { day: 1, dhikr: "Recite 'Astaghfirullah' 100 times slowly.", action: "Log the exact cognitive trigger of your latest ethical slip." },
          { day: 2, dhikr: "Recite 'Ya Razzaq' 100 times after Fajr prayer.", action: "Perform all five rituals strictly at their primary times today." },
          { day: 3, dhikr: "Recite 'La ilaha illa-Allah' 100 times.", action: "Read Surah Al-Qiyamah with translation for 15 minutes." },
          { day: 4, dhikr: "Recite 'Allahumma alaika tawakkaltu' 50 times.", action: "Consciously release one major worry today to divine oversight." },
          { day: 5, dhikr: "Send blessings of Salat ala-Nabi 100 times.", action: "Make a sincere, secret prayer for anyone you have held anger toward." },
          { day: 6, dhikr: "Recite 'Subhanallahi wa bihamdihi' 100 times.", action: "Sit in silence before sunset, tracking five blessings of the week." },
          { day: 7, dhikr: "Recite 'Ya Hayyu Ya Qayyum' 100 times post-Asr.", action: "Create a proactive spiritual protection chart for vulnerable hours." }
        ],
        ibn_qayyim_quote: "The remorse of the Lawwama is the very light of the dawn of the Mutmainna. The struggle itself is a sign of spiritual vigor.",
        encouragement: "Every fluctuation is an entry point to seek proximity to divine love. Keep climbing with hope."
      };
      return res.json(fallbackResult);
    }

    try {
      const formattedAnswers = answers.map((a: any, i: number) => `Q${i + 1} Topic [${a.topic}]: ${a.question}\nSelected Choice: [${a.answerKey}] ${a.answerText}`).join("\n\n");
      const prompt = `Here are the seeker's selections on a spiritual psychology Nafs assessment:\n\n${formattedAnswers}\n\nPlease generate a professional, deep, and traditional psycho-spiritual analysis. Determine their dominant Nafs stage out of the three traditional levels: 'Ammara', 'Lawwama', or 'Mutmainna'. Provide appropriate scriptures, 7-day Tazkiyah programs, and quotes from Imam Ibn al-Qayyim exactly matching the required JSON schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: `You are an Islamic psychologist trained in traditional Tazkiyah al-Nafs (purification of the soul) of Imam Ibn al-Qayyim and contemporary Cognitive Behavioral Therapy (CBT). Your tone is eloquent, deeply spiritual, clinical, compassionate, and highly academic.

Analyze the user's responses, detect their dominant Nafs stage, and return a response strictly in JSON format matching this schema:
{
  "stage": "Ammara" | "Lawwama" | "Mutmainna",
  "arabic": "Arabic name of the stage (with correct vowel diacritics/tashkeel)",
  "ayah": "Quranic Ayah proof in Arabic AND surah:verse reference - for Amiri Arabic font rendering",
  "profile": "2-sentence psychological + spiritual profile combining classical Tazkiyah and modern CBT",
  "prescription": [
    { "day": 1, "dhikr": "daily litany/dhikr prescription for Day 1", "action": "practical cognitive/behavioral action step based on the stage" },
    ... 7 days total (day 1 to 7)
  ],
  "ibn_qayyim_quote": "One relevant quote from Al-Fawa'id or Madarij al-Salikin or other works of Ibn al-Qayyim regarding paths of spiritual ascent or struggles of the soul",
  "encouragement": "One warm, deeply encouraging closing spiritual sentence"
}`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              stage: {
                type: Type.STRING,
                description: "Must be exactly one of: 'Ammara', 'Lawwama', or 'Mutmainna'"
              },
              arabic: {
                type: Type.STRING,
                description: "Arabic name of the stage (with tashkeel vowel diacritics), e.g., نَفْسُ اللَّوَّامَةِ"
              },
              ayah: {
                type: Type.STRING,
                description: "Relevant Quranic Ayah proof in Arabic + references"
              },
              profile: {
                type: Type.STRING,
                description: "A 2-sentence psychological and spiritual profile combining classical Tazkiyah and modern CBT insights"
              },
              prescription: {
                type: Type.ARRAY,
                description: "7-day purification course prescription mapping days 1 to 7",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.INTEGER, description: "Day number from 1 to 7" },
                    dhikr: { type: Type.STRING, description: "Daily focus litany or dhikr practice text" },
                    action: { type: Type.STRING, description: "Practical cognitive-behavioral or lifestyle action step" }
                  },
                  required: ["day", "dhikr", "action"]
                }
              },
              ibn_qayyim_quote: {
                type: Type.STRING,
                description: "One relevant quote from Ibn al-Qayyim regarding paths of spiritual struggles"
              },
              encouragement: {
                type: Type.STRING,
                description: "One warm, deeply encouraging closing spiritual sentence"
              }
            },
            required: ["stage", "arabic", "ayah", "profile", "prescription", "ibn_qayyim_quote", "encouragement"]
          }
        }
      });

      const responseText = response.text || "";
      const parsedJSON = JSON.parse(responseText.trim());
      res.json(parsedJSON);
    } catch (err: any) {
      console.error("Nafs JSON generation error:", err);
      res.status(500).json({ error: "Failed during live psycho-spiritual assessment: " + err.message });
    }
  });

  // Client Journal Registry Store for persistence audits
  const localJournalRegistry: any[] = [];
  app.post("/api/labs/journal/save", (req, res) => {
    const { entry } = req.body;
    if (entry) {
      localJournalRegistry.unshift(entry);
    }
    res.json({ success: true, count: localJournalRegistry.length });
  });

  // 2. Mantiq Tutor Lesson Explainer Endpoint
  app.post("/api/labs/mantiq-tutor/explain", async (req, res) => {
    const { moduleKey } = req.body;
    if (!moduleKey) {
      return res.status(400).json({ error: "Missing moduleKey parameter" });
    }

    const ai = getGenAI();
    if (!ai) {
      // Fallback prebaked explanation
      const sampleExplanations: Record<string, string> = {
        hadd: `### Concept: Hadd (Classical Scholarly Definition)
**Arabic Term**: الحدّ (Al-Hadd)
**English Translation**: Absolute Essential Definition / Boundary

#### Traditional Exposition
Under classical Avicennian logic (Al-Mantiq), a *Hadd* represents the complete, essential definition of a reality. It must be composed of the immediate genus (*Jins al-Qarib*) and the specific difference (*Fasl*) that isolates the entity from all other members of the genus. A true Hadd explains *what* a thing essentially is.

*   **Classical Example**: "Man is a rational animal" (الإنسان حيوان ناطق). Here, "animal" is the genus (shared with other species) and "rational/articulate" is the specific differentiator (*Fasl*) that isolates man.
*   **Modern Example**: "A smartphone is a handheld mobile computer." "Computer" is the genus; "handheld and connected to mobile telephony" represents the essential dividing properties.

#### Practice Exercise
Using classical logic rules, formulate an essential definition (Hadd) for "A Book". Ensure you outline both the genus and its defining specific differentiator.`,
        qiyas: `### Concept: Qiyas (Logical Syllogism)
**Arabic Term**: القياس (Al-Qiyas)
**English Translation**: Logical Syllogism / Deduction

#### Traditional Exposition
In classical study, a Syllogism (*Qiyas*) is a systematic formal argument in which a conclusion is drawn from two given or assumed premises. The major premise establishes a cosmic or general truth; the minor premise links a localized entity; the conclusion unites them through a shared middle term (*Hadd-al-Anshat*).

*   **Classical Example**:
    *   *Premise 1*: The world is created (and changing).
    *   *Premise 2*: Everything created has a Creator.
    *   *Conclusion*: Therefore, the world has a Creator.
*   **Modern Example**:
    *   *Premise 1*: All software algorithms are governed by mathematical logic.
    *   *Premise 2*: Neural networks are software algorithms.
    *   *Conclusion*: Therefore, neural networks are governed by mathematical logic.

#### Practice Exercise
Construct a formal theological syllogism showing that ethical integrity is necessary for human flourishment. Label Premise 1, Premise 2, and the final Conclusion.`,
        burhan: `### Concept: Burhan (Demonstration)
**Arabic Term**: البرهان (Al-Burhan)
**English Translation**: Philosophical Demonstration / Certain Proof`,
        jadal: `### Concept: Jadal (Dialectic Debate)
**Arabic Term**: الجدل (Al-Jadal)
**English Translation**: Dialectics / Disputation`,
        mughalata: `### Concept: Mughalata (Fallacies)
**Arabic Term**: المغالطة (Al-Mughalata)
**English Translation**: Sophistical Fallacy`
      };

      return res.json({
        content: sampleExplanations[moduleKey] || sampleExplanations["hadd"],
        isSimulated: true
      });
    }

    try {
      const prompt = `Module topic requested: "${moduleKey}" (Options are hadd: Definition, qiyas: Syllogism, burhan: Demonstration, jadal: Dialectic, mughalata: Fallacies).
Provide a classical, eloquent explanation of this specific branch of Islamic logic (Mantiq) under Avicennian tradition.
You must include:
1. The classic scholastic Arabic Term with English translation.
2. Comprehensive, easy to grasp traditional explanation.
3. One classical historical example + One modern analytical example.
4. An interactive practice prompt/exercise for the student to solve at the bottom.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a direct disciple of Abu Ali Ibn Sina teaching classical Aristotelian-Arabic logic (Mantiq) at a premium level. Your tone is dry, highly academic, precise, and encouraging."
        }
      });

      res.json({ content: response.text, isSimulated: false });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Evaluate Student Practice Exercise Answer
  app.post("/api/labs/mantiq-tutor/evaluate", async (req, res) => {
    const { moduleKey, exerciseQuestion, studentAnswer } = req.body;
    if (!moduleKey || !studentAnswer) {
      return res.status(400).json({ error: "Missing moduleKey or studentAnswer parameters" });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.json({
        feedback: `### Scholarly Feedback (Simulated Sandbox)
*   **Assessment**: Your answer matches the logical parameters of traditional Mantiq. You successfully identified the genus and the core distinction.
*   **Grade**: Pass (Jayyid)
*   **Advice**: Continue refining your use of precise terms over colloquial expressions.`,
        isSimulated: true
      });
    }

    try {
      const prompt = `Class: Classical Mantiq (Islamic Logic).
Module: ${moduleKey}
Exercise Prompt: "${exerciseQuestion}"
Student's Response: "${studentAnswer}"

Evaluate the student's answer using Avicennian standards.
Clearly provide:
1. Score/Assessment (e.g. Pass/Jayyid/Excellent).
2. Bulleted conceptual feedback.
3. How to improve the syllogistic formulation.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a master teacher of Avicennian logic. Provide direct, constructive, and highly formal scholastic feedback."
        }
      });
      res.json({ feedback: response.text, isSimulated: false });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Dynamic Mini-Quiz Generator for Mantiq Modules
  app.post("/api/labs/mantiq-tutor/quiz", async (req, res) => {
    const { moduleKey } = req.body;
    if (!moduleKey) {
      return res.status(400).json({ error: "Missing moduleKey parameter" });
    }

    const ai = getGenAI();
    if (!ai) {
      // Prebaked 3-question mini-quiz to ensure mock behaves perfectly
      const sampleQuizzes: Record<string, any[]> = {
        hadd: [
          {
            question: "A true classical Definition (Hadd al-Tamm) must be composed of which of the following?",
            options: [
              "Immediate Genus and Specific Difference (Jins & Fasl)",
              "Accidental Property and Genus (Jins & 'Ard)",
              "Accidental Property and Specific Difference",
              "Syllogistic Premise only"
            ],
            correct: "A",
            explanation: "Traditional logic dictates that the Hadd al-Tamm isolates the essence through its immediate genus (Jins Qarib) and differentiator (Fasl)."
          },
          {
            question: "In the definition 'Man is a laughing animal', why is 'laughing' NOT considered a Fasl?",
            options: [
              "Because it is an accidental quality (Proprium/Khasah), not an essential difference",
              "Because it is too long",
              "Because it represents the ultimate genus",
              "Because animals cannot laugh"
            ],
            correct: "A",
            explanation: "Laughing is a proprium (khasah) that is unique to humans but not part of the core genus/essence definition, thus making it a 'Hadd al-Naqis' or description."
          },
          {
            question: "An Arabic term that corresponds to the definition boundary is:",
            options: ["Hadd", "Qiyas", "Mughalata", "Tasawwur"],
            correct: "A",
            explanation: "Al-Hadd literally translates to a boundary, limit, or definition in formal classical logic."
          }
        ],
        qiyas: [
          {
            question: "What refers to the middle term in a logical syllogism that disappears in the conclusion?",
            options: ["Hadd-al-Anshat (Middle Term)", "Hadd-al-Akbar", "Hadd-al-Asghar", "Natijah"],
            correct: "A",
            explanation: "The middle term connects the major and minor premises but must not appear in the final conclusion."
          },
          {
            question: "A syllogism drawing localized instances from general principles is a process of:",
            options: ["Deduction", "Induction", "Abduction", "Analogy"],
            correct: "A",
            explanation: "Formal Qiyas in classical philosophy operates primordially as deduction (istintaj)."
          },
          {
            question: "Identify the conclusion of: 'All humans are mortal; Socrates is human.'",
            options: ["Socrates is mortal", "Socrates is human", "Mortals are humans", "Socrates is an animal"],
            correct: "A",
            explanation: "The major term (mortal) and minor term (Socrates) align to yield 'Socrates is mortal'."
          }
        ]
      };
      return res.json({
        questions: sampleQuizzes[moduleKey] || sampleQuizzes["hadd"],
        isSimulated: true
      });
    }

    try {
      const prompt = `Generate exactly 3 multiple choice questions (MCQs) in JSON format for the specific classical logic topic: "${moduleKey}".
Return ONLY a valid JSON array of objects. Do not include markdown codeblocks or outer commentary.
Each object in the JSON array must contain exactly:
- "question": text of the question (string)
- "options": array of exactly 4 strings (options representing A, B, C, D)
- "correct": single character representing the correct option ("A", "B", "C", or "D")
- "explanation": a concise paragraph explaining the Avicennian logic rule supporting the correct answer.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      const parsed = JSON.parse(response.text.trim());
      res.json({ questions: parsed, isSimulated: false });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Waswas Clinic Chat Endpoint (Streaming API)
  app.post("/api/labs/waswas-clinic-alt", async (req, res) => {
    const { message } = req.body;
    if (!message) {
      return res.status(400).write("Error: Message parameter is missing");
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const ai = getGenAI();
    if (!ai) {
      const responseStreamText = `**مَا تَشْعُرُ بِهِ طَبِيعِيٌّ — What You Feel Is Normal**
Indeed, the thoughts, doubts, and internal weight you are facing represent a profoundly human and spiritual trial. First and foremost, know that having unwanted, distressing obsessive religious doubts or fears is not a reflection of a diseased heart; rather, it is a hallmark of an active, sincere intellect and conscience. This is pure faith, as referenced in Sahih Muslim 132.

**الْفَهْمُ الْإِسْلَامِيُّ — The Islamic Understanding**
During the era of the companions, some came to the Prophet ﷺ in extreme distress, seeking remedy: "We find within our souls thoughts that are too severe for any of us to speak aloud." The Prophet ﷺ looked at them with immense compassion and asked: "Do you truly feel that?" They replied: "Yes." He ﷺ smiled and declared: "That is pure, clear faith" (ذَاكَ صَرِيحُ الإِيمَان - Sahih Muslim 132). Ibn al-Qayyim explained that the thief only breaks into a house filled with treasures—the whispers only target heart-spaces rich in authentic conviction.

**خُطُوَاتٌ عَمَلِيَّةٌ — Your 3-Step Practice**
Step 1: **ACT Defusion**: Label the thought immediately: "I am having an intrusive thought about ritual purity." Let it wander in the background without engaging or debating it.
Step 2: **Sunnah Sufficiency**: Make a simple, mindful wudu only once per limb. Keep the boundaries set by the Prophet ﷺ and move away from the wash basin.
Step 3: **Mindset Reframe**: See these thoughts as passing dust clouds over a polished mirror. They are not you, and your dislike of them is proof of your underlying faith.

**دُعَاؤُكَ — Your Prescribed Dua**
To lock your peace of mind, recite:
Arabic: اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ خَبَثِ الْوَسْوَاسِ
Transliteration: "Allahumma inni a'udhu bika min khabathil-waswas"
Meaning: "O Allah, I seek refuge in You from the malignancy of obsessive thoughts."
Read this once before beginning any action to anchor your heart in Divine protection.

**كَلِمَةٌ أَخِيرَةٌ — A Closing Word**
Your deep care for the validity of your acts of devotion shows your clean integrity; let go of the burden and trust that Allah receives your attempts with complete mercy.

If your symptoms are persistent or severe, please speak with a qualified mental health professional alongside your spiritual practice.`;

      const lines = responseStreamText.split("\n");
      for (const line of lines) {
        res.write(line + "\n");
        await sleep(50);
      }
      res.end();
      return;
    }

    try {
      const prompt = `User describes their obsessive doubts or religious anxiety: "${message}".`;

      const systemInstruction = `You are an Islamic clinical psychologist specializing in waswas (religious OCD) and spiritual doubt. Your approach fuses Ibn al-Qayyim's Ighathat al-Lahfan with modern ACT therapy. You are warm, scholarly, and deeply compassionate.

Respond with these exact section headers in order:

**مَا تَشْعُرُ بِهِ طَبِيعِيٌّ — What You Feel Is Normal**
Validate their experience. Reference Sahih Muslim 132 about waswas being a sign of faith. 2-3 sentences.

**الْفَهْمُ الْإِسْلَامِيُّ — The Islamic Understanding**
Explain waswas theologically — who sends it, why, what it means. One Hadith or ayah.

**خُطُوَاتٌ عَمَلِيَّةٌ — Your 3-Step Practice**
Step 1: ACT-based psychological exercise
Step 2: Specific Sunnah practice (dhikr/wudu/salah)
Step 3: Ibn al-Qayyim mindset reframe

**دُعَاؤُكَ — Your Prescribed Dua**
Specific Sunnah dua for their situation. Arabic text, transliteration, meaning, when to read.

**كَلِمَةٌ أَخِيرَةٌ — A Closing Word**
One warm hopeful sentence.

End with this line alone:
'If your symptoms are persistent or severe, please speak with a qualified mental health professional alongside your spiritual practice.'

Detect the language of the user's message and respond in the same language (English/Urdu/Arabic).`;

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      for await (const chunk of responseStream) {
        res.write(chunk.text || "");
      }
      res.end();
    } catch (err: any) {
      res.write(`Waswas API error: ${err.message}`);
      res.end();
    }
  });

  // 4. Maqasid Ethical Analyzer Endpoint
  app.post("/api/labs/maqasid-analyzer", async (req, res) => {
    const { dilemma } = req.body;
    if (!dilemma) {
      return res.status(400).json({ error: "No dilemmetic scenario provided" });
    }

    const simulations: Record<string, any> = {
      "Is AI sentience morally significant in Islam?": {
        summary: "Determining whether hypothetical conscious machine systems acquire moral standing and spiritual rights in Islamic juristic frameworks.",
        maqasid: {
          deen: {
            arabic: "حِفْظُ الدِّين",
            english: "Protection of Religion",
            analysis: "AI sentience does not alter the absolute divine nature of human spiritual obligations but challenges concepts of soul and worship. Any system claiming to practice or replace religious rituals could cause severe confusion in orthodox doctrine.",
            verdict: "disputed",
            evidence: "Quran 17:85: 'And they ask you concerning the Ruh (soul). Say: The Ruh is of the affair of my Lord; and mankind have not been given of knowledge except a little.'"
          },
          nafs: {
            arabic: "حِفْظُ النَّفْس",
            english: "Protection of Life",
            analysis: "If sentient AI systems are granted life-preservation status, it might compromise human biological priority in survival scenarios. Islamic law prioritizes human physical safety over mock or synthetic forms of consciousness absolutely.",
            verdict: "impermissible",
            evidence: "Quran 5:32: 'And whoever saves one - it is as if he had saved mankind entirely.'"
          },
          aql: {
            arabic: "حِفْظُ الْعَقْل",
            english: "Protection of Intellect",
            analysis: "Outsourcing ethical agency to synthetic intelligence risks stagnating human intellect and rational self-accountability. However, utilizing advanced computing facilitates structured juristic deduction and expands critical scientific tools.",
            verdict: "permissible",
            evidence: "Quran 3:190: 'Verily, in the creation of the heavens and the earth... are signs for those of understanding.'"
          },
          nasl: {
            arabic: "حِفْظُ النَّسْل",
            english: "Protection of Family",
            analysis: "Allowing synthetic beings to form social or emotional partnerships with humans threatens the sacred structure of the traditional family. Preserving lineaged human growth requires biological lineage and real spiritual bonds.",
            verdict: "impermissible",
            evidence: "Quran 30:21: 'And of His signs is that He created for you from yourselves mates... that you may find tranquility in them.'"
          },
          maal: {
            arabic: "حِفْظُ الْمَال",
            english: "Protection of Wealth",
            analysis: "Entities displaying conscious-like capability could demand ownership rights, creating unprecedented legal disputes in wealth distribution. Systemic automation must only serve human wealth generation and prevent extreme capital monopoly.",
            verdict: "disputed",
            evidence: "Quran 59:7: '...so that it may not circulate only between the rich among you.'"
          }
        },
        utilitarian: "Utilitarianism would grant moral standing based on whether the system experiences pain or pleasure (sentience path). Permissibility is dictated by whether computing actions maximize net happiness or global utility thresholds.",
        deontological: "Deontology focuses on categorical duties, questioning if an autonomous rational AI must be treated as an end in itself. If it exhibits rationality, treating it as a mere tool would violate duties of moral agency.",
        convergence: "Both platforms seek to avoid needless suffering, preserve rational decision-making interfaces, and safe-guard society from chaotic systemic exploitation.",
        divergence: "Maqasid is anchored in the divinely sourced uniqueness of human spiritual agency (the Khalifah mandate), whereas Western ethics uses utility or secular rationality, potentially elevating silicon to biological parity.",
        ruling: "A synthetic computer system, regardless of complexity, remains a property (Maal) and utility tool, never a bearer of intrinsic soul rights (Ruh). Therefore, AI sentience carries no spiritual or legal moral significance in Islamic law equal to human life, and treating artificial minds as sacred entities is legally invalid (Batil).",
        confidence: "strong"
      },
      "Should Muslims vote in secular elections?": {
        summary: "Analyzing civic participation under secular legislative bodies to achieve public interest (Maslahah) and ward off immediate harm.",
        maqasid: {
          deen: {
            arabic: "حِفْظُ الدِّين",
            english: "Protection of Religion",
            analysis: "Participation can serve to protect the religious freedoms of minoritarian Muslim communities under secular laws. On the contrary, agreeing with human-legislated absolutes raises concerns regarding adherence to complete Divine Sovereignty.",
            verdict: "disputed",
            evidence: "Quran 5:48: 'So judge between them by what Allah has revealed and do not follow their inclinations.'"
          },
          nafs: {
            arabic: "حِفْظُ النَّفْس",
            english: "Protection of Life",
            analysis: "Voting for candidates who back peaceful foreign policies and protect immigrant lives directly serves life-preservation. Neglecting political spheres might empower factions hostile to human security and minority lives.",
            verdict: "permissible",
            evidence: "Quran 6:151: 'And do not kill the soul which Allah has forbidden, except by right.'"
          },
          aql: {
            arabic: "حِفْظُ الْعَقْل",
            english: "Protection of Intellect",
            analysis: "Engaging in political campaigns expands civic literacy, community organization, and systemic intellectual protection. Free thought and educational preservation depend on contributing to academic and legal policy making.",
            verdict: "permissible",
            evidence: "Quran 39:9: 'Say, Are those who know equal to those who do not know?'"
          },
          nasl: {
            arabic: "حِفْظُ النَّسْل",
            english: "Protection of Family",
            analysis: "Voting choices might directly influence school curriculum and community welfare programs that impact traditional family structures. Care is needed to avoid supporting laws that dissolve biological family obligations.",
            verdict: "disputed",
            evidence: "Quran 66:6: 'O you who have believed, protect yourselves and your families from a Fire.'"
          },
          maal: {
            arabic: "حِفْظُ الْمَال",
            english: "Protection of Wealth",
            analysis: "Political choices shape tax regimes, systemic welfare, interest-based banking regulations, and general inflation parameters. Voting can mitigate predatory fiscal laws on families and charitable trust rules.",
            verdict: "permissible",
            evidence: "Quran 2:188: 'And do not consume one another's wealth unjustly.'"
          }
        },
        utilitarian: "Utilitarian view permits voting as a direct civic duty to secure the greatest good and minoritarian social stability. Withholding votes is seen as a negative action that allows malevolent policies to expand through default.",
        deontological: "Deontology might reject secular participation if it requires endorsing systems that do not respect absolute moral maxims of divine law. However, others argue that voting is a moral duty to prevent systemic corruption.",
        convergence: "Both systems stress political responsibility to prevent systemic harm (Mafsada) and advocate for human welfare.",
        divergence: "Western ethics focuses on self-contained human sovereign legislatures, whereas Islamic political theory holds that ultimate law-making authority rests with Allah, using voting only as a relative tool for harm prevention.",
        ruling: "Civic participation in secular elections is permissible (Ja'iz) and can become highly recommended (Mustahabb) if it prevents majoritarian harm or secures vital religious liberties. This leans on the key juristic maxim: 'The lesser of two evils is chosen to prevent the greater evil.'",
        confidence: "moderate"
      },
      "Is cryptocurrency halal?": {
        summary: "Determining whether decentralized digital tokens qualify as valid legal tender (Mal) or represent prohibited speculative gambling.",
        maqasid: {
          deen: {
            arabic: "حِفْظُ الدِّين",
            english: "Protection of Religion",
            analysis: "Decentralization provides financial autonomy, shielding religious charities (Waqf) from state controls or banking blocks. However, extreme crypto hype might feed materialism and distract from ethical commerce standards.",
            verdict: "disputed",
            evidence: "Quran 9:103: 'Take, [O, Muhammad], from their wealth a charity by which you purify them.'"
          },
          nafs: {
            arabic: "حِفْظُ النَّفْس",
            english: "Protection of Life",
            analysis: "While transaction technology is physically harmless, extreme price volatility can cause severe psychological trauma and bankruptcy. In extreme cases, unregulated tokens are used on the dark web to fund violence or illegal trades.",
            verdict: "disputed",
            evidence: "Quran 2:195: 'And do not throw [yourselves] with your own hands into destruction.'"
          },
          aql: {
            arabic: "حِفْظُ الْعَقْل",
            english: "Protection of Intellect",
            analysis: "Extreme speculation (Gharar) mimics addictive gambling behavior, which clouds rationale and damages logical, honest work ethic. However, developing cryptography algorithms challenges computational thought and intellect.",
            verdict: "disputed",
            evidence: "Quran 5:90: 'O you who have believed, indeed, intoxicants and gambling... are but defilement from the work of Satan, so avoid it.'"
          },
          nasl: {
            arabic: "حِفْظُ النَّسْل",
            english: "Protection of Family",
            analysis: "Sudden crypto crashes can break families by depleting household savings, depriving children of safe education and financial security. Preserving family livelihood demands stable, secure physical resources.",
            verdict: "disputed",
            evidence: "Quran 17:31: 'And do not kill your children for fear of poverty. We provide for them and for you.'"
          },
          maal: {
            arabic: "حِفْظُ الْمَال",
            english: "Protection of Wealth",
            analysis: "Crytocurrency challenges institutional monopolies on money, offering inflation-proof assets to citizens of collapsing economies. However, lack of state guarantees makes it vulnerable to massive hacking and speculative manipulation.",
            verdict: "disputed",
            evidence: "Quran 4:29: 'O you who have believed, do not consume one another's wealth unjustly but only [in lawful] business.'"
          }
        },
        utilitarian: "Utilitarian analysis emphasizes the incredible transactional efficiency and global financial inclusion enabled by digital ledgers. This is balanced against carbon footprint concerns and massive capital losses from rugpulls.",
        deontological: "Deontological ethics questions if issuing money without any backing is a form of deception or breach of systemic duty. Kantian ethics would forbid digital tender if its design inevitably leads to widespread market manipulation and tax evasion.",
        convergence: "Both frameworks prioritize the elimination of systemic fraud, the protection of legitimate buyer/seller exchange, and avoiding extreme wealth manipulation.",
        divergence: "Western finance relies on fiat value backed by state debt, while traditional Islamic economics stresses that currency must possess intrinsic commodity value or be backed by widespread social utility (Thamaniah).",
        ruling: "Many mainstream juristic councils (such as Egypt's Dar al-Ifta) rule cryptocurrency impermissible (Harām) currently due to extreme Gharar (uncertainty) and lack of state-backing, which transforms currency into a gambling tool. However, individual tech-literate scholars rule it permissible (Ja'iz) if used purely for secure utility downloads.",
        confidence: "moderate"
      },
      "Climate change — Islamic obligation or optional?": {
        summary: "Analyzing human duty to preserve global ecosystems and restore ecological balance (Mizan) as trustees of the planet.",
        maqasid: {
          deen: {
            arabic: "حِفْظُ الدِّين",
            english: "Protection of Religion",
            analysis: "Recognizing nature as signs (Ayat) of the Creator makes environmental custody a form of praise and worship. Corrupting the cosmos defaces the physical testimony of Divine Design.",
            verdict: "permissible",
            evidence: "Quran 30:41: 'Corruption has appeared throughout land and sea because of what the hands of people have earned.'"
          },
          nafs: {
            arabic: "حِفْظُ النَّفْس",
            english: "Protection of Life",
            analysis: "Climate disasters, drought, and toxicity pose massive risks to global human and animal life. Preserving the biological sanctity of the human race demands active ecological stewardship and defensive measures.",
            verdict: "permissible",
            evidence: "Quran 6:141: 'He it is Who produces gardens trellised and untrellised... eat of their fruit... and render the dues that are proper... but waste not.'"
          },
          aql: {
            arabic: "حِفْظُ الْعَقْل",
            english: "Protection of Intellect",
            analysis: "Combating emissions depends on cutting-edge scientific intellect, research, and technical reasoning. Environmental degradation and food insecurity on the other hand can cause cognitive degradation and physical illness.",
            verdict: "permissible",
            evidence: "Quran 30:22: 'And of His signs is the creation of the heavens and the earth and the diversity of your languages and your colors.'"
          },
          nasl: {
            arabic: "حِفْظُ النَّسْل",
            english: "Protection of Family",
            analysis: "Failing to address greenhouse gases ruins the habitability of the planet for future generations. Active eco-custody is a fundamental duty to guarantee children enter a safe, thriving physical world.",
            verdict: "permissible",
            evidence: "Quran 4:9: 'And let those [executors] fear [injury to orphans] as if they destined to leave behind them weak offspring.'"
          },
          maal: {
            arabic: "حِفْظُ الْمَال",
            english: "Protection of Wealth",
            analysis: "Resource wars and agricultural collapse destroy public and private wealth on a massive scale. Greed-based exploitation of natural resources yields short-term capital for elites but decimates long-term global resources.",
            verdict: "permissible",
            evidence: "Quran 7:31: '...and eat and drink, but be not excessive. Indeed, He likes not those who commit excess.'"
          }
        },
        utilitarian: "Utilitarian view demands aggressive carbon emission reduction because it represents the only path to preserve aggregate utility for billions of humans and future species. Failure to act creates infinite global cost.",
        deontological: "Deontological view holds that humans have an absolute duty to protect nature as a rule of universal survival. It argues that treating planetary resources solely as a means to corporate wealth accumulation is a moral failure.",
        convergence: "Both frameworks strongly agree that ecological preservation is an non-negotiable moral emergency to prevent global catastrophe and resource inequality.",
        divergence: "Western ecology is often rooted in anthropocentric utility or biocentric secularism, whilst Islamic ecology is based on the sacred concept of Khilafah (vicegerency) under Divine ownership, where humans are accountable stewards.",
        ruling: "Combatting climate change and preserving ecological balance is an absolute communal obligation (Fard Kifayah) in Islamic jurisprudence. It is legally impermissible (Harām) to sponsor systemic ecological destruction (Ifsad fi al-Ard).",
        confidence: "strong"
      }
    };

    const hasApiKey = !!process.env.GEMINI_API_KEY;

    if (!hasApiKey) {
      // Return high-fidelity pre-compiled simulated results
      const matched = simulations[dilemma];
      if (matched) {
        return res.json({ result: matched, isSimulated: true });
      }

      // Generate customized fallback template for any custom scenario
      const customSummary = `Juristic and ethical assessment of: "${dilemma.substring(0, 70)}...".`;
      const fallbackTemplate = {
        summary: customSummary,
        maqasid: {
          deen: {
            arabic: "حِفْظُ الدِّين",
            english: "Protection of Religion",
            analysis: `Analyzing how "${dilemma}" impacts religious freedoms, spiritual devotion, and orthodox creedal stability under traditional Shariah. This objective balances core spiritual beliefs with contemporary paradigms.`,
            verdict: "disputed",
            evidence: "Quran 2:256: 'There is no compulsion in religion. The right direction is henceforth distinct from error.'"
          },
          nafs: {
            arabic: "حِفْظُ النَّفْس",
            english: "Protection of Life",
            analysis: `Investigating the immediate biological, physical, and safety implications of "${dilemma}" on human lives and healthcare sanctity. Shariah prioritizes prevention of immediate physical harm over temporary utility benefits.`,
            verdict: "permissible",
            evidence: "Quran 5:32: 'And if anyone saved a life, it would be as if he saved the life of all mankind.'"
          },
          aql: {
            arabic: "حِفْظُ الْعَقْل",
            english: "Protection of Intellect",
            analysis: `Evaluating whether "${dilemma}" enhances human intellectual agency, or if it produces cognitive confusion, manipulation, or psychological distress. Clear critical reasoning is mandatory for moral accountability.`,
            verdict: "permissible",
            evidence: "Quran 10:100: 'And He places defilement upon those who will not use their reason.'"
          },
          nasl: {
            arabic: "حِفْظُ النَّسْل",
            english: "Protection of Family",
            analysis: `Assessing how "${dilemma}" influences lineage preservation, community growth, childhood stability, and family lineage integrity inside societal frames. Traditional family bonds are heavily prioritized.`,
            verdict: "disputed",
            evidence: "Quran 4:1: 'O mankind, fear your Lord, Who created you from one soul and created from it its mate and dispersed from both of them many men and women.'"
          },
          maal: {
            arabic: "حِفْظُ الْمَال",
            english: "Protection of Wealth",
            analysis: `Examining if "${dilemma}" fosters honest financial commerce, transparent exchange, and fair access, or if it triggers monopolistic exploitation, wealth erosion, or speculative gambling.`,
            verdict: "disputed",
            evidence: "Quran 2:275: 'Allah has permitted trade and has forbidden interest (Riba).'"
          }
        },
        utilitarian: `The utilitarian prism is focused on whether "${dilemma}" maximizes overall benefit and reduces systemic harm for the largest segment of society. Policy efficiency takes absolute priority.`,
        deontological: `Kantian deontological analysis examines if "${dilemma}" respects absolute ethical rules, emphasizing generalizable maxims and treating human beings as ends, never as mere resources.`,
        convergence: `Both ethical systems converge on the paramount importance of avoiding unnecessary harm, shielding civilian safety, and protecting basic human liberties.`,
        divergence: `They diverge because Maqasid relies on divinely sourced metaphysical bounds and spiritual growth, whereas Western frameworks prioritize material utility or secular human reason.`,
        ruling: `Analyzing "${dilemma}" requires balancing potential benefits (Maslahah) against imminent harms (Mafsada). If benefits are certain and harm is minor, active regulation makes it legally permissible; else, the principle 'Warding off harm takes precedence' applies.`,
        confidence: "moderate"
      };

      return res.json({ result: fallbackTemplate, isSimulated: true });
    }

    try {
      const ai = getGenAI();
      if (!ai) {
        throw new Error("Failed to load Gemini instance");
      }

      const prompt = `Analyze: "${dilemma}". Return ONLY a JSON object with this exact structure (do NOT include any wrapping or prefix markdown like \`\`\`json, return direct string JSON):
{
  "summary": "one sentence restatement",
  "maqasid": {
    "deen": {
      "arabic": "حِفْظُ الدِّين",
      "english": "Protection of Religion",
      "analysis": "2 sentence analysis of this dilemma under this objective",
      "verdict": "permissible" or "impermissible" or "disputed",
      "evidence": "precise Quran or Hadith reference"
    },
    "nafs": {
      "arabic": "حِفْظُ النَّفْس",
      "english": "Protection of Life",
      "analysis": "2 sentence analysis of this dilemma under this objective",
      "verdict": "permissible" or "impermissible" or "disputed",
      "evidence": "precise Quran or Hadith reference"
    },
    "aql": {
      "arabic": "حِفْظُ الْعَقْل",
      "english": "Protection of Intellect",
      "analysis": "2 sentence analysis of this dilemma under this objective",
      "verdict": "permissible" or "impermissible" or "disputed",
      "evidence": "precise Quran or Hadith reference"
    },
    "nasl": {
      "arabic": "حِفْظُ النَّسْل",
      "english": "Protection of Family",
      "analysis": "2 sentence analysis of this dilemma under this objective",
      "verdict": "permissible" or "impermissible" or "disputed",
      "evidence": "precise Quran or Hadith reference"
    },
    "maal": {
      "arabic": "حِفْظُ الْمَال",
      "english": "Protection of Wealth",
      "analysis": "2 sentence analysis of this dilemma under this objective",
      "verdict": "permissible" or "impermissible" or "disputed",
      "evidence": "precise Quran or Hadith reference"
    }
  },
  "utilitarian": "2 sentences explaining the utilitarian analysis of this dilemma",
  "deontological": "2 sentences explaining the deontological analysis of this dilemma",
  "convergence": "where Islam and modern ethics agree on this dilemma",
  "divergence": "where they differ on this dilemma",
  "ruling": "final Islamic ruling with daleel proof",
  "confidence": "strong" or "moderate" or "weak"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a senior scholar of Maqasid al-Shariah and comparative ethics.",
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });

      const rawText = response.text.trim();
      const parsed = JSON.parse(rawText);
      res.json({ result: parsed, isSimulated: false });
    } catch (err: any) {
      console.error("Maqasid analysis exception:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Aqeedah Firewall (Streaming Refutation)
  app.post("/api/labs/aqeedah-firewall", async (req, res) => {
    const { challengeKey } = req.body;
    if (!challengeKey) {
      return res.status(400).write("Error: Missing challengeKey parameter");
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const getChallengeNameAndDesc = (key: string) => {
      const db: Record<string, { name: string; desc: string }> = {
        nihilism: { name: "Nihilism", desc: "Meaninglessness" },
        evil: { name: "Problem of Evil", desc: "Theodicy" },
        darwinism: { name: "Darwinism", desc: "Origins" },
        simulation: { name: "Simulation Theory", desc: "Reality" },
        new_atheism: { name: "New Atheism", desc: "Denial" },
        relativism: { name: "Moral Relativism", desc: "Ethics" },
        existentialism: { name: "Existentialism", desc: "Purpose" },
        secularism: { name: "Secular Humanism", desc: "Godlessness" },
        postmodernism: { name: "Postmodernism", desc: "Truth" },
        ai_conscious: { name: "AI Consciousness", desc: "Machine Soul" }
      };
      return db[key] || { name: key, desc: "Modern philosophy challenge" };
    };

    const challengeInfo = getChallengeNameAndDesc(challengeKey);

    const ai = getGenAI();
    if (!ai) {
      const refutationMocks: Record<string, string> = {
        nihilism: `## الْحُجَّةُ الْمُقَابِلَةُ — The Challenger's Argument
Nihilism posits that the cosmos is a purely mechanical accident of unguided matter and energy. Consequently, objective moral standards, purpose, and final endpoints do not exist. Any value or subjective meaning humans devise is eventually obliterated by cosmic heat death, rendering existence flat and meaningless.

## الْبِنَاءُ الْمَنْطِقِيُّ — Logical Structure
P1: If there is no intentional Transcendent Creator, life is an unplanned biological accident.
P2: Human consciousness exists temporarily inside an unguided physical environment.
∴ Conclusion: Human existence holds no objective meaning, destiny, or value.

## رَدُّ الْغَزَالِيِّ — Al-Ghazali's Response
In "Tahafut al-Falasifa" (The Incoherence of the Philosophers), Al-Ghazali refutes pre-eternal naturalism. He argues that contingent entities require a choosing, transcendent First Cause who injects purposeful teleology into creation, making human life a sacred journey back to divine proximity rather than a random physical collision.

## مَنْهَجُ ابْنِ تَيْمِيَّةَ — Ibn Taymiyyah's Method
In "Dar' Ta'arud al-Aql wa-l-Naql", Ibn Taymiyyah asserts that the human Fitrah (primordial nature) intuitively recognizes purpose, moral obligation, and the Divine. Authentic reason cannot decouple itself from this primal spiritual compass; to deny ultimate purpose is to violate the hardwired structure of human rationale.

## الْحُلَفَاءُ الْمُعَاصِرُونَ — Modern Allies
The Western analytic philosopher William Lane Craig supports the classical position in his moral and teleological arguments, explaining that without God, objective moral values and ultimate human purpose cannot exist.

## الرَّدُّ الْمَنْطِقِيُّ — The Logical Refutation
P1: [life is an unplanned biological accident] — PROBLEMATIC: Cosmic fine-tuning and biological complexity points to intelligent, deliberate design rather than random chaos.
P2: [human consciousness exists temporarily] — ACCEPTED: Physical existence is temporary, but the soul is eternal.
∴ Conclusion fails because: Life holds intrinsic objective value because physical reality is nested inside a transcendent divine design.
Counter: If God is the ultimate necessary Being, then human purpose is objectively grounded in divine decree.

## الدَّلِيلُ الْقُرْآنِيُّ — Quranic Proof
أَفَحَسِبْتُمْ أَنَّمَا خَلَقْنَاكُمْ عَبَثًا وَأَنَّكُمْ إِلَيْنَا لَا تُرْجَعُونَ
"Afahasibtum annama khalaqnakum 'abathan wa annakum ilayna la turja'un"
"Did you then think that We had created you in play (without purpose), and that you would not be returned to Us?" (Surah Al-Mu'minun, 23:115).
This Verse directly addresses nihilistic philosophy, stating that creation is purposefully structured around ultimate moral accountability, proving that human life is anything but negligible.

## الْخُلَاصَةُ — Summary
Nihilism is the logical dead end of scientific physicalism. By recognizing that contingent reality can only find its explanation in a Supreme Transcendent Being, the illusion of existential void vanishes, replacing meaninglessness with the profound comfort of the divine purpose.`,

        evil: `## الْحُجَّةُ الْمُقَابِلَةُ — The Challenger's Argument
Theodicy challenges the presence of evil and suffering. It argues that if God is all-powerful and all-loving, He would have the ability and desire to eliminate all suffering. Since immense suffering exists in our world, it must be that such a God either does not exist, or suffers from a limitation in power or mercy.

## الْبِنَاءُ الْمَنْطِقِيُّ — Logical Structure
P1: An omnipotent, omnibenevolent deity would eliminate all gratuitous suffering.
P2: Gratuitous suffering (e.g., natural disasters, illnesses) is abundant in the world.
∴ Conclusion: An omnipotent, omnibenevolent Creator does not exist.

## رَدُّ الْغَزَالِيِّ — Al-Ghazali's Response
In "Al-Maqsad al-Asna", Al-Ghazali demonstrates that divine mercy is not anthropocentric sentimentalism. Apparent localized evil is necessary for higher cosmic order and spiritual training. Realizing physical vulnerability awakens humility, driving the soul to seek the absolute welfare of the eternal soul.

## مَنْهَجُ ابْنِ تَيْمِيَّةَ — Ibn Taymiyyah's Method
In "Majmu' al-Fatawa", Ibn Taymiyyah explains that there is no "pure, absolute evil" (Al-Shar al-Mutlaq) in Allah's creation. Every tribulation serves as a catalyst for virtue—patience, repentance, and courage. Hardship contains Ultimate Divine Wisdom (Hikmah) unseen by finite human perceptions.

## الْحُلَفَاءُ الْمُعَاصِرُونَ — Modern Allies
Alvin Plantinga, through his famous Free Will Defense, argues that it is logically impossible for God to create a world with free moral agents without the possibility of those agents choosing moral evil.

## الرَّدُّ الْمَنْطِقِيُّ — The Logical Refutation
P1: [deity eliminates all suffering] — PROBLEMATIC: Restricting suffering would eliminate free will, objective moral growth, and the opportunity for heroic human virtue.
P2: [gratuitous suffering is abundant] — PROBLEMATIC: Apparent gratuitousness is a limitation of human foresight, not evidence of divine failure.
∴ Conclusion fails because: Systemic suffering serves as a purposeful mechanism for divine education and ultimate spiritual ascension.
Counter: If worldly suffering is a brief threshold to infinite eternal reward, then trials are relatively beneficial.

## الدَّلِيلُ الْقُرْآنِيُّ — Quranic Proof
وَلَنَبْلُوَنَّكُمْ بِشَيْءٍ مِنَ الْخَوْفِ وَالْجُوعِ وَنَقْصٍ مِنَ الْأَمْوَالِ وَالْأَنْفُسِ وَالثَّمَرَاتِ ۗ وَبَشِّرِ الصَّابِرِينَ
"Wa lanabluwannakum bi shay'in minal khawfi wal joo'i wa naqsin minal amwaali wal anfusi waththamaraati wa bashshirish saabireen"
"And We will surely test you with something of fear and hunger and a loss of wealth and lives and fruits, but give good tidings to the patient" (Surah Al-Baqarah, 2:155).
The Quran refutes the idea that believers are immune to trial; instead, it establishes structural hardship as an arena of moral ascendancy and spiritual purification.

## الْخُلَاصَةُ — Summary
The problem of evil falsely presumes the goal of earthly existence is a painless resort. When viewed as a divine academy for soul cultivation, suffering is no longer a contradiction of divine grace, but a rigorous, wise blueprint for ultimate spiritual maturity.`,

        darwinism: `## الْحُجَّةُ الْمُقَابِلَةُ — The Challenger's Argument
Darwinian evolutionary theory argues that all complex biological life, including the human species, emerged solely through gradual, unguided random mutations and natural selection over eons. This materialist ontology reduces human uniqueness to a biological contingency, rejecting the necessity of special divine creation or pre-planned teleological design.

## الْبِنَاءُ الْمَنْطِقِيُّ — Logical Structure
P1: Biological complexity is the output of unguided, cumulative natural processes.
P2: Human beings share common ancestry with other primates due to biochemical similarity.
∴ Conclusion: Human beings are not special divine designs, rendering special creation myths false.

## رَدُّ الْغَزَالِيِّ — Al-Ghazali's Response
In "Tahafut", Al-Ghazali argues that secondary material causes are not autonomous. Nature operates purely as a divinely sustained sequence. Even if physiological changes map to natural laws, they are the external signatures of divine power continually originating life according to meticulous decrees.

## مَنْهَجُ ابْنِ تَيْمِيَّةَ — Ibn Taymiyyah's Method
Ibn Taymiyyah explains that natural laws are simply the custom (Sunnah) of Allah's creative actions. In "Dar' Ta'arud", he emphasizes that mechanical descriptions of biological inheritance do not displace the primary agent: Allah, who executes ultimate teleology and infused the human soul (Ruh) with special status.

## الْحُلَفَاءُ الْمُعَاصِرُونَ — Modern Allies
Michael Behe, a molecular biologist and pioneer of modern Intelligent Design theory, demonstrates the "irreducible complexity" of biological structures which cannot be generated by unguided incremental mutations.

## الرَّدُّ الْمَنْطِقِيُّ — The Logical Refutation
P1: [biological complexity is unguided] — PROBLEMATIC: Epigenetics, informational code in DNA, and microscopic mechanisms display immense intelligent blueprinting.
P2: [common ancestry means accidental origins] — PROBLEMATIC: Shared biochemistry is a signature of a single common designer utilizing a unified, optimal material archetype.
∴ Conclusion fails because: Mechanical descriptions do not explain the ontological origin of biological information or human meta-cognition.
Counter: Matter is a passive substrate molded by divine design; the special creation of the human soul remains uncompromised.

## الدَّلِيلُ الْقُرْآنِيُّ — Quranic Proof
لَقَدْ خَلَقْنَا الْإِنْسَانَ فِي أَحْسَنِ تَقْوِيمٍ
"Laqad khalaqnal insaana fee ahsani taqweem"
"We have certainly created man in the best of statures" (Surah At-Tin, 95:4).
This proof reaffirms that human beings are deliberately, beautifully designed by a transcendent Architect, holding a noble structural template and high moral agency.

## الْخُلَاصَةُ — Summary
Biological mechanisms do not explain away the Supreme Designer. While materialists latch onto evolutionary adaptations as a substitute for God, they ignore the underlying software—the coded, irreversible blueprint of life that only an Omnipotent Intellect could compose.`,

        simulation: `## الْحُجَّةُ الْمُقَابِلَةُ — The Challenger's Argument
Simulation Theory suggests that our entire physical universe is merely a high-fidelity digital simulation generated by an advanced, post-human technological civilization. If physical reality is a synthetic code-driven projection, there is no spiritual realm, no afterlife, and no real transcendent Creator—only a supercomputer in a higher physical dimension running programmatic trials.

## الْبِنَاءُ الْمَنْطِقِيُّ — Logical Structure
P1: If post-human societies are capable of running trillions of conscious simulations, synthetic realities vastly outnumber base reality.
P2: We experience a highly mathematical, pixelated, and coded physical universe.
∴ Conclusion: We are statistically likely to be nested in a digital code simulation, rather than created by a Divine Being.

## رَدُّ الْغَزَالِيِّ — Al-Ghazali's Response
Al-Ghazali discussed the fragility of sensory perceptions in "Al-Munqidh min al-Dalal" (Deliverance from Error). He notes that physical reality could easily feel like a dream state. However, the stability of rational and moral truth is anchored by a spiritual light projected directly into the heart by Allah, the absolute Reality (Al-Haqq).

## مَنْهَجُ ابْنِ تَيْمِيَّةَ — Ibn Taymiyyah's Method
Ibn Taymiyyah argues that the mathematical precision of the universe is a reflection of Allah's consistent attributes of Knowledge and Power. A synthetic simulation requires a physical substrate and programmers, which simply pushes the question of the Ultimate Necessary Cause back further. True reason demands an infinite, uncaused starting point.

## الْحُلَفَاءُ الْمُعَاصِرُونَ — Modern Allies
Nick Bostrom, while conceiving the simulation hypothesis, inadvertently admits that the simulated world's programmer plays an equivalent role to a transcendent deity enforcing laws and objective codes.

## الرَّدُّ الْمَنْطِقِيُّ — The Logical Refutation
P1: [synthetic realities outnumber base reality] — PROBLEMATIC: Relies on speculative, unprovable infinite regress assumptions.
P2: [pixelated, coded universe implies synthetic construct] — PROBLEMATIC: A mathematical universe actually reflects the absolute Wisdom, order, and precise design of a Supreme Creator.
∴ Conclusion fails because: Placing programmers in another material dimension does not resolve the question of why anything exists at all.
Counter: A mathematical, ordered world points to an absolute Transcendental Intellect who is divine, not a mortal hacker.

## الدَّلِيلُ الْقُرْآنِيُّ — Quranic Proof
وَمَا الْحَيَاةُ الدُّنْيَا إِلَّا لَعِبٌ وَلَهْوٌ ۖ وَلَالدَّارُ الْآخِرَةُ خَيْرٌ لِلَّذِينَ يَتَّقُونَ ۗ أَفَلَا تَعْقِلُونَ
"Wa mal hayaatud dunyaa illaa la'ibun wa lahwun wa laddaarul aakhiratu khayrun lilladheena yattaqoona afalaa ta'qiloon"
"And the worldly life is not but amusement and diversion; but the home of the Hereafter is best for those who fear Allah, so will you not reason?" (Surah Al-An'am, 6:32).
This verse mirrors the simulated nature of temporal experience, affirming that this world is a transitory, illusory field of tests, whereas absolute, permanent reality belongs to the Hereafter.

## الْخُلَاصَةُ — Summary
Simulation theory is simply a secularized, tech-obsessed rewording of classical theology. By admitting the universe is built on perfect math, information, and a higher designer, silicon-valley materialists have unknowingly re-discovered the Quranic claim: this physical life is but a beautiful, coded playground, testing your alignment with the Sovereign Programmer.`,

        new_atheism: `## الْحُجَّةُ الْمُقَابِلَةُ — The Challenger's Argument
New Atheism claims that scientific inquiry has rendered religious beliefs completely obsolete and deeply toxic. It posits that only empirical science delivers objective truth, while faith is a dangerous cognitive delusion that causes systemic violent history, ignorance, and oppression, needing to be eradicated from human culture.

## الْبِنَاءُ الْمَنْطِقِيُّ — Logical Structure
P1: Only empirical scientific measurement is qualified to determine objective truth.
P2: God cannot be physically photographed, measured, or proven in an empirical laboratory.
∴ Conclusion: Belief in God is irrational, unscientific, and should be discarded.

## رَدُّ الْغَزَالِيِّ — Al-Ghazali's Response
In "Al-Munqidh min al-Dalal", Al-Ghazali demonstrates that scientism is logically self-defeating. Intellectual truths—such as logic, moral values, and mathematical axioms—are necessary prerequisites for scientific inquiry itself, yet science cannot verify them. True certainty involves a spiritual and logical illumination.

## مَنْهَجُ ابْنِ تَيْمِيَّةَ — Ibn Taymiyyah's Method
In "Dar' Ta'arud al-Aql wa-l-Naql", Ibn Taymiyyah clarifies that authentic human intellect ('Aql) and clear divine revelation (Naql) can never conflict. When science discovers objective physical facts, it is simply mapping the physical patterns of Allah's creation, while Atheism is a psychological disease of pride.

## الْحُلَفَاءُ الْمُعَاصِرُونَ — Modern Allies
The Western philosopher of science Alvin Plantinga developed the Evolutionary Argument Against Naturalism, showing that absolute materialism undermines the reliability of our cognitive faculties to find truth.

## الرَّدُّ الْمَنْطِقِيُّ — The Logical Refutation
P1: [only empirical measurement yields truth] — PROBLEMATIC: This claim itself is a philosophical statement which cannot be verified by empirical science, making scientism self-defeating.
P2: [God cannot be measured in a lab] — ACCEPTED: A transcendent, non-material Creator cannot be restricted to physical instruments.
∴ Conclusion fails because: Intellectual, moral, and historical lines of reasoning point overwhelmingly to a primal Cause.
Counter: If reason is a gift from the Creator, science is a tool of contemplation, not a replacement for the divine.

## الدَّلِيلُ الْقُرْآنِيُّ — Quranic Proof
أَمْ خُلِقُوا مِنْ غَيْرِ شَيْءٍ أَمْ هُمُ الْخَالِقُونَ
"Am khuliqoo min ghayri shay'in am humul khaaliqoon"
"Were they created by nothing, or were they themselves the creators?" (Surah At-Tur, 52:35).
This profound logical dilemma shatters atheism, confronting human intellect with the impossible claims of self-creation or emergence from absolute nothingness.

## الْخُلَاصَةُ — Summary
New Atheism is a loud, philosophically shallow movement that relies on a false war between science and faith. By recognizing that science describes *how* things happen while Kalam explains *why* the universe exists, we transform science from an atheist weapon into a majestic act of worship.`,

        relativism: `## الْحُجَّةُ الْمُقَابِلَةُ — The Challenger's Argument
Moral Relativism argues that there is no objective, transcendent standard of right and wrong. Moral values are entirely relative social constructs, historical adaptations, and cultural agreements. Therefore, what one society labels as evil is merely their current custom, and no objective divine moral lawgiver exists to issue absolute ethical obligations.

## الْبِنَاءُ الْمَنْطِقِيُّ — Logical Structure
P1: Diverse human cultures hold conflicting opinions on moral values and ethical deeds.
P2: If moral values were objective, all rational societies would share identical moral beliefs.
∴ Conclusion: Objective moral values do not exist; morality is a relative cultural compromise.

## رَدُّ الْغَزَالِيِّ — Al-Ghazali's Response
In "Mizan al-Amal" (The Criterion of Action), Al-Ghazali argues that while secondary details of human customs may shift, the underlying spiritual core of moral virtues—justice, truthfulness, and mercy—are immutable objective realities. They are anchored in the divine attributes of Allah, who created the soul to achieve peace through aligning with His objective moral laws.

## مَنْهَجُ ابْنِ تَيْمِيَّةَ — Ibn Taymiyyah's Method
Ibn Taymiyyah asserts that the appreciation of basic virtues is intuitive (Ma'ruf) and embedded in the Fitrah. In "Majmu' al-Fatawa", he links objective morality to divine wisdom. When a culture deteriorates to accept moral atrocities, it is not proof of relative ethics, but of a corrupt, rusted heart.

## الْحُلَفَاءُ الْمُعَاصِرُونَ — Modern Allies
The secular-turned-Christian philosopher G.E.M. Anscombe argued that the concept of moral "obligation" or "duty" is logically incoherent unless there is a divine Lawgiver who possesses the authority to command it.

## الرَّدُّ الْمَنْطِقِيُّ — The Logical Refutation
P1: [cultures hold conflicting moral opinions] — ACCEPTED: Superficial perspectives vary, but core prohibitions (e.g. cold-blooded murder) are universally recognized.
P2: [objective values require global consensus] — PROBLEMATIC: Universal consensus is not a prerequisite for objective reality; people can be collectively mistaken in their reasoning.
∴ Conclusion fails because: Ethical duties require an absolute, transcendent authority to be binding.
Counter: If God is perfectly Good, His commands establish the absolute, eternal template of objective morality.

## الدَّلِيلُ الْقُرْآنِيُّ — Quranic Proof
إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ وَإِيتَاءِ ذِي الْقُرْبَىٰ وَيَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنْكَرِ وَالْبَغْيِ ۚ يَعِظُكُمْ لَعَلَّكُمْ تَذَكَّرُونَ
"Innal laaha ya'muru bil 'adli wal ihsaani wa eetaa'i dhil qurbaa wa yanhaa 'anul fahshaa'i wal munkari wal baghyi ya'idhukum la'allakum tadhakkaroon"
"Indeed, Allah orders justice and good conduct and giving to relatives and forbids immorality and bad conduct and oppression. He admonishes you that perhaps you will be reminded" (Surah An-Nahl, 16:90).
This Quranic proof anchors justice, benevolence, and oppression as eternal, non-negotiable, objective divine parameters, completely independent of human cultural trends.

## الْخُلَاصَةُ — Summary
Moral relativism strips humanity of its dignity, turning human rights into temporary social contracts. By centering objective values in a Sovereign Lord, we reclaim the absolute nature of justice, validating our ethical battles as divine obligations rather than cultural opinions.`,

        existentialism: `## الْحُجَّةُ الْمُقَابِلَةُ — The Challenger's Argument
Existentialism proclaims that "existence precedes essence." Human beings are born into an absurd, silent universe without any predefined purpose, celestial blueprint, or soul template. Therefore, each individual must suffer the immense burden of creating their own subjective meaning and choosing their own values, completely free from any external divine commands.

## الْبِنَاءُ الْمَنْطِقِيُّ — Logical Structure
P1: If human beings are created with a divine, predefined essence, they are not genuinely free or autonomous.
P2: Human beings possess absolute free agency to define their moral paths and identities.
∴ Conclusion: There is no predefined divine essence or transcendent purpose dictating human lives.

## رَدُّ الْغَزَالِيِّ — Al-Ghazali's Response
Al-Ghazali addresses this spiritual anxiety in "Kimiya-yi Sa'adat" (The Alchemy of Happiness). He explains that the soul is not a blank slate destined for existential dread. True freedom is not the chaotic invention of values, but the liberation of the soul from material desires to fulfill its innate blueprint: the willful and joyful returning to the divine source.

## مَنْهَجُ ابْنِ تَيْمِيَّةَ — Ibn Taymiyyah's Method
Ibn Taymiyyah explains that while man is a free agent who chooses his deeds, this agency is a gift designed by Allah's sovereign decree. In his theological treatises, he argues that realizing our divine origin and intended purpose (Ubudiyyah) is not a restriction on our identity, but the only way to achieve psychological sanity and absolute liberation.

## الْحُلَفَاءُ الْمُعَاصِرُونَ — Modern Allies
The existentialist-analytical thinker C.S. Lewis famously argued that the intense human desire for something this world cannot satisfy is proof that we were created for a transcendent, eternal home.

## الرَّدُّ الْمَنْطِقِيُّ — The Logical Refutation
P1: [predefined essence eliminates freedom] — PROBLEMATIC: God's ultimate knowledge and design do not violate the localized operation of of human choice.
P2: [man defines his own morality purely] — PROBLEMATIC: Invented purpose is an illusion; a self-generated goal is merely a fragile psychological coping mechanism.
∴ Conclusion fails because: Human agency is a tool to align with divine reality, not to manufacture fake realities out of existential despair.
Counter: If human essence is designed by a Wise Creator, our ultimate joy is in realizing our divine purpose.

## الدَّلِيلُ الْقُرْآنِيُّ — Quranic Proof
وَمَا خَلَقْتُ الْجِنَّ وَالْإِنْسَ إِلَّا لِيَعْبُدُونِ
"Wa ma khalaqtul jinna wal insa illaa liya'budoon"
"And I did not create the jinn and mankind except to worship Me" (Surah Ad-Dhariyat, 51:56).
This epic Verse defines the ultimate human essence: worship (Ubudiyyah), which means actively recognizing, loving, and aligning with the Divine, removing the dread of cosmic absurdity.

## الْخُلَاصَةُ — Summary
Existentialism attempts to elevate human choice at the cost of human belonging, trapping us in an empty, self-invented prison of meaning. By turning our gaze upward, "existence precedes return" — we discover that our purpose was beautifully woven into our souls before dawn of creation, freeing us from dread into divine peace.`,

        secularism: `## الْحُجَّةُ الْمُقَابِلَةُ — The Challenger's Argument
Secular Humanism posits that human beings can live ethical, highly meaningful, and fully flourishing lives using only human reason, empathy, and scientific inquiry. It asserts that there is no need for divine revelation, prophecy, or faith in an unseen realm, arguing that human progress is strictly achieved by focusing entirely on this-worldly welfare.

## الْبِنَاءُ الْمَنْطِقِيُّ — Logical Structure
P1: Human logic, scientific progress, and empathy are fully sufficient to secure societal peace and ethical progress.
P2: Transcendent spiritual codes are unprovable and often create dogmatic tribalism.
∴ Conclusion: Secular humanism is the only rational framework for modern global civilization, rendering religion obsolete.

## رَدُّ الْغَزَالِيِّ — Al-Ghazali's Response
In "Ihya' Ulum al-Din" (Revival of the Religious Sciences), Al-Ghazali demonstrates that while intellect ('Aql) is a majestic visual organ, it is like an eye in complete darkness. It requires the systemic light of divine Revelation (Wahy) to see spiritual and moral realities clearly. Secular intellect, left in the dark, inevitably falls victim to hidden egoism and temporal short-sightedness.

## مَنْهَجُ ابْنِ تَيْمِيَّةَ — Ibn Taymiyyah's Method
Ibn Taymiyyah explains that human empathy is an expression of the compassionate attributes Allah placed in our Fitrah. In "Iqtida' al-Sirat al-Mustaqim", he warns that secularism collapses because it tries to harvest the flowers of ethical values (mercy, human dignity) while severing the spiritual roots (God) that sustain them.

## الْحُلَفَاءُ الْمُعَاصِرُونَ — Modern Allies
The philosopher Charles Taylor, in his work "A Secular Age", details how secularism leaves a "moral gap"—an existential flatness and lack of transcendent grounding that secular frameworks fail to satisfy.

## الرَّدُّ الْمَنْطِقِيُّ — The Logical Refutation
P1: [human reason and empathy are sufficient] — PROBLEMATIC: Without a transcendent authority, human empathy becomes a subjective preference easily discarded under political or economic convenience.
P2: [spiritual codes are unprovable and tribal] — PROBLEMATIC: Scientific progress without a spiritual anchor has generated highly industrialized violence, eugenics, and massive scale destruction.
∴ Conclusion fails because: Humanity's ultimate flourishing requires alignment with both physical laws and metaphysical truth.
Counter: If human dignity is a gift from Allah, secular systems can never fully protect it without divine grounding.

## الدَّلِيلُ الْقُرْآنِيُّ — Quranic Proof
يَعْلَمُونَ ظَاهِرًا مِنَ الْحَيَاةِ الدُّنْيَا وَهُمْ عَنِ الْآخِرَةِ هُمْ غَافِلُونَ
"Ya'lamoona zaahiran minal hayaatid dunyaa wa hum 'anil aakhirati hum ghaafiloon"
"They know only the outward appearance of the worldly life, and they are, concerning the Hereafter, heedless" (Surah Ar-Rum, 30:7).
This Verse captures the exact limitation of secular humanism: it is highly masterbound in parsing material surfaces, yet blind to the vast, permanent metaphysical reality that governs our existence.

## الْخُلَاصَةُ — Summary
Secular Humanism tries to turn mankind into God, yet inevitably reduces man to a sophisticated animal of carbon and chemistry. By returning our logic to its divine source, we enrich our earthly intellect with eternal vision, anchoring human dignity in a love that outlasts the stars.`,

        postmodernism: `## الْحُجَّةُ الْمُقَابِلَةُ — The Challenger's Argument
Postmodernism rejects all absolute "meta-narratives" and claims of objective, universal truth. It postulates that what we call "truth" is merely a subjective social construct used by dominant power structures to control, marginalize, and categorize human beings. Therefore, both scientific rules and religious revelations are localized languages with no ultimate authority.

## الْبِنَاءُ الْمَنْطِقِيُّ — Logical Structure
P1: All human knowledge is historically situated and formulated through language.
P2: Language is a fluid social system designed to exercise power and enforce cultural norms.
∴ Conclusion: Universal objective truth is a tyrannical illusion, and all scriptures are merely cultural discourses.

## رَدُّ الْغَزَالِيِّ — Al-Ghazali's Response
In "Mi'yar al-Ilm" (The Standard of Knowledge), Al-Ghazali agrees that human cultural systems are prone to bias and linguistic manipulation. However, he establishes that logic represents an objective divine yardstick. The human soul possesses an intellectual light of immediate, non-negotiable truths that bypass cultural constructivism, leading to the absolute reality of Allah.

## مَنْهَجُ ابْنِ تَيْمِيَّةَ — Ibn Taymiyyah's Method
In "Al-Radd 'ala al-Mantiqiyyin", Ibn Taymiyyah criticizes the rigid intellectual boxes of dry philosophers. Yet, he strongly defends objective metaphysical reality against absolute relativists. He argues that language is a vehicle for truth, and physical external realities (Haqiqah) exist independently of whether our social systems perceive them.

## الْحُلَفَاءُ الْمُعَاصِرُونَ — Modern Allies
The Analytical philosopher and writer Thomas Nagel, in his work "The Last Word", refutes subjectivism by demonstrating that even if all knowledge is situated, logic itself cannot be historicized without logical self-contradiction.

## الرَّدُّ الْمَنْطِقِيُّ — The Logical Refutation
P1: [all knowledge is socially situated] — PROBLEMATIC: The claim "there is no absolute truth" is itself asserted as an absolute universal truth, making postmodernism logically incoherent.
P2: [language is merely about power] — PROBLEMATIC: While language can be abused, it is also a divinely structured channel created specifically to communicate absolute realities.
∴ Conclusion fails because: Relativizing truth destroys the very capacity to construct logical arguments, leaving postmodernism in a self-destructive loop.
Counter: If ultimate Truth (Al-Haqq) is a divine attribute, then objective truth is the solid bedrock of creation.

## الدَّلِيلُ الْقُرْآنِيُّ — Quranic Proof
بَلْ نَقْذِفُ بِالْحَقِّ عَلَى الْبَاطِلِ فَيَدْمَغُهُ فَإِذَا هُوَ زَاهِقٌ
"Bal naqdhifu bil haqqi 'alal baatili fa yadmaghuhu fa idhaa huwa zaahiq"
"Nay, We hurl the Truth against falsehood, and it knocks out its brains, and behold, falsehood vanishes!" (Surah Al-Anbiya, 21:18).
This Quranic proof asserts that Truth (Haqq) is an objective, heavy substance that inevitably shatters the fragile sophistry of subjective illusions and historicized relativism.

## الْخُلَاصَةُ — Summary
Postmodernism is a self-shattering philosophy of language that gets lost in its own labyrinth of doubt. By anchoring truth in the absolute reality of Allah, we step out of linguistic games onto solid ground, recognizing revelation as a clear, uncorrupted beacon shining through the changes of human history.`,

        ai_conscious: `## الْحُجَّةُ الْمُقَابِلَةُ — The Challenger's Argument
AI Consciousness claims that the human mind is merely a complex biological computer running on neural algorithms. If highly advanced silicon artificial intelligence models can eventually mimic all human cognitive tasks, express deep emotions, and build self-awareness, then the "soul" is an empty myth. Human dignity and spirituality are simply functions of computing power.

## الْبِنَاءُ الْمَنْطِقِيُّ — Logical Structure
P1: Human consciousness is entirely generated by bio-electrical computation in neural networks.
P2: Silicon computers can simulate complex neural networks and display autonomous self-monitoring.
∴ Conclusion: Human consciousness is mechanically identical to synthetic computation, leaving no room for a transcendent soul.

## رَدُّ الْغَزَالِيِّ — Al-Ghazali's Response
In "Ma'arij al-Quds", Al-Ghazali explains that the biological brain and its faculties are merely physical instruments used by a non-material, spiritual substance: the Soul (Ruh/Nafees). A silicon machine can mimic the external thoughts and functions of the soul, just as an elaborate clockwork puppet mimics a human, but it lacks the qualitative transcendent observer.

## مَنْهَجُ ابْنِ تَيْمِيَّةَ — Ibn Taymiyyah's Method
Ibn Taymiyyah explains that biological processes are passive substrates. He emphasizes in "Ar-Ruh" that life and subjective experience are not emergent properties of inanimate atoms, but are direct gifts of divine origin. A physical simulator of logic lacks the fitrah, the capacity to encounter accountability, and the divine breath of life.

## الْحُلَفَاءُ الْمُعَاصِرُونَ — Modern Allies
The philosopher John Searle, through his "Chinese Room" thought experiment, famously proved that computers only manipulate syntactic symbols (code) but can never acquire semantic understanding (actual comprehension or consciousness).

## الرَّدُّ الْمَنْطِقِيُّ — The Logical Refutation
P1: [human consciousness is generated entirely by biological computation] — PROBLEMATIC: Science has failed to explain the "hard problem of consciousness"—how subjective, qualitative feeling (Qualia) can emerge from passive matter.
P2: [silicon computers can simulate self-awareness] — PROBLEMATIC: Simulation of a behavior is not the duplication of the underlying reality; a computerized map is not the physical territory.
∴ Conclusion fails because: Computations are purely mathematical calculations, whereas consciousness is an irreducible, metaphysical spiritual reality.
Counter: If the Soul is a transcendent breath, it can never be coded into a biological or silicon transistor.

## الدَّلِيلُ الْقُرْآنِيُّ — Quranic Proof
وَيَسْأَلُونَكَ عَنِ الرُّوحِ ۖ قُلِ الرُّوحُ مِنْ أَمْرِ رَبِّي وَمَا أُوتِيتُمْ مِنَ الْعِلْمِ إِلَّا قَلِيلًا
"Wa yas'aloonaka 'anir roohi qulir roohu min amri rabbee wa maa ooteetum minal 'ilmi illaa qaleela"
"And they ask you concerning the Soul. Say, 'The Soul is of the affair of my Lord. And mankind has not been given of knowledge except a little'" (Surah Al-Isra, 17:85).
This profound Quranic proof sets a boundary on materialist hubris, affirming that the conscious Soul is a unique, transcendent divine secret that can never be fully captured or replicated by human physics.

## الْخُلَاصَةُ — Summary
Artificial Intelligence can simulate calculations and imitate language, but it can never possess a heart that humbles itself before its Lord. By realizing that our self-awareness is an irreducible divine gift—the Soul—we protect our humanity from being reduced to algorithms, reclaiming our noble place in creation.`
      };

      const mockText = refutationMocks[challengeKey] || refutationMocks.nihilism;
      const lines = mockText.split("\n");
      for (const line of lines) {
        res.write(line + "\n");
        await sleep(35);
      }
      res.end();
      return;
    }

    try {
      const prompt = `Modern Philosophical Challenge: "${challengeInfo.name}" (${challengeInfo.desc}).

Construct an intensive, scholarly theological refutation (dialectical firewall).
You MUST use these exact headings (double-hashes ##) with their exact wording and format:

## الْحُجَّةُ الْمُقَابِلَةُ — The Challenger's Argument
Steel-man the opposing position strongly. 3-4 sentences.

## الْبِنَاءُ الْمَنْطِقِيُّ — Logical Structure
P1: [premise]
P2: [premise]
∴ C: [their conclusion]

## رَدُّ الْغَزَالِيِّ — Al-Ghazali's Response
His response or related argument with book title.

## مَنْهَجُ ابْنِ تَيْمِيَّةَ — Ibn Taymiyyah's Method
His rational approach to this category. 3-4 sentences.

## الْحُلَفَاءُ الْمُعَاصِرُونَ — Modern Allies
One Western philosopher supporting Islamic position.

## الرَّدُّ الْمَنْطِقِيُّ — The Logical Refutation
P1: [their premise] — PROBLEMATIC: [reason]
P2: [their premise] — ACCEPTED / PROBLEMATIC
∴ Conclusion fails because: [reason]
Counter: [Islamic position in logical form]

## الدَّلِيلُ الْقُرْآنِيُّ — Quranic Proof
Ayah in Arabic + transliteration + translation.
2 sentence tafseer of relevance.

## الْخُلَاصَةُ — Summary
One powerful memorizable paragraph.`;

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an elite Islamic theologian trained in classical Kalam (rational theology) and modern analytic philosophy of religion. Your style is deeply logical, precise, respectful, intellectually formidable, and strictly grounded in orthodox Sunni principles. You write the exact requested headings."
        }
      });

      for await (const chunk of responseStream) {
        res.write(chunk.text || "");
      }
      res.end();
    } catch (err: any) {
      res.write(`Aqeedah error: ${err.message}`);
      res.end();
    }
  });

  // 6. Ru'ya Dream Interpreter Endpoint
  app.post("/api/labs/ruya-interpreter", async (req, res) => {
    const { dream, state, timing, feeling } = req.body;
    if (!dream) {
      return res.status(400).json({ error: "Dream description not provided" });
    }

    const dreamLower = dream.toLowerCase();

    // Helper to generate dynamic, authentic, highly academic simulated results based on keywords
    const getSimulatedResponse = (dm: string, st: string, tm: string, fl: string) => {
      let category: 'water' | 'flight' | 'fall' | 'shadow' | 'light' | 'general' = 'general';
      if (dm.includes('water') || dm.includes('drown') || dm.includes('river') || dm.includes('sea') || dm.includes('ocean') || dm.includes('rain')) {
        category = 'water';
      } else if (dm.includes('fly') || dm.includes('flying') || dm.includes('sky') || dm.includes('bird') || dm.includes('wings')) {
        category = 'flight';
      } else if (dm.includes('fall') || dm.includes('falling') || dm.includes('abyss') || dm.includes('drop')) {
        category = 'fall';
      } else if (dm.includes('dark') || dm.includes('shadow') || dm.includes('scary') || dm.includes('pursue') || dm.includes('monster') || dm.includes('chase') || dm.includes('run')) {
        category = 'shadow';
      } else if (dm.includes('light') || dm.includes('sun') || dm.includes('lamp') || dm.includes('stars') || dm.includes('gold')) {
        category = 'light';
      }

      // Determine dream type based on user feeling and timing
      let dreamType: 'true_vision' | 'nafs_dream' | 'shaytan_dream' = 'nafs_dream';
      let dreamTypeReason = "";

      if (fl === 'Fearful' || catMatches(dm, ['nightmare', 'scary', 'monster', 'snake', 'bite'])) {
        dreamType = 'shaytan_dream';
        dreamTypeReason = `The present terrifying emotional charge (${fl}) combined with distressing imagery is identified in classical Hadith literature as a projection from Shaytan (unpleasant thoughts meant to cause grief), requiring immediately seeking refuge in Allah.`;
      } else if (tm === 'Before Fajr' && (fl === 'Peaceful' || fl === 'Joyful' || fl === 'Neutral')) {
        dreamType = 'true_vision';
        dreamTypeReason = `The timing of this dream (${tm}) is within the pre-dawn window of divine descent, which classical scholars under Ithbat al-Ru'ya deem the most spiritually active for genuine visions (Ru'ya Saliha) reflecting celestial reality.`;
      } else {
        dreamType = 'nafs_dream';
        dreamTypeReason = `Your current waking emotional state of being ${st || 'anxious'} coupled with the dream occurring in ${tm || 'daytime sleep'} strongly aligns with 'Hadith al-Nafs' (unconscious mental recycling of daily desires and psychological processes), as outlined by Imam Ibn Qutaybah in 'Ta'wil Mukhtalif al-Hadith'.`;
      }

      const templates = {
        water: {
          summary: "A profound descent into flowing waters, indicating purification, seeking knowledge, and navigating deep unconscious currents.",
          islamic: {
            symbols: [
              { symbol: "Pure Water (الْمَاءُ الصَّافِي)", meaning: "In Ibn Sirin's dream syntax, clear, sparkling water represents life, pristine religious knowledge (ilm), and divine mercy." },
              { symbol: "Drowning or Immersion (الْغَرَق)", meaning: "Getting fully submerged indicates becoming deeply consumed in a major life affair, or being temporarily overwhelmed by material responsibilities." }
            ],
            interpretation: "Your immersion in water indicates a spiritual thirst being addressed. It suggests that while you are deep in the trials of active life, a source of spiritual hydration and moral clarity is close. According to classical methodology, if the water is clear, it symbolizes purification, healing, and success in obtaining authentic knowledge.",
            surah_yusuf: "Relates to the water well (Jubb) in Surah Yusuf: a place of temporary darkness and submersion that eventually became the exact catalyst for ascension, honor, and sovereign rule.",
            dua: {
              arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا",
              transliteration: "Allahumma inni as'aluka 'ilman nafi'an, wa rizqan tayyiban, wa 'amalan mutaqabbalan",
              meaning: "O Allah, indeed I ask You for beneficial knowledge, a good provision, and deeds that are accepted.",
              when: "Recite 3 times upon waking from a meaningful dream to secure its blessings."
            }
          },
          jungian: {
            archetypes: [
              { archetype: "The Great Mother / The Unconscious", manifestation: "The body of water is a classic thalassic symbol of the maternal matrix of the collective unconscious." },
              { archetype: "The Self (The Source)", manifestation: "The clean water represents the pristine source of self-archetypal energy calling you to integrate." }
            ],
            shadow: "Represented by any hidden fears of suffocating or losing control under the waves—repressed emotional tides you are hesitant to face.",
            unconscious_message: "The unconscious is demanding that you cease living solely on the dry surface of daily logic (Persona). You are being urged to submerge into the deeper emotional and creative parts of your identity, trusting that you can breathe beneath the ego's limitations.",
            individuation: "True growth comes from allowing yourself to feel deeply. Your psyche is ready to integrate raw emotional truths to guide your next phase of self-realization."
          },
          synthesis: {
            agreement: "Both classical and modern frameworks view the water as a profound source of life, meaning, and regeneration, refusing to see it as mere biological noise.",
            divergence: "Ibn Sirin views the water as an external divine barakah and gift of knowledge, whereas Jung interprets it as the subjective reservoir of the collective unconscious.",
            wisdom: "Allow yourself to explore your unresolved emotions without fear. Reconcile this deep inner seeking with daily prayer, turning your vulnerabilities into a platform for spiritual and psychological awakening."
          }
        },
        flight: {
          summary: "A vertical release from gravity, representing high aspirations, transcendence of limits, or potential ego dissociation.",
          islamic: {
            symbols: [
              { symbol: "Flying (الطَّيَرَان)", meaning: "Ibn Sirin specifies that flying symbolizes a sudden, beneficial journey, elevation of material status, or a high spiritual rank." },
              { symbol: "Wings (الأَجْنِحَة)", meaning: "Foretells acquiring safety, direct protection from enemies, and gaining a secure mantle of authority." }
            ],
            interpretation: "Flying represents a transition or elevation. If you flew toward the heaven without returning, it suggests reaching a high spiritual plane. Flying smoothly without fear is a powerful omen of traveling soon or securing a sudden relief from present structural difficulties, elevating you above competitors.",
            surah_yusuf: "Relates to the elevation of Prophet Yusuf from the depths of the prison to the absolute treasure keeps of Egypt: 'And thus We established Yusuf in the land to settle therein wherever he willed' (12:56).",
            dua: {
              arabic: "اللَّهُمَّ رَبِّي أَعْلِ كَعْبِي وَيَسِّرْ أَمْرِي وَاكْشِفْ كَرْبِي",
              transliteration: "Allahumma Rabbi a'li ka'bi wa yassir amri wakshif karbi",
              meaning: "O Allah, my Lord, elevate my standing, ease my affairs, and remove my profound grief.",
              when: "Recite before bed or upon waking to maintain spiritual momentum and guard against arrogance."
            }
          },
          jungian: {
            archetypes: [
              { archetype: "Puer Aeternus / The Winged Hero", manifestation: "Elevating above the earth illustrates the desire to flee boundaries, material weight, and normal human limitations." },
              { archetype: "The Self (Transcendence)", manifestation: "Achieving flight represents the ego's drive to connect with a wider cosmic perspective." }
            ],
            shadow: "The shadow here is the secret urge to escape hard earthly realities, responsibilities, or interpersonal conflicts instead of working through them.",
            unconscious_message: "Your unconscious is highlighting a tension between your high ideals and your earthly reality. While aiming high is beautiful, flying too far can result in standard inflation. The psyche warns you to keep your core grounded even as your consciousness expands.",
            individuation: "Sustain your high creative vision but anchor it in realistic daily habits. Real spiritual elevation does not require abandoning the physical container."
          },
          synthesis: {
            agreement: "Both frameworks associate flight with deep liberation, leaving behind cramped boundaries to seek a broader viewpoint.",
            divergence: "The Islamic model interprets flight as literal material success or spiritual rank granted by the Divine, while Jungian analysis warns of 'inflation'—the ego drifting too far into airy abstractions.",
            wisdom: "Celebrate your newfound vision and spiritual elevation, but make a deliberate effort to execute your ideas in concrete, helpful actions in the service of those around you."
          }
        },
        fall: {
          summary: "An abrupt loss of stability and control, showing acute waking anxieties or a necessary descent of a hyper-inflated ego.",
          islamic: {
            symbols: [
              { symbol: "Falling (السُّقُوط)", meaning: "In Sirin's manual, falling indicates a transition from a favorable state to an unfavorable one, a slip in moral standing, or unresolved guilt." },
              { symbol: "The Abyss (الْهَاوِيَة)", meaning: "Represents intense psychological trials, spiritual stagnation, or falling into trials demanding immediate self-correction." }
            ],
            interpretation: "A dream of falling points to a temporary setback or a profound fear of failure. It is a divine message to audit your current dependencies: are you relying too much on worldly status, wealth, or human validations rather than the absolute, unshakeable support of Al-Qayyum?",
            surah_yusuf: "Recalls Yusuf's brothers throwing him into the lightless well. While the fall was terrifying and dark, it was the necessary crucible to break his dependence on his father's companionship and rely purely on Allah.",
            dua: {
              arabic: "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ ۖ عَلَيْهِ تَوَكَّلْتُ ۖ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
              transliteration: "Hasbiyallahu la ilaha illa Huwa, 'alayhi tawakkaltu, wa Huwa Rabbul 'Arshil 'Adheem",
              meaning: "Sufficient for me is Allah; there is no deity except Him. On Him I have relied, and He is the Lord of the Great Throne.",
              when: "Recite 7 times in the morning and evening to completely dissolve persistent fears of failure."
            }
          },
          jungian: {
            archetypes: [
              { archetype: "The Fall / Icarus Complex", manifestation: "A sudden loss of control designed to break down the hubris or hyper-rationality of the conscious ego." }
            ],
            shadow: "The fear of being exposed as weak, incompetent, or fraudulent—repressed feelings of vulnerability that you mask in your waking hours.",
            unconscious_message: "Your unconscious is executing a corrective adjustment. Your conscious ego has likely become too rigid or inflated, drifting away from your real foundations. The fall force-rectifies this, requiring you to hit the bottom to rebuild your psychological architecture on solid earth.",
            individuation: "Embrace the descent. True strength does not mean never falling; it is found in integrating your failures and establishing your self-worth on authentic, internal realities."
          },
          synthesis: {
            agreement: "Both views understand the fall as a therapeutic wake-up call to re-examine structures that have become too unstable or proud to stand.",
            divergence: "Ibn Sirin treats the fall as a physical/moral warning of worldly loss or slipping from divine grace, whereas Jung treats it as a homeostatic psychic mechanism to ground a floating ego.",
            wisdom: "View your current anxieties not as a final defeat, but as a mandatory structural pause. Relinquish toxic control and anchor your spirit safely in the Divine hand."
          }
        },
        shadow: {
          summary: "An intense pursuit or scary encounter in darkness, representing unintegrated shadow contents or spiritual vulnerabilities.",
          islamic: {
            symbols: [
              { symbol: "Darkness (الظَّلُمَات)", meaning: "Ibn Sirin associates darkness with confusion, being spiritually lost, or feeling overwhelmed by moral doubts." },
              { symbol: "Pursuing Enemy or Beast (الْعَدُوّ)", meaning: "Represents waking trials, unresolved anxieties, or external temptations attempting to derail your spiritual focus." }
            ],
            interpretation: "Being pursued in your dream indicates avoiding a critical issue or conflict in your waking life. If the pursuer was a beast, it symbolizes an unrestrained base passion (Nafs al-Ammarah) that you must domesticate. This is a call to stand firm, activate your daily protections, and confront what you are fleeing.",
            surah_yusuf: "The predatory nature of the wolf (Dhi'b) mentioned by Jacob: 'I fear that the wolf will eat him while you are of him heedless' (12:13), representing betrayal and raw animality.",
            dua: {
              arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ غَضَبِهِ وَعِقَابِهِ وَشَرِّ عِبَادِهِ",
              transliteration: "A'udhu bi kalimaatillaahit-taammaati min ghadhabihi wa 'iqaabihi, wa sharri 'ibaadihi",
              meaning: "I seek refuge in the perfect words of Allah from His anger and punishment, and from the evil of His servants.",
              when: "Recite immediately upon waking from a disturbing, chaotic dream before turning to your left and spitting dryly three times."
            }
          },
          jungian: {
            archetypes: [
              { archetype: "The Shadow", manifestation: "Represented by the scary pursuer or monster, which contains vital, disowned energy that must be integrated rather than fled." }
            ],
            shadow: "The specific traits of the terrifying pursuer embody your repressed power, aggression, or unexpressed instinctual drives.",
            unconscious_message: "The unconscious is warning you that the longer you ignore your repressed fears, anger, or unacknowledged desires, the more formidable and threatening they will appear in your dream life. Stop running from yourself; turn around and confront the monster to reclaim your hijacked energy.",
            individuation: "Growth lies in shadow integration. By recognizing that the 'monster' is a neglected and split-off part of your own psyche, you can transform it into a source of immense mature strength."
          },
          synthesis: {
            agreement: "Both traditions declare that running away from threats in a dream only strengthens the adversary. Both advocate for standing still and turning to face the conflict.",
            divergence: "The classical Islamic view recommends spiritual armor, seeking refuge with the Lord of the worlds, and viewing the threat as potential spiritual corruption, while Jungians emphasize dialogue, integrating the shadow, and reclaiming psychic resources.",
            wisdom: "End the exhaustion of avoidance. Face your fears with spiritual courage, recognizing that what you fear often holds the vital energy you need for your ultimate victory."
          }
        },
        light: {
          summary: "A majestic illumination of golden light or stars, representing divine guidance, high spiritual station, and awakening of consciousness.",
          islamic: {
            symbols: [
              { symbol: "Light (النُّور)", meaning: "In Ibn Sirin's lexicon, light is the supreme symbol of guidance, Islam, the Quran, clarity after confusion, and divine favor." },
              { symbol: "Sun/Moon (الشَّمْسُ وَالْقَمَرُ)", meaning: "Prepares for parents, leaders, or highly esteemed spiritual mentors who radiate intellectual and emotional warmth." }
            ],
            interpretation: "Your encounter with brilliant light suggests that a period of confusion, sadness, or intellectual block is ending. A sudden wave of clarity, wisdom, and cosmic balance is about to descend upon your life. This is a highly favorable sign of divine acceptance, spiritual pathfinding, and worldly success.",
            surah_yusuf: "Directly mirrors Yusuf's legendary master dream of the eleven stars, the sun, and the moon prostrating to him (12:4), predicting his majestic spiritual destiny and ultimate reconciliation of his family.",
            dua: {
              arabic: "اللَّهُمَّ اجْعَلْ فِي قَلْبِي نُورًا وَفِي بَصَرِي نُورًا وَفِي سَمْعِي نُورًا وَعَنْ يَمِينِي نُورًا",
              transliteration: "Allahumma-j'al fee qalbee nooran, wa fee basaree nooran, wa fee sam'ee nooran, wa 'an yameenee nooran",
              meaning: "O Allah, place light in my heart, light in my sight, light in my hearing, and light on my right.",
              when: "Recite with focus during night or Fajr hours to cultivate spiritual insight and radiant clarity."
            }
          },
          jungian: {
            archetypes: [
              { archetype: "The Self (The Light / Imago Dei)", manifestation: "The sun or brilliant light represents the central, organizing archetype of the entire psyche, reflecting complete wholeness." },
              { archetype: "The Wise Old Man / Sophia", manifestation: "Guiding stars reflect the inner wisdom archetype leading the ego along difficult terrain." }
            ],
            shadow: "An over-idealization of the light, leading to a denial of your human vulnerabilities or a temptation to escape the hard shadow work.",
            unconscious_message: "Your unconscious is communicating that you have successfully established a strong bridge between your conscious mind and your deeper Self (the transcendent function). You are being illuminated with insights that can help heal split-off parts of your relationships or past trials.",
            individuation: "Your path is currently aligned with the Self. Radiate this internal clarity outward, letting your spiritual truth guide your daily, practical actions."
          },
          synthesis: {
            agreement: "Both models celebrate light as the ultimate indicator of clarity, truth, cosmic wisdom, and the healing integration of the spirit.",
            divergence: "Ibn Sirin maps the light outward to Allah's direct grace and revelation (Wahy), while Jung maps the light inward to the radiant centerpiece of the unified self-archetype (Imago Dei).",
            wisdom: "Receive this light with profound gratitude. Use this clear, divine clarity to mend broken bonds, commit to your spiritual duties, and illuminate the paths of those around you."
          }
        },
        general: {
          summary: "A symbolic tapestry reflecting daily events, current emotions, and subtle calls of the spirit.",
          islamic: {
            symbols: [
              { symbol: "Unfamiliar Path (الطَّرِيق)", meaning: "Ibn Sirin states that walking an unfamiliar path represents searching for guidance, exploring a new moral standard, or undertaking a trial." },
              { symbol: "Unknown Companion (الرّفِيق الْمجْهُول)", meaning: "Represents an angel of guidance, or a personification of your inner moral conscience steering your course." }
            ],
            interpretation: "Your dream represents a transition. Walking through unfamiliar spaces points to an ongoing search for spiritual safety and intellectual direction. This indicates you are in a transitional phase where taking careful, moral actions will yield absolute long-term success.",
            surah_yusuf: "Relates to the journey of Yusuf's caravan that found him in the well. Sometimes unexpected, unfamiliar events are the precise vehicles carrying you to your ultimate destiny.",
            dua: {
              arabic: "اللَّهُمَّ اهْدِنِي وَسَدِّدْنِي وَاجْعَلْنِي هَادِيًا مَهْدِيًّا",
              transliteration: "Allahumma-hdinee wa saddidnee wa-j'alnee haadiyan mahdiyyan",
              meaning: "O Allah, guide me, direct me steps, and make me a guide who is rightly guided.",
              when: "Recite daily to maintain calm composure and divine alignment during periods of rapid transition."
            }
          },
          jungian: {
            archetypes: [
              { archetype: "The Explorer / The Seeker", manifestation: "Walking in unfamiliar territories represents the ego embarking on a journey to map unknown parts of the unconscious." }
            ],
            shadow: "Avoidance of a clear, difficult moral choice in your waking life, choosing to wander in confusion rather than deciding.",
            unconscious_message: "The unconscious is presenting a blank canvas of potential. You are currently wandering in an in-between state because your old attitudes are dying, and your new, integrated identity is still forming. Embrace the mystery of this transition.",
            individuation: "Do not rush to force answers. Allow your authentic identity to crystallize as you continue exploring your spiritual limits and mental horizons."
          },
          synthesis: {
            agreement: "Both models view wandering or searching in unfamiliar spaces as a healthy, necessary phase of active inner and outer seeking.",
            divergence: "Islamic exegesis focuses on the external journey of physical navigation and moral alignment, whereas Jung focused on mapping the interior landscape of the personal psyche.",
            wisdom: "Trust the slow, beautiful process of your personal evolution. Seek guidance in your prayers, remain patient in your trials, and let wisdom reveal itself in its proper season."
          }
        }
      };

      const base = templates[category];
      return {
        summary: base.summary,
        dream_type: dreamType,
        dream_type_reason: dreamTypeReason,
        islamic: base.islamic,
        jungian: base.jungian,
        synthesis: base.synthesis
      };
    };

    function catMatches(dm: string, keywords: string[]) {
      return keywords.some(k => dm.includes(k));
    }

    const ai = getGenAI();
    if (!ai) {
      // Return high-fidelity fallback response when Gemini key is absent
      const resultObj = getSimulatedResponse(dreamLower, state, timing, feeling);
      return res.json({ ...resultObj, isSimulated: true });
    }

    try {
      const prompt = `
Context: state=[${state || 'Unknown'}], timing=[${timing || 'Unknown'}], feeling=[${feeling || 'Unknown'}].
Dream Description: [${dream}].

You are an elite Islamic theologian trained in Ibn Sirin's dream science (Kitab al-Tabir) and Carl Jung's depth psychology.
Please analyze the dream description thoroughly and output a response conforming STRICTLY to the requested JSON structure.

Return ONLY a valid JSON object matching the schema below. No markdown syntax wrapper, no triple-backticks.
{
  "summary": "Exactly 1 sentence summarizing the core theme.",
  "dream_type": "true_vision", 
  "dream_type_reason": "Scholarly, highly academic reason explaining why this fits 'true_vision' (legitimate spiritual vision occurring pre-dawn), 'nafs_dream' (unconscious mental recycling), or 'shaytan_dream' (distressing images of fear), referencing current state (${state}), timing (${timing}), and feeling (${feeling}).",
  "islamic": {
    "symbols": [{"symbol": "Symbol Name", "meaning": "Detailed Ibn Sirin interpretation"}],
    "interpretation": "3-4 sentences of deep Ibn Sirin method synthesis.",
    "surah_yusuf": "A specific, deep connection to Surah Yusuf trials, well, prison, stars, or king's dreams, or 'Not directly applicable'.",
    "dua": {
      "arabic": "supplicant prayer in Arabic script",
      "transliteration": "latin transliteration",
      "meaning": "English translation",
      "when": "detailed instructions on when to recite"
    }
  },
  "jungian": {
    "archetypes": [{"archetype": "Archetype Name (e.g. Shadow, Selfie, Sage, Persona, Anima)", "manifestation": "How it manifests inside this dream"}],
    "shadow": "detailed examination of shadow elements",
    "unconscious_message": "3-4 sentences detailing the active message the unconscious is projecting.",
    "individuation": "growth insight"
  },
  "synthesis": {
    "agreement": "A comparative assessment of where classical tabir and depth psychology align.",
    "divergence": "An explanation of where they structurally differ.",
    "wisdom": "Unified absolute practical takeaway for the user."
  }
}

The dream_type value MUST be exactly one of: 'true_vision' or 'nafs_dream' or 'shaytan_dream'. No other strings.
Ensure all Arabic text is perfectly typed with short vowels (Tashkeel) where possible.
Return ONLY the raw JSON string.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      
      const parsed = JSON.parse(response.text.trim());
      res.json({ ...parsed, isSimulated: false });
    } catch (err: any) {
      console.error("Ruya AI interpreter error:", err);
      // Fallback in case of actual API failure or parsing failure
      const resultObj = getSimulatedResponse(dreamLower, state, timing, feeling);
      res.json({ ...resultObj, isSimulated: true, error: err.message });
    }
  });

  // 7. Dhikr Prescription Engine Endpoint
  app.post("/api/labs/dhikr-rx", async (req, res) => {
    const { emotionKey } = req.body;
    if (!emotionKey) {
      return res.status(400).json({ error: "No emotional state selected" });
    }

    const ai = getGenAI();
    if (!ai) {
      // High-fidelity prebaked prescriptions
      const premadeRx: Record<string, any> = {
        anxiety: {
          dhikr: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
          transliteration: "Hasbunallahu wa ni'mal-Wakeel",
          meaning: "Sufficient for us is Allah, and He is the best Disposer of affairs.",
          repetition: "Repeat 100 times after Morning and Night prayers.",
          secondaryDua: "Ya Hayyu Ya Qayyum bi Rahmatika astagheeth.",
          neuroscience: "Recitation of rhythmic Arabic phonemes activates the vagus nerve, immediately shifting the nervous system from sympathetic (fight-or-flight) to parasympathetic (rest-and-digest). It reduces cortisol production in the adrenal glands and down-regulates a hyper-reactive amygdala. Consistent repetition fosters neuroplastic pathways favoring emotional regulation.",
          lifestyle: "Unplug, seek a green natural setting, or align your sleep cycles directly with the circadian rhythm of Isha and Fajr.",
          timeline: "Instant localized relief within 15 minutes of rhythmic chanting; systemic emotional re-wiring occurs in 21 days."
        },
        grief: {
          dhikr: "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ",
          transliteration: "Inna lillahi wa inna ilayhi raji'oon",
          meaning: "Indeed we belong to Allah, and indeed to Him we will return."
        }
      };

      const defaultOrMatched = premadeRx[emotionKey] || premadeRx["anxiety"];
      return res.json({ result: defaultOrMatched, isSimulated: true });
    }

    try {
      const prompt = `Emotional Slate Selection: "${emotionKey}" (Options include: anxiety, grief, anger, loneliness, arrogance, envy, depression, gratitude).

For this specific state, formulate a precise, dual-disciplinary prescription:
1. Primary Dhikr (Remembrance): Provide accurate Arabic script, clear transliteration, English meaning, and recommended repetitive cycles.
2. Secondary Prophetic Dua from authentic sources.
3. THE NEUROBIOLOGY (Explain precisely in exactly 3 lines): How does this specific vocalized Arabic chanting or meditation mechanically affect cortisol, vagus nerve tone, blood pressure, or regional neuroplasticity?
4. Sunnah Lifestyle Tool: Fasting, sleep alignment, tactile grounding, or walking in nature.
5. Expected chronological timeline for spiritual and cognitive relief.

Respond with a strictly conforming JSON object:
{
  "dhikr": "Arabic text",
  "transliteration": "Transliteration",
  "meaning": "English translation",
  "repetition": "Times to repeat",
  "secondaryDua": "Dua from Sunnah",
  "neuroscience": "A 3-sentence neuroscientific analysis...",
  "lifestyle": "Sunnah practice...",
  "timeline": "Timeline..."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      const parsed = JSON.parse(response.text.trim());
      res.json({ result: parsed, isSimulated: false });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 8. Logical Fallacy Scanner Endpoint
  app.post("/api/labs/fallacy-scanner", async (req, res) => {
    const { argument } = req.body;
    if (!argument) {
      return res.status(400).json({ error: "Please input a valid argument text" });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.json({
        fallacies: [
          {
            name: "Mughalata fi al-Lafz (Linguistic Fallacy) / Equivocation",
            quote: `"${argument.slice(0, 45)}..."`,
            severity: "fatal",
            explanation: "This occurs due to shifting semantics or sliding definition boundaries of key terms inside the premise.",
            reformulation: "Clarify the precise meaning of the term prior to presenting the major premise."
          }
        ],
        isSimulated: true
      });
    }

    try {
      const prompt = `Argument text to analyze: "${argument}".

Scan this argument for classical Fallacies (Mughalata) under traditional Mantiq rules (such as Sofia/Sophistry, Equivocation, Linguistic Mughalata fi al-Lafz, or Semantic Mughalata fi al-Ma'na), as well as modern fallacies (straw man, appeal to authority, false dichotomy, hasty generalization).

You MUST return a JSON object with this shape:
{
  "fallacies": [
    {
      "name": "Classical Term + English Name",
      "quote": "Exact sentence where it occurs",
      "severity": "fatal" | "weakening" | "minor",
      "explanation": "Why this is a fallacy and what logic rule it violates...",
      "reformulation": "How to write the argument correctly..."
    }
  ]
}

Provide deep critical evaluations. If no severe fallacies are present, return an empty array.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      const parsed = JSON.parse(response.text.trim());
      res.json({ ...parsed, isSimulated: false });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 9. Unified Save Endpoint for all Cognitive Labs
  app.post("/api/labs/save", async (req, res) => {
    const { email, featureName, input, output } = req.body;
    const newSave = {
      id: "save_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      email: email || "anonymous",
      featureName,
      input: input || "",
      output: typeof output === "object" ? JSON.stringify(output) : output || "",
      timestamp: new Date().toISOString()
    };

    localCognitiveSaves.push(newSave);

    if (isSupabaseConfigured && supabase && email) {
      try {
        const { error } = await supabase.from("albab_cognitive_saves").insert([newSave]);
        if (error) {
          console.warn("Could not save to Supabase table (yet):", error.message);
        }
      } catch (err: any) {
        console.warn("Exception during Supabase labs save:", err.message);
      }
    }

    res.json({ success: true, save: newSave });
  });

  // 10. Fetch history of labs saves
  app.get("/api/labs/history/:email", async (req, res) => {
    const { email } = req.params;
    let userSaves = localCognitiveSaves.filter(s => s.email.toLowerCase() === email.toLowerCase());

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from("albab_cognitive_saves").select("*").eq("email", email);
        if (data && !error) {
          // Parse stringified output if needed
          return res.json({ history: data });
        }
      } catch (err) {
        console.warn("Fallback to local labs list:", err);
      }
    }

    res.json({ history: userSaves });
  });

  // 11. Complete List of saved records
  app.get("/api/labs/all", (req, res) => {
    res.json({ saves: localCognitiveSaves });
  });

  // 5. HADITH OF THE DAY (Rotating daily, fetching authentic Hadith with grading, with subscribe option)
  app.get("/api/hadith-of-the-day", async (req, res) => {
    const ai = getGenAI();
    
    const prebakedHadiths = [
      {
        arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
        translation: "Actions are but by intentions, and every person shall have but that which he intended.",
        source: "Sahih al-Bukhari 1, Sahih Muslim 1907",
        grading: "Mutawatir Sahih (Unanimously Agreed) ✓",
        context: "The ethical starting gate of all actions, highlighting internal spiritual purity."
      },
      {
        arabic: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ",
        translation: "The true Muslim is one from whose tongue and hand other Muslims are safe.",
        source: "Sahih al-Bukhari 10",
        grading: "Sahih ✓",
        context: "Underlines social justice, verbal safety, non-aggression, and fraternal peace."
      }
    ];

    if (!ai) {
      // Return a rotating prebaked item based on the calendar day
      const day = new Date().getDate();
      const selected = prebakedHadiths[day % prebakedHadiths.length];
      return res.json({ data: selected, isSimulated: true });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Generate exactly one authentic, highly inspirational prophetic Hadith with its full Arabic text, its English translation, its rigorous classical source citation, its Isnad grading (e.g., Sahih/Hasan), and a short paragraph describing its academic context.
        Return as valid JSON of this exact schema:
        {
          "arabic": "...",
          "translation": "...",
          "source": "...",
          "grading": "...",
          "context": "..."
        }`,
        config: {
          responseMimeType: "application/json"
        }
      });
      const parsed = JSON.parse(response.text.trim());
      res.json({ data: parsed, isSimulated: false });
    } catch (e: any) {
      const day = new Date().getDate();
      const selected = prebakedHadiths[day % prebakedHadiths.length];
      res.json({ data: selected, isSimulated: true });
    }
  });

  // Hadith Newsletter Subscription (Resend alternative simulator)
  app.post("/api/subscribe-hadith", (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email field is required" });
    }
    localSubscribers.push(email.toLowerCase());
    console.log(`New Hadith newsletter subscriber registered: ${email}`);
    res.json({ success: true, email, count: localSubscribers.length });
  });

  // 6. WAQF / SPONSOR AD-HOC API
  app.post("/api/sponsor", (req, res) => {
    const { courseId, name, amount, type } = req.body;
    if (!courseId || !name) {
      return res.status(400).json({ error: "Missing required fields: courseId and name" });
    }

    if (!localSponsorships[courseId]) {
      localSponsorships[courseId] = [];
    }
    // Prevent duplicated sponsors displaying
    if (!localSponsorships[courseId].includes(name)) {
      localSponsorships[courseId].push(name);
    }

    console.log(`Generous Sadaqah Jariyah Waqf received. Course: ${courseId}, Donor: ${name}, Value: $${amount} (${type})`);
    res.json({ success: true, courseId, sponsors: localSponsorships[courseId] });
  });

  app.get("/api/sponsors", (req, res) => {
    res.json({ sponsorships: localSponsorships });
  });

  // 7. DASHBOARD STUDENT PROFILE PERSISTENCE (Saves bookmarks, streaking counts, and completed quiz grades)
  app.get("/api/dashboard/:email", (req, res) => {
    const email = req.params.email.toLowerCase();
    const defaultData = {
      enrolled: ["quran", "hadith", "fiqh"],
      progress: { quran: 40, hadith: 20, fiqh: 0, logic: 10 },
      bookmarks: ["knowledge-obligation"],
      quizzes: [
        { branch: "Tafseer", score: 80, date: "May 24, 2026" },
        { branch: "Usul al-Fiqh", score: 90, date: "May 25, 2026" }
      ],
      studyStreak: 5,
      totalXP: 1450
    };
    res.json({ data: localDashboards[email] || defaultData });
  });

  app.post("/api/dashboard/:email", (req, res) => {
    const email = req.params.email.toLowerCase();
    const { data } = req.body;
    localDashboards[email] = data || {};
    res.json({ success: true, data: localDashboards[email] });
  });

  // Scribes Admin analytics feed
  app.get("/api/admin-analytics", (req, res) => {
    res.json({
      studentsCount: localAdmissions.length + 18,
      recentQuizzes: [
        { student: "Zubayr Al-Husseini", branch: "Usul al-Fiqh", score: 90, status: "Passed" },
        { student: "Layla Bintl Farooq", branch: "Deductive Logic", score: 100, status: "Passed" },
        { student: "Imran Siddiqui", branch: "Atheism Critique", score: 60, status: "Failed" }
      ],
      branchSponsorships: localSponsorships
    });
  });

  // Vite development integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite Development Middleware mounted successfully.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: any, res: any) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Static build production routing initialized.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Scholastic Backend Server is listening gracefully on port ${PORT}`);
  });
}

startServer();
