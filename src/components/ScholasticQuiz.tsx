import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Award, CheckCircle2, AlertTriangle, ArrowRight, 
  RotateCcw, Sparkles, HelpCircle, FileText, ChevronRight, 
  Bookmark, ShieldCheck, Download, Share2, ClipboardList
} from 'lucide-react';
import { Language } from '../i18n';

interface ScholasticQuizProps {
  currentTheme: 'parchment' | 'space';
  language: Language;
  onBackToLanding: () => void;
}

// Deep, authentic questions across disciplines and levels
interface QuizQuestion {
  id: string;
  discipline: 'fiqh' | 'hadith';
  level: 'mubtadi' | 'mutawassit' | 'muntahi';
  question: {
    en: string;
    ar: string;
    ur: string;
  };
  options: {
    key: string;
    text: {
      en: string;
      ar: string;
      ur: string;
    };
  }[];
  correctAnswer: string;
  feedback: {
    en: string;
    ar: string;
    ur: string;
  };
  reference: string;
  arabicRef?: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  // --- FIQH DISCIPLINE ---
  {
    id: 'f1',
    discipline: 'fiqh',
    level: 'mubtadi',
    question: {
      en: "Which legal maxim states that established status cannot be voided or overturned by temporary, unverified doubt?",
      ar: "أي قاعدة فقهية تنص على أن اليقين الثابت لا يرتفع بحدوث شك طارئ؟",
      ur: "کون سا فقہی قاعدہ یہ بیان کرتا ہے کہ ثابت شدہ حالت عارضی یا غیر مصدقہ شک سے زائل نہیں ہو سکتی؟"
    },
    options: [
      {
        key: 'A',
        text: {
          en: "Harm must be eliminated (Al-Dharar Yuzal)",
          ar: "الضرر يزال",
          ur: "نقصان کو دور کیا جائے (الضرر يزال)"
        }
      },
      {
        key: 'B',
        text: {
          en: "Certainty is not overruled by doubt (Al-Yaqin la Yazulu bish-Shakk)",
          ar: "اليقين لا يزول بالشك",
          ur: "یقین شک سے زائل نہیں ہوتا (اليقين لا يزول بالشك)"
        }
      },
      {
        key: 'C',
        text: {
          en: "Custom is arbitrator (Al-'Adah Muhakkamah)",
          ar: "العادة محكمة",
          ur: "عرف و رواج فیصلہ کن ہے (العادة محكمة)"
        }
      },
      {
        key: 'D',
        text: {
          en: "Hardship brings ease (Al-Mashaqqah Tajlib al-Taysir)",
          ar: "المشقة تجلب التيسير",
          ur: "تنگی آسانی لاتی ہے (المشقة تجلب التيسير)"
        }
      }
    ],
    correctAnswer: 'B',
    feedback: {
      en: "This is one of the five grand universal legal maxims upon which the entirety of Islamic jurisprudence rests. It ensures legal stability and psychological peace, combating scrupulosity (waswas).",
      ar: "هذه إحدى القواعد الفقهية الكبرى الخمس التي ينبني عليها الفقه الإسلامي كله، وتدفع الوساوس والشكوك الطارئة بالرجوع إلى اليقين الأصلي.",
      ur: "یہ ان پانچ بڑی عالمگیر فقہی قواعد میں سے ایک ہے جن پر تمام اسلامی فقہ کی بنیاد ہے۔ یہ قانونی استحکام کو یقینی بناتا ہے اور وسوسوں کو دور کرتا ہے۔"
    },
    reference: "Al-Suyuti, Al-Ashbah wan-Naza'ir, Maxim 1",
    arabicRef: "السيوطي، الأشباه والنظائر، القاعدة الأولى"
  },
  {
    id: 'f2',
    discipline: 'fiqh',
    level: 'mubtadi',
    question: {
      en: "According to the majority of scholars, what is the primary purpose of the Maqasid al-Shariah (Objectives of Law)?",
      ar: "وفقاً لجمهور العلماء، ما هو الهدف الأساسي لمقاصد الشريعة الإسلامية؟",
      ur: "جمہور علماء کے نزدیک مقاصد الشریعہ کا بنیادی مقصد کیا ہے؟"
    },
    options: [
      {
        key: 'A',
        text: {
          en: "Strict enforcement of penalties",
          ar: "التطبيق الصارم للعقوبات",
          ur: "سزاؤں کا سخت نفاذ"
        }
      },
      {
        key: 'B',
        text: {
          en: "Securing human welfare and removing hardship (Maslahah)",
          ar: "جلب مصالح العباد ودرء المفاسد عنهم (المصلحة)",
          ur: "انسانی فلاح و بہبود کا حصول اور تنگی کا خاتمہ (مصلحت)"
        }
      },
      {
        key: 'C',
        text: {
          en: "Abolishing pre-Islamic customary laws completely",
          ar: "إلغاء القوانين العرفية الجاهلية بالكامل",
          ur: "قبل از اسلام کے روایتی قوانین کو مکمل طور پر ختم کرنا"
        }
      },
      {
        key: 'D',
        text: {
          en: "Aligning human systems purely with legal literalism",
          ar: "مواءمة النظم البشرية مع الحرفية القانونية البحتة",
          ur: "انسانی نظاموں کو خالصتاً لفظی قانون سے ہم آہنگ کرنا"
        }
      }
    ],
    correctAnswer: 'B',
    feedback: {
      en: "The core philosophy of Shariah centers on protecting five necessities: Religion, Life, Intellect, Lineage, and Wealth. All laws aim at procuring benefits (Jalb al-Masalih) and preventing harm (Dar' al-Mafasid).",
      ar: "تتمحور فلسفة الشريعة حول حفظ الضروريات الخمس: الدين والنفس والعقل والنسل والمال. وتهدف الأحكام كلها إلى جلب المصالح ودرء المفاسد.",
      ur: "شریعت کا بنیادی فلسفہ پانچ ضروریات کی حفاظت پر مرکوز ہے: دین، جان، عقل، نسل اور مال۔ تمام قوانین کا مقصد مصالح کو حاصل کرنا اور مفاسد کو روکنا ہے۔"
    },
    reference: "Al-Shatibi, Al-Muwafaqat fi Usul al-Shariah",
    arabicRef: "الشاطبي، الموافقات في أصول الشريعة"
  },
  {
    id: 'f3',
    discipline: 'fiqh',
    level: 'mutawassit',
    question: {
      en: "Which commercial term represents a transaction where the seller discloses the original cost price and adds a specified profit margin?",
      ar: "ما هو المصطلح التجاري الذي يطلق على بيع يذكر فيه البائع الثمن الأصلي الذي اشترى به السلعة مع زيادة ربح معلوم؟",
      ur: "کون سی تجارتی اصطلاح اس سودے کو ظاہر کرتی ہے جہاں بیچنے والا اصل قیمت خرید بتاتا ہے اور اس پر منافع کا متعین مارجن جوڑتا ہے؟"
    },
    options: [
      {
        key: 'A',
        text: {
          en: "Riba (Usury/Interest)",
          ar: "الربا",
          ur: "ربا (سود)"
        }
      },
      {
        key: 'B',
        text: {
          en: "Murabahah (Cost-Plus Profit)",
          ar: "بيع المرابحة",
          ur: "مرابحہ (اصل قیمت مع منافع)"
        }
      },
      {
        key: 'C',
        text: {
          en: "Mudarabah (Trustee Financing)",
          ar: "المضاربة",
          ur: "مضاربہ (مشارکتِ امانت)"
        }
      },
      {
        key: 'D',
        text: {
          en: "Ijarah (Leasing contract)",
          ar: "الإجارة",
          ur: "اجارہ (کرایہ داری کا معاہدہ)"
        }
      }
    ],
    correctAnswer: 'B',
    feedback: {
      en: "Murabahah is a classical fiduciary contract (Buyu' al-Amanah). Under modern Islamic banking, it is widely utilized for commodity financing where the asset's acquisition cost and profit are explicitly declared.",
      ar: "بيع المرابحة من بيوع الأمانة التي يصدق فيها البائع المشتري في بيان رأس المال مع ربح معلوم، وهو أساس التمويل الإسلامي المعاصر.",
      ur: "مرابحہ بیوعِ امانت میں سے ایک کلاسیکی معاہدہ ہے۔ جدید اسلامی بینکاری میں اشیاء کی فنانسنگ کے لیے اس کا کثرت سے استعمال کیا جاتا ہے جہاں اثاثہ کی قیمت خرید اور منافع واضح طور پر بتایا جاتا ہے۔"
    },
    reference: "Ibn Rushd, Bidayat al-Mujtahid, Book of Sales",
    arabicRef: "ابن رشد، بداية المجتهد ونهاية المقتصد، كتاب البيوع"
  },
  {
    id: 'f4',
    discipline: 'fiqh',
    level: 'mutawassit',
    question: {
      en: "Under comparative Fiqh methodology, what does the term 'Rukhsah' signify?",
      ar: "في منهجية الفقه المقارن، ماذا يعني مصطلح 'الرخصة' الفقهي؟",
      ur: "موازنہِ فقہ کے طریقہ کار کے تحت، اصطلاح 'رخصت' سے کیا مراد ہے؟"
    },
    options: [
      {
        key: 'A',
        text: {
          en: "A strict obligation with no exceptions",
          ar: "الحكم الأصلي العزيمة الخالي من الاستثناءات",
          ur: "بغیر کسی استثنیٰ کے سخت ترین واجب عمل"
        }
      },
      {
        key: 'B',
        text: {
          en: "A legal concession relaxing a rule due to severe hardship",
          ar: "تسهيل وتخفيف شرعي طرأ لعذر أو مشقة شديدة",
          ur: "سخت مشقت کی وجہ سے کسی حکم میں ملنے والی شرعی رعایت"
        }
      },
      {
        key: 'C',
        text: {
          en: "A law repealed permanently from the texts",
          ar: "حكم منسوخ ومزال نهائياً من الشريعة",
          ur: "شریعت کے متن سے مستقل طور پر منسوخ شدہ حکم"
        }
      },
      {
        key: 'D',
        text: {
          en: "An innovation without scholastic backing",
          ar: "بدعة قانونية لا يسندها دليل شرعي",
          ur: "ایسی ایجاد جس کی پشت پناہی فقہی دلائل سے نہ ہو"
        }
      }
    ],
    correctAnswer: 'B',
    feedback: {
      en: "Rukhsah is contrasted with 'Azimah (the default, rigorous rule). Examples include shortening prayers during travel or consuming normally forbidden things to save one's life in extreme necessity.",
      ar: "الرخصة تقابل العزيمة، وهي تيسير شرعي يشرع للمكلفين تخفيفاً لمشقة استثنائية، كقصر الصلاة للمسافر وأكل الميتة للمضطر.",
      ur: "رخصت کا مقابلہ 'عزیمت' (بنیادی حکم) سے ہوتا ہے۔ اس کی مثالوں میں سفر کے دوران نماز قصر کرنا یا شدید ضرورت میں جان بچانے کے لیے ممنوع چیز کھانا شامل ہے۔"
    },
    reference: "Al-Ghazali, Al-Mustasfa min 'Ilm al-Usul",
    arabicRef: "الغزالي، المستصفى من علم الأصول"
  },
  {
    id: 'f5',
    discipline: 'fiqh',
    level: 'muntahi',
    question: {
      en: "In Hanafi Usul al-Fiqh, what is the exact epistemological difference between 'Fard' (Obligatory) and 'Wajib' (Necessary)?",
      ar: "في أصول الفقه الحنفي، ما هو الفرق الإبستمولوجي الدقيق بين 'الفرض' و'الواجب'؟",
      ur: "اصولِ فقہ حنفی میں، 'فرض' اور 'واجب' کے درمیان دقیق علمی فرق کیا ہے؟"
    },
    options: [
      {
        key: 'A',
        text: {
          en: "They are completely synonymous with no distinct variance",
          ar: "هما مترادفان تماماً ولا يوجد أي فرق تفصيلي بينهما",
          ur: "وہ مکمل طور پر مترادف ہیں اور ان میں کوئی نمایاں فرق نہیں ہے"
        }
      },
      {
        key: 'B',
        text: {
          en: "Fard is established by absolute textual proof (Qat'i), while Wajib is proven by speculative proof (Dhanni)",
          ar: "الفرض يثبت بدليل قطعي الثبوت والدلالة، بينما الواجب يثبت بدليل ظني",
          ur: "فرض قطعی دلیل سے ثابت ہوتا ہے، جبکہ واجب ظنی دلیل (جیسے اخبارِ آحاد) سے ثابت ہوتا ہے"
        }
      },
      {
        key: 'C',
        text: {
          en: "Wajib requires immediate performance whereas Fard can be delayed",
          ar: "الواجب يجب أداؤه فوراً أما الفرض فيجوز تأخيره",
          ur: "واجب کی ادائیگی فوری طور پر لازم ہے جبکہ فرض کو مؤخر کیا جا سکتا ہے"
        }
      },
      {
        key: 'D',
        text: {
          en: "Fard applies only to ritual acts, and Wajib applies only to commercial transactions",
          ar: "الفرض يختص بالعبادات فقط والواجب بالمعاملات التجارية والمالية",
          ur: "فرض صرف عبادات پر لاگو ہوتا ہے، اور واجب صرف تجارتی لین دین پر"
        }
      }
    ],
    correctAnswer: 'B',
    feedback: {
      en: "This distinction is a hallmark of Hanafi legal philosophy. Rejecting a Fard leads to disbelief (Kufr), while rejecting a Wajib does not, though leaving its practice willfully is sin (Fisq).",
      ar: "يميز الحنفية بين الفرض والواجب؛ فالفرض ما ثبت بدليل قطعي لا شبهة فيه كقرآن متواتر ويكفر جاحده، والواجب ما ثبت بدليل ظني كخبر الآحاد.",
      ur: "یہ تمیز فقہ حنفی کا ایک بڑا امتیاز ہے۔ فرض کا انکار کفر تک لے جاتا ہے، جبکہ واجب کا منکر کافر نہیں کہلاتا، اگرچہ اسے جان بوجھ کر چھوڑنا گناہ (فسق) ہے۔"
    },
    reference: "Al-Pazdawi, Usul al-Pazdawi, Section on Obligation",
    arabicRef: "البزدوي، كنز الوصول إلى معرفة الأصول"
  },

