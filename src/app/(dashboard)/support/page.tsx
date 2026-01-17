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
  Settings,
  Upload,
  Filter,
  BarChart3,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Database,
  Link,
  MousePointer,
  Eye,
  Reply,
  TrendingUp,
  Building2,
  Linkedin,
  Copy,
  Play,
  Pause,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Header } from '@/components/layout';
import { Card, Input, Button } from '@/components/ui';

type DocSection =
  | 'getting-started'
  | 'investors'
  | 'campaigns'
  | 'templates'
  | 'sequences'
  | 'pipeline'
  | 'outreach'
  | 'analytics'
  | 'settings'
  | 'faq';

interface DocItem {
  id: DocSection;
  title: string;
  icon: typeof BookOpen;
  description: string;
}

const docSections: DocItem[] = [
  { id: 'getting-started', title: 'Getting Started', icon: Zap, description: 'Quick start guide to Cap Outro' },
  { id: 'investors', title: 'Investor Database', icon: Users, description: 'Managing your investor contacts' },
  { id: 'campaigns', title: 'Campaigns', icon: Target, description: 'Creating and managing fundraising campaigns' },
  { id: 'templates', title: 'Email Templates', icon: FileText, description: 'Building personalized email templates' },
  { id: 'sequences', title: 'Sequences', icon: GitBranch, description: 'Automated outreach workflows' },
  { id: 'pipeline', title: 'Pipeline', icon: Kanban, description: 'Tracking investor relationships' },
  { id: 'outreach', title: 'Outreach', icon: Send, description: 'Sending and tracking emails' },
  { id: 'analytics', title: 'Analytics', icon: BarChart3, description: 'Metrics and reporting' },
  { id: 'settings', title: 'Settings', icon: Settings, description: 'Configuration and integrations' },
  { id: 'faq', title: 'FAQ', icon: MessageCircle, description: 'Frequently asked questions' },
];

