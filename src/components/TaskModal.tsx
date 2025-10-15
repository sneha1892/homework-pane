import React, { useState, useEffect } from 'react';
import { } from '../types';
import { getAccentForKid } from '../utils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: {
    kidName: string;
    subject: string;
    book: 'Textbook' | 'Notebook' | 'Handwriting Book' | 'Dictation';
    description: string;
    id?: string;
  }) => void;
  availableKids: string[];
  preselectedKid?: string;
  preselectedSubject?: string;
}

const subjects: string[] = ['English', 'Malayalam', 'Maths', 'GK', 'Hindi'];
const bookTypes: Array<'Textbook' | 'Notebook' | 'Handwriting Book' | 'Dictation'> = ['Textbook', 'Notebook', 'Handwriting Book', 'Dictation'];

export default function TaskModal({ isOpen, onClose, onSave, availableKids, preselectedKid, preselectedSubject }: TaskModalProps) {
  const [kidName, setKidName] = useState(preselectedKid || '');
  const [subject, setSubject] = useState<string>('English');
  const [book, setBook] = useState<'Textbook' | 'Notebook' | 'Handwriting Book' | 'Dictation'>('Textbook');
  const [description, setDescription] = useState('');
  const [newKidName, setNewKidName] = useState('');
  const [isAddingNewKid, setIsAddingNewKid] = useState(false);

  useEffect(() => {
    if (preselectedKid) {
      setKidName(preselectedKid);
    }
  }, [preselectedKid]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSubject(preselectedSubject || 'English');
      setBook('Textbook');
      setDescription('');
      setIsAddingNewKid(false);
      setNewKidName('');
      if (preselectedKid) {
        setKidName(preselectedKid);
      } else if (availableKids.length > 0) {
        setKidName(availableKids[0]);
      }
    }
  }, [isOpen, preselectedKid, preselectedSubject, availableKids]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalKidName = isAddingNewKid ? newKidName.trim() : kidName;
    
    if (!finalKidName || !description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const taskData = {
      kidName: finalKidName,
      subject,
      book,
      description: description.trim()
    };

    onSave(taskData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <h2 className="modal-title">Add Homework Task</h2>

        <form onSubmit={handleSubmit} className="task-form">
          {/* Kid Selector */}
          <div className="form-group">
            <label htmlFor="kid-select">Kid:</label>
            {!isAddingNewKid ? (
              <div className="kid-selector-group">
                <select
                  id="kid-select"
                  value={kidName}
                  onChange={(e) => setKidName(e.target.value)}
                  className="form-select"
                  required
                >
                  {availableKids.length === 0 && <option value="">Select a kid</option>}
                  {availableKids.map(kid => (
                    <option key={kid} value={kid}>{kid}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-add-kid"
                  onClick={() => setIsAddingNewKid(true)}
                >
                  + New Kid
                </button>
              </div>
            ) : (
              <div className="kid-selector-group">
                <input
                  type="text"
                  value={newKidName}
                  onChange={(e) => setNewKidName(e.target.value)}
                  placeholder="Enter kid's name"
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  className="btn-cancel-kid"
                  onClick={() => setIsAddingNewKid(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Subject Selector */}
          <div className="form-group">
            <label htmlFor="subject-select">Subject:</label>
            <select
              id="subject-select"
              value={subject}
              onChange={(e) => setSubject(e.target.value as string)}
              className="form-select"
              required
            >
              {subjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Book Type */}
          <div className="form-group">
            <label>Book:</label>
            <div className="radio-group">
              {bookTypes.map(b => (
                <label key={b} className="radio-label">
                  <input
                    type="radio"
                    name="book"
                    value={b}
                    checked={book === b}
                    onChange={(e) => setBook(e.target.value as any)}
                  />
                  <span>{b}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Finish chapter 5 review questions"
              className="form-input"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-submit"
            style={{
              backgroundColor: getAccentForKid(isAddingNewKid ? newKidName : kidName)
            }}
          >
            Save Task
          </button>
        </form>
      </div>
    </div>
  );
}