  // --- HADITH DISCIPLINE ---
  {
    id: 'h1',
    discipline: 'hadith',
    level: 'mubtadi',
    question: {
      en: "Which classical collection is considered the earliest arranged systematically according to jurisprudential (Fiqh) categories?",
      ar: "ما هي المجموعة الكلاسيكية التي تعد أول مصنف مرتب منهجياً وفقاً للأبواب الفقهية؟",
      ur: "کون سا کلاسیکی مجموعہ فقہی ابواب کے مطابق منظم کیا جانے والا قدیم ترین مجموعہ سمجھا جاتا ہے؟"
    },
    options: [
      {
        key: 'A',
        text: {
          en: "Sahih al-Bukhari",
          ar: "صحيح البخاري",
          ur: "صحیح البخاری"
        }
      },
      {
        key: 'B',
        text: {
          en: "Al-Muwatta of Imam Malik",
          ar: "موطأ الإمام مالك",
          ur: "موطا امام مالک"
        }
      },
      {
        key: 'C',
        text: {
          en: "Sunan al-Tirmidhi",
          ar: "سنن الترمذي",
          ur: "سنن الترمذی"
        }
      },
      {
        key: 'D',
        text: {
          en: "Musnad Ahmad ibn Hanbal",
          ar: "مسند أحمد بن حنبل",
          ur: "مسند احمد بن حنبل"
        }
      }
    ],
    correctAnswer: 'B',
    feedback: {
      en: "Imam Malik compiled Al-Muwatta ('The Approved') in Madinah. It remains a foundational masterpiece representing the synthesis of Prophetic Sunnah and early Madinan legal consensus (Amal Ahl al-Madinah).",
      ar: "صنف الإمام مالك الموطأ بالمدينة المنورة، وهو أقدم كتاب جامع للأحاديث مرتب على الأبواب الفقهية يدمج السنن والآثار بعمل أهل المدينة.",
      ur: "امام مالک نے مدینہ منورہ میں 'موطا' مرتب کیا۔ یہ نبوی سنت اور اہل مدینہ کے تعامل (عمل اہل مدینہ) کے امتزاج کا ایک بہترین شاہکار ہے۔"
    },
    reference: "Imam Malik, Al-Muwatta, Introduction",
    arabicRef: "مالك بن أنس، مقدمة الموطأ"
  },
  {
    id: 'h2',
    discipline: 'hadith',
    level: 'mubtadi',
    question: {
      en: "What is the designation for a Hadith where the chain of narrators is broken by the omission of a Companion (Sahabi) at the very end?",
      ar: "ما هو اسم الحديث الذي سقط من آخر سنده الصحابي، ورفعه التابعي مباشرة؟",
      ur: "اس حدیث کو کیا کہتے ہیں جس کی سند کے آخر میں صحابی کا ذکر چھوٹ جائے اور تابعی براہِ راست روایت کرے؟"
    },
    options: [
      {
        key: 'A',
        text: {
          en: "Mu'dal (Perplexing/Double gap)",
          ar: "المعضل",
          ur: "معضل"
        }
      },
      {
        key: 'B',
        text: {
          en: "Mursal (Sent/Hurried)",
          ar: "المرسل",
          ur: "مرسل"
        }
      },
      {
        key: 'C',
        text: {
          en: "Mawdu' (Fabricated)",
          ar: "الموضوع",
          ur: "موضوع (من گھڑت)"
        }
      },
      {
        key: 'D',
        text: {
          en: "Mutawatir (Consecutive)",
          ar: "المتواتر",
          ur: "متواتر"
        }
      }
    ],
    correctAnswer: 'B',
    feedback: {
      en: "A Mursal Hadith occurs when a Successor (Tabii) says 'The Prophet said...' without mentioning which Companion told them. Scholars of Usul differ on its use as a legal proof.",
      ar: "الحديث المرسل هو ما رفعه التابعي (كبيراً كان أو صغيراً) إلى النبي صلى الله عليه وسلم دون ذكر الصحابي الواسطة.",
      ur: "مرسل حدیث وہ ہوتی ہے جس میں ایک تابعی براہِ راست کہتا ہے کہ 'رسول اللہ صلی اللہ علیہ وسلم نے فرمایا...' اور درمیان سے صحابی کا تذکرہ چھوڑ دیتا ہے۔"
    },
    reference: "Ibn al-Salah, Muqaddimah fi 'Ulum al-Hadith",
    arabicRef: "ابن الصلاح، معرفة أنواع علم الحديث (المقدمة)"
  },
  {
    id: 'h3',
    discipline: 'hadith',
    level: 'mutawassit',
    question: {
      en: "Who compiled the monumental, universally celebrated commentary on Sahih al-Bukhari titled 'Fath al-Bari'?",
      ar: "من هو العالم الحافظ الذي وضع الشرح الأضخم والأشهر لصحيح البخاري والمسمى 'فتح الباري'؟",
      ur: "صحیح البخاری کی سب سے مشہور اور ضخیم شرح 'فتح الباري' کے مصنف کون ہیں؟"
    },
    options: [
      {
        key: 'A',
        text: {
          en: "Imam al-Nawawi",
          ar: "الإمام النووي",
          ur: "امام نووی"
        }
      },
      {
        key: 'B',
        text: {
          en: "Ibn Kathir",
          ar: "الحافظ ابن كثير",
          ur: "حافظ ابنِ کثیر"
        }
      },
      {
        key: 'C',
        text: {
          en: "Ibn Hajar al-Asqalani",
          ar: "الحافظ ابن حجر العسقلاني",
          ur: "حافظ ابنِ حجر عسقلانی"
        }
      },
      {
        key: 'D',
        text: {
          en: "Jalaluddin al-Suyuti",
          ar: "جلال الدين السيوطي",
          ur: "جلال الدین سیوطی"
        }
      }
    ],
    correctAnswer: 'C',
    feedback: {
      en: "Hafidh Ibn Hajar al-Asqalani (d. 852 AH) spent decades compiling Fath al-Bari. Upon its completion, the scholars of Islam declared: 'No migration after the conquest (Fath)!'",
      ar: "الحافظ شهاب الدين ابن حجر العسقلاني ألف شرحه الحافل في أكثر من عشرين سنة، وقيل عند تمامه: 'لا هجرة بعد الفتح'.",
      ur: "حافظ ابن حجر عسقلانی (وفات 852ھ) نے فتح الباری کی تالیف میں دہائیاں گزاریں۔ اس کی تکمیل پر اس وقت کے علماء نے فرمایا تھا: 'لا هجرة بعد الفتح' (فتح کے بعد اب کسی اور شرح کی ضرورت نہیں رہی)۔"
    },
    reference: "Ibn Hajar al-Asqalani, Fath al-Bari, Prolegomena",
    arabicRef: "ابن حجر العسقلاني، هدي الساري مقدمة فتح الباري"
  },
  {
    id: 'h4',
    discipline: 'hadith',
    level: 'mutawassit',
    question: {
      en: "What is the primary condition that distinguishes a Hadith as 'Mutawatir' (Consecutive)?",
      ar: "ما هو الشرط الأساسي والفيصل ليوصف الحديث بأنه 'متواتر'؟",
      ur: "حدیث کو 'متواتر' قرار دینے کے لیے بنیادی اور فیصل کن شرط کیا ہے؟"
    },
    options: [
      {
        key: 'A',
        text: {
          en: "It must be recorded in all of the Sihah al-Sittah (Six Authentic Books)",
          ar: "أن يكون مخرجاً في جميع الكتب الستة الصحاح",
          ur: "اس کا صحاح ستہ (چھ مستند کتابوں) کی تمام کتب میں درج ہونا ضروری ہے"
        }
      },
      {
        key: 'B',
        text: {
          en: "It must contain only narrators who were direct family relatives of the Prophet",
          ar: "أن يرويه فقط آل البيت أو أقارب الرسول المقربون",
          ur: "اس کے راوی صرف خاندانِ نبوت کے افراد ہونے چاہئیں"
        }
      },
      {
        key: 'C',
        text: {
          en: "It must be narrated by such a large number of people at every link of the chain that collusion on a lie is logically impossible",
          ar: "أن يرويه جمع غفير في كل طبقة من طبقات السند تحيل العادة تواطؤهم على الكذب",
          ur: "اسے ہر طبقے میں اتنی بڑی تعداد نے روایت کیا ہو کہ عقل ان سب کے جھوٹ پر متفق ہونے کو ناممکن سمجھے"
        }
      },
      {
        key: 'D',
        text: {
          en: "It must possess a continuous chain without a single weak narrator",
          ar: "أن يكون مسلسلاً بالسند المتصل الخالي من الرواة الضعاف فحسب",
          ur: "اس کی سند متصل ہو اور اس میں کوئی ایک راوی بھی کمزور نہ ہو"
        }
      }
    ],
    correctAnswer: 'C',
    feedback: {
      en: "A Mutawatir narration yields absolute epistemological certainty (Yaqin/Daruri). It contrasts with Ahad (isolated) narrations, which represent probabilistic evidence, though still legally binding.",
      ar: "المتواتر يفيد العلم اليقيني الضروري، وشروطه تقتضي الكثرة الكاثرة في الرواية من المبتدأ إلى المنتهى بحيث يمتنع عقلاً الاتفاق على الكذب.",
      ur: "متواتر روایت یقینی علمی فائدہ دیتی ہے۔ یہ اخبارِ آحاد کے برعکس ہے جو ظنی فائدہ دیتی ہیں اگرچہ شرعی طور پر قابلِ عمل ہوتی ہیں۔"
    },
    reference: "Al-Khatib al-Baghdadi, Al-Kifayah fi 'Ilm al-Riwayah",
    arabicRef: "الخطيب البغدادي، الكفاية في علم الرواية"
  },
  {
    id: 'h5',
    discipline: 'hadith',
    level: 'muntahi',
    question: {
      en: "If a trustworthy narrator (Thiqah) transmits a Hadith that directly contradicts a narration of a more reliable or numerous group of narrators, how is their specific narration classified in Mustafa (terminology)?",
      ar: "إذا روى الراوي الثقة حديثاً يخالف فيه من هو أوثق منه أو أكثر عدداً، فما هو تصنيف حديثه هذا عند المحدثين؟",
      ur: "اگر کوئی ثقہ راوی ایسی حدیث روایت کرے جو اس سے زیادہ ثقہ یا زیادہ راویوں کی جماعت کے خلاف ہو، تو اس مخصوص روایت کو اصطلاح میں کیا درجہ دیا جاتا ہے؟"
    },
    options: [
      {
        key: 'A',
        text: {
          en: "Shadhdh (Anomalous)",
          ar: "الشاذ",
          ur: "شاذ"
        }
      },
      {
        key: 'B',
        text: {
          en: "Munkar (Denounced)",
          ar: "المنكر",
          ur: "منکر"
        }
      },
      {
        key: 'C',
        text: {
          en: "Mudtarib (Shaken/Inconsistent)",
          ar: "المضطرب",
          ur: "مضطرب"
        }
      },
      {
        key: 'D',
        text: {
          en: "Gharib (Uncommon/Singular)",
          ar: "الغريب",
          ur: "غریب (اکیلے راوی کی روایت)"
        }
      }
    ],
    correctAnswer: 'A',
    feedback: {
      en: "This is the classic definition of Shadhdh. The opposing narration (from the more trustworthy/numerous narrators) is called Mahfudh (Preserved). If a weak narrator contradicts a trustworthy one, it is classified as Munkar.",
      ar: "الحديث الشاذ هو ما رواه الثقة مخالفاً لمن هو أولى منه أو أرجح، ويقابله الحديث المحفوظ. أما مخالفة الضعيف للثقة فتسمى منكراً.",
      ur: "یہ شاذ حدیث کی کلاسیکی تعریف ہے۔ اس کے مقابلے میں زیادہ ثقہ راویوں کی روایت کو 'محفوظ' کہا جاتا ہے۔ جبکہ ضعیف راوی کی مخالفت کو 'منکر' کہا جاتا ہے۔"
    },
    reference: "Ibn Hajar, Nuzhat al-Nazar Sharh Nukhbat al-Fikar",
    arabicRef: "ابن حجر العسقلاني، نزهة النظر في توضيح نخبة الفكر"
  }
];

