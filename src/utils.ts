import { format } from 'date-fns';
import { KidTemplateDoc } from './types';

/**
 * Format a date to YYYY-MM-DD string for Firestore keys
 */
export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Get accent color for a kid by name
 * Defaults: Aiden (blue), Hazel (orange)
 * Falls back to a palette for additional kids
 */
export function getAccentForKid(name: string): string {
  const colorMap: Record<string, string> = {
    Hazel: '#1fb6a6', // Teal
    Aiden: '#ff8a3d', // Warm Orange
  };

  // Return mapped color or generate from fallback palette
  if (colorMap[name]) {
    return colorMap[name];
  }

  // Fallback palette for additional kids
  const fallbackPalette = [
    '#4caf50', // Green
    '#ff5722', // Deep Orange
    '#00bcd4', // Cyan
    '#ffeb3b', // Yellow
    '#795548', // Brown
  ];

  // Use name hash to pick consistent color
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return fallbackPalette[hash % fallbackPalette.length];
}

/**
 * Get list of kids from Firestore tasks (unique names)
 */
export function getUniqueKids(tasks: Array<{ kidName: string }>): string[] {
  const uniqueNames = new Set(tasks.map(t => t.kidName));
  return Array.from(uniqueNames).sort();
}

/**
 * Returns the static templates for Hazel and Aiden as a convenience helper
 * in case you want to seed Firestore programmatically.
 */
export function getDefaultKidTemplates(): KidTemplateDoc[] {
  const hazel: KidTemplateDoc = {
    kidName: 'Hazel',
    templateTasks: [
      { subject: 'English', book: 'Textbook' },
      { subject: 'English', book: 'Dictation' },
      { subject: 'English', book: 'Handwriting Book' },
      { subject: 'English', book: 'Notebook' },
      { subject: 'Malayalam', book: 'Textbook' },
      { subject: 'Malayalam', book: 'Dictation' },
      { subject: 'Malayalam', book: 'Handwriting Book' },
      { subject: 'Malayalam', book: 'Notebook' },
      { subject: 'Maths', book: 'Textbook' },
      { subject: 'Maths', book: 'Dictation' },
      { subject: 'Maths', book: 'Notebook' },
      { subject: 'GK', book: 'Textbook' },
      { subject: 'GK', book: 'Dictation' }
    ]
  };

  const aiden: KidTemplateDoc = {
    kidName: 'Aiden',
    templateTasks: [
      ...hazel.templateTasks,
      { subject: 'Hindi', book: 'Textbook' },
      { subject: 'Hindi', book: 'Dictation' },
      { subject: 'Hindi', book: 'Notebook' }
    ]
  } as KidTemplateDoc;

  return [hazel, aiden];
}