const shortcuts = [
  { keys: ['⌘', 'K'], description: 'Open quick search' },
  { keys: ['⌘', 'N'], description: 'Create new item' },
  { keys: ['⌘', '/'], description: 'Open support' },
  { keys: ['Esc'], description: 'Close modal / Cancel' },
  { keys: ['⌘', 'Enter'], description: 'Submit form' },
  { keys: ['⌘', 'S'], description: 'Save changes' },
  { keys: ['↑', '↓'], description: 'Navigate lists' },
  { keys: ['Enter'], description: 'Select item' },
];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<DocSection>('getting-started');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredSections = docSections.filter(
    (section) =>
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSectionChange = (sectionId: DocSection) => {
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Support & Documentation"
        subtitle="Everything you need to know about Cap Outro"
      />

      {/* Mobile Navigation Toggle */}
      <div className="md:hidden p-4 border-b border-gray-200 bg-white">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center gap-3">
            {docSections.find(s => s.id === activeSection)?.icon && (
              <span className="text-gray-600">
                {(() => {
                  const Icon = docSections.find(s => s.id === activeSection)?.icon;
                  return Icon ? <Icon className="w-4 h-4" /> : null;
                })()}
              </span>
            )}
            <span className="font-medium text-black">
              {docSections.find(s => s.id === activeSection)?.title}
            </span>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {isMobileMenuOpen && (
          <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search docs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 py-2 text-sm"
                />
              </div>
            </div>
            <nav className="p-2 max-h-80 overflow-y-auto">
              {filteredSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionChange(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <section.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{section.title}</span>
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden md:block w-64 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto flex-shrink-0">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search docs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 py-2 text-sm"
              />
            </div>
          </div>

          <nav className="space-y-1">
            {filteredSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeSection === section.id
                    ? 'bg-black text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <section.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{section.title}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {activeSection === 'getting-started' && <GettingStartedSection />}
            {activeSection === 'investors' && <InvestorsSection />}
            {activeSection === 'campaigns' && <CampaignsSection />}
            {activeSection === 'templates' && <TemplatesSection />}
            {activeSection === 'sequences' && <SequencesSection />}
            {activeSection === 'pipeline' && <PipelineSection />}
            {activeSection === 'outreach' && <OutreachSection />}
            {activeSection === 'analytics' && <AnalyticsSection />}
            {activeSection === 'settings' && <SettingsSection />}
            {activeSection === 'faq' && <FAQSection expandedFaq={expandedFaq} setExpandedFaq={setExpandedFaq} />}

            {/* Keyboard Shortcuts (shown on all sections) */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                <Keyboard className="w-5 h-5" />
                Keyboard Shortcuts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">{shortcut.description}</span>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono text-gray-700"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Support */}
            <div className="mt-8 p-4 md:p-6 bg-gray-50 rounded-xl">
              <h3 className="text-lg font-semibold text-black mb-2">Still need help?</h3>
              <p className="text-gray-600 mb-4">Our support team is here to assist you.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="mailto:support@capoutro.com"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Email Support
                </a>
                <a
                  href="https://docs.capoutro.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Full Documentation
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Section Components
function GettingStartedSection() {
  const steps = [
    {
      step: 1,
      title: 'Create Your First Campaign',
      description: 'Start by creating a fundraising campaign. Define your raise amount, target stage (Seed, Series A, etc.), and focus sectors.',
      icon: Target,
    },
    {
      step: 2,
      title: 'Build Your Investor Database',
      description: 'Import investors via CSV or browse our database of thousands of verified investors with contact information.',
      icon: Users,
    },
    {
      step: 3,
      title: 'Create Email Templates',
      description: 'Build personalized email templates using variables like {{investor_name}}, {{company_name}}, and {{raise_amount}}.',
      icon: FileText,
    },
    {
      step: 4,
      title: 'Set Up Sequences',
      description: 'Create automated outreach sequences with multiple touchpoints and follow-ups.',
      icon: GitBranch,
    },
    {
      step: 5,
      title: 'Track Your Pipeline',
      description: 'Move investors through your pipeline as conversations progress from initial contact to commitment.',
      icon: Kanban,
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-black mb-2">Getting Started with Cap Outro</h1>
      <p className="text-gray-600 mb-8">
        Cap Outro is a fundraising CRM that helps founders manage investor outreach, track relationships, and close rounds faster.
      </p>

      <div className="space-y-6">
        {steps.map((step) => (
          <div key={step.step} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg">
              {step.step}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-black flex items-center gap-2">
                <step.icon className="w-5 h-5 text-gray-600" />
                {step.title}
              </h3>
              <p className="text-gray-600 mt-1">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
        <h3 className="font-semibold text-blue-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Pro Tip
        </h3>
        <p className="text-blue-800 mt-2">
          Start with a small batch of 20-30 investors to test your messaging before scaling up. Track open rates and response rates to optimize your outreach.
        </p>
      </div>
    </div>
  );
}

function InvestorsSection() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-black mb-2">Investor Database</h1>
      <p className="text-gray-600 mb-8">
        Cap Outro includes a database of thousands of investors with verified contact information. Learn how to search, filter, and manage your investor contacts.
      </p>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-black mb-4 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Browsing Investors
          </h2>
          <div className="bg-gray-50 p-4 rounded-xl space-y-3">
            <p className="text-gray-700">
              The Investors page displays all investors with contact information. Each investor card shows:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
              <li><strong>Name and Title</strong> - Investor's name and position</li>
              <li><strong>Firm</strong> - The VC firm or investment company</li>
              <li><strong>Contact Info</strong> - Email and LinkedIn profile</li>
              <li><strong>Investment Stages</strong> - Pre-Seed, Seed, Series A, etc.</li>
              <li><strong>Focus Sectors</strong> - SaaS, Fintech, Healthcare, etc.</li>
              <li><strong>Fit Score</strong> - How well they match your campaign</li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-black mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtering Investors
          </h2>
          <div className="bg-gray-50 p-4 rounded-xl space-y-3">
            <p className="text-gray-700">Use filters to find the right investors:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <h4 className="font-medium text-black">Investment Stage</h4>
                <p className="text-sm text-gray-600">Filter by Pre-Seed, Seed, Series A, B, C, or Growth</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <h4 className="font-medium text-black">Sectors</h4>
                <p className="text-sm text-gray-600">SaaS, Fintech, Healthcare, AI/ML, Consumer, etc.</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <h4 className="font-medium text-black">Check Size</h4>
                <p className="text-sm text-gray-600">Filter by minimum and maximum check size</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <h4 className="font-medium text-black">Fit Score</h4>
                <p className="text-sm text-gray-600">Show only high-fit investors (60+, 80+, etc.)</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-black mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Importing Investors
          </h2>
          <div className="bg-gray-50 p-4 rounded-xl space-y-3">
            <p className="text-gray-700">Import your own investor list via CSV. Required and optional columns:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm mt-4">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-black">Column</th>
                    <th className="text-left py-2 text-black">Required</th>
                    <th className="text-left py-2 text-black">Description</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-mono text-sm">name</td>
                    <td className="py-2"><CheckCircle className="w-4 h-4 text-green-600" /></td>
                    <td className="py-2">Investor's full name</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-mono text-sm">email</td>
                    <td className="py-2"><CheckCircle className="w-4 h-4 text-green-600" /></td>
                    <td className="py-2">Email address</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-mono text-sm">firm</td>
                    <td className="py-2 text-gray-400">Optional</td>
                    <td className="py-2">VC firm or company</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-mono text-sm">title</td>
                    <td className="py-2 text-gray-400">Optional</td>
                    <td className="py-2">Job title (Partner, Principal, etc.)</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-mono text-sm">linkedin_url</td>
                    <td className="py-2 text-gray-400">Optional</td>
                    <td className="py-2">LinkedIn profile URL</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-mono text-sm">stages</td>
                    <td className="py-2 text-gray-400">Optional</td>
                    <td className="py-2">Comma-separated: Seed,Series A</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono text-sm">sectors</td>
                    <td className="py-2 text-gray-400">Optional</td>
                    <td className="py-2">Comma-separated: SaaS,Fintech</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-black mb-4 flex items-center gap-2">
            <MousePointer className="w-5 h-5" />
            Investor Details
          </h2>
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-gray-700">
              Click on any investor card to open a detailed modal showing all their information. From here you can:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 mt-3">
              <li>Copy email or LinkedIn URL with one click</li>
              <li>View investment preferences and check size</li>
              <li>See warm intro paths if available</li>
              <li>Edit investor information</li>
              <li>Add investor to a campaign or sequence</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function CampaignsSection() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-black mb-2">Campaigns</h1>
      <p className="text-gray-600 mb-8">
        Campaigns are the core organizing unit in Cap Outro. Each fundraising round should have its own campaign.
      </p>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-black mb-4">Creating a Campaign</h2>
          <div className="bg-gray-50 p-4 rounded-xl space-y-3">
            <p className="text-gray-700">When creating a campaign, you'll configure:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
              <li><strong>Campaign Name</strong> - e.g., "Series A 2024"</li>
              <li><strong>Raise Type</strong> - Pre-Seed, Seed, Series A, B, C, etc.</li>
              <li><strong>Target Amount</strong> - Your fundraising goal</li>
              <li><strong>Sectors</strong> - Your company's focus areas</li>
              <li><strong>Description</strong> - Brief overview for context</li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-black mb-4">Campaign Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-100 rounded-lg">
              <span className="inline-block px-2 py-1 bg-gray-200 text-gray-600 rounded text-sm font-medium mb-2">Draft</span>
              <p className="text-sm text-gray-600">Campaign is being set up, not active yet</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium mb-2">Active</span>
              <p className="text-sm text-gray-600">Campaign is live and accepting outreach</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm font-medium mb-2">Paused</span>
              <p className="text-sm text-gray-600">Temporarily stopped, can be resumed</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium mb-2">Completed</span>
              <p className="text-sm text-gray-600">Round closed, campaign archived</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-black mb-4">Campaign Overview</h2>
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-gray-700">The campaign detail page shows:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 mt-3">
              <li>Total investors contacted and response rate</li>
              <li>Pipeline breakdown by stage</li>
              <li>Committed vs target amount</li>
              <li>Active sequences and their performance</li>
              <li>Recent activity and upcoming tasks</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplatesSection() {
  const variables = [
    { name: '{{investor_name}}', description: 'Full name of the investor' },
    { name: '{{investor_first_name}}', description: 'First name only' },
    { name: '{{investor_firm}}', description: 'VC firm name' },
    { name: '{{investor_sectors}}', description: 'Their focus sectors' },
    { name: '{{company_name}}', description: 'Your company name' },
    { name: '{{founder_name}}', description: 'Your name' },
    { name: '{{raise_type}}', description: 'Seed, Series A, etc.' },
    { name: '{{raise_amount}}', description: 'Target raise amount' },
    { name: '{{deck_url}}', description: 'Link to your pitch deck' },
    { name: '{{calendar_link}}', description: 'Your scheduling link' },
    { name: '{{key_metric_1}}', description: 'Custom metric placeholder' },
    { name: '{{recent_milestone}}', description: 'Recent achievement' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-black mb-2">Email Templates</h1>
      <p className="text-gray-600 mb-8">
        Create reusable email templates with personalization variables to make your outreach more effective.
      </p>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-black mb-4">Template Types</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-black">Initial Outreach</h4>
              <p className="text-sm text-gray-600">First cold email to an investor</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-black">Follow-up</h4>
              <p className="text-sm text-gray-600">Follow-up after no response</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-black">Intro Request</h4>
              <p className="text-sm text-gray-600">Asking for a warm introduction</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-black">Update</h4>
              <p className="text-sm text-gray-600">Progress updates to interested investors</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-black mb-4">Personalization Variables</h2>
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-gray-700 mb-4">
              Use these variables in your templates. They'll be replaced with actual values when sending.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {variables.map((v) => (
                <div key={v.name} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 bg-white rounded border border-gray-200 gap-1">
                  <code className="text-sm font-mono text-black">{v.name}</code>
                  <span className="text-xs text-gray-500">{v.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-black mb-4">Template Editor</h2>
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-gray-700">The template editor supports:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 mt-3">
              <li>Rich text formatting (bold, italic, links, lists)</li>
              <li>HTML editing for advanced customization</li>
              <li>Live preview with sample data</li>
              <li>Variable insertion with one click</li>
              <li>Subject line personalization</li>
            </ul>
          </div>
        </div>

        <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <h3 className="font-semibold text-blue-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Best Practices
          </h3>
          <ul className="text-blue-800 mt-2 space-y-1">
            <li>• Keep subject lines under 50 characters</li>
            <li>• Personalize the first line with investor or firm name</li>
            <li>• Include 2-3 key metrics or achievements</li>
            <li>• Have a clear call-to-action (meeting request, deck review)</li>
            <li>• Keep emails under 150 words for initial outreach</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function SequencesSection() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-black mb-2">Email Sequences</h1>
      <p className="text-gray-600 mb-8">
        Sequences are automated multi-step outreach workflows that help you follow up consistently.
      </p>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-black mb-4">How Sequences Work</h2>
          <div className="bg-gray-50 p-4 rounded-xl">
            <ol className="list-decimal list-inside text-gray-700 space-y-2">
              <li>Create a sequence with multiple steps (emails, tasks, delays)</li>
              <li>Add investors to the sequence</li>
              <li>The first step executes immediately or at a scheduled time</li>
              <li>Subsequent steps execute after the specified delay</li>
              <li>If an investor replies, they're automatically removed from the sequence</li>
            </ol>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-black mb-4">Sequence Steps</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-black">Email Step</h4>
                <p className="text-sm text-gray-600">Send an automated email using a template</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Linkedin className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-black">LinkedIn Step</h4>
                <p className="text-sm text-gray-600">Reminder to send a LinkedIn message manually</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium text-black">Wait Step</h4>
                <p className="text-sm text-gray-600">Delay before the next step (1-14 days)</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-black">Task Step</h4>
                <p className="text-sm text-gray-600">Create a manual task reminder</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-black mb-4">Sequence Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm font-medium mb-2">Draft</span>
              <p className="text-sm text-gray-600">Being built</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-medium mb-2">Active</span>
              <p className="text-sm text-gray-600">Running</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg text-center">
              <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm font-medium mb-2">Paused</span>
              <p className="text-sm text-gray-600">Temporarily stopped</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
          <h3 className="font-semibold text-yellow-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Important Note
          </h3>
          <p className="text-yellow-800 mt-2">
            When an investor replies to any email in your sequence, they're automatically removed from the sequence. This prevents awkward follow-ups after they've already responded.
          </p>
        </div>
      </div>
    </div>
  );
}

function PipelineSection() {
  const stages = [
    { name: 'Not Contacted', color: 'bg-gray-500', description: 'Haven\'t reached out yet' },
    { name: 'Contacted', color: 'bg-blue-500', description: 'Initial email sent' },
    { name: 'Responded', color: 'bg-cyan-500', description: 'Got a reply' },
    { name: 'Meeting Scheduled', color: 'bg-purple-500', description: 'Call or meeting booked' },
    { name: 'Meeting Held', color: 'bg-indigo-500', description: 'Had the conversation' },
    { name: 'Due Diligence', color: 'bg-yellow-500', description: 'They\'re reviewing materials' },
    { name: 'Term Sheet', color: 'bg-orange-500', description: 'Received a term sheet' },
    { name: 'Committed', color: 'bg-green-500', description: 'Money committed' },
    { name: 'Passed', color: 'bg-red-500', description: 'They declined' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-black mb-2">Pipeline Management</h1>
      <p className="text-gray-600 mb-8">
        Track investor relationships through your fundraising pipeline with a Kanban-style board.
      </p>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-black mb-4">Pipeline Stages</h2>
          <div className="space-y-2">
            {stages.map((stage) => (
              <div key={stage.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                <span className="font-medium text-black w-40">{stage.name}</span>
                <span className="text-gray-600">{stage.description}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-black mb-4">Using the Pipeline</h2>
          <div className="bg-gray-50 p-4 rounded-xl">
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Drag and drop investor cards between columns</li>
              <li>Click on a card to view investor details</li>
              <li>Add notes and log activity on each investor</li>
              <li>Track soft commits and hard commits</li>
              <li>Filter by stage, sector, or fit score</li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-black mb-4">Tracking Commitments</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-black">Soft Commit</h4>
              <p className="text-sm text-gray-600">Verbal interest, non-binding indication</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-black">Hard Commit</h4>
              <p className="text-sm text-gray-600">Signed term sheet or wire sent</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OutreachSection() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-black mb-2">Outreach & Email Tracking</h1>
      <p className="text-gray-600 mb-8">
        Send emails to investors and track opens, clicks, and replies in real-time.
      </p>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-black mb-4">Email Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Send className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <span className="font-medium text-black">Sent</span>
                <p className="text-sm text-gray-600">Email delivered</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Eye className="w-5 h-5 text-cyan-600 flex-shrink-0" />
              <div>
                <span className="font-medium text-black">Opened</span>
                <p className="text-sm text-gray-600">Recipient viewed the email</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <MousePointer className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <div>
                <span className="font-medium text-black">Clicked</span>
                <p className="text-sm text-gray-600">Clicked a link in the email</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Reply className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <span className="font-medium text-black">Replied</span>
                <p className="text-sm text-gray-600">Received a response</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-black mb-4">How Tracking Works</h2>
          <div className="bg-gray-50 p-4 rounded-xl">
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Open Tracking:</strong> A tiny invisible pixel is embedded in each email</li>
              <li><strong>Click Tracking:</strong> Links are wrapped to track when clicked</li>
              <li><strong>Reply Detection:</strong> Connected email accounts detect replies automatically</li>
              <li><strong>Real-time Updates:</strong> Stats update within seconds of an action</li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-black mb-4">Composing Emails</h2>
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-gray-700 mb-3">When composing an email, you can:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
              <li>Select from your saved templates</li>
              <li>Customize the message for each recipient</li>
              <li>Schedule emails for later delivery</li>
              <li>Add attachments (pitch deck, one-pager)</li>
              <li>Preview how the email will look</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsSection() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-black mb-2">Analytics & Reporting</h1>
      <p className="text-gray-600 mb-8">
        Track your fundraising progress with detailed analytics and reporting.
      </p>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-black mb-4">Key Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-black">Open Rate</h4>
              <p className="text-sm text-gray-600">Percentage of emails opened</p>
              <p className="text-xs text-gray-400 mt-1">Industry average: 20-30%</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-black">Response Rate</h4>
              <p className="text-sm text-gray-600">Percentage that replied</p>
              <p className="text-xs text-gray-400 mt-1">Industry average: 5-10%</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-black">Meeting Rate</h4>
              <p className="text-sm text-gray-600">Replies that became meetings</p>
              <p className="text-xs text-gray-400 mt-1">Industry average: 30-50%</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-black">Conversion Rate</h4>
              <p className="text-sm text-gray-600">Meetings that led to commits</p>
              <p className="text-xs text-gray-400 mt-1">Industry average: 5-15%</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-black mb-4">Campaign Analytics</h2>
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-gray-700 mb-3">Each campaign dashboard shows:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
              <li>Total investors contacted</li>
              <li>Email open and response rates</li>
              <li>Pipeline funnel visualization</li>
              <li>Committed amount vs target</li>
              <li>Activity timeline</li>
              <li>Top performing templates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsSection() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-black mb-2">Settings & Configuration</h1>
      <p className="text-gray-600 mb-8">
        Configure your account, connect integrations, and customize your experience.
      </p>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-black mb-4">Profile Settings</h2>
          <div className="bg-gray-50 p-4 rounded-xl">
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Update your name and email</li>
              <li>Set your company name and role</li>
              <li>Upload a profile photo</li>
              <li>Configure notification preferences</li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-black mb-4">Organization Settings</h2>
          <div className="bg-gray-50 p-4 rounded-xl">
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Company branding and logo</li>
              <li>Team member management</li>
              <li>Default campaign settings</li>
              <li>Email sending limits</li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-black mb-4">Integrations</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-black">Resend</h4>
                  <p className="text-sm text-gray-600">Email delivery service</p>
                </div>
              </div>
              <span className="text-sm text-green-600">Required</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Linkedin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-black">LinkedIn</h4>
                  <p className="text-sm text-gray-600">Profile enrichment</p>
                </div>
              </div>
              <span className="text-sm text-gray-400">Optional</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-black">CRM Sync</h4>
                  <p className="text-sm text-gray-600">Salesforce, HubSpot</p>
                </div>
              </div>
              <span className="text-sm text-gray-400">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FAQSection({ expandedFaq, setExpandedFaq }: { expandedFaq: number | null; setExpandedFaq: (i: number | null) => void }) {
  const faqs = [
    {
      question: 'How do I import my investor list?',
      answer: 'Go to the Investors page and click "Import CSV". Your CSV should have columns for name, email, firm, and optionally title, LinkedIn URL, check size, stages, and sectors. Download our template for the correct format.',
    },
    {
      question: 'How do email sequences work?',
      answer: 'Sequences are automated outreach workflows. Create steps (emails, LinkedIn messages, tasks) with delays between them. When you add an investor to a sequence, each step executes automatically based on the timing you set. If they reply, they\'re automatically removed.',
    },
    {
      question: 'What template variables can I use?',
      answer: 'Available variables include: {{investor_name}}, {{investor_first_name}}, {{investor_firm}}, {{company_name}}, {{raise_type}}, {{raise_amount}}, {{deck_url}}, {{calendar_link}}, and more. See the Templates section for the full list.',
    },
    {
      question: 'How is the fit score calculated?',
      answer: 'Fit scores are calculated based on investor preferences (check size, stages, sectors) compared to your campaign details. Higher scores indicate better alignment. Investors with 80+ fit scores are excellent matches.',
    },
    {
      question: 'Can I track email opens and clicks?',
      answer: 'Yes! All emails sent through Cap Outro include invisible tracking pixels for opens and wrapped links for click tracking. View stats in real-time on the Outreach page and campaign dashboard.',
    },
    {
      question: 'How do I connect my email provider?',
      answer: 'Go to Settings > Integrations and click Connect next to Resend. You\'ll need a Resend API key, which you can get from resend.com. Once connected, all emails will be sent through your domain.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes. All data is encrypted in transit and at rest. We use industry-standard security practices and never share your data with third parties. Your investor database is private to your organization.',
    },
    {
      question: 'Can I collaborate with my team?',
      answer: 'Yes! You can invite team members to your organization. Each member can have different permission levels (Admin, Editor, Viewer). Activity is logged so you can see who did what.',
    },
    {
      question: 'What happens when an investor replies?',
      answer: 'When an investor replies to any email, they\'re automatically removed from all active sequences. Their pipeline status is updated to "Responded" and you\'ll see the reply in your inbox.',
    },
    {
      question: 'Can I use my own email domain?',
      answer: 'Yes. With the Resend integration, you can send emails from your own domain (e.g., yourname@yourcompany.com). This improves deliverability and looks more professional.',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-black mb-2">Frequently Asked Questions</h1>
      <p className="text-gray-600 mb-8">
        Find answers to common questions about Cap Outro.
      </p>

      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
              aria-expanded={expandedFaq === index}
            >
              <span className="font-medium text-black">{faq.question}</span>
              {expandedFaq === index ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {expandedFaq === index && (
              <div className="px-4 pb-4 text-gray-600">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
