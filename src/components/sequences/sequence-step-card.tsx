'use client';

import { Mail, Linkedin, ClipboardList, Clock, GripVertical, Trash2, Edit } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { SequenceStep, StepType } from '@/types';

interface SequenceStepCardProps {
  step: SequenceStep;
  index: number;
  onEdit?: (step: SequenceStep) => void;
  onDelete?: (step: SequenceStep) => void;
}

const stepIcons: Record<StepType, typeof Mail> = {
  email: Mail,
  linkedin: Linkedin,
  task: ClipboardList,
  wait: Clock,
};

const stepColors: Record<StepType, string> = {
  email: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  linkedin: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  task: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  wait: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const stepLabels: Record<StepType, string> = {
  email: 'Email',
  linkedin: 'LinkedIn',
  task: 'Task',
  wait: 'Wait',
};

export function SequenceStepCard({ step, index, onEdit, onDelete }: SequenceStepCardProps) {
  const Icon = stepIcons[step.type];
  const colorClass = stepColors[step.type];

  return (
    <Card className="group relative">
      <div className="flex items-start gap-4">
        {/* Drag Handle */}
        <div className="flex-shrink-0 cursor-grab text-gray-600 hover:text-gray-400">
          <GripVertical className="w-5 h-5" />
        </div>

        {/* Step Number + Icon */}
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-400">Step {index + 1}</span>
            <span className="text-xs text-gray-600">•</span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
              {stepLabels[step.type]}
            </span>
            {step.delay_days > 0 && (
              <>
                <span className="text-xs text-gray-600">•</span>
                <span className="text-xs text-gray-500">
                  {step.delay_days} day{step.delay_days !== 1 ? 's' : ''} delay
                </span>
              </>
            )}
          </div>

          {step.type === 'email' && (
            <>
              {step.subject && (
                <p className="text-sm font-medium text-white truncate">{step.subject}</p>
              )}
              {step.content && (
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">{step.content}</p>
              )}
            </>
          )}

          {step.type === 'linkedin' && step.content && (
            <p className="text-sm text-gray-400 line-clamp-2">{step.content}</p>
          )}

          {step.type === 'task' && step.content && (
            <p className="text-sm text-gray-400">{step.content}</p>
          )}

          {step.type === 'wait' && (
            <p className="text-sm text-gray-500">
              Wait {step.delay_days} day{step.delay_days !== 1 ? 's' : ''} before next step
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={() => onEdit(step)}
              className="p-2 text-gray-500 hover:text-white hover:bg-dark-600 rounded transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(step)}
              className="p-2 text-gray-500 hover:text-red-400 hover:bg-dark-600 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
