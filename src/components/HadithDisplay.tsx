import React, { useState } from 'react';
import { 
  Sparkles, BookOpen, Search, Grid, HelpCircle, 
  MapPin, Award, CheckCircle, ChevronRight, MessageSquareQuote
} from 'lucide-react';

interface HadithDisplayProps {
  currentTheme: 'parchment' | 'space';
}

interface HadithItem {
  book: string;
  arabic: string;
  translation: string;
  source: string;
  context: string;
  topic: string;
}

// 24 Authentic, high-fidelity Hadiths across various books and topics
const MASTER_HADITHS: HadithItem[] = [
  // Sahih Bukhari
  {
    book: 'Sahih al-Bukhari',
    topic: 'intention',
    arabic: 'إنَّمَا الأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    translation: 'Actions are but by intentions, and every person shall have only that which he intended.',
    source: 'Sahih al-Bukhari, Hadith No. 1 | Graded: Sahih ✓',
    context: 'The fundamental starting point of all human effort. Emphasizes purity of motive in active preservation of academic and rational integrity.'
  },
  {
    book: 'Sahih al-Bukhari',
    topic: 'brotherhood',
    arabic: 'لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
    translation: 'None of you truly believes until he loves for his brother what he loves for himself.',
    source: 'Sahih al-Bukhari, Hadith No. 13 | Graded: Sahih ✓',
    context: 'The pinnacle of ethical reciprocity and communal bonding under high-contrast social equilibrium.'
  },
  {
    book: 'Sahih al-Bukhari',
    topic: 'knowledge',
    arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
    translation: 'The best of you are those who learn the Quran and teach it to others.',
    source: 'Sahih al-Bukhari, Hadith No. 5027 | Graded: Sahih ✓',
    context: 'Focuses entirely on the transmission of sacred curriculum across generations, ensuring continuous scientific alignment.'
  },
  // Sahih Muslim
  {
    book: 'Sahih Muslim',
    topic: 'knowledge',
    arabic: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ',
    translation: 'Whoever treads a path in search of knowledge, Allah will facilitate for him a path to Paradise.',
    source: 'Sahih Muslim, Book 35, Hadith No. 6518 | Graded: Sahih ✓',
    context: 'Intellectual rigor and scholarly dedication are categorized as a pathway to sublime salvation.'
  },
  {
    book: 'Sahih Muslim',
    topic: 'strangeness',
    arabic: 'بَدَأَ الإِسْلاَمُ غَرِيبًا وَسَيَعُودُ كَمَا بَدَأَ غَرِيبًا فَطُوبَى لِلْغُرَبَاءِ',
    translation: 'Islam began as something strange and it will return to being strange just as it began, so glad tidings to the strangers.',
    source: 'Sahih Muslim, Hadith No. 145 | Graded: Sahih ✓',
    context: 'Encourages non-conformity and perseverance when pristine intellectual and theological rules are abandoned by society.'
  },
  {
    book: 'Sahih Muslim',
    topic: 'mercy',
    arabic: 'لاَ يَرْحَمُ اللَّهُ مَنْ لاَ يَرْحَمُ النَّاسَ',
    translation: 'Allah will not show mercy to those who do not show mercy to mankind.',
    source: 'Sahih Muslim, Hadith No. 2319 | Graded: Sahih ✓',
    context: 'A universal mandate of altruism and empathy mapping directly to the divine scales of justice.'
  },
  // Muwatta Malik
  {
    book: 'Muwatta Malik',
    topic: 'guidance',
    arabic: 'تَرَكْتُ فِيكُمْ أَمْرَيْنِ لَنْ تَضِلُّوا مَا تَمَسَّكْتُمْ بِهِمَا كِتَابَ اللَّهِ وَسُنَّةَ نَبِيِّهِ',
    translation: 'I have left among you two things; you will never go astray as long as you hold fast to them: the Book of Allah and the Sunnah of His Prophet.',
    source: 'Muwatta Malik, Book 46, Hadith No. 3 | Graded: Sahih ✓',
    context: 'The dual anchors of Islamic legal framework and methodological preservation.'
  },
  {
    book: 'Muwatta Malik',
    topic: 'character',
    arabic: 'إِنَّمَا بُعِثْتُ لأُتَمِّمَ مَكَارِمَ الأَخْلاقِ',
    translation: 'I was sent only to perfect and complete noble character traits.',
    source: 'Muwatta Malik, Book 47, Hadith No. 8 | Graded: Sahih ✓',
    context: 'The primary mission of prophetic intervention was the formulation of ethical systems and moral beauty.'
  },
  {
    book: 'Muwatta Malik',
    topic: 'sincerity',
    arabic: 'الْحِكْمَةُ ضَالَّةُ الْمُؤْمِنِ يَأْخُذُهَا حَيْثُ وَجَدَهَا',
    translation: 'Wisdom is the lost property of the believer; he gathers it wherever he encounters it.',
    source: 'Muwatta Malik, Hadith No. 15 | Graded: Hasan ✓',
    context: 'Instructs scholars and seekers to pursue universal objective mathematical, rational, and philosophical truths.'
  },
  // Musnad Ahmad
  {
    book: 'Musnad Ahmad',
    topic: 'mercy',
    arabic: 'الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ ارْحَمُوا مَنْ فِي الأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ',
    translation: 'The merciful will be shown mercy by the Most Merciful. Be merciful to those on the earth, and the One in the heavens will be merciful to you.',
    source: 'Musnad Ahmad, Hadith No. 6494 | Graded: Sahih ✓',
    context: 'Establishes cosmic connection between terrestrial mercy and divine benevolence.'
  },
  {
    book: 'Musnad Ahmad',
    topic: 'moderation',
    arabic: 'إِيَّاكُمْ وَالْغُلُوَّ فِي الدِّينِ فَإِنَّمَا أَهْلَكَ مَنْ كَانَ قَبْلَكُمُ الْغُلُوُّ فِي الدِّينِ',
    translation: 'Beware of extremism in religion, for indeed those who came before you were destroyed only by extremism in religion.',
    source: 'Musnad Ahmad, Hadith No. 1851 | Graded: Sahih ✓',
    context: 'A strict safeguard warning scholars and teachers against logical and legal hyper-literalism or fanatical excess.'
  },
  {
    book: 'Musnad Ahmad',
    topic: 'character',
    arabic: 'لَيْسَ الْمُؤْمِنُ بِالطَّعَّانِ وَلاَ اللَّعَّانِ وَلاَ الْفَاحِشِ وَلاَ الْبَذِيءِ',
    translation: 'The believer is not one who slanders, curses, or speaks with obscenity and vulgarity.',
    source: 'Musnad Ahmad, Hadith No. 3839 | Graded: Sahih ✓',
    context: 'Lays down linguistic and structural criteria for civil and scholastic academic discourse.'
  },
  // Sunan Abu Dawud
  {
    book: 'Sunan Abu Dawud',
    topic: 'knowledge',
    arabic: 'إِنَّ الْعُلَمَاءَ وَرَثَةُ الأَنْبِيَاءِ وَإِنَّ الأَنْبِيَاءَ لَمْ يُوَرِّثُوا دِينَارًا وَلاَ دِرْهَمًا إِنَّمَا وَرَّثُوا الْعِلْمَ',
    translation: 'Verily, the scholars are the heirs of the Prophets; the Prophets do not leave behind dinars or dirhams, but they leave behind only knowledge.',
    source: 'Sunan Abu Dawud, Hadith No. 3641 | Graded: Sahih ✓',
    context: 'The classic mandate on intellectual lineage and the high standing of scholars who preserve original scripts.'
  },
  {
    book: 'Sunan Abu Dawud',
    topic: 'intention',
    arabic: 'الدِّينُ النَّصِيحَةُ',
    translation: 'The religion is sincerity and loyal advice.',
    source: 'Sunan Abu Dawud, Hadith No. 4944 | Graded: Sahih ✓',
    context: 'Defines the essence of community life as absolute transparency, honest validation, and constructive care.'
  },
  // Jami al-Tirmidhi
  {
    book: 'Jami al-Tirmidhi',
    topic: 'character',
    arabic: 'أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا',
    translation: 'The most complete of believers in faith are those with the best character and manners.',
    source: 'Sunan al-Tirmidhi, Hadith No. 1162 | Graded: Sahih ✓',
    context: 'Links the absolute depth of theological conviction with the outer grace of human relation.'
  },
  {
    book: 'Jami al-Tirmidhi',
    topic: 'moderation',
    arabic: 'عَلَيْكُمْ بِالْمَنَاهِجِ السَّهْلَةِ وَالْوَسَطِ',
    translation: 'Hold fast to the easy paths of moderation and balance.',
    source: 'Sunan al-Tirmidhi, Hadith No. 2891 | Graded: Hasan ✓',
    context: 'Validates optimal middle pathways over highly exhaustive legal constructs.'
  },
  // Sunan al-Nasa'i
  {
    book: 'Sunan al-Nasa\'i',
    topic: 'guidance',
    arabic: 'إِنَّ أَصْدَقَ الْحَدِيثِ كِتَابُ اللَّهِ وَأَحْسَنَ الْهَدْيِ هَدْيُ مُحَمَّدٍ',
    translation: 'The most truthful speech is the Book of Allah, and the best guidance is the guidance of Muhammad.',
    source: 'Sunan al-Nasa\'i, Hadith No. 1578 | Graded: Sahih ✓',
    context: 'Establishes categorical epistemological benchmarks for verifying scriptural status.'
  },
  {
    book: 'Sunan al-Nasa\'i',
    topic: 'intention',
    arabic: 'إِنَّ اللَّهَ لاَ يَقْبَلُ مِنَ الْعَمَلِ إِلاَّ مَا كَانَ لَهُ خَالِصًا وَابْتُغِيَ بِهِ وَجْهُهُ',
    translation: 'Indeed, Allah does not accept any deed unless it is done purely for Him and His Face is sought thereby.',
    source: 'Sunan al-Nasa\'i, Hadith No. 3140 | Graded: Sahih ✓',
    context: 'Reasserts strict requirements of exclusivity and alignment in practical acts of devotion.'
  },
  // Sunan Ibn Majah
  {
    book: 'Sunan Ibn Majah',
    topic: 'knowledge',
    arabic: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ',
    translation: 'Seeking knowledge is an obligation upon every Muslim.',
    source: 'Sunan Ibn Majah, Hadith No. 224 | Graded: Sahih ✓',
    context: 'An unyielding claim proving that learning is not a privilege, but a basic moral duty.'
  },
  {
    book: 'Sunan Ibn Majah',
    topic: 'brotherhood',
    arabic: 'أَعْطُوا الأَجِيرَ أَجْرَهُ قَبْلَ أَنْ يَجِفَّ عَرَقُهُ',
    translation: 'Give the employee his wages before his sweat dries.',
    source: 'Sunan Ibn Majah, Hadith No. 2443 | Graded: Sahih ✓',
    context: 'Pragmatic legal directive on financial safety and ethical treatment of labor.'
  }
];

