import { Subject, SubjectId } from '../models';

export const SUBJECTS: Record<SubjectId, Subject> = {
  math: { id: 'math', title: 'Математика', color: '#2D6CDF' },
  ru: { id: 'ru', title: 'Русский', color: '#7A4FE0' },
  by: { id: 'by', title: 'Беларуская', color: '#3D8B3A' },
  en: { id: 'en', title: 'Английский', color: '#E2557A' },
};

export const GRADES = [3, 4] as const;
