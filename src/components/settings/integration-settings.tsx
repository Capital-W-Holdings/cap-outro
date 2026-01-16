'use client';

import { Key, Check, X, ExternalLink } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { useToast } from '@/components/ui/toast';

interface Integration {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  icon: string;
  url?: string;
  comingSoon?: boolean;
}

const integrations: Integration[] = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Connect to send LinkedIn messages and find warm paths',
    connected: false,
    icon: '💼',
    url: 'https://linkedin.com',
    comingSoon: true,
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    description: 'Sync meetings and track investor interactions',
    connected: false,
    icon: '📅',
    comingSoon: true,
  },
  {
    id: 'crm',
    name: 'Salesforce',
    description: 'Sync investor data with your CRM',
    connected: false,
    icon: '☁️',
    comingSoon: true,
  },
];

export function IntegrationSettings() {
  const { addToast } = useToast();

  const handleConnect = (integration: Integration) => {
    if (integration.comingSoon) {
      addToast(`${integration.name} integration coming soon!`, 'info');
      return;
    }
    // TODO: Implement OAuth flow
    addToast(`Connecting to ${integration.name}...`, 'info');
  };

  const handleDisconnect = (integration: Integration) => {
    addToast(`Disconnected from ${integration.name}`, 'success');
  };

  return (
    <Card>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
          <Key className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Integrations</h3>
          <p className="text-sm text-gray-400">Connect external services</p>
        </div>
      </div>

      <div className="space-y-4">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="flex items-center gap-4 p-4 bg-dark-700 rounded-lg border border-dark-600"
          >
            {/* Icon */}
            <div className="text-2xl">{integration.icon}</div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-white">{integration.name}</h4>
                {integration.comingSoon ? (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-400">
                    Coming Soon
                  </span>
                ) : integration.connected ? (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400">
                    <Check className="w-3 h-3" />
                    Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs bg-gray-500/10 text-gray-400">
                    <X className="w-3 h-3" />
                    Not connected
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-0.5">{integration.description}</p>
            </div>

            {/* Action */}
            <div className="flex items-center gap-2">
              {integration.url && (
                <a
                  href={integration.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-500 hover:text-white hover:bg-dark-600 rounded transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              {integration.connected ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDisconnect(integration)}
                >
                  Disconnect
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleConnect(integration)}
                >
                  Connect
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-dark-700/50 rounded-lg border border-dark-600">
        <p className="text-sm text-gray-400">
          <strong className="text-gray-300">Need an API key?</strong>{' '}
          Contact support to enable API access for your organization.
        </p>
      </div>
    </Card>
  );
}
