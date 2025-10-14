import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Task } from '../types';
import clsx from 'clsx';

interface KidCardProps {
  kidName: string;
  accent: string;
  tasks: Task[];
  onToggleTask: (taskId: string, completed: boolean) => void;
  onAddTask: () => void;
  onRemoveTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onQuickAddForSubject: (subject: string, book?: Task['book']) => void;
  onRemoveSubject?: (subject: string) => void;
}

// Group tasks by subject
function groupTasksBySubject(tasks: Task[]) {
  const grouped: Record<string, Task[]> = {};
  tasks.forEach(task => {
    if (!grouped[task.subject]) {
      grouped[task.subject] = [];
    }
    grouped[task.subject].push(task);
  });
  return grouped;
}

// Subject icons mapping (emoji set with clearer metaphors)
const subjectIcons: Record<string, string> = {
  Maths: '🧮',
  Math: '🧮',
  English: '📘',
  Science: '🧪',
  History: '🏛️',
  Malayalam: '📝',
  Hindi: '📝',
  GK: '🧠',
  Other: '📌'
};

const BOOK_CHOICES: Task['book'][] = ['Textbook', 'Notebook', 'Handwriting Book', 'Dictation'];

export default function KidCard({ kidName, accent, tasks, onToggleTask, onAddTask, onRemoveTask, onEditTask, onQuickAddForSubject, onRemoveSubject }: KidCardProps) {
  const groupedTasks = groupTasksBySubject(tasks);
  const subjects = Object.keys(groupedTasks).sort();
  const [openPopoverFor, setOpenPopoverFor] = useState<string | null>(null);
  const [celebrated, setCelebrated] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const chooseBook = (subject: string, book: Task['book']) => {
    onQuickAddForSubject(subject, book);
    setOpenPopoverFor(null);
  };

  const portalRoot = typeof document !== 'undefined' ? document.body : null;

  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;

  useEffect(() => {
    if (total > 0 && completed === total && !celebrated) {
      setCelebrated(true);
      // Fire a small confetti burst over the card
      if (portalRoot && cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '0';
        container.style.top = '0';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '1500';
        const colors = [accent, '#22c55e', '#3b82f6', '#ff8a3d', '#f59e0b'];
        const pieces = 28;
        for (let i = 0; i < pieces; i++) {
          const piece = document.createElement('div');
          const size = 6 + Math.random() * 6;
          const left = rect.left + rect.width / 2 + (Math.random() - 0.5) * rect.width * 0.6;
          const top = rect.top + rect.height * 0.15 + Math.random() * 20;
          piece.className = 'confetti-piece';
          piece.style.position = 'fixed';
          piece.style.width = `${size}px`;
          piece.style.height = `${size * 1.4}px`;
          piece.style.left = `${left}px`;
          piece.style.top = `${top}px`;
          piece.style.background = colors[i % colors.length];
          piece.style.borderRadius = '2px';
          piece.style.opacity = '0.95';
          const dx = (Math.random() - 0.5) * 160;
          const dy = 160 + Math.random() * 140;
          const rot = 180 + Math.random() * 540;
          const duration = 700 + Math.random() * 500;
          piece.style.transform = 'translate3d(0,0,0)';
          piece.style.transition = `transform ${duration}ms cubic-bezier(0.2, 0.7, 0.2, 1), opacity ${duration}ms linear`;
          requestAnimationFrame(() => {
            piece.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
            piece.style.opacity = '0';
          });
          container.appendChild(piece);
        }
        portalRoot.appendChild(container);
        setTimeout(() => portalRoot.removeChild(container), 1400);
      }
    } else if (completed !== total && celebrated) {
      setCelebrated(false);
    }
  }, [completed, total, celebrated, accent, portalRoot]);

  return (
    <div ref={cardRef} className="kid-card glass-panel" style={{ '--accent-color': accent } as React.CSSProperties}>
      <h2 className="kid-name" style={{ color: accent }}>
        {kidName.toUpperCase()}
      </h2>

      <div className="tasks-container">
        {subjects.length === 0 ? (
          <p className="no-tasks">No homework yet!</p>
        ) : (
          subjects.map(subject => (
            <div key={subject} className="subject-group">
              <h3 className="subject-header">
                <span className="subject-icon">{subjectIcons[subject] || '📝'}</span>
                {subject}
                <div style={{ marginLeft: 'auto', position: 'relative' }}>
                  <button 
                    className="quick-add-btn" 
                    onClick={() => setOpenPopoverFor(openPopoverFor === subject ? null : subject)}
                    style={{ color: accent }}
                    title={`Quick add ${subject} task`}
                  >
                    +
                  </button>
                  {openPopoverFor === subject && portalRoot && createPortal(
                    <div className="glass-panel quick-popover" style={{ position: 'fixed', right: 16, top: (window.scrollY || 0) + 120 }}>
                      {BOOK_CHOICES.map(b => (
                        <button key={b} className="btn-submit" style={{ backgroundColor: accent }} onClick={() => chooseBook(subject, b)}>
                          {b}
                        </button>
                      ))}
                    </div>,
                    portalRoot
                  )}
                </div>
                {onRemoveSubject && (
                  <button
                    className="remove-task-btn"
                    style={{ marginLeft: 8 }}
                    onClick={() => onRemoveSubject(subject)}
                    title={`Remove all ${subject}`}
                  >
                    ×
                  </button>
                )}
              </h3>
              
              <div className="task-list">
                {groupedTasks[subject].map(task => (
                  <div key={task.id} className={clsx('task-item', task.completed && 'completed')}>
                    <input
                      type="checkbox"
                      className="task-checkbox"
                      checked={task.completed}
                      onChange={(e) => onToggleTask(task.id, e.target.checked)}
                      style={{ '--checkbox-accent': accent } as React.CSSProperties}
                    />
                    <span className="task-content">
                      <span className="task-type">{task.book}:</span>
                      <span 
                        className="task-description"
                        onClick={() => onEditTask(task)}
                        style={{ cursor: 'pointer' }}
                      >
                        {task.description || <span style={{ color: '#999', fontStyle: 'italic' }}>Tap to add note</span>}
                      </span>
                    </span>
                    <button className="remove-task-btn" onClick={() => onRemoveTask(task.id)} aria-label="Remove task">×</button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card-footer">
        <div className="kid-completed glass-panel">
          <span className="check-icon">✓</span>
          {completed}/{total} completed
        </div>
        <button
          className="add-task-btn"
          onClick={onAddTask}
          style={{ backgroundColor: accent }}
        >
          + Add Homework
        </button>
      </div>
    </div>
  );
}

