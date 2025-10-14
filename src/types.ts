// Kid name type - dynamic string to allow adding new kids
export type KidName = string;

// New canonical Task for daily_tasks documents
export interface Task {
  id: string; // unique line id within the daily document
  subject: string; // e.g., English, Malayalam, Maths, GK, Hindi
  book: 'Textbook' | 'Notebook' | 'Handwriting Book' | 'Dictation';
  description: string; // free-text note; can be empty
  completed: boolean;
}

// Daily document stored in daily_tasks collection
export interface DailyTasksDoc {
  id?: string; // doc id == `${date}_${kidName}`
  kidName: KidName;
  date: string; // YYYY-MM-DD
  tasks: Task[];
  removedKeys?: string[]; // keys for removed template pairs: `${subject}::${book}`
  createdAt: number;
  updatedAt: number;
}

// Template document stored in kid_templates collection
export interface KidTemplateDoc {
  kidName: KidName;
  // Predefined lines that will be cloned into a daily doc (without descriptions)
  templateTasks: Array<Pick<Task, 'subject' | 'book'>>;
}

// Kid configuration for UI
export interface KidConfig {
  name: KidName;
  accent: string;
}

