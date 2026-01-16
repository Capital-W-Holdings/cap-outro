import type { EmailTemplate } from '@/types';

// Shared mock templates data
export const mockTemplates: EmailTemplate[] = [
  {
    id: '1',
    org_id: 'org-1',
    name: 'Cold Outreach - Series A',
    subject: 'Quick intro - {{company_name}}',
    body: `<p>Hi {{investor_first_name}},</p>

<p>I'm {{founder_name}}, founder of {{company_name}}. We're raising a {{raise_type}} round and I thought you might be interested given your focus on {{investor_sectors}}.</p>

<p>Quick highlights:</p>
<ul>
  <li>{{key_metric_1}}</li>
  <li>{{key_metric_2}}</li>
  <li>{{key_metric_3}}</li>
</ul>

<p>Would love to share our deck and get 15 minutes on your calendar. Here's my availability: {{calendar_link}}</p>

<p>Best,<br>{{founder_name}}</p>`,
    variables: ['investor_first_name', 'founder_name', 'company_name', 'raise_type', 'investor_sectors', 'key_metric_1', 'key_metric_2', 'key_metric_3', 'calendar_link'],
    type: 'initial',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    org_id: 'org-1',
    name: 'Follow-up #1',
    subject: 'Re: Quick intro - {{company_name}}',
    body: `<p>Hi {{investor_first_name}},</p>

<p>Just following up on my email from last week. I know you're busy, but I'd love to get {{company_name}} on your radar.</p>

<p>We just hit a big milestone - {{recent_milestone}}. Would be great to share more.</p>

<p>Here's the deck if you'd like to take a look: {{deck_url}}</p>

<p>Best,<br>{{founder_name}}</p>`,
    variables: ['investor_first_name', 'company_name', 'recent_milestone', 'deck_url', 'founder_name'],
    type: 'followup',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    org_id: 'org-1',
    name: 'Warm Intro Request',
    subject: 'Intro request: {{company_name}} <> {{investor_name}}',
    body: `<p>Hi {{connection_name}},</p>

<p>Hope you're doing well! I'm reaching out because I noticed you're connected with {{investor_name}} at {{investor_firm}}.</p>

<p>We're currently raising our {{raise_type}} and I think {{company_name}} would be a great fit for their portfolio. Would you be willing to make a warm intro?</p>

<p>Happy to send over a blurb you can forward, or jump on a quick call to give you the full pitch first.</p>

<p>Thanks so much!<br>{{founder_name}}</p>`,
    variables: ['connection_name', 'investor_name', 'investor_firm', 'raise_type', 'company_name', 'founder_name'],
    type: 'intro_request',
    created_at: new Date().toISOString(),
  },
];
