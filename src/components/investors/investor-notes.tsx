'use client';

import { useState, useCallback } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Note {
  id: string;
  content: string;
  author: string;
  created_at: string;
  updated_at: string;
}

interface InvestorNotesProps {
  investorId: string;
}

// Mock notes - in production, this would come from API
function useMockNotesData(): [Note[], (notes: Note[]) => void] {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      content:
        'Initial call went well. They are particularly interested in our AI capabilities and the recent traction we\'ve shown in the enterprise segment.',
      author: 'John Doe',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      content:
        'Follow-up: They mentioned they typically invest $1-3M in Series A rounds. Their sweet spot is B2B SaaS with clear path to profitability.',
      author: 'John Doe',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  return [notes, setNotes];
}

export function InvestorNotes({ investorId }: InvestorNotesProps) {
  const [notes, setNotes] = useMockNotesData();
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleAddNote = useCallback(() => {
    if (!newNoteContent.trim()) return;

    const newNote: Note = {
      id: `note-${Date.now()}`,
      content: newNoteContent.trim(),
      author: 'You', // In production, get from auth
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setNotes([newNote, ...notes]);
    setNewNoteContent('');
    setIsAddingNote(false);
  }, [newNoteContent, notes, setNotes]);

  const handleEditNote = useCallback(
    (noteId: string) => {
      const note = notes.find((n) => n.id === noteId);
      if (note) {
        setEditingNoteId(noteId);
        setEditContent(note.content);
      }
    },
    [notes]
  );

  const handleSaveEdit = useCallback(() => {
    if (!editContent.trim() || !editingNoteId) return;

    setNotes(
      notes.map((note) =>
        note.id === editingNoteId
          ? { ...note, content: editContent.trim(), updated_at: new Date().toISOString() }
          : note
      )
    );
    setEditingNoteId(null);
    setEditContent('');
  }, [editContent, editingNoteId, notes, setNotes]);

  const handleDeleteNote = useCallback(
    (noteId: string) => {
      if (!confirm('Are you sure you want to delete this note?')) return;
      setNotes(notes.filter((n) => n.id !== noteId));
    },
    [notes, setNotes]
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Notes</h3>
        {!isAddingNote && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddingNote(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Note
          </Button>
        )}
      </div>

      {/* Add Note Form */}
      {isAddingNote && (
        <div className="mb-6 p-4 bg-dark-600 rounded-lg">
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Write your note here..."
            className="w-full h-24 bg-dark-700 border border-dark-500 rounded-lg p-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent resize-none"
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAddingNote(false);
                setNewNoteContent('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddNote}
              disabled={!newNoteContent.trim()}
            >
              Save Note
            </Button>
          </div>
        </div>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No notes yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Add notes to keep track of important details about this investor
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-4 bg-dark-600 rounded-lg group"
            >
              {editingNoteId === note.id ? (
                // Edit mode
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-24 bg-dark-700 border border-dark-500 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent resize-none"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingNoteId(null);
                        setEditContent('');
                      }}
                      leftIcon={<X className="w-3 h-3" />}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={!editContent.trim()}
                      leftIcon={<Check className="w-3 h-3" />}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                // View mode
                <>
                  <p className="text-white whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-xs text-gray-500">
                      <span>{note.author}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(note.created_at)}</span>
                      {note.updated_at !== note.created_at && (
                        <span className="ml-1">(edited)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditNote(note.id)}
                        className="p-1.5 text-gray-500 hover:text-white hover:bg-dark-500 rounded transition-colors"
                        title="Edit note"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-dark-500 rounded transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
