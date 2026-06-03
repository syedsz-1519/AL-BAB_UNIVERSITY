export type Language = 'en' | 'ar' | 'ur';

export interface Translations {
  title: string;
  subtitle: string;
  celestialGlobe: string;
  mission: string;
  curriculum: string;
  scholasticPortal: string;
  partnersTeam: string;
  applyNow: string;
  searchPlaceholder: string;
  enterPortal: string;
  accessAudits: string;
  debateArena: string;
  quranExplorer: string;
  fiqhRuling: string;
  adminPanel: string;
  backToLanding: string;
  toggleThemeLight: string;
  toggleThemeDark: string;
  hadithTitle: string;
}

export const LIST_TRANSLATIONS: Record<Language, Translations> = {
  en: {
    title: "ALBAB ISLAMIC",
    subtitle: "UNIVERSITY",
    celestialGlobe: "Celestial Globe Hub",
    mission: "Mission & Ethics",
    curriculum: "Branches of Study",
    scholasticPortal: "Scholastic Portal",
    partnersTeam: "Strategic Partners",
    applyNow: "Apply Now",
    searchPlaceholder: "Search branches...",
    enterPortal: "Enter Scholar Student Portal",
    accessAudits: "Access Scribes Audits",
    debateArena: "Debate Arena",
    quranExplorer: "Qur'an Explorer",
    fiqhRuling: "Fiqh Ruling Generator",
    adminPanel: "Scribes Admin Panel",
    backToLanding: "Back to Home",
    toggleThemeLight: "Switch to light scholarly mode",
    toggleThemeDark: "Switch to dark celestial mode",
    hadithTitle: "Prophetic Wisdom Matrix"
  },
  ar: {
    title: "جامعة الباب الإسلامية",
    subtitle: "الصرح الأكاديمي الرقمي",
    celestialGlobe: "الكرة الفلكية",
    mission: "الرسالة والقيم",
    curriculum: "المناهج الدراسية",
    scholasticPortal: "البوابة الأكاديمية",
    partnersTeam: "الشركاء الاستراتيجيون",
    applyNow: "قدّم الآن",
    searchPlaceholder: "ابحث عن الفروع الأكاديمية...",
    enterPortal: "ولوج بوابة الطلاب العلماء",
    accessAudits: "ولوج لوحة تدقيق الكتبة",
    debateArena: "ميدان المناظرة العلمية",
    quranExplorer: "مستكشف القرآن الكريم",
    fiqhRuling: "منشئ الفتاوى والقرارات",
    adminPanel: "لوحة تحكم المشرفين والكتبة",
    backToLanding: "العودة للرئيسية",
    toggleThemeLight: "التحويل للوضع الورقي المضيء",
    toggleThemeDark: "التحويل للوضع الفلكي المظلم",
    hadithTitle: "فيض الحكمة النبوية الشريفة"
  },
  ur: {
    title: "الباب اسلامک یونیورسٹی",
    subtitle: "علمی و روحانی مرکز",
    celestialGlobe: "فلکیاتی کرہ علم",
    mission: "مقصد اور اخلاقیات",
    curriculum: "شعبہ ہائے تعلیم",
    scholasticPortal: "علمی پورٹل",
    partnersTeam: "اسٹریٹجک شراکت دار",
    applyNow: "داخلہ لیں",
    searchPlaceholder: "شاخیں تلاش کریں...",
    enterPortal: "سکالر سٹوڈنٹ پورٹل میں داخل ہوں",
    accessAudits: "کاتب ایڈٹ اور آڈٹ پینل",
    debateArena: "علمی مناظرہ گاہ",
    quranExplorer: "قرآن ورس ایکسپلورر",
    fiqhRuling: "فتاویٰ اور فقہی مشیر",
    adminPanel: "ایڈمنسٹریشن آڈٹ پینل",
    backToLanding: "ہوم پیج پر واپس جائیں",
    toggleThemeLight: "روشن علمی انداز منتخب کریں",
    toggleThemeDark: "تاریک فلکیاتی انداز منتخب کریں",
    hadithTitle: "اقوالِ رسول ﷺ"
  }
};
