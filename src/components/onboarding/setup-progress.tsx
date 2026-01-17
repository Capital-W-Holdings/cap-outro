'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, Mail, Users, FileText, GitBranch, Rocket, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useEmailAccounts, useCampaigns, useInvestors, useTemplates, useSequences } from '@/hooks';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: typeof Mail;
  href: string;
  actionLabel: string;
  isComplete: boolean;
}

interface SetupProgressProps {
  variant?: 'full' | 'compact';
  showWhenComplete?: boolean;
}

export function SetupProgress({ variant = 'full', showWhenComplete = false }: SetupProgressProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Fetch data to determine completion status
  const { data: emailAccounts } = useEmailAccounts();
  const { data: campaigns } = useCampaigns();
  const { data: investors } = useInvestors();
  const { data: templates } = useTemplates();
  const { data: sequences } = useSequences();

  const steps: SetupStep[] = [
    {
      id: 'email',
      title: 'Connect your email',
      description: 'Required to send campaigns',
      icon: Mail,
      href: '/settings',
      actionLabel: 'Connect',
      isComplete: (emailAccounts?.length ?? 0) > 0,
    },
    {
      id: 'campaign',
      title: 'Create a campaign',
      description: 'Organize your fundraise',
      icon: Rocket,
      href: '/campaigns',
      actionLabel: 'Create',
      isComplete: (campaigns?.length ?? 0) > 0,
    },
    {
      id: 'investors',
      title: 'Add investors',
      description: 'Import or add manually',
      icon: Users,
      href: '/investors',
      actionLabel: 'Add',
      isComplete: (investors?.length ?? 0) > 0,
    },
    {
      id: 'template',
      title: 'Create an email template',
      description: 'Write your outreach message',
      icon: FileText,
      href: '/templates',
      actionLabel: 'Create',
      isComplete: (templates?.length ?? 0) > 0,
    },
    {
      id: 'sequence',
      title: 'Build a sequence',
      description: 'Automate follow-ups',
      icon: GitBranch,
      href: '/sequences',
      actionLabel: 'Build',
      isComplete: (sequences?.length ?? 0) > 0,
    },
  ];

  const completedCount = steps.filter(s => s.isComplete).length;
  const totalSteps = steps.length;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);
  const isAllComplete = completedCount === totalSteps;

  // Hide if all complete and showWhenComplete is false
  if (isAllComplete && !showWhenComplete) {
    return null;
  }

  // Compact variant for sidebar
  if (variant === 'compact') {
    return (
      <Link href="/campaigns" className="block">
        <div className="mx-3 mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-emerald-800">Setup Progress</span>
            <span className="text-sm font-bold text-emerald-700">{completedCount}/{totalSteps}</span>
          </div>
          <div className="h-1.5 bg-emerald-200 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-700">Continue setup</span>
            <ChevronRight className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
      </Link>
    );
  }

  // Full variant for main content
  return (
    <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 sm:p-5"
      >
        <div className="flex items-center gap-3">
          <div className="text-left">
            <p className="text-sm text-gray-600 font-medium">
              {completedCount} of {totalSteps} steps complete
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-gray-200 rounded-full">
            <span className="text-sm font-bold text-gray-700">{progressPercent}%</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </button>

      {/* Progress Bar */}
      <div className="px-4 sm:px-5 pb-4">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      {isExpanded && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-1">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  step.isComplete
                    ? 'bg-white'
                    : 'bg-white hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Checkbox/Icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    step.isComplete
                      ? 'bg-emerald-100'
                      : 'bg-gray-100'
                  }`}>
                    {step.isComplete ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Icon className="w-4 h-4 text-gray-400" />
                    )}
                  </div>

                  {/* Text */}
                  <div>
                    <p className={`text-sm font-medium ${
                      step.isComplete ? 'text-emerald-700' : 'text-gray-900'
                    }`}>
                      {step.title}
                    </p>
                    <p className={`text-xs ${
                      step.isComplete ? 'text-emerald-600' : 'text-gray-500'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Action */}
                {!step.isComplete && (
                  <Link
                    href={step.href}
                    className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-black transition-colors"
                  >
                    {step.actionLabel}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// Sidebar version component
export function SetupProgressSidebar() {
  return <SetupProgress variant="compact" />;
}