export default function ScholasticQuiz({ currentTheme, language, onBackToLanding }: ScholasticQuizProps) {
  const isSpace = currentTheme === 'space';
  
  // Selection state
  const [selectedDiscipline, setSelectedDiscipline] = useState<'fiqh' | 'hadith' | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<'mubtadi' | 'mutawassit' | 'muntahi' | null>(null);
  
  // Quiz running states
  const [isStarted, setIsStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({}); // id -> answer key

  // Filtered list based on discipline + level
  const activeQuestions = QUIZ_QUESTIONS.filter(
    q => q.discipline === selectedDiscipline && q.level === selectedLevel
  );

  const startQuiz = () => {
    if (activeQuestions.length === 0) return;
    setIsStarted(true);
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
    setUserAnswers({});
  };

  const handleSelectOption = (key: string) => {
    if (isAnswered) return;
    setSelectedAnswer(key);
  };

  const handleConfirmAnswer = () => {
    if (!selectedAnswer || isAnswered) return;
    setIsAnswered(true);
    const q = activeQuestions[currentIdx];
    const isCorrect = selectedAnswer === q.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    setUserAnswers(prev => ({ ...prev, [q.id]: selectedAnswer }));
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    if (currentIdx + 1 < activeQuestions.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setQuizFinished(true);
      // Attempt to save to student database if applicable (via browser storage as dynamic record)
      try {
        const existingHistory = JSON.parse(localStorage.getItem('albab_quiz_history') || '[]');
        const record = {
          discipline: selectedDiscipline,
          level: selectedLevel,
          score: score + (selectedAnswer === activeQuestions[currentIdx].correctAnswer ? 1 : 0),
          total: activeQuestions.length,
          timestamp: new Date().toISOString(),
          id: Math.random().toString(36).substring(2, 9)
        };
        existingHistory.push(record);
        localStorage.setItem('albab_quiz_history', JSON.stringify(existingHistory));
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const handleResetSelection = () => {
    setIsStarted(false);
    setSelectedDiscipline(null);
    setSelectedLevel(null);
    setQuizFinished(false);
  };

  // Grading calculator
  const percentScore = activeQuestions.length > 0 ? (score / activeQuestions.length) * 100 : 0;
  
  const getScholarGrade = () => {
    if (percentScore === 100) return { title: "Alim (Scholar-Sage)", class: "text-emerald-600 dark:text-emerald-400" };
    if (percentScore >= 80) return { title: "Faqih (Juristic Thinker)", class: "text-amber-600 dark:text-amber-400" };
    if (percentScore >= 60) return { title: "Talib al-Ilm (Diligent Seeker)", class: "text-blue-600 dark:text-blue-400" };
    return { title: "Mubtadi (Novice Disciple)", class: "text-stone-500 dark:text-stone-400" };
  };

  return (
    <div className={`p-6 sm:p-10 rounded-xl border max-w-5xl mx-auto shadow-2xl transition-all duration-300 relative overflow-hidden my-4
      ${isSpace 
        ? 'bg-space-dark/70 border-gold/15 text-white' 
        : 'bg-[#FCFAF6] border-[#0B4628]/15 text-stone-900'
      }
    `}>
      {/* Arabic Decorative Script in Background */}
      <div className="absolute top-4 right-8 opacity-[0.03] pointer-events-none select-none text-9xl font-serif leading-none font-bold">
        امتحان
      </div>

      {/* Header section */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-2 px-3 py-1.5 w-fit rounded-full border text-[10px] font-mono tracking-[0.2em] uppercase font-black
          dark:border-gold/30 dark:bg-gold/10 dark:text-gold-light border-[#0B4628]/25 bg-[#0B4628]/5 text-[#0B4628]"
        >
          <ClipboardList className="h-4 w-4 text-amber-500 animate-pulse" />
          {language === 'ar' ? 'منصة الامتحانات والتقييم' : language === 'ur' ? 'امتحانی بورڈ' : 'Interactive Scholastic Assessment'}
        </div>
        
        <h2 className="font-serif font-black text-3xl sm:text-4xl tracking-tight text-stone-900 dark:text-stone-100">
          {language === 'ar' ? 'الاختبار الأكاديمي التفاعلي' : language === 'ur' ? 'انٹرایکٹو تعلیمی کوئز' : 'Scholastic Quiz Module'}
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-3xl leading-relaxed">
          {language === 'ar' 
            ? 'اختبر معارفك الفقهية والحديثية بمنهجية نقدية رصينة واحصل على إجازة علمية ورقية وتغذية راجعة فورية بمرجعيات من أمهات الكتب الكلاسيكية.' 
            : language === 'ur'
              ? 'اپنے فقہی اور حدیثی علم کی جانچ کیجیے۔ یہ ماڈیول آپ کو ہر سوال پر فوری فیڈ بیک اور مستند کتابوں کے حوالے فراہم کرتا ہے۔'
              : 'Audit your theological and empirical parameters across core Islamic disciplines. This expert engine issues instant juristic reasoning and references directly to classical works of Islamic sciences.'
          }
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!isStarted ? (
          // SELECT DISCIPLINE & LEVEL SCREEN
          <motion.div 
            key="selector-screen"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8 mt-6 pt-4 border-t border-stone-200 dark:border-zinc-800"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Discipline picker */}
              <div className="space-y-4">
                <label className="text-xs uppercase font-mono tracking-widest text-[#0B4628] dark:text-gold font-black block">
                  1. {language === 'ar' ? 'اختر التخصص العلمي' : language === 'ur' ? 'علمی شعبہ منتخب کریں' : 'Select Discipline'}
                </label>
                <div className="grid grid-cols-1 gap-4">
                  <button
                    onClick={() => setSelectedDiscipline('fiqh')}
                    className={`p-5 rounded-lg border-2 text-left transition-all relative overflow-hidden group cursor-pointer
                      ${selectedDiscipline === 'fiqh'
                        ? 'border-[#0B4628] bg-[#0B4628]/5 dark:border-gold dark:bg-gold/10'
                        : 'border-stone-200 hover:border-[#0B4628]/40 dark:border-zinc-800 dark:hover:border-gold/40'
                      }
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded bg-[#0B4628]/10 dark:bg-gold/10 text-[#0B4628] dark:text-gold">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-serif font-black text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                          Fiqh & Usul
                          <span className="text-xs font-serif text-[#0B4628] dark:text-gold italic font-normal">الفقه وأصوله</span>
                        </div>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                          Universal legal maxims, commercial laws, Usul methodologies, and juristic reasoning.
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedDiscipline('hadith')}
                    className={`p-5 rounded-lg border-2 text-left transition-all relative overflow-hidden group cursor-pointer
                      ${selectedDiscipline === 'hadith'
                        ? 'border-[#0B4628] bg-[#0B4628]/5 dark:border-gold dark:bg-gold/10'
                        : 'border-stone-200 hover:border-[#0B4628]/40 dark:border-zinc-800 dark:hover:border-gold/40'
                      }
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded bg-[#0B4628]/10 dark:bg-gold/10 text-[#0B4628] dark:text-gold">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-serif font-black text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                          Hadith Sciences
                          <span className="text-xs font-serif text-[#0B4628] dark:text-gold italic font-normal">علوم الحديث</span>
                        </div>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                          Transmission chains (Isnad), grading parameters, terms (Mustalah), and commentary indices.
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Difficulty Selector */}
              <div className="space-y-4">
                <label className="text-xs uppercase font-mono tracking-widest text-[#0B4628] dark:text-gold font-black block">
                  2. {language === 'ar' ? 'اختر المستوى المعرفي' : language === 'ur' ? 'علمی درجہ منتخب کریں' : 'Select Scholarly Rank'}
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: 'mubtadi', title: 'Mubtadi (Beginner Seeker)', arabic: 'مبتدئ', desc: 'Core introductory legal parameters and well-known traditional terms.' },
                    { id: 'mutawassit', title: 'Mutawassit (Intermediate Scholar)', arabic: 'متوسط', desc: 'Comparative legal debates, standard compilation commentary, and Isnad rules.' },
                    { id: 'muntahi', title: 'Muntahi (Advanced Researcher)', arabic: 'منتهٍ', desc: 'Epistemological variance, deep school logic definitions, and micro-defect analysis.' }
                  ].map((levelItem) => (
                    <button
                      key={levelItem.id}
                      onClick={() => setSelectedLevel(levelItem.id as any)}
                      className={`p-4 rounded-lg border-2 text-left transition-all cursor-pointer
                        ${selectedLevel === levelItem.id
                          ? 'border-[#0B4628] bg-[#0B4628]/5 dark:border-gold dark:bg-gold/10'
                          : 'border-stone-200 hover:border-[#0B4628]/30 dark:border-zinc-800 dark:hover:border-gold/30'
                        }
                      `}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-serif font-black text-sm text-stone-900 dark:text-stone-100">{levelItem.title}</span>
                        <span className="text-xs font-serif text-[#C4A35A] italic">{levelItem.arabic}</span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">{levelItem.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-stone-200 dark:border-zinc-800">
              <button
                onClick={onBackToLanding}
                className="font-mono text-xs uppercase px-5 py-3 border border-stone-300 dark:border-zinc-800 rounded-sm hover:bg-stone-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer font-bold w-full sm:w-auto text-center"
              >
                &larr; {language === 'ar' ? 'رجوع للرئيسية' : language === 'ur' ? 'واپس جائیں' : 'Back to Universe'}
              </button>

              <button
                disabled={!selectedDiscipline || !selectedLevel}
                onClick={startQuiz}
                className={`flex items-center justify-center gap-2 font-mono text-xs uppercase font-black tracking-widest px-8 py-3 rounded-sm shadow-md cursor-pointer w-full sm:w-auto transition-all duration-300
                  ${(selectedDiscipline && selectedLevel)
                    ? 'bg-crimson dark:bg-gold text-white dark:text-space hover:scale-103'
                    : 'bg-stone-200 dark:bg-zinc-800 text-stone-400 dark:text-zinc-600 cursor-not-allowed'
                  }
                `}
              >
                <span>{language === 'ar' ? 'ابدأ الامتحان الشرعي' : language === 'ur' ? 'امتحان شروع کریں' : 'Initiate Examination'}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ) : !quizFinished ? (
          // ACTIVE QUIZ RUNNING
          <motion.div
            key="quiz-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6 pt-4 border-t border-stone-200 dark:border-zinc-800"
          >
            {/* Header / Tracker */}
            <div className="flex justify-between items-center bg-stone-100/50 dark:bg-zinc-900/50 p-3 rounded-sm text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#0B4628] dark:text-gold capitalize">{selectedDiscipline}</span>
                <span className="opacity-40">/</span>
                <span className="text-stone-500 capitalize">{selectedLevel} Level</span>
              </div>
              <div className="font-black text-amber-500">
                Question {currentIdx + 1} of {activeQuestions.length}
              </div>
            </div>

            {/* Question Text */}
            <div className="py-2">
              <p className="text-[11px] font-mono text-stone-400 uppercase tracking-widest mb-1 font-extrabold">Proposed Query:</p>
              <h3 className="font-serif text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100 leading-relaxed">
                {activeQuestions[currentIdx].question[language] || activeQuestions[currentIdx].question.en}
              </h3>
              {/* Optional Arabic inline text if language is not Arabic */}
              {language !== 'ar' && (
                <p className="font-serif text-base text-[#C4A35A] italic text-right mt-1.5 font-amiri" dir="rtl">
                  {activeQuestions[currentIdx].question.ar}
                </p>
              )}
            </div>

            {/* Options List */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              {activeQuestions[currentIdx].options.map((opt) => {
                const isSelected = selectedAnswer === opt.key;
                const isCorrectAns = opt.key === activeQuestions[currentIdx].correctAnswer;
                
                let optStyle = 'border-stone-200 hover:border-[#0B4628]/50 dark:border-zinc-800 dark:hover:border-gold/50 bg-white/20';
                if (isAnswered) {
                  if (isCorrectAns) {
                    optStyle = 'border-emerald-500 bg-emerald-500/10 dark:border-emerald-400 dark:bg-emerald-400/5 text-emerald-800 dark:text-emerald-300 font-extrabold';
                  } else if (isSelected) {
                    optStyle = 'border-rose-500 bg-rose-500/10 dark:border-rose-400 dark:bg-rose-400/5 text-rose-800 dark:text-rose-300';
                  } else {
                    optStyle = 'border-stone-200 dark:border-zinc-800 opacity-60';
                  }
                } else if (isSelected) {
                  optStyle = 'border-[#C4A35A] bg-[#C4A35A]/10 dark:border-gold dark:bg-gold/10 font-bold';
                }

                return (
                  <button
                    key={opt.key}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(opt.key)}
                    className={`p-4 rounded-lg border-2 text-left transition-all flex items-center justify-between cursor-pointer group ${optStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-mono font-black border
                        ${isSelected 
                          ? 'bg-[#0B4628] text-white dark:bg-gold dark:text-space border-transparent' 
                          : 'bg-stone-100 text-stone-600 dark:bg-zinc-800 dark:text-zinc-400 border-stone-300 dark:border-zinc-700'
                        }
                      `}>
                        {opt.key}
                      </span>
                      <span className="text-xs sm:text-sm leading-relaxed text-stone-800 dark:text-stone-200 font-sans">
                        {opt.text[language] || opt.text.en}
                      </span>
                    </div>
                    {isAnswered && isCorrectAns && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    )}
                    {isAnswered && isSelected && !isCorrectAns && (
                      <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Instant Feedback Drawer */}
            <AnimatePresence>
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-5 rounded-lg border bg-stone-100/60 dark:bg-zinc-900/50 space-y-3.5"
                  style={{ borderColor: selectedAnswer === activeQuestions[currentIdx].correctAnswer ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.2)' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-full bg-amber-500/10 text-amber-500">
                      <Bookmark className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-widest font-black text-amber-600">
                      {language === 'ar' ? 'تحقيق وبحث علمي فوري' : language === 'ur' ? 'علمی تحقیق' : 'Instant Scholarly Verification'}
                    </span>
                  </div>

                  {/* Clarification/Reasoning text */}
                  <p className="text-xs leading-relaxed text-stone-750 dark:text-stone-300 font-serif italic">
                    {activeQuestions[currentIdx].feedback[language] || activeQuestions[currentIdx].feedback.en}
                  </p>

                  {/* Reference marker */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2.5 border-t border-stone-200 dark:border-zinc-800 text-[10px] font-mono text-stone-500">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3 text-[#C4A35A]" />
                      <strong>{language === 'ar' ? 'المصدر الكلاسيكي:' : language === 'ur' ? 'کلاسیکی حوالہ:' : 'Classical Source Reference:'}</strong>
                      <span className="text-stone-800 dark:text-stone-200 ml-1">
                        {language === 'ar' ? (activeQuestions[currentIdx].arabicRef || activeQuestions[currentIdx].reference) : activeQuestions[currentIdx].reference}
                      </span>
                    </span>
                    {activeQuestions[currentIdx].arabicRef && language !== 'ar' && (
                      <span className="font-serif italic text-[#C4A35A] font-amiri text-xs" dir="rtl">
                        {activeQuestions[currentIdx].arabicRef}
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active Control Bar */}
            <div className="flex justify-between items-center pt-4 border-t border-stone-200 dark:border-zinc-800">
              <button
                onClick={handleResetSelection}
                className="font-mono text-[10px] sm:text-xs uppercase px-4 py-2 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{language === 'ar' ? 'إلغاء الامتحان' : language === 'ur' ? 'منسوخ کریں' : 'Abort Examination'}</span>
              </button>

              {!isAnswered ? (
                <button
                  disabled={!selectedAnswer}
                  onClick={handleConfirmAnswer}
                  className={`font-mono text-xs uppercase font-black tracking-widest px-6 py-3 rounded-sm transition-all duration-200 cursor-pointer shadow-md
                    ${selectedAnswer
                      ? 'bg-[#0B4628] hover:bg-[#0B4628]/90 dark:bg-gold dark:text-space text-white'
                      : 'bg-stone-100 dark:bg-zinc-800 text-stone-400 dark:text-zinc-600 cursor-not-allowed'
                    }
                  `}
                >
                  {language === 'ar' ? 'تأكيد الإجابة' : language === 'ur' ? 'جواب تصدیق کریں' : 'Confirm Answer'}
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="flex items-center gap-2 font-mono text-xs uppercase font-black tracking-widest bg-crimson dark:bg-gold text-white dark:text-space px-6 py-3 rounded-sm hover:scale-[1.02] active:scale-98 transition-all duration-200 cursor-pointer shadow-md"
                >
                  <span>
                    {currentIdx + 1 === activeQuestions.length
                      ? (language === 'ar' ? 'عرض السجل والنتيجة' : language === 'ur' ? 'نتائج دیکھیں' : 'Finish & Review Ledger')
                      : (language === 'ar' ? 'السؤال التالي' : language === 'ur' ? 'اگلا سوال' : 'Next Question')
                    }
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          // QUIZ COMPLETED - DETAILED LEDGER & IJAZA CERTIFICATE
          <motion.div
            key="finished-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8 pt-4 border-t border-stone-200 dark:border-zinc-800"
          >
            {/* Score Tally Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-stone-100/40 dark:bg-zinc-900/40 p-6 rounded-lg border border-stone-200 dark:border-zinc-800 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-2 bg-[#0B4628]" />
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block font-extrabold">Correct Answers</span>
                <span className="text-4xl font-mono font-black text-[#0B4628] dark:text-emerald-400">
                  {score} / {activeQuestions.length}
                </span>
                <span className="text-xs text-stone-500 block">Accomplished Marks</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block font-extrabold">Efficiency Quotient</span>
                <span className="text-4xl font-mono font-black text-[#C4A35A]">
                  {Math.round(percentScore)}%
                </span>
                <span className="text-xs text-stone-500 block">Juristic Accuracy Rate</span>
              </div>
              <div className="space-y-1 md:border-l border-stone-200 dark:border-zinc-800">
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block font-extrabold">Traditional Title</span>
                <span className={`text-xl font-serif font-black block leading-none py-1.5 ${getScholarGrade().class}`}>
                  {getScholarGrade().title}
                </span>
                <span className="text-xs text-stone-500 block">Scholastic Placement</span>
              </div>
            </div>

            {/* IJAZA CERTIFICATE PARCHMENT (ONLY UNLOCKED ON PASSING OR COMPLETION) */}
            <div className="relative p-6 sm:p-10 border-4 border-double border-[#C4A35A] bg-white text-stone-900 rounded shadow-inner max-w-2xl mx-auto text-center font-serif flex flex-col items-center gap-4">
              {/* Complex Calligraphy Seal Background element */}
              <div className="absolute top-4 left-4 w-12 h-12 border border-[#C4A35A]/30 flex items-center justify-center rounded-full opacity-60">
                <span className="text-[8px] font-mono text-[#C4A35A] tracking-tighter">ALBAB</span>
              </div>
              <div className="absolute top-4 right-4 w-12 h-12 border border-[#C4A35A]/30 flex items-center justify-center rounded-full opacity-60">
                <span className="text-[10px] font-serif text-[#C4A35A] italic">إجازة</span>
              </div>

              {/* Subtitle / Header */}
              <div className="space-y-1">
                <h4 className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#0B4628] font-bold">
                  Jamiah Al-Albab Scholastic Synod
                </h4>
                <div className="text-[#C4A35A] font-amiri text-lg tracking-normal font-bold">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </div>
              </div>

              {/* Certificate Title */}
              <h3 className="font-black text-2xl tracking-wide font-amiri text-[#0B4628] drop-shadow-sm leading-normal">
                {language === 'ar' ? 'شهادة إجازة مشاركة وتفوق' : language === 'ur' ? 'سندِ فراغت و شرکت' : 'Ijaza Certification of Achievement'}
              </h3>

              <div className="h-[1px] w-48 bg-gradient-to-r from-transparent via-[#C4A35A] to-transparent" />

              {/* Text */}
              <p className="text-xs sm:text-sm leading-relaxed max-w-lg italic text-stone-700">
                {language === 'ar' 
                  ? 'نشهد بموجب هذا أن الطالب الباحث قد أتم الاختبار بنجاح واقتدار في تخصص الفقه والحديث وبذل وسعه الأكاديمي في التدبر ومراجعة أمهات الكتب الكلاسيكية.'
                  : language === 'ur'
                    ? 'اس بات کی تصدیق کی جاتی ہے کہ طالبِ علم نے ہمارے علمی امتحانی ماڈیول کو کامیابی سے مکمل کر کے روایتی فقہ اور علمِ حدیث کے اعلیٰ اصولوں پر عبور ظاہر کیا ہے۔'
                    : 'We hereby attest that the diligent Seeker has honorably executed the rigorous intellectual inquiry, demonstrating advanced analytical capability in the classical texts of divine jurisprudence and Prophetic transmission.'
                }
              </p>

              {/* Discipline and Details */}
              <div className="grid grid-cols-2 gap-8 text-left max-w-sm w-full py-4 text-xs font-mono">
                <div>
                  <span className="text-stone-400 block uppercase text-[9px]">Discipline:</span>
                  <span className="font-extrabold text-[#0B4628] capitalize">{selectedDiscipline} Science</span>
                </div>
                <div>
                  <span className="text-stone-400 block uppercase text-[9px]">Scholastic Rank:</span>
                  <span className="font-extrabold text-[#C4A35A] capitalize">{selectedLevel} Level</span>
                </div>
                <div>
                  <span className="text-stone-400 block uppercase text-[9px]">Juristic Rating:</span>
                  <span className="font-extrabold text-stone-900">{getScholarGrade().title}</span>
                </div>
                <div>
                  <span className="text-stone-400 block uppercase text-[9px]">Sync Ledger ID:</span>
                  <span className="font-extrabold text-stone-700 font-mono text-[10px]">ALB-QZ-{Math.floor(1000 + Math.random() * 9000)}</span>
                </div>
              </div>

              {/* Signatures & Seal */}
              <div className="w-full flex justify-between items-end pt-4 max-w-md text-[10px] font-mono text-stone-500">
                <div className="text-center">
                  <div className="h-6 w-16 mx-auto border-b border-stone-300 italic text-stone-700">Attestation</div>
                  <span>Scribes Chancellor</span>
                </div>
                
                {/* Traditional Round Golden Seal */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E8B86D] via-[#C4A35A] to-[#E8B86D] text-[#0B4628] font-bold text-center flex flex-col justify-center items-center shadow-md relative group select-none border border-[#C4A35A]/50">
                  <div className="absolute inset-1 rounded-full border border-dashed border-white/40" />
                  <span className="text-[7px] font-mono font-black tracking-tighter uppercase text-white drop-shadow-sm">VERIFIED</span>
                  <span className="text-[6px] font-serif tracking-normal text-white/90">AL-ALBAB</span>
                </div>

                <div className="text-center">
                  <div className="h-6 w-16 mx-auto border-b border-stone-300 italic text-stone-700">Verified</div>
                  <span>Academic Registrar</span>
                </div>
              </div>
            </div>

            {/* Cert Actions */}
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => {
                  alert(language === 'ar' ? 'تم نسخ رمز الإجازة إلى حافظتك بنجاح لتضمينها بملفك الأكاديمي!' : 'IJAZA credential identifier copied to clipboard securely for academic inclusion!');
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-sm border border-stone-300 dark:border-zinc-800 font-mono text-xs hover:bg-stone-150 transition-all cursor-pointer font-bold"
              >
                <Share2 className="h-3.5 w-3.5 text-[#C4A35A]" />
                <span>Share Credential</span>
              </button>

              <button
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-sm border border-stone-300 dark:border-zinc-800 font-mono text-xs hover:bg-stone-150 transition-all cursor-pointer font-bold"
              >
                <Download className="h-3.5 w-3.5 text-crimson" />
                <span>Print Certificate</span>
              </button>
            </div>

            {/* Complete answers history list overview */}
            <div className="space-y-4 pt-6 border-t border-stone-200 dark:border-zinc-800">
              <h4 className="font-serif font-black text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                {language === 'ar' ? 'مراجعة الأسئلة والتحقيقات الشرعية' : language === 'ur' ? 'سوالات اور جوابات کا جائزہ' : 'Detailed Academic Query Audit'}
              </h4>

              <div className="grid grid-cols-1 gap-4">
                {activeQuestions.map((q, idx) => {
                  const userAnsKey = userAnswers[q.id];
                  const isUserCorrect = userAnsKey === q.correctAnswer;
                  
                  return (
                    <div 
                      key={q.id} 
                      className={`p-4 rounded-lg border text-left space-y-2
                        ${isUserCorrect 
                          ? 'border-emerald-500/25 bg-emerald-500/[0.02]' 
                          : 'border-rose-500/20 bg-rose-500/[0.02]'
                        }
                      `}
                    >
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="font-black text-stone-400">Query #{idx + 1}</span>
                        <span className={`px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider
                          ${isUserCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}
                        `}>
                          {isUserCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>

                      <p className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100">
                        {q.question[language] || q.question.en}
                      </p>

                      <div className="text-xs font-mono space-y-1">
                        <div>
                          <span className="text-stone-400 block sm:inline mr-1">Your answer:</span>
                          <span className={isUserCorrect ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                            ({userAnsKey}) {q.options.find(o => o.key === userAnsKey)?.text[language] || q.options.find(o => o.key === userAnsKey)?.text.en}
                          </span>
                        </div>
                        {!isUserCorrect && (
                          <div>
                            <span className="text-stone-400 block sm:inline mr-1">Correct answer:</span>
                            <span className="text-emerald-600 font-bold">
                              ({q.correctAnswer}) {q.options.find(o => o.key === q.correctAnswer)?.text[language] || q.options.find(o => o.key === q.correctAnswer)?.text.en}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* feedback */}
                      <p className="text-[11px] text-stone-500 italic font-serif leading-relaxed pt-1 border-t border-dashed border-stone-200">
                        "{q.feedback[language] || q.feedback.en}"
                      </p>
                      
                      {/* reference */}
                      <p className="text-[10px] font-mono text-[#C4A35A] font-semibold">
                        Reference: {q.reference}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Finish actions */}
            <div className="flex justify-center pt-4 border-t border-stone-200 dark:border-zinc-800">
              <button
                onClick={handleResetSelection}
                className="font-mono text-xs uppercase font-black bg-[#0B4628] hover:bg-[#0B4628]/90 dark:bg-gold dark:text-space text-white px-8 py-3.5 rounded-sm hover:scale-103 transition-all duration-300 shadow-md cursor-pointer"
              >
                {language === 'ar' ? 'اختبار تخصص آخر' : language === 'ur' ? 'نیا امتحان منتخب کریں' : 'Attempt Another Exam'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
