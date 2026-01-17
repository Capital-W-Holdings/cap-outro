'use client';

import { useState, useMemo } from 'react';
import { Save, Eye, Code, Variable, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, Button, Input, Select, type SelectOption } from '@/components/ui';
import { useCreateTemplate, useUpdateTemplate } from '@/hooks';
import { extractTemplateVariables, interpolateTemplate, type TemplateVariables } from '@/lib/email';
import type { EmailTemplate, TemplateType } from '@/types';

interface TemplateEditorProps {
  template?: EmailTemplate;
  onSave?: () => void;
  onCancel?: () => void;
}

const typeOptions: SelectOption[] = [
  { value: 'initial', label: 'Initial Outreach' },
  { value: 'followup', label: 'Follow-up' },
  { value: 'intro_request', label: 'Intro Request' },
  { value: 'update', label: 'Update' },
];

// Sample variables for preview
const sampleVariables: TemplateVariables = {
  investor_name: 'Sarah Chen',
  investor_first_name: 'Sarah',
  investor_firm: 'Sequoia Capital',
  founder_name: 'Alex Founder',
  company_name: 'My Startup',
  raise_type: 'Series A',
  raise_amount: '$5M',
  deck_url: 'https://deck.mystartup.com',
  calendar_link: 'https://calendly.com/alex/30min',
  recent_milestone: 'hit 100K users',
  key_metric_1: '100K+ monthly active users',
  key_metric_2: '40% month-over-month growth',
  key_metric_3: '95% customer retention',
};

export function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps) {
  const [name, setName] = useState(template?.name ?? '');
  const [type, setType] = useState<TemplateType>(template?.type ?? 'initial');
  const [subject, setSubject] = useState(template?.subject ?? '');
  const [body, setBody] = useState(template?.body ?? '');
  const [showPreview, setShowPreview] = useState(false);
  const [showVariables, setShowVariables] = useState(false);

  const { mutate: createTemplate, isLoading: isCreating } = useCreateTemplate();
  const { mutate: updateTemplate, isLoading: isUpdating } = useUpdateTemplate(template?.id ?? '');

  const isLoading = isCreating || isUpdating;
  const isEdit = !!template;

  // Extract variables from content
  const variables = useMemo(() => {
    return extractTemplateVariables(subject + ' ' + body);
  }, [subject, body]);

  // Generate preview
  const preview = useMemo(() => {
    return {
      subject: interpolateTemplate(subject, sampleVariables),
      body: interpolateTemplate(body, sampleVariables),
    };
  }, [subject, body]);

  const handleSave = async () => {
    try {
      if (isEdit) {
        await updateTemplate({ name, type, subject, body });
      } else {
        await createTemplate({ name, type, subject, body });
      }
      onSave?.();
    } catch {
      // Error handled by hook
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('template-body') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newBody = body.substring(0, start) + `{{${variable}}}` + body.substring(end);
      setBody(newBody);
      // Focus back and set cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
      }, 0);
    }
  };

  // Variables sidebar content - shared between desktop sidebar and mobile collapsible
  const VariablesContent = () => (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-gray-500 mb-2">Used in template ({variables.length})</p>
        <div className="flex flex-wrap gap-1">
          {variables.length > 0 ? (
            variables.map((v) => (
              <span key={v} className="px-2 py-0.5 bg-gray-100 text-black text-xs rounded">
                {v}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-500">No variables used</span>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-3">
        <p className="text-xs text-gray-500 mb-2">Available variables</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1 max-h-64 overflow-y-auto">
          {Object.keys(sampleVariables).map((v) => (
            <button
              key={v}
              onClick={() => insertVariable(v)}
              className="flex items-center justify-between w-full px-2 py-2 sm:py-1.5 text-left text-sm rounded hover:bg-gray-100 active:bg-gray-200 transition-colors group min-h-[44px] sm:min-h-0"
            >
              <code className="text-gray-700 text-xs sm:text-sm">{`{{${v}}}`}</code>
              <span className="text-xs text-brand-gold sm:text-gray-500 sm:opacity-0 sm:group-hover:opacity-100">
                Insert
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-semibold text-black">
          {isEdit ? 'Edit Template' : 'Create Template'}
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            leftIcon={showPreview ? <Code className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            className="flex-1 sm:flex-none"
          >
            <span className="sm:inline">{showPreview ? 'Edit' : 'Preview'}</span>
          </Button>
          {onCancel && (
            <Button variant="ghost" onClick={onCancel} className="flex-1 sm:flex-none">
              Cancel
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={isLoading}
            disabled={!name || !subject || !body}
            leftIcon={<Save className="w-4 h-4" />}
            className="flex-1 sm:flex-none"
          >
            <span className="hidden sm:inline">{isEdit ? 'Save Changes' : 'Create Template'}</span>
            <span className="sm:hidden">Save</span>
          </Button>
        </div>
      </div>

      {/* Mobile: Collapsible Variables Panel */}
      <div className="lg:hidden">
        <button
          onClick={() => setShowVariables(!showVariables)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Variable className="w-4 h-4 text-black" />
            <span className="font-medium text-black">Variables</span>
            {variables.length > 0 && (
              <span className="px-1.5 py-0.5 bg-brand-gold/10 text-brand-gold text-xs rounded">
                {variables.length} used
              </span>
            )}
          </div>
          {showVariables ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        {showVariables && (
          <div className="mt-2 p-4 bg-white border border-gray-200 rounded-lg">
            <VariablesContent />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Template Name"
              placeholder="e.g., Cold Outreach - Series A"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Select
              label="Type"
              options={typeOptions}
              value={type}
              onChange={(e) => setType(e.target.value as TemplateType)}
            />
          </div>

          <Input
            label="Subject Line"
            placeholder="e.g., Quick intro - {{company_name}}"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          {showPreview ? (
            <Card>
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Subject</p>
                <p className="text-black font-medium break-words">{preview.subject || 'No subject'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Body</p>
                <div
                  className="prose prose-sm max-w-none text-black break-words"
                  dangerouslySetInnerHTML={{ __html: preview.body || '<p class="text-gray-500">No content</p>' }}
                />
              </div>
            </Card>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Body
              </label>
              <textarea
                id="template-body"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none font-mono text-sm"
                rows={10}
                placeholder="<p>Hi {{investor_first_name}},</p>..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Supports HTML. Use {"{{variable}}"} for personalization.
              </p>
            </div>
          )}
        </div>

        {/* Desktop: Variables Sidebar */}
        <div className="hidden lg:block space-y-4">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Variable className="w-4 h-4 text-black" />
              <h3 className="font-medium text-black">Variables</h3>
            </div>
            <VariablesContent />
          </Card>

          <Card>
            <h3 className="font-medium text-black mb-2">Tips</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Keep subject lines under 50 characters</li>
              <li>• Personalize with investor name and firm</li>
              <li>• Include a clear call-to-action</li>
              <li>• Test with the preview before sending</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Mobile: Tips Card */}
      <div className="lg:hidden">
        <Card>
          <h3 className="font-medium text-black mb-2">Tips</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Keep subject lines under 50 characters</li>
            <li>• Personalize with investor name and firm</li>
            <li>• Include a clear call-to-action</li>
            <li>• Test with the preview before sending</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
