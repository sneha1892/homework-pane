import { db, COLLECTIONS } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { DailyTasksDoc, KidTemplateDoc, Task } from './types';
import { getDefaultKidTemplates } from './utils';

// helper
const keyFor = (s: string, b: Task['book']) => `${s}::${b}`;

export async function getTemplate(kidName: string): Promise<KidTemplateDoc | null> {
  try {
    const ref = doc(db, COLLECTIONS.templates, kidName);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { kidName, ...(snap.data() as Omit<KidTemplateDoc, 'kidName'>) };
  } catch (err) {
    console.error('getTemplate error', err);
    throw err;
  }
}

export async function initializeDailyTasks(dateKey: string, kidName: string): Promise<DailyTasksDoc> {
  const dailyId = `${dateKey}_${kidName}`;
  const dailyRef = doc(db, COLLECTIONS.daily, dailyId);

  // If already exists, ensure sync and return it
  const existing = await getDoc(dailyRef);
  if (existing.exists()) {
    const data = existing.data() as Omit<DailyTasksDoc, 'id'>;
    await syncDailyWithTemplate(dateKey, kidName).catch(() => {});
    return { id: existing.id, ...data };
  }

  // Create from template or fallback
  let tpl = await getTemplate(kidName);
  if (!tpl) {
    const fallback = getDefaultKidTemplates().find(t => t.kidName === kidName);
    if (fallback) {
      tpl = fallback;
    }
  }

  const tasks: Task[] = (tpl?.templateTasks || []).map((t, idx) => ({
    id: `${idx + 1}-${t.subject}-${t.book}`,
    subject: t.subject,
    book: t.book,
    description: '',
    completed: false
  }));

  const docData: DailyTasksDoc = {
    kidName,
    date: dateKey,
    tasks,
    removedKeys: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  await setDoc(dailyRef, docData);
  return { id: dailyId, ...docData };
}

export async function toggleTaskCompleted(dateKey: string, kidName: string, taskId: string, completed: boolean) {
  const dailyId = `${dateKey}_${kidName}`;
  const ref = doc(db, COLLECTIONS.daily, dailyId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data() as DailyTasksDoc;
  const tasks = data.tasks.map(t => (t.id === taskId ? { ...t, completed } : t));
  await updateDoc(ref, { tasks, updatedAt: Date.now() });
}

export async function upsertTask(
  dateKey: string,
  kidName: string,
  task: Omit<Task, 'id'> & { id?: string }
) {
  const dailyId = `${dateKey}_${kidName}`;
  const ref = doc(db, COLLECTIONS.daily, dailyId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data() as DailyTasksDoc;
  let tasks = data.tasks.slice();
  if (task.id) {
    tasks = tasks.map(t => (
      t.id === task.id
        ? { ...t, ...task, id: task.id!, completed: t.completed }
        : t
    ));
  } else {
    const newId = `${Date.now()}`;
    tasks.push({ ...task, id: newId });
  }
  await updateDoc(ref, { tasks, updatedAt: Date.now() });
}

export async function deleteTaskLine(dateKey: string, kidName: string, taskId: string) {
  const dailyId = `${dateKey}_${kidName}`;
  const ref = doc(db, COLLECTIONS.daily, dailyId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data() as DailyTasksDoc;
  const found = data.tasks.find(t => t.id === taskId);
  let removedKeys = data.removedKeys || [];
  if (found) {
    const k = keyFor(found.subject, found.book);
    if (!removedKeys.includes(k)) removedKeys = [...removedKeys, k];
  }
  const tasks = data.tasks.filter(t => t.id !== taskId);
  await updateDoc(ref, { tasks, removedKeys, updatedAt: Date.now() });
}

export async function deleteSubjectTasks(dateKey: string, kidName: string, subject: string) {
  const dailyId = `${dateKey}_${kidName}`;
  const ref = doc(db, COLLECTIONS.daily, dailyId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data() as DailyTasksDoc;
  const tasksToRemove = data.tasks.filter(t => t.subject === subject);
  const keysToAdd = tasksToRemove.map(t => keyFor(t.subject, t.book));
  const tasks = data.tasks.filter(t => t.subject !== subject);
  const removedSet = new Set([...(data.removedKeys || []), ...keysToAdd]);
  await updateDoc(ref, { tasks, removedKeys: Array.from(removedSet), updatedAt: Date.now() });
}

export async function syncDailyWithTemplate(dateKey: string, kidName: string) {
  const dailyId = `${dateKey}_${kidName}`;
  const ref = doc(db, COLLECTIONS.daily, dailyId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data() as DailyTasksDoc;
  let tpl = await getTemplate(kidName);
  if (!tpl) {
    const fallback = getDefaultKidTemplates().find(t => t.kidName === kidName);
    if (fallback) tpl = fallback;
  }
  if (!tpl) return;

  const removedSet = new Set(data.removedKeys || []);
  const existingKeys = new Set(data.tasks.map(t => keyFor(t.subject, t.book)));
  const additions: Task[] = [];
  tpl.templateTasks.forEach((t, idx) => {
    const key = keyFor(t.subject, t.book);
    if (removedSet.has(key)) return; // honor deletions
    if (!existingKeys.has(key)) {
      additions.push({
        id: `${Date.now()}-${idx}`,
        subject: t.subject,
        book: t.book,
        description: '',
        completed: false
      });
    }
  });

  if (additions.length > 0) {
    await updateDoc(ref, { tasks: [...data.tasks, ...additions], updatedAt: Date.now() });
  }
}

export function subscribeDailyDoc(dateKey: string, kidName: string, cb: (doc: DailyTasksDoc | null) => void) {
  const dailyId = `${dateKey}_${kidName}`;
  const ref = doc(db, COLLECTIONS.daily, dailyId);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      cb(null);
      return;
    }
    cb({ id: snap.id, ...(snap.data() as Omit<DailyTasksDoc, 'id'>) });
  });
}

