'use client';

import { useState, useCallback } from 'react';
import { Plus, Play, Pause, Settings } from 'lucide-react';
import { useSequence, useUpdateSequence, useAddSequenceStep } from '@/hooks';
import { SequenceStepCard } from './sequence-step-card';
import { Button, LoadingPage, ErrorState, EmptyState, Modal, ModalFooter, Input, Select } from '@/components/ui';
import type { SequenceStep, StepType, SequenceStatus } from '@/types';

interface SequenceBuilderProps {
  sequenceId: string;
}

const stepTypeOptions = [
  { value: 'email', label: 'Email' },
  { value: 'linkedin', label: 'LinkedIn Message' },
  { value: 'task', label: 'Manual Task' },
  { value: 'wait', label: 'Wait / Delay' },
];

export function SequenceBuilder({ sequenceId }: SequenceBuilderProps) {
  const { data: sequence, isLoading, error, refetch } = useSequence(sequenceId);
  const { mutate: updateSequence, isLoading: isUpdating } = useUpdateSequence(sequenceId);
  const { mutate: addStep, isLoading: isAddingStep } = useAddSequenceStep(sequenceId);

  // Add step modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStepType, setNewStepType] = useState<StepType>('email');
  const [newStepDelay, setNewStepDelay] = useState('0');
  const [newStepSubject, setNewStepSubject] = useState('');
  const [newStepContent, setNewStepContent] = useState('');

  // Edit step modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<SequenceStep | null>(null);
  const [editStepType, setEditStepType] = useState<StepType>('email');
  const [editStepDelay, setEditStepDelay] = useState('0');
  const [editStepSubject, setEditStepSubject] = useState('');
  const [editStepContent, setEditStepContent] = useState('');
  const [isEditingSaving, setIsEditingSaving] = useState(false);

  // Delete confirmation state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingStep, setDeletingStep] = useState<SequenceStep | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (isLoading) return <LoadingPage />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!sequence) return <ErrorState error="Sequence not found" />;

  const handleToggleStatus = async () => {
    const newStatus: SequenceStatus = sequence.status === 'active' ? 'paused' : 'active';
    try {
      await updateSequence({ status: newStatus });
      refetch();
    } catch {
      // Error handled by hook
    }
  };

  const handleAddStep = async () => {
    const order = (sequence.steps?.length ?? 0) + 1;

    try {
      await addStep({
        order,
        type: newStepType,
        delay_days: parseInt(newStepDelay, 10) || 0,
        subject: newStepSubject || undefined,
        content: newStepContent || undefined,
      });

      // Reset form
      setNewStepType('email');
      setNewStepDelay('0');
      setNewStepSubject('');
      setNewStepContent('');
      setIsAddModalOpen(false);
      refetch();
    } catch {
      // Error handled by hook
    }
  };

  const handleEditStep = useCallback((step: SequenceStep) => {
    setEditingStep(step);
    setEditStepType(step.type);
    setEditStepDelay(String(step.delay_days || 0));
    setEditStepSubject(step.subject || '');
    setEditStepContent(step.content || '');
    setIsEditModalOpen(true);
  }, []);

  const handleSaveEdit = async () => {
    if (!editingStep) return;

    setIsEditingSaving(true);
    try {
      const response = await fetch(`/api/sequences/${sequenceId}/steps/${editingStep.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: editStepType,
          delay_days: parseInt(editStepDelay, 10) || 0,
          subject: editStepSubject || null,
          content: editStepContent || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update step');
      }

      setIsEditModalOpen(false);
      setEditingStep(null);
      refetch();
    } catch (err) {
      console.error('Error updating step:', err);
    } finally {
      setIsEditingSaving(false);
    }
  };

  const handleDeleteStep = useCallback((step: SequenceStep) => {
    setDeletingStep(step);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (!deletingStep) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/sequences/${sequenceId}/steps/${deletingStep.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete step');
      }

      setIsDeleteModalOpen(false);
      setDeletingStep(null);
      refetch();
    } catch (err) {
      console.error('Error deleting step:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const statusColor =
    sequence.status === 'active' ? 'text-green-400' :
    sequence.status === 'paused' ? 'text-yellow-400' :
    'text-gray-400';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{sequence.name}</h2>
          <p className={`text-sm capitalize ${statusColor}`}>
            {sequence.status}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={sequence.status === 'active' ? 'secondary' : 'primary'}
            onClick={handleToggleStatus}
            isLoading={isUpdating}
            leftIcon={sequence.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          >
            {sequence.status === 'active' ? 'Pause' : 'Activate'}
          </Button>
          <Button variant="outline" leftIcon={<Settings className="w-4 h-4" />}>
            Settings
          </Button>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {sequence.steps && sequence.steps.length > 0 ? (
          sequence.steps.map((step, index) => (
            <SequenceStepCard
              key={step.id}
              step={step}
              index={index}
              onEdit={handleEditStep}
              onDelete={handleDeleteStep}
            />
          ))
        ) : (
          <EmptyState
            title="No steps yet"
            description="Add your first step to build the sequence."
          />
        )}

        {/* Add Step Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Step</span>
        </button>
      </div>

      {/* Add Step Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Step"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Step Type"
            options={stepTypeOptions}
            value={newStepType}
            onChange={(e) => setNewStepType(e.target.value as StepType)}
          />

          <Input
            label="Delay (days)"
            type="number"
            min="0"
            value={newStepDelay}
            onChange={(e) => setNewStepDelay(e.target.value)}
            helperText="Days to wait before this step"
          />

          {(newStepType === 'email') && (
            <Input
              label="Subject"
              placeholder="Email subject line"
              value={newStepSubject}
              onChange={(e) => setNewStepSubject(e.target.value)}
            />
          )}

          {(newStepType === 'email' || newStepType === 'linkedin' || newStepType === 'task') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {newStepType === 'task' ? 'Task Description' : 'Content'}
              </label>
              <textarea
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                rows={4}
                placeholder={
                  newStepType === 'email' ? 'Email body (use {{variables}} for personalization)' :
                  newStepType === 'linkedin' ? 'LinkedIn message' :
                  'Describe the task'
                }
                value={newStepContent}
                onChange={(e) => setNewStepContent(e.target.value)}
              />
            </div>
          )}
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddStep} isLoading={isAddingStep}>
            Add Step
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Step Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Step"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Step Type"
            options={stepTypeOptions}
            value={editStepType}
            onChange={(e) => setEditStepType(e.target.value as StepType)}
          />

          <Input
            label="Delay (days)"
            type="number"
            min="0"
            value={editStepDelay}
            onChange={(e) => setEditStepDelay(e.target.value)}
            helperText="Days to wait before this step"
          />

          {(editStepType === 'email') && (
            <Input
              label="Subject"
              placeholder="Email subject line"
              value={editStepSubject}
              onChange={(e) => setEditStepSubject(e.target.value)}
            />
          )}

          {(editStepType === 'email' || editStepType === 'linkedin' || editStepType === 'task') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {editStepType === 'task' ? 'Task Description' : 'Content'}
              </label>
              <textarea
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                rows={4}
                placeholder={
                  editStepType === 'email' ? 'Email body (use {{variables}} for personalization)' :
                  editStepType === 'linkedin' ? 'LinkedIn message' :
                  'Describe the task'
                }
                value={editStepContent}
                onChange={(e) => setEditStepContent(e.target.value)}
              />
            </div>
          )}
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveEdit} isLoading={isEditingSaving}>
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Step"
        size="sm"
      >
        <p className="text-gray-600">
          Are you sure you want to delete this step? This action cannot be undone.
        </p>

        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete} isLoading={isDeleting}>
            Delete Step
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
