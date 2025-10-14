import { useState, useEffect } from 'react';
import { formatDateKey, getAccentForKid } from './utils';
import KidCard from './components/KidCard';
import TaskModal from './components/TaskModal';
import SwipePager from './components/SwipePager';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { DailyTasksDoc, Task } from './types';
import { initializeDailyTasks, subscribeDailyDoc, toggleTaskCompleted, upsertTask, deleteTaskLine, deleteSubjectTasks } from './services.firestore';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyDocs, setDailyDocs] = useState<Record<string, DailyTasksDoc | null>>({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKid, setSelectedKid] = useState<string | undefined>();
  const [useSwipe, setUseSwipe] = useState(true);
  const [editingTask, setEditingTask] = useState<(Task & { kidName?: string }) | null>(null);

  // Fixed kids for template-based system
  const displayKids = ['Hazel', 'Aiden'];

  // Subscribe to Firestore for current date
  useEffect(() => {
    const dateKey = formatDateKey(currentDate);
    setLoading(true);
    const unsubs = displayKids.map((kid) => {
      // Ensure daily doc exists for each kid
      initializeDailyTasks(dateKey, kid).catch((e) => console.error('init daily failed', e));
      return subscribeDailyDoc(dateKey, kid, (doc) => {
        setDailyDocs((prev) => ({ ...prev, [kid]: doc }));
        setLoading(false);
      });
    });
    return () => {
      unsubs.forEach((u) => u && u());
    };
  }, [currentDate]);

  // Check window size for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setUseSwipe(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle task completion
  const handleToggleTask = async (kidName: string, taskId: string, completed: boolean) => {
    try {
      await toggleTaskCompleted(formatDateKey(currentDate), kidName, taskId, completed);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task.');
    }
  };

  // Add new task
  const handleUpsertTask = async (taskData: {
    kidName: string;
    subject: string;
    book: 'Textbook' | 'Notebook' | 'Handwriting Book' | 'Dictation';
    description: string;
    id?: string;
  }) => {
    try {
      const { kidName, subject, book, description, id } = taskData;
      await upsertTask(formatDateKey(currentDate), kidName, {
        id,
        subject,
        book,
        description,
        completed: false
      });
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task.');
    }
  };

  // Quick add: create a placeholder line for a subject (defaults to Notebook)
  const handleQuickAdd = async (kidName: string, subject: string, book?: Task['book']) => {
    await handleUpsertTask({
      kidName,
      subject,
      book: (book || 'Notebook') as any,
      description: ''
    });
  };

  const openModalForKid = (kidName: string) => {
    setSelectedKid(kidName);
    setIsModalOpen(true);
  };

  const openEditForTask = (kidName: string, task: Task) => {
    setSelectedKid(kidName);
    setEditingTask({ ...task, kidName });
    setIsModalOpen(true);
  };

  // Navigate dates
  const goToPreviousDay = () => {
    setCurrentDate(subDays(currentDate, 1));
  };

  const goToNextDay = () => {
    setCurrentDate(addDays(currentDate, 1));
  };

  // No separate goToToday control; the current date displays a TODAY badge when applicable

  // Get tasks for a specific kid
  const getTasksForKid = (kidName: string): Task[] => {
    const doc = dailyDocs[kidName];
    return doc?.tasks || [];
  };

  const handleRemoveSubject = async (kidName: string, subject: string) => {
    try {
      await deleteSubjectTasks(formatDateKey(currentDate), kidName, subject);
    } catch (e) {
      console.error('remove subject failed', e);
    }
  };

  return (
    <div className="app">
      {/* Header with date navigation */}
      <header className="app-header glass-panel">
        <button className="date-nav-btn" onClick={goToPreviousDay} aria-label="Previous day">
          ‹
        </button>
        
        <div className="date-strip">
          <span className="date-item muted">{format(subDays(currentDate, 1), 'EEE d')}</span>
          <div className={`date-item selected-date ${isSameDay(currentDate, new Date()) ? 'is-today' : ''}`}>
            <span className="selected-date-text">{format(currentDate, 'EEE, MMM d')}</span>
            {isSameDay(currentDate, new Date()) && (
              <span className="today-badge">TODAY</span>
            )}
          </div>
          <span className="date-item muted">{format(addDays(currentDate, 1), 'EEE d')}</span>
        </div>

        <button className="date-nav-btn" onClick={goToNextDay} aria-label="Next day">
          ›
        </button>
      </header>

      {/* Totals bar */}
      <div className="totals-bar glass-panel">
        {(() => {
          const totals = (displayKids || []).reduce(
            (acc, kid) => {
              const list = getTasksForKid(kid);
              acc.total += list.length;
              acc.completed += list.filter(t => t.completed).length;
              return acc;
            },
            { completed: 0, total: 0 }
          );
          const percent = totals.total > 0 ? Math.round((totals.completed / totals.total) * 100) : 0;
          return (
            <div style={{ width: '100%' }}>
              <div className="totals-header">
                <span className="totals-text"><span className="check-icon">✓</span>{totals.completed}/{totals.total} completed</span>
                <span className="totals-percent">{percent}%</span>
              </div>
              <div className="totals-progress">
                <div className="totals-progress-fill" style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })()}
      </div>

      {/* Main content */}
      <main className="app-content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : useSwipe ? (
          // Mobile: Swipeable cards
          <SwipePager>
            {displayKids.map(kid => (
              <KidCard
                key={kid}
                kidName={kid}
                accent={getAccentForKid(kid)}
                tasks={getTasksForKid(kid)}
                onToggleTask={(taskId, completed) => handleToggleTask(kid, taskId, completed)}
                onAddTask={() => openModalForKid(kid)}
                onRemoveTask={(taskId) => deleteTaskLine(formatDateKey(currentDate), kid, taskId).catch(console.error)}
                onEditTask={(task) => openEditForTask(kid, task)}
                onQuickAddForSubject={(subject, book) => handleQuickAdd(kid, subject, book)}
                onRemoveSubject={(subject) => handleRemoveSubject(kid, subject)}
              />
            ))}
          </SwipePager>
        ) : (
          // Desktop/Tablet: Two columns
          <div className="kids-grid">
            {displayKids.map(kid => (
              <KidCard
                key={kid}
                kidName={kid}
                accent={getAccentForKid(kid)}
                tasks={getTasksForKid(kid)}
                onToggleTask={(taskId, completed) => handleToggleTask(kid, taskId, completed)}
                onAddTask={() => openModalForKid(kid)}
                onRemoveTask={(taskId) => deleteTaskLine(formatDateKey(currentDate), kid, taskId).catch(console.error)}
                onEditTask={(task) => openEditForTask(kid, task)}
                onQuickAddForSubject={(subject, book) => handleQuickAdd(kid, subject, book)}
                onRemoveSubject={(subject) => handleRemoveSubject(kid, subject)}
              />
            ))}
          </div>
        )}

      </main>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedKid(undefined);
          setEditingTask(null);
        }}
        onSave={handleUpsertTask}
        availableKids={displayKids}
        preselectedKid={editingTask?.kidName || selectedKid}
      />
    </div>
  );
}

export default App;

