export interface Branch {
  name: string;
  description: string;
}

export interface Course {
  id: string;
  name: string;
  count: string;
  icon: string;
  branches: string[];
  description: string;
  accentColor: string;
}

export interface Hadith {
  id: string;
  arabic: string;
  translation: string;
  source: string;
  context?: string;
}

export interface Partner {
  name: string;
  shape: 'square' | 'circle' | 'triangle';
  description: string;
}

export interface EnrollmentState {
  fullName: string;
  email: string;
  selectedCourse: string;
  statementOfPurpose: string;
  priorKnowledge: 'none' | 'beginner' | 'intermediate' | 'advanced';
}
