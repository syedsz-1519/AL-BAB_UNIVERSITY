import { Course, Hadith, Partner } from './types';

const COURSES_BASE: Course[] = [
  {
    id: 'quran',
    name: "Qur'an",
    count: '5 Branches',
    icon: 'BookOpen',
    branches: ['Tafseer', 'Uloom al-Qur\'an', 'Qira\'at', 'Hifz & Tajweed', 'Qur\'anic Arabic'],
    description: 'The fountainhead of revelation. Deep dive into exegesis, structural rules, rhetorical miracles, historic context, and precise preservation methodology.',
    accentColor: '--color-gold'
  },
  {
    id: 'hadith',
    name: 'Hadith',
    count: '5 Branches',
    icon: 'MessageSquareText',
    branches: ['Mustalah of Hadith', 'Ilm al-Rijal', 'Sharh al-Hadith', 'Takhrij', 'Hadith Collections Study'],
    description: 'The prophetic path. Study the scientific principles of narrations, the critical biography of narrators, chain authenticity verification, and application.',
    accentColor: '--color-crimson'
  },
  {
    id: 'fiqh',
    name: 'Fiqh',
    count: '5 Branches',
    icon: 'Scale',
    branches: ['Usul al-Fiqh', 'Comparative Fiqh', 'Muamalat', 'Ibadat', 'Judiciary & Fatwa'],
    description: 'Islamic jurisprudence and systematic execution. Grasp legal principles, comparative school methods, contracts of modern commerce, and ethical decree generation.',
    accentColor: 'emerald-600'
  },
  {
    id: 'logic',
    name: 'Logic',
    count: '5 Branches',
    icon: 'Binary',
    branches: ['Deductive Logic', 'Inductive Logic', 'Symbolic Logic', 'Informal Fallacies', 'Critical Thinking'],
    description: 'The standard of sound reasoning. Master deductive synergetic systems, inductive research, formal notation of arguments, and identification of intellectual fallacies.',
    accentColor: 'blue-500'
  },
  {
    id: 'philosophy',
    name: 'Philosophy',
    count: '5 Branches',
    icon: 'Compass',
    branches: ['Metaphysics', 'Epistemology', 'Ethics', 'Political Philosophy', 'Philosophy of Religion'],
    description: 'The analytical arena. Reconstruct core paradigms, evaluate theories of knowing, study classic morals, and critique secular political thought framework.',
    accentColor: 'purple-500'
  },
  {
    id: 'psychology',
    name: 'Psychology',
    count: '5 Branches',
    icon: 'Brain',
    branches: ['Cognitive Psychology', 'Behavioral Psychology', 'Clinical Psychology', 'Social Psychology', 'Neuropsychology'],
    description: 'Mind, soul, and motivation. Juxtapose historical theories of Nafs (the soul/psyche) with state-of-the-art cognitive neuroscience and behavioral therapy.',
    accentColor: 'pink-500'
  },
  {
    id: 'challenges',
    name: 'Challenges',
    count: '5 Branches',
    icon: 'TriangleAlert',
    branches: ['Atheism', 'Liberalism', 'Feminism', 'Materialism', 'Secularism'],
    description: 'Scholarly critique of contemporary ideologies. Undertake a rigorous, respectful academic breakdown of current sociopolitical and theological challenges.',
    accentColor: 'emerald-600'
  },
  {
    id: 'modernity',
    name: 'Modernity',
    count: '5 Branches',
    icon: 'Globe',
    branches: ['Artificial Intelligence', 'Capitalism', 'Globalization', 'Postmodernism', 'Digital Culture'],
    description: 'Mapping the now. Navigate technology ethics, absolute automation, hyper-connected commerce, critical theory of postmodern age, and societal consequences.',
    accentColor: 'cyan-500'
  }
];

