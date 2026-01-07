'use client';

import { useState } from 'react';
import { 
  BookOpen, 
  Keyboard, 
  Zap, 
  MessageCircle, 
  Mail, 
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Search,
  Target,
  Users,
  GitBranch,
  FileText,
  Kanban,
} from 'lucide-react';
import { Header } from '@/components/layout';
import { Card, Input } from '@/components/ui';

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: 'How do I import my investor list?',
    answer: 'Go to the Investors page and click "Import CSV". Your CSV should have columns for name, email, firm, and optionally title, LinkedIn URL, check size, stages, and sectors.',
  },
  {
    question: 'How do email sequences work?',
    answer: 'Sequences are automated outreach workflows. Create steps (emails, LinkedIn messages, tasks) with delays between them. When you add an investor to a sequence, each step executes automatically based on the timing you set.',
  },
  {
    question: 'What template variables can I use?',
    answer: 'Available variables include: {{investor_name}}, {{investor_first_name}}, {{investor_firm}}, {{company_name}}, {{raise_type}}, {{raise_amount}}, {{deck_url}}, {{calendar_link}}, and more.',
  },
  {
    question: 'How is the fit score calculated?',
    answer: 'Fit scores are calculated based on investor preferences (check size, stages, sectors) compared to your campaign details. Higher scores indicate better alignment.',
  },
  {
    question: 'Can I track email opens and clicks?',
    answer: 'Yes! All emails sent through Cap Outro include invisible tracking pixels for opens and wrapped links for click tracking. View stats in the campaign overview.',
  },
  {
    question: 'How do I connect my email provider?',
    answer: 'Go to Settings > Integrations and click Connect next to Resend. You\'ll need a Resend API key, which you can get from resend.com.',
  },
];

const shortcuts = [
  { keys: ['⌘', 'K'], description: 'Open quick search' },
  { keys: ['⌘', 'N'], description: 'Create new item' },
  { keys: ['⌘', '/'], description: 'Open help' },
  { keys: ['Esc'], description: 'Close modal / Cancel' },
  { keys: ['⌘', 'Enter'], description: 'Submit form' },
  { keys: ['⌘', 'S'], description: 'Save changes' },
];

const gettingStartedSteps = [
  {
    icon: Target,
    title: 'Create a Campaign',
    description: 'Start by creating a fundraising campaign with your target raise amount and sectors.',
  },
  {
    icon: Users,
    title: 'Import Investors',
    description: 'Upload your investor list via CSV or add investors manually.',
  },
  {
    icon: FileText,
    title: 'Create Templates',
    description: 'Build email templates with personalization variables.',
  },
  {
    icon: GitBranch,
    title: 'Build Sequences',
    description: 'Create multi-step outreach sequences with emails and follow-ups.',
  },
  {
    icon: Kanban,
    title: 'Track Pipeline',
    description: 'Move investors through your pipeline as conversations progress.',
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Help Center"
        subtitle="Learn how to use Cap Outro effectively"
      />

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <Input
              type="text"
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-3 text-lg"
            />
          </div>

          {/* Getting Started */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-brand-gold" />
              Getting Started
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gettingStartedSteps.map((step, index) => (
                <Card key={index} hover>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-gold/10 flex items-center justify-center flex-shrink-0">
                      <step.icon className="w-5 h-5 text-brand-gold" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white mb-1">{step.title}</h3>
                      <p className="text-sm text-gray-400">{step.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* FAQs */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-gold" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-2">
              {filteredFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-dark-800 border border-dark-600 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-dark-700 transition-colors"
                    aria-expanded={expandedFaq === index}
                  >
                    <span className="font-medium text-white">{faq.question}</span>
                    {expandedFaq === index ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="px-4 pb-4 text-gray-400">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
              {filteredFaqs.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No results found for &quot;{searchQuery}&quot;
                </p>
              )}
            </div>
          </section>

          {/* Keyboard Shortcuts */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-brand-gold" />
              Keyboard Shortcuts
            </h2>
            <Card>
              <div className="grid grid-cols-2 gap-4">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-400">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="px-2 py-1 bg-dark-600 border border-dark-500 rounded text-xs font-mono text-gray-300"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-brand-gold" />
              Need More Help?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card hover>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Email Support</h3>
                    <a
                      href="mailto:support@capoutro.com"
                      className="text-sm text-brand-gold hover:underline"
                    >
                      support@capoutro.com
                    </a>
                  </div>
                </div>
              </Card>
              <Card hover>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Documentation</h3>
                    <a
                      href="https://docs.capoutro.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-brand-gold hover:underline"
                    >
                      docs.capoutro.com
                    </a>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