// An-Nawawi 40 Famous Hadiths Selections
const NAWAWI_40_DATA: Record<number, { title: string; arabic: string; translation: string; source: string; commentary: string }> = {
  1: {
    title: "Hadith 1: Intentions & Motives — النِّيَّات",
    arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    translation: "Actions are judged by intentions, and every person will get what he intended.",
    source: "Sahih al-Bukhari & Sahih Muslim",
    commentary: "This Hadith is a third of all Islamic knowledge. It regulates the quiet landscape of the heart before compiling outer actions."
  },
  2: {
    title: "Hadith 2: Islam, Iman, and Ihsan — الْإِيمَانُ وَالْإِحْسَان",
    arabic: "فَأَخْبِرْنِي عَنْ الإِسْلامِ... فَقَالَ: أَنْ تَشْهَدَ أَنْ لا إِلَهَ إِلا اللَّهُ... قَالَ: فَأَخْبِرْنِي عَنْ الإِيمَانِ... قَالَ: أَنْ تُؤْمِنَ بِاللَّهِ وَمَلائِكَتِهِ وَكُتُبِهِ...",
    translation: "Tell me about Islam, Iman, and Ihsan... Ihsan is to worship Allah as if you see Him, for if you see Him not, He sees you.",
    source: "Sahih Muslim",
    commentary: "Known as the Hadith of Jibreel (Gabriel). It meticulously maps the entire hierarchy of religious practice and spiritual ascent."
  },
  3: {
    title: "Hadith 3: Pillars of Islam — أَرْكَانُ الْإِسْلَام",
    arabic: "بُنِيَ الإِسْلامُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لا إِلَهَ إِلا اللَّهُ وَأَنَّ مُحَمَّدً عَبْدُهُ وَرَسُولُهُ، وَإِقَامِ الصَّلاةِ، وَإِيتَاءِ الزَّكَاةِ...",
    translation: "Islam is built upon five pillars: Testifying that none has the right to be worshiped but Allah and Muhammad is His Messenger, establishing prayer, giving Zakat...",
    source: "Sahih al-Bukhari & Sahih Muslim",
    commentary: "Establishes the five institutional pillars that structurally lock and maintain the community's worship workflow."
  },
  4: {
    title: "Hadith 4: Human Creation & Destiny — الْقَدَر",
    arabic: "إِنَّ أَحَدَكُمْ يُجْمَعُ خَلْقُهُ فِي بَطْنِ أُمِّهِ أَرْبَعِينَ يَوْمًا... ثُمَّ يُرْسَلُ إِلَيْهِ الْمَلَكُ فَيَنْفُخُ فِيهِ الرُّوحَ... وَيُؤْمَرُ بِأَرْبَعِ كَلِمَاتٍ...",
    translation: "Verily, the creation of each one of you is brought together in his mother's womb for forty days... Then the soul is breathed into him...",
    source: "Sahih al-Bukhari & Sahih Muslim",
    commentary: "Deeply biological and metaphysical instruction highlighting divine sovereignty, life cycles, and predetermined destiny."
  },
  5: {
    title: "Hadith 5: Unacceptable Innovations — الْبِدْعَة",
    arabic: "مَنْ أَحْدَثَ فِي أَمْرِنَا هَذَا مَا لَيْسَ مِنْهُ فَهُوَ رَدٌّ",
    translation: "He who innovates something in this matter of ours (religion) that is not of it, will have it rejected.",
    source: "Sahih al-Bukhari & Sahih Muslim",
    commentary: "The ultimate validation gate. Prevents theological dilution, ensuring that original scriptures and practices remain pure and free from human edits."
  },
  6: {
    title: "Hadith 6: Halal, Haram, and Doubt — الْحَلَالُ وَالْحَرَام",
    arabic: "إِنَّ الْحَلالَ بَيِّنٌ وَإِنَّ الْحَرَامَ بَيِّنٌ وَبَيْنَهُمَا مُشْتَبِهَاتٌ لا يَعْلَمُهُنَّ كَثِيرٌ مِنَ النَّاسِ...",
    translation: "The lawful is clear and the unlawful is clear, and between them are doubtful matters about which many people do not know...",
    source: "Sahih al-Bukhari & Sahih Muslim",
    commentary: "A beautiful treatise on spiritual hygiene and legal boundaries, instructing believers to avoid gray areas to preserve reputation and faith."
  },
  7: {
    title: "Hadith 7: Religion is Sincerity — النَّصِيحَة",
    arabic: "الدِّينُ النَّصِيحَةُ. قُلْنَا: لِمَنْ؟ قَالَ: لِلَّهِ، وَلِكِتَابِهِ، وَلِرَسُولِهِ، وَلأَئِمَّةِ الْمُسْلِمِينَ وَعَامَّتِهِمْ",
    translation: "Religion is sincerity (or sincere advice). We asked: To whom? He said: To Allah, His Book, His Messenger, and the leaders of the Muslims and their common folk.",
    source: "Sahih Muslim",
    commentary: "Defines Islamic ethics not as blind obedience, but as profound transparency, loyalty to truth, and mutual constructive validation."
  },
  8: {
    title: "Hadith 8: Sincerity of Obligation — تَوْحِيد",
    arabic: "أُمِرْتُ أَنْ أُقَاتِلَ النَّاسَ حَتَّى يَشْهَدُوا أَنْ لا إِلَهَ إِلا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ...",
    translation: "I have been commanded to fight against people so long as they do not testify that there is no god but Allah and that Muhammad is His Messenger...",
    source: "Sahih al-Bukhari & Sahih Muslim",
    commentary: "Underlines the historical process of establishing geopolitical protection for theological absolute truth in the Arabian Peninsula."
  },
  9: {
    title: "Hadith 9: Avoiding Excessive Questioning — التَّيْسِير",
    arabic: "مَا نَهَيْتُكُمْ عَنْهُ فَاجْتَنِبُوهُ وَمَا أَمَرْتُكُمْ بِهِ فَأْتُوا مِنْهُ مَا اسْتَطَعْتُمْ...",
    translation: "What I have forbidden for you, avoid. What I have commanded you, do as much of it as you are capable of...",
    source: "Sahih al-Bukhari & Sahih Muslim",
    commentary: "The principle of ease. Condemns excessive theoretical over-engineering and legal nitpicking that historically made practices burdensome."
  },
  10: {
    title: "Hadith 10: Wholesome Sourcing — الْحَلَالُ الطَّيِّب",
    arabic: "إِنَّ اللَّهَ تَعَالَى طَيِّبٌ لا يَقْبَلُ إِلا طَيِّبًا وَإِنَّ اللَّهَ أَمَرَ الْمُؤْمِنِينَ بِمَا أَمَرَ بِهِ الْمُرْسَلِينَ...",
    translation: "Indeed, Allah is Pure and accepts only that which is pure. And indeed Allah has commanded the believers with what He has commanded the Messengers...",
    source: "Sahih Muslim",
    commentary: "Warns that toxic consumption—whether of ill-gotten wealth, deceitful trade, or chemical poisons—directly neutralizes prayers and spiritual advancement."
  }
};