export const NEW_COURSES: Course[] = [
  {
    id: 'history',
    name: 'History',
    count: '5 Branches',
    icon: 'History',
    branches: ['Islamic History', 'World History', 'Ancient Civilizations', 'Historiography', 'Political History'],
    description: 'Relive the great eras and intellectual trajectories. Trace divine patterns through Islamic annals, ancient rises and falls, and historiographical frameworks.',
    accentColor: 'amber-600'
  },
  {
    id: 'politics',
    name: 'Politics',
    count: '5 Branches',
    icon: 'Landmark',
    branches: ['Political Theory', 'Islamic Governance', 'International Relations', 'Geopolitics', 'Public Administration'],
    description: 'Analyze governance models and global systems. Investigate classical theory, Islamic treaties, diplomatic frameworks, and modern geopolitics.',
    accentColor: 'teal-600'
  },
  {
    id: 'poetry',
    name: 'Poetry',
    count: '5 Branches',
    icon: 'Feather',
    branches: ['Arabic Poetry', 'Urdu Poetry', 'Persian Poetry', 'Literary Criticism', 'Spiritual Poetry'],
    description: 'The soul of eloquence. Explore classical odes, mystical couplets, structural rhetorical criticism, and the linguistic genius of legendary poets.',
    accentColor: 'rose-600'
  },
  {
    id: 'islamic-studies',
    name: 'Islamic Studies',
    count: '5 Branches',
    icon: 'BookType',
    branches: ['Aqeedah', 'Seerah', 'Tasawwuf', 'Comparative Religion', 'Dawah Studies'],
    description: 'Roots of conviction and practice. Unveil theological foundations, prophetic biography, spiritual purification, and global comparative dialogues.',
    accentColor: 'emerald-700'
  },
  {
    id: 'economic-studies',
    name: 'Economic Studies',
    count: '5 Branches',
    icon: 'Coins',
    branches: ['Islamic Economics', 'Microeconomics', 'Macroeconomics', 'Behavioral Economics', 'Finance & Trade'],
    description: 'Ethics in commerce and capital. Review micro and macro systems, behavioral incentives, global trading structures, and interest-free solutions.',
    accentColor: 'yellow-600'
  },
  {
    id: 'duniyavi-ilm',
    name: 'Duniya vi Ilm',
    count: '5 Branches',
    icon: 'Globe',
    branches: ['Natural Sciences', 'Social Sciences', 'Modernity & Tech', 'History & Philosophy', 'Economics & Trade'],
    description: 'Worldly knowledge and empirical sciences. Integrating physics, geography, medicine, humanities, and social sciences within an ethical intellectual paradigm.',
    accentColor: 'cyan-500'
  }
];

export const COURSES: Course[] = [...COURSES_BASE, ...NEW_COURSES];

export const HADITHS: Hadith[] = [
  {
    id: 'knowledge-obligation',
    arabic: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ',
    translation: 'Seeking knowledge is an obligation upon every Muslim.',
    source: 'Sunan Ibn Majah, Hadith No. 224 | Graded: Sahih by Al-Albani ✓',
    context: 'This core statement underscores that learning is not a privilege, but a foundational moral and spiritual duty for every single believer.'
  },
  {
    id: 'jannah-path',
    arabic: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ',
    translation: 'Whoever treads a path in search of knowledge, Allah will facilitate for him a path to Paradise.',
    source: 'Sahih Muslim, Book 35, Hadith 6518 | Graded: Sahih ✓',
    context: 'The intellectual struggle and focus required to understand truths is itself a continuous act of worship, paving the cosmic road to eternity.'
  },
  {
    id: 'wisdom-lost',
    arabic: 'الْكَلِمَةُ الْحِكْمَةُ ضَالَّةُ الْمُؤْمِنِ فَحَيْثُ وَجَدَهَا فَهُوَ أَحَقُّ بِهَا',
    translation: 'The word of wisdom is the lost property of the believer, so wherever he finds it, he has a better right to it.',
    source: 'Sunan al-Tirmidhi, Hadith No. 2687 | Graded: Hasan ✓',
    context: 'Instructs the People of Understanding (Ulul Albab) to receive truth and objective knowledge with open arms, regardless of where or who it comes from.'
  },
  {
    id: 'wish-good',
    arabic: 'مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ',
    translation: 'When Allah wishes good for someone, He bestows upon him profound understanding of the religion.',
    source: 'Sahih al-Bukhari, Hadith No. 71 | Graded: Sahih ✓',
    context: 'True goodness lies in clear foresight, comprehension, and the wisdom to execute the principles of active preservation and context.'
  }
];

export const PARTNERS: Partner[] = [
  {
    name: 'Halqa',
    shape: 'square',
    description: 'Traditional circle of scholarly gathering specializing in classic texts reconstruction.'
  },
  {
    name: 'Fiqh Lab',
    shape: 'circle',
    description: 'An international research syndicate focusing on modern financial transactions and legal decrees.'
  },
  {
    name: 'Iqra Hub',
    shape: 'triangle',
    description: 'A contemporary digital preservation library indexing critical editions of heritage manuscripts.'
  }
];
