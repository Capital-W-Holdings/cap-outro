'use client';

import { useState, useMemo } from 'react';
import { Save, Eye, Code, Variable } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          {isEdit ? 'Edit Template' : 'Create Template'}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            leftIcon={showPreview ? <Code className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          >
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={isLoading}
            disabled={!name || !subject || !body}
            leftIcon={<Save className="w-4 h-4" />}
          >
            {isEdit ? 'Save Changes' : 'Create Template'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Editor */}
        <div className="col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
                <p className="text-white font-medium">{preview.subject || 'No subject'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Body</p>
                <div
                  className="prose prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: preview.body || '<p class="text-gray-500">No content</p>' }}
                />
              </div>
            </Card>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Email Body
              </label>
              <textarea
                id="template-body"
                className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent resize-none font-mono text-sm"
                rows={15}
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

        {/* Variables Sidebar */}
        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Variable className="w-4 h-4 text-brand-gold" />
              <h3 className="font-medium text-white">Variables</h3>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-2">Used in template ({variables.length})</p>
                <div className="flex flex-wrap gap-1">
                  {variables.length > 0 ? (
                    variables.map((v) => (
                      <span key={v} className="px-2 py-0.5 bg-brand-gold/10 text-brand-gold text-xs rounded">
                        {v}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">No variables used</span>
                  )}
                </div>
              </div>

              <div className="border-t border-dark-600 pt-3">
                <p className="text-xs text-gray-500 mb-2">Available variables</p>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {Object.keys(sampleVariables).map((v) => (
                    <button
                      key={v}
                      onClick={() => insertVariable(v)}
                      className="flex items-center justify-between w-full px-2 py-1.5 text-left text-sm rounded hover:bg-dark-600 transition-colors group"
                    >
                      <code className="text-gray-300">{`{{${v}}}`}</code>
                      <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100">
                        Insert
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-medium text-white mb-2">Tips</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Keep subject lines under 50 characters</li>
              <li>• Personalize with investor name and firm</li>
              <li>• Include a clear call-to-action</li>
              <li>• Test with the preview before sending</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