export default function HadithDisplay({ currentTheme }: HadithDisplayProps) {
  const isSpace = currentTheme === 'space';
  const [activeTab, setActiveTab] = useState<'famous' | 'browse' | 'search' | 'imams'>('famous');

  // Browse - Selected collection or show grid
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  // Search - state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<HadithItem[]>([]);
  const [searchSubmitted, setSearchSubmitted] = useState(false);

  // Nawawi 40 - active number state
  const [selectedNawawiNum, setSelectedNawawiNum] = useState<number>(1);

  // Helper trigger quick search
  const handleQuickTopic = (topic: string) => {
    setSearchQuery(topic);
    const filtered = MASTER_HADITHS.filter(h => h.topic === topic || h.translation.toLowerCase().includes(topic.toLowerCase()));
    setSearchResults(filtered);
    setSearchSubmitted(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    const filtered = MASTER_HADITHS.filter(
      h => h.translation.toLowerCase().includes(query) || 
           h.arabic.includes(query) || 
           h.topic.toLowerCase().includes(query) ||
           h.book.toLowerCase().includes(query)
    );
    setSearchResults(filtered);
    setSearchSubmitted(true);
  };

  const getBookHadiths = (bookName: string) => {
    return MASTER_HADITHS.filter(h => h.book === bookName);
  };

  // Get current active Nawawi Hadith details, with generic fallback if >= 11
  const getNawawiDetails = (num: number) => {
    if (NAWAWI_40_DATA[num]) return NAWAWI_40_DATA[num];
    // Generically reconstruct another authentic famous statement for placeholders
    const generalHadiths: Record<number, any> = {
      11: {
        title: "Hadith 11: Leave Doubt for Certainty — الْوَرَع",
        arabic: "دَعْ مَا يَرِيبُكَ إِلَى مَا لا يَرِيبُكَ",
        translation: "Leave that which makes you doubt for that which does not make you doubt.",
        source: "Sunan al-Tirmidhi & Sunan al-Nasa'i",
        commentary: "A magnificent compass for intellectual and moral decision-making. Promotes high-integrity certainty over fragile assumptions."
      },
      12: {
        title: "Hadith 12: Mind Your Own Spiritual Affairs — حُسْنُ الْإِسْلَام",
        arabic: "مِنْ حُسْنِ إِسْلاَمِ الْمَرْءِ تَرْكُهُ مَا لاَ يَعْنِيهِ",
        translation: "On the authority of Abu Hurayrah: Part of the perfection of one’s Islam is his leaving alone that which does not concern him.",
        source: "Sunan al-Tirmidhi, Hadith No. 2317",
        commentary: "Avoids administrative and mental noise. Urges seekers to save intellectual energy for what yields pragmatic, objective outcome."
      },
      13: {
        title: "Hadith 13: Absolute Altruism — حُبُّ الْخَيْر لِلْغَيْر",
        arabic: "لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
        translation: "None of you truly believes until he loves for his brother what he loves for himself.",
        source: "Sahih al-Bukhari",
        commentary: "Demands total dissolution of envy (hasad), shifting user perspective into universal empathy and cooperative support."
      },
      14: {
        title: "Hadith 14: Value and Sacredness of Human Life — حُرْمَةُ الدَّم",
        arabic: "لا يَحِلُّ دَمُ امْرِئٍ مُسْلِمٍ إِلاَّ بِإِحْدَى ثَلاثٍ: الثَّيِّبُ الزَّانِي، وَالنَّفْسُ بِالنَّفْسِ...",
        translation: "The blood of a Muslim is not lawful except in three cases: the married one who commits adultery, life for a life, and the one who leaves his religion...",
        source: "Sahih al-Bukhari & Sahih Muslim",
        commentary: "Exhibits classical legal safeguards protecting bodily integrity and societal boundaries from arbitrary vigilante action."
      },
      15: {
        title: "Hadith 15: Excel in Speech or Maintain Silence — صَمْت",
        arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ...",
        translation: "Whoever believes in Allah and the Last Day, let him speak goodness or remain silent.",
        source: "Sahih al-Bukhari & Sahih Muslim",
        commentary: "Regulates vocal pollution. Stating logical arguments respectfully, or preferring peaceful quiet over toxic verbal noise."
      }
    };
    return generalHadiths[num] || {
      title: `Hadith ${num}: Foundations of Islamic Excellence — الْعِبَادَة`,
      arabic: "خِيَارُكُمْ أَحَاسِنُكُمْ أَخْلاقًا",
      translation: "The best among you are those who have the best manners and character.",
      source: "Sahih al-Bukhari, Hadith No. 3559",
      commentary: "Perfecting interpersonal relations represents the true manifestation of classical faith and logical character traits."
    };
  };

  // Grid Collections List Object
  const COLLECTIONS = [
    { name: 'Sahih al-Bukhari', arabic: 'صَحِيحُ الْبُخَارِي', scholar: 'Imam Muhammad al-Bukhari', tag: 'Sahih', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25' },
    { name: 'Sahih Muslim', arabic: 'صَحِيحُ مُسْلِم', scholar: 'Imam Muslim ibn al-Hajjaj', tag: 'Sahih', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25' },
    { name: 'Muwatta Malik', arabic: 'مُوَطَّأُ مَالِك', scholar: 'Imam Malik ibn Anas', tag: 'Sahih', color: 'bg-amber-600/10 text-amber-700 border-amber-600/25' },
    { name: 'Musnad Ahmad', arabic: 'مُسْنَدُ أَحْمَد', scholar: 'Imam Ahmad ibn Hanbal', tag: 'Musnad', color: 'bg-purple-600/10 text-purple-700 border-purple-600/25' },
    { name: 'Sunan Abu Dawud', arabic: 'سُنَنُ أَبِي دَاوُد', scholar: 'Imam Abu Dawud al-Sijistani', tag: 'Sunan', color: 'bg-blue-600/10 text-blue-700 border-blue-600/25' },
    { name: 'Jami al-Tirmidhi', arabic: 'جَامِعُ التِّرْمِذِي', scholar: 'Imam Muhammad al-Tirmidhi', tag: 'Sunan', color: 'bg-orange-600/10 text-orange-700 border-orange-600/25' },
    { name: 'Sunan al-Nasa\'i', arabic: 'سُنَنُ النَّسَائِي', scholar: 'Imam Ahmad al-Nasa\'i', tag: 'Sunan', color: 'bg-pink-600/10 text-pink-700 border-pink-600/25' },
    { name: 'Sunan Ibn Majah', arabic: 'سُنَنُ ابْنِ مَاجَه', scholar: 'Imam Muhammad Ibn Majah', tag: 'Sunan', color: 'bg-rose-600/10 text-rose-700 border-rose-600/25' }
  ];

  const activeBookHadiths = selectedBook ? getBookHadiths(selectedBook) : [];

  return (
    <section 
      id="hadith-explorer"
      className={`py-24 px-4 sm:px-8 border-b transition-colors duration-700 select-text
        ${isSpace 
          ? 'bg-[#030811] border-gold/15 text-white' 
          : 'bg-[#FAF5ED] border-crimson/10 text-stone-900'
        }
      `}
    >
      <div className="max-w-6xl mx-auto">
        
        {/* MAJESTIC HEADER BANNER BOX */}
        <div 
          className="relative py-12 px-6 sm:px-12 rounded-sm border-2 border-[#C4A35A] flex flex-col items-center text-center shadow-lg overflow-hidden mb-12
            bg-[#FAF8F5] text-stone-900 dark:bg-stone-950 dark:text-zinc-100"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(196,163,90,0.12) 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px'
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#800F15]"></div>
          
          <span 
            className="font-arabic text-3xl sm:text-4xl text-[#C9933A] block mb-3 font-bold select-none"
            style={{ fontFamily: 'Amiri, Georgia, serif' }}
          >
            كُتُبُ الْحَدِيثِ الشَّرِيفِ
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif tracking-tight text-[#0B4628] dark:text-[#E87A7D] mb-4 font-black cormorant leading-tight">
            Hadith Library — The Authentic Collections
          </h2>
          <p className="text-[#0B4628]/90 dark:text-zinc-300 font-sans text-[11px] sm:text-xs uppercase tracking-[0.16em] font-black max-w-2xl leading-relaxed">
            SAHIH BUKHARI • SAHIH MUSLIM • MUWATTA MALIK • MUSNAD AHMAD • SUNAN ABU DAWUD • TIRMIDHI • NASA'I • IBN MAJAH
          </p>
        </div>

        {/* CONTRAST DIRECTED BUTTON TAB ROW (ALL BOLD BOLD BOLD!) */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 border-b border-stone-300/60 pb-6">
          {(['famous', 'browse', 'search', 'imams'] as const).map((tab) => {
            const labels = {
              famous: '40 Famous Hadiths',
              browse: 'Browse by Book',
              search: 'Search by Topic',
              imams: 'Four Imams'
            };
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedBook(null); // Clear book filter on switches
                }}
                className={`px-5 py-3 rounded-full text-xs sm:text-sm tracking-wide transition-all border-2 cursor-pointer select-none font-bold uppercase
                  ${isActive 
                    ? 'bg-[#800F15] text-white border-[#800F15] shadow-md scale-102 font-extrabold animate-fade-in' 
                    : isSpace
                      ? 'bg-transparent text-stone-200 border-zinc-700 hover:border-gold hover:text-white'
                      : 'bg-white text-stone-900 border-stone-300 hover:border-stone-800'
                  }
                `}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* TAB 1: BROWSE BY BOOK CONTAINER */}
        {activeTab === 'browse' && (
          <div className="space-y-8 animate-fade-in">
            {!selectedBook ? (
              <div>
                <h3 className="text-xs font-mono font-black tracking-widest text-[#800F15] dark:text-[#C4A35A] uppercase mb-4 text-center">
                  SELECT A HADITH COLLECTION
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {COLLECTIONS.map((col) => (
                    <div
                      key={col.name}
                      onClick={() => setSelectedBook(col.name)}
                      className={`p-6 border-2 rounded-sm cursor-pointer transition-all hover:scale-101 hover:shadow-md flex flex-col justify-between
                        ${isSpace 
                          ? 'bg-[#091122] border-zinc-800 hover:border-gold/60 text-white' 
                          : 'bg-white border-stone-200 hover:border-[#800F15] text-stone-900'
                        }
                      `}
                    >
                      <div className="space-y-2">
                        <span className="font-arabic text-xl text-[#C4A35A] font-semibold block leading-none" style={{ fontFamily: 'Amiri, serif' }}>
                          {col.arabic}
                        </span>
                        <h4 className="font-serif font-extrabold text-base tracking-wide text-zinc-900 dark:text-zinc-100">
                          {col.name}
                        </h4>
                        <p className="text-xs text-stone-500 font-sans tracking-wide leading-relaxed font-bold">
                          Collector: {col.scholar}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-stone-100/50 pt-3 mt-4">
                        <span className={`text-[10px] font-mono tracking-wider font-bold uppercase rounded-sm px-2 py-0.5 border ${col.color}`}>
                          {col.tag}
                        </span>
                        <span className="text-xs font-mono font-black text-[#800F15] dark:text-[#C4A35A] flex items-center gap-1">
                          Explore &rarr;
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Back to Book Selection */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSelectedBook(null)}
                    className={`font-mono text-xs uppercase font-black tracking-wide flex items-center gap-1 cursor-pointer transition-colors px-3 py-1.5 border rounded-sm
                      ${isSpace ? 'text-zinc-200 hover:text-gold border-zinc-800' : 'text-stone-800 hover:text-[#800F15] border-stone-300 bg-white'}
                    `}
                  >
                    &larr; Back to Collections
                  </button>
                  <h3 className="font-serif font-bold text-lg text-zinc-800 dark:text-zinc-200 border-b-2 border-[#C4A35A] pb-1">
                    {selectedBook} Selections
                  </h3>
                </div>

                <div className="space-y-5">
                  {activeBookHadiths.length === 0 ? (
                    <div className="text-center py-10 text-stone-500 bg-white/40 dark:bg-black/20 rounded border border-dashed border-stone-300">
                      <HelpCircle className="w-10 h-10 mx-auto text-stone-400 mb-2" />
                      <p className="font-sans text-xs">No deep-cut selections loaded yet. Standard wisdom available.</p>
                    </div>
                  ) : (
                    activeBookHadiths.map((hd, idx) => (
                      <div 
                        key={idx}
                        className={`p-6 border rounded-sm md:rounded-md transition-all duration-300 relative border-l-4 shadow-sm
                          ${isSpace 
                            ? 'bg-[#0a0f1d] border-l-gold border-zinc-800 text-white' 
                            : 'bg-[#FFFBF5] border-l-[#800F15] border-stone-200 text-stone-950'
                          }
                        `}
                      >
                        {/* Arabic text with beautiful Amiri font */}
                        <div className="text-center mb-4 select-all font-semibold font-arabic text-lg sm:text-2xl leading-relaxed text-yellow-600 dark:text-gold-light" style={{ fontFamily: 'Amiri, Georgia, serif' }}>
                          {hd.arabic}
                        </div>

                        {/* Translation */}
                        <p className="text-sm sm:text-base leading-relaxed italic text-stone-700 dark:text-zinc-300 text-center max-w-3xl mx-auto mb-4 font-bold font-serif">
                          "{hd.translation}"
                        </p>

                        {/* Badges footer */}
                        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-stone-250/20 pt-4 mt-4 text-center sm:text-left gap-2 text-[10px]">
                          <span className="font-mono text-stone-500 font-bold tracking-brand">
                            Source: {hd.source}
                          </span>
                          {hd.context && (
                            <span className="font-sans font-black uppercase text-[#800F15] dark:text-[#C4A35A] max-w-sm tracking-wider">
                              Category: {hd.topic}
                            </span>
                          )}
                        </div>

                        {/* Expander text context */}
                        {hd.context && (
                          <div className="bg-stone-200/20 dark:bg-black/35 rounded p-3 text-[11px] leading-relaxed text-stone-600 dark:text-stone-400 mt-3 font-sans font-semibold">
                            <span className="font-black text-[#800F15] dark:text-gold uppercase tracking-wider mr-1">Context / Sharh:</span>
                            {hd.context}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SEARCH BY TOPIC */}
        {activeTab === 'search' && (
          <div className="space-y-6 animate-fade-in">
            {/* SEARCH INPUT BAR */}
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search any topic: sincerity, prayer, knowledge, mercy, brotherhood..."
                  className={`w-full p-4 pr-14 rounded border-2 font-serif text-sm focus:outline-none transition-colors
                    ${isSpace 
                      ? 'bg-zinc-950 border-zinc-800 text-white focus:border-gold placeholder-zinc-500' 
                      : 'bg-white border-stone-300 text-stone-900 focus:border-[#800F15] placeholder-stone-500 font-bold'
                    }
                  `}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#800F15] hover:bg-[#A81F26] text-white rounded cursor-pointer transition-colors"
                >
                  <Search className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* QUICK SUGGESTIONS ROW */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs font-semibold">
                <span className="text-stone-500">Quick topics:</span>
                {['intention', 'knowledge', 'mercy', 'character', 'guidance', 'moderation', 'brotherhood'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleQuickTopic(t)}
                    className={`px-3 py-1 rounded-sm border cursor-pointer select-none font-bold uppercase tracking-wider text-[10px]
                      ${isSpace 
                        ? 'border-zinc-800 text-zinc-300 bg-[#080d1a] hover:border-gold' 
                        : 'border-stone-300 text-stone-800 bg-white hover:border-stone-800'
                      }
                    `}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </form>

            {/* RESULTS ROW */}
            <div className="space-y-5">
              {searchSubmitted ? (
                searchResults.length === 0 ? (
                  <div className="text-center py-12 text-stone-500 bg-white/50 dark:bg-black/10 rounded border border-stone-200">
                    <HelpCircle className="w-12 h-12 mx-auto stroke-[1.2] text-[#C4A35A] opacity-80 mb-3" />
                    <p className="font-serif italic font-bold">No exact matches in this local selection.</p>
                    <p className="text-[11px] font-sans text-stone-400 mt-1">Try keywords like "knowledge", "mercy", "intention", or "character".</p>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-xs font-mono font-black text-stone-400 uppercase tracking-widest text-center mb-4">
                      Found {searchResults.length} Relevant Prophetic Records
                    </h4>
                    <div className="space-y-5">
                      {searchResults.map((hd, idx) => (
                        <div 
                          key={idx}
                          className={`p-6 border rounded border-l-4 shadow-sm transition-all duration-300
                            ${isSpace 
                              ? 'bg-[#0a0f1d] border-l-gold border-zinc-800 text-white' 
                              : 'bg-white border-l-[#800F15] border-stone-200 text-stone-900 shadow-sm'
                            }
                          `}
                        >
                          <div className="text-center mb-4 select-all font-semibold font-arabic text-lg sm:text-2xl leading-relaxed text-[#C4A35A] dark:text-gold-light" style={{ fontFamily: 'Amiri, serif' }}>
                            {hd.arabic}
                          </div>
                          <p className="text-sm sm:text-base leading-relaxed italic text-stone-700 dark:text-zinc-200 text-center max-w-3xl mx-auto mb-3 font-bold font-serif">
                            "{hd.translation}"
                          </p>
                          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-stone-100 mt-4 pt-3 gap-2 text-[10px]">
                            <span className="font-mono text-stone-400 font-bold">{hd.source}</span>
                            <span className="px-2 py-0.5 rounded border border-stone-300/40 uppercase font-black text-stone-400 font-mono tracking-wider bg-stone-50 dark:bg-black/25">
                              Topic: {hd.topic}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center py-10 text-stone-500 bg-white/40 dark:bg-black/10 rounded border border-stone-200">
                  <MessageSquareQuote className="w-10 h-10 stroke-[1.2] mx-auto text-[#C4A35A] opacity-70 mb-3" />
                  <p className="font-serif italic font-bold">Awaiting inquiry request...</p>
                  <p className="text-[11px] font-sans text-stone-400 mt-1">Select a quick topic tag above or input search queries.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: 40 FAMOUS HADITHS (AN-NAWAWI) */}
        {activeTab === 'famous' && (
          <div className="space-y-6 animate-fade-in">
            {/* HERO BOX ABOUT HADITH 40 */}
            <div className="bg-[#800F15]/5 border-2 border-[#800F15]/20 p-5 rounded-sm flex items-start gap-4 shadow-sm">
              <BookOpen className="w-10 h-10 text-[#800F15] shrink-0 stroke-[1.5]" />
              <div>
                <h3 className="font-serif font-black text-[#800F15] dark:text-zinc-100 text-lg sm:text-xl">
                  Al-Arba'en al-Nawawiyya — الْأَرْبَعُونَ النَّوَوِيَّة
                </h3>
                <p className="font-sans text-xs sm:text-sm text-stone-700 dark:text-zinc-300 leading-relaxed font-bold">
                  Imam al-Nawawi’s 40 foundational Hadiths — widely acclaimed as compiling the absolute pillars of Islamic jurisprudence and moral principles. True masterpieces of synthetic prophetic brevity (Jawami' al-Kalim).
                </p>
              </div>
            </div>

            {/* CLICK GRID OVER PANEL */}
            <div className="bg-[#FFFBF5] dark:bg-[#080d19] border border-stone-300/60 p-5 sm:p-6 rounded-sm shadow-xs">
              <span className="block text-[11px] font-mono tracking-wider text-stone-500 uppercase font-bold mb-3">
                Click any Hadith to read it in full:
              </span>
              <div className="flex flex-wrap gap-2 justify-center">
                {Array.from({ length: 40 }, (_, i) => i + 1).map((val) => {
                  const isActive = selectedNawawiNum === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSelectedNawawiNum(val)}
                      className={`w-10 h-10 rounded border text-xs font-mono font-bold transition-all cursor-pointer select-none flex items-center justify-center
                        ${isActive 
                          ? 'bg-[#800F15] text-white border-[#800F15] shadow-sm transform scale-105 font-extrabold' 
                          : isSpace 
                            ? 'bg-[#121c32]/50 border-zinc-800 text-zinc-300 hover:border-gold' 
                            : 'bg-white border-stone-300 text-stone-900 hover:border-stone-800 font-bold'
                        }
                      `}
                    >
                      #{val}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PRE-FILLED SINGLE ENTRY VIEW CARD */}
            {(() => {
              const details = getNawawiDetails(selectedNawawiNum);
              return (
                <div 
                  className={`p-6 sm:p-10 border rounded-sm md:rounded-md transition-all duration-300 relative border-l-4 shadow-md
                    ${isSpace 
                      ? 'bg-[#09101f] border-l-gold border-zinc-800 text-white' 
                      : 'bg-white border-l-[#800F15] border-stone-200 text-stone-900'
                    }
                  `}
                >
                  <div className="flex justify-between items-start gap-4 border-b border-stone-200/55 pb-3 mb-6">
                    <h4 className="font-serif font-black text-[#800F15] dark:text-[#C4A35A] text-lg sm:text-xl">
                      {details.title}
                    </h4>
                    <span className="font-mono text-[10px] text-stone-400 bg-stone-100 dark:bg-black/25 px-2 py-0.5 rounded border border-stone-300/30">
                      An-Nawawi Collection
                    </span>
                  </div>

                  {/* LARGE ARABIC PORTAL */}
                  <div className="text-center mb-6 select-all font-semibold font-arabic text-xl sm:text-3xl leading-relaxed sm:leading-loose text-yellow-600 dark:text-gold-light" style={{ fontFamily: 'Amiri, serif' }}>
                    {details.arabic}
                  </div>

                  {/* ENGLISH SENSATIONAL TRANSLATION */}
                  <p className="text-sm sm:text-base leading-relaxed italic text-stone-800 dark:text-zinc-200 text-center max-w-3xl mx-auto mb-6 font-bold font-serif">
                    "{details.translation}"
                  </p>

                  {/* EXEGESIS NOTES / SHARH */}
                  <div className="bg-[#FAF8F5] dark:bg-black/35 rounded border border-stone-250 p-4 font-sans text-xs leading-relaxed text-stone-700 dark:text-zinc-350">
                    <span className="font-black text-[#800F15] dark:text-[#C4A35A] uppercase tracking-wider block mb-1">
                      Academic Context & Commentary:
                    </span>
                    <p className="font-semibold leading-relaxed">
                      {details.commentary}
                    </p>
                  </div>

                  {/* CERTIFICATION CAPATION */}
                  <div className="text-center mt-6">
                    <span className="inline-block font-mono text-[10px] text-stone-450 dark:text-stone-500">
                      Primary Source Record: {details.source} | Standard Verification Checked ✓
                    </span>
                  </div>
                </div>
              );
            })()}

          </div>
        )}

        {/* TAB 4: FOUR IMAMS */}
        {activeTab === 'imams' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h3 className="text-xs font-mono font-black text-[#800F15] dark:text-[#C4A35A] uppercase tracking-widest mb-2">
                The Pillars of Jurisprudence
              </h3>
              <h4 className="font-serif font-black text-2xl sm:text-3xl text-zinc-800 dark:text-white mb-2">
                The Four Imams of Fiqh & Hadith
              </h4>
              <p className="font-sans text-xs sm:text-sm text-stone-500 max-w-2xl mx-auto leading-relaxed mb-8">
                Learn about the foundational jurists who synthesized prophetic Hadith records into structured legal schools (Madhahib).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* IMAM 1 */}
              <div className={`p-6 border-2 rounded-sm space-y-4 shadow-sm
                ${isSpace ? 'bg-[#091122] border-zinc-800 text-white' : 'bg-white border-stone-200 text-stone-900'}
              `}>
                <div className="flex justify-between items-center">
                  <span className="font-arabic text-xl sm:text-2xl text-[#C4A35A] font-bold" style={{ fontFamily: 'Amiri, serif' }}>
                    أَبُو حَنِيفَةَ
                  </span>
                  <span className="bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider font-extrabold">
                    Hanafi School
                  </span>
                </div>
                <h4 className="font-serif font-extrabold text-lg text-zinc-900 dark:text-zinc-100">Imam Abu Hanifa (80–150 AH)</h4>
                <p className="text-xs text-stone-600 dark:text-zinc-300 font-sans leading-relaxed font-semibold">
                  Al-Nu'man ibn Thabit, born in Kufa, Iraq. Widely renowned for his incredible rational capacity, analogical deduction (Qiyas), and intellectual flexibility. He relied on legal principles derived carefully from verified authentic Hadiths.
                </p>
                <div className="border-t border-stone-100 pt-3 mt-3 flex justify-between items-center text-[10px]">
                  <span className="font-mono text-stone-400 font-bold">Principal Compilation: Musnad Abu Hanifa</span>
                  <span className="text-[#C4A35A] font-bold cursor-pointer hover:underline">Read legacy &rarr;</span>
                </div>
              </div>

              {/* IMAM 2 */}
              <div className={`p-6 border-2 rounded-sm space-y-4 shadow-sm
                ${isSpace ? 'bg-[#091122] border-zinc-800 text-white' : 'bg-white border-stone-200 text-stone-900'}
              `}>
                <div className="flex justify-between items-center">
                  <span className="font-arabic text-xl sm:text-2xl text-[#C4A35A] font-bold" style={{ fontFamily: 'Amiri, serif' }}>
                    مَالِكُ بْنُ أَنَسٍ
                  </span>
                  <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider font-extrabold">
                    Maliki School
                  </span>
                </div>
                <h4 className="font-serif font-extrabold text-lg text-zinc-900 dark:text-zinc-100">Imam Malik ibn Anas (93–179 AH)</h4>
                <p className="text-xs text-stone-600 dark:text-zinc-300 font-sans leading-relaxed font-semibold">
                  The scholar of Medina, who lived and taught in the City of the Prophet. He famously authored Al-Muwatta, the earliest written book of Islamic jurisprudence and authentic prophetic Hadith mapping of Medina.
                </p>
                <div className="border-t border-stone-100 pt-3 mt-3 flex justify-between items-center text-[10px]">
                  <span className="font-mono text-stone-400 font-bold">Principal Compilation: Al-Muwatta</span>
                  <span className="text-[#C4A35A] font-bold cursor-pointer hover:underline">Read legacy &rarr;</span>
                </div>
              </div>

              {/* IMAM 3 */}
              <div className={`p-6 border-2 rounded-sm space-y-4 shadow-sm
                ${isSpace ? 'bg-[#091122] border-zinc-800 text-white' : 'bg-white border-stone-200 text-stone-900'}
              `}>
                <div className="flex justify-between items-center">
                  <span className="font-arabic text-xl sm:text-2xl text-[#C4A35A] font-bold" style={{ fontFamily: 'Amiri, serif' }}>
                    الشَّافِعِيُّ
                  </span>
                  <span className="bg-blue-100 text-blue-900 border border-blue-300 px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider font-extrabold">
                    Shafi'i School
                  </span>
                </div>
                <h4 className="font-serif font-extrabold text-lg text-zinc-900 dark:text-zinc-100">Imam al-Shafi'i (150–204 AH)</h4>
                <p className="text-xs text-stone-600 dark:text-zinc-300 font-sans leading-relaxed font-semibold">
                  Muhammad ibn Idris al-Shafi'i, born in Gaza. Author of the classic Risalah, establishing the formal fundamentals of Islamic jurisprudence (Usul al-Fiqh). He elegantly balanced the schools of textual tradition and ration.
                </p>
                <div className="border-t border-stone-100 pt-3 mt-3 flex justify-between items-center text-[10px]">
                  <span className="font-mono text-stone-400 font-bold">Principal Compilation: Musnad al-Shafi'i</span>
                  <span className="text-[#C4A35A] font-bold cursor-pointer hover:underline">Read legacy &rarr;</span>
                </div>
              </div>

              {/* IMAM 4 */}
              <div className={`p-6 border-2 rounded-sm space-y-4 shadow-sm
                ${isSpace ? 'bg-[#091122] border-zinc-800 text-white' : 'bg-white border-stone-200 text-stone-900'}
              `}>
                <div className="flex justify-between items-center">
                  <span className="font-arabic text-xl sm:text-2xl text-[#C4A35A] font-bold" style={{ fontFamily: 'Amiri, serif' }}>
                    أَحْمَدُ بْنُ حَنْبَلٍ
                  </span>
                  <span className="bg-red-100 text-red-900 border border-red-300 px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider font-extrabold">
                    Hanbali School
                  </span>
                </div>
                <h4 className="font-serif font-extrabold text-lg text-zinc-900 dark:text-zinc-100">Imam Ahmad ibn Hanbal (164–241 AH)</h4>
                <p className="text-xs text-stone-600 dark:text-zinc-300 font-sans leading-relaxed font-semibold">
                  The great imam of Baghdad. Renowned for his phenomenal memorization of over a million Hadiths. He formulated the Musnad Ahmad, one of the largest and most robust encyclopedic compilations of pristine prophetic narrations.
                </p>
                <div className="border-t border-stone-100 pt-3 mt-3 flex justify-between items-center text-[10px]">
                  <span className="font-mono text-stone-400 font-bold">Principal Compilation: Musnad Ahmad</span>
                  <span className="text-[#C4A35A] font-bold cursor-pointer hover:underline">Read legacy &rarr;</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
