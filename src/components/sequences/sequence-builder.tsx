'use client';

import { useState } from 'react';
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

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStepType, setNewStepType] = useState<StepType>('email');
  const [newStepDelay, setNewStepDelay] = useState('0');
  const [newStepSubject, setNewStepSubject] = useState('');
  const [newStepContent, setNewStepContent] = useState('');

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

  const handleEditStep = (step: SequenceStep) => {
    // TODO: Open edit modal
    console.log('Edit step:', step);
  };

  const handleDeleteStep = (step: SequenceStep) => {
    // TODO: Confirm and delete
    console.log('Delete step:', step);
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
          <h2 className="text-xl font-semibold text-white">{sequence.name}</h2>
          <p className={`text-sm ${statusColor}`}>
            {sequence.status.charAt(0).toUpperCase() + sequence.status.slice(1)}
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
          className="w-full py-4 border-2 border-dashed border-dark-500 rounded-xl text-gray-500 hover:text-white hover:border-dark-400 transition-colors flex items-center justify-center gap-2"
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
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                {newStepType === 'task' ? 'Task Description' : 'Content'}
              </label>
              <textarea
                className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent resize-none"
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
    </div>
  );
}
