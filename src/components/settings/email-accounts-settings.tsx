'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, Plus, Check, Trash2, Star, AlertCircle, RefreshCw, Send, ArrowRight } from 'lucide-react';
import { Card, Button, Modal, ModalFooter, Input, Select, type SelectOption } from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import { useEmailAccounts, useCreateEmailAccount, useDeleteEmailAccount, useSetDefaultEmailAccount } from '@/hooks';
import type { EmailAccount, EmailProvider } from '@/types';
import Link from 'next/link';

const providerOptions: SelectOption[] = [
  { value: '', label: 'Select provider...' },
  { value: 'gmail', label: 'Gmail (Google Workspace)' },
  { value: 'outlook', label: 'Outlook (Microsoft 365)' },
  { value: 'resend', label: 'Resend (Recommended)' },
];

const providerConfig: Record<EmailProvider, { icon: string; color: string; darkColor: string; limit: string }> = {
  gmail: { icon: '📧', color: 'bg-red-50 border-red-200', darkColor: 'bg-red-500/10 border-red-500/20', limit: '500/day' },
  outlook: { icon: '📬', color: 'bg-blue-50 border-blue-200', darkColor: 'bg-blue-500/10 border-blue-500/20', limit: '300/day' },
  resend: { icon: '🚀', color: 'bg-purple-50 border-purple-200', darkColor: 'bg-purple-500/10 border-purple-500/20', limit: '1000/day' },
};

// Component to handle OAuth redirect messages
function OAuthMessageHandler({ onSuccess }: { onSuccess: () => void }) {
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success) {
      addToast(success, 'success');
      onSuccess();
      // Clean up URL
      window.history.replaceState({}, '', '/settings');
    }

    if (error) {
      addToast(error, 'error');
      // Clean up URL
      window.history.replaceState({}, '', '/settings');
    }
  }, [searchParams, addToast, onSuccess]);

  return null;
}

export function EmailAccountsSettings() {
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<EmailProvider | ''>('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const { data: accounts, isLoading, refetch } = useEmailAccounts();
  const { mutate: createAccount, isLoading: isCreating } = useCreateEmailAccount();
  const { deleteAccount, isLoading: isDeleting } = useDeleteEmailAccount();
  const { setDefault, isLoading: isSettingDefault } = useSetDefaultEmailAccount();
  const { addToast } = useToast();

  // Redirect to Google OAuth
  const handleGoogleConnect = () => {
    window.location.href = '/api/auth/google?redirect=/settings';
  };

  const handleConnect = async () => {
    if (!selectedProvider || !email) return;

    try {
      // For Gmail/Outlook, we'd normally redirect to OAuth
      // For now, we'll just create the account directly
      if (selectedProvider === 'gmail' || selectedProvider === 'outlook') {
        // In production, this would trigger OAuth flow
        addToast(`${selectedProvider === 'gmail' ? 'Gmail' : 'Outlook'} OAuth integration coming soon. For now, use Resend.`, 'info');
        return;
      }

      await createAccount({
        provider: selectedProvider,
        email,
        name: name || email.split('@')[0],
      });

      addToast(`Email account ${email} connected successfully!`, 'success');
      setIsConnectModalOpen(false);
      setSelectedProvider('');
      setEmail('');
      setName('');
      refetch();
    } catch {
      addToast('Failed to connect email account', 'error');
    }
  };

  const handleDisconnect = async (account: EmailAccount) => {
    if (!confirm(`Disconnect ${account.email}? You won't be able to send emails from this account.`)) return;

    try {
      await deleteAccount(account.id);
      addToast(`Disconnected ${account.email}`, 'success');
      refetch();
    } catch {
      addToast('Failed to disconnect account', 'error');
    }
  };

  const handleSetDefault = async (account: EmailAccount) => {
    try {
      await setDefault(account.id);
      addToast(`${account.email} is now your default sending account`, 'success');
      refetch();
    } catch {
      addToast('Failed to set default account', 'error');
    }
  };

  const handleCloseModal = () => {
    setIsConnectModalOpen(false);
    setSelectedProvider('');
    setEmail('');
    setName('');
  };

  const hasAccounts = accounts && accounts.length > 0;

  return (
    <>
      {/* Handle OAuth redirect messages */}
      <Suspense fallback={null}>
        <OAuthMessageHandler onSuccess={refetch} />
      </Suspense>

      <Card className={!hasAccounts ? 'border-2 border-dashed border-brand-gold/30 bg-brand-gold/5' : ''}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${hasAccounts ? 'bg-green-500/10' : 'bg-brand-gold/10'}`}>
            <Mail className={`w-5 h-5 ${hasAccounts ? 'text-green-500' : 'text-brand-gold'}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Email Accounts</h3>
            <p className="text-sm text-gray-400">
              {hasAccounts
                ? `${accounts.length} account${accounts.length > 1 ? 's' : ''} connected`
                : 'Connect an account to start sending campaigns'
              }
            </p>
          </div>
        </div>
        <Button
          variant={hasAccounts ? 'outline' : 'primary'}
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsConnectModalOpen(true)}
        >
          {hasAccounts ? 'Add Another' : 'Connect Email'}
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      )}

      {/* Empty State - More Actionable */}
      {!isLoading && !hasAccounts && (
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-brand-gold" />
          </div>
          <h4 className="text-white font-medium mb-2">Ready to send your first campaign?</h4>
          <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
            Connect your email account to start sending personalized outreach to investors.
            We recommend using Resend for reliable delivery.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setSelectedProvider('resend');
                setIsConnectModalOpen(true);
              }}
            >
              Connect with Resend
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Free tier: 100 emails/day | Pro: 1000+ emails/day
          </p>
        </div>
      )}

      {/* Accounts List */}
      {!isLoading && hasAccounts && (
        <div className="space-y-3">
          {accounts.map((account) => {
            const config = providerConfig[account.provider];
            const usagePercent = (account.emails_sent_today / account.daily_limit) * 100;
            return (
              <div
                key={account.id}
                className={`flex items-center gap-4 p-4 rounded-lg border ${config.darkColor}`}
              >
                {/* Provider Icon */}
                <div className="text-2xl">{config.icon}</div>

                {/* Account Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white truncate">{account.email}</span>
                    {account.is_default && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">
                        <Star className="w-3 h-3" />
                        Default
                      </span>
                    )}
                    {account.status === 'error' && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400">
                        <AlertCircle className="w-3 h-3" />
                        Error
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-gray-400 capitalize">{account.provider}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {account.emails_sent_today}/{account.daily_limit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!account.is_default && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(account)}
                      disabled={isSettingDefault}
                      title="Set as default"
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDisconnect(account)}
                    disabled={isDeleting}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    title="Disconnect"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}

          {/* Quick Action */}
          <Link href="/campaigns" className="block">
            <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg border border-dark-600 hover:border-brand-gold/30 hover:bg-dark-700 transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <Send className="w-5 h-5 text-brand-gold" />
                <div>
                  <p className="font-medium text-white">Ready to send campaigns</p>
                  <p className="text-sm text-gray-400">Go to Campaigns to start outreach</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-brand-gold transition-colors" />
            </div>
          </Link>
        </div>
      )}

      {/* Connect Account Modal */}
      <Modal
        isOpen={isConnectModalOpen}
        onClose={handleCloseModal}
        title="Connect Email Account"
        size="sm"
      >
        <div className="space-y-4">
          <Select
            label="Email Provider"
            options={providerOptions}
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value as EmailProvider | '')}
          />

          {selectedProvider === 'gmail' && (
            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
              <h4 className="font-medium text-red-400 mb-1">Gmail (Google Workspace)</h4>
              <p className="text-sm text-red-400/80">
                Connect your Gmail account to send emails directly. You'll be redirected to Google to authorize access.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-3 bg-red-600 hover:bg-red-700"
                onClick={handleGoogleConnect}
              >
                Connect with Google
              </Button>
            </div>
          )}

          {selectedProvider === 'outlook' && (
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <h4 className="font-medium text-blue-400 mb-1">Outlook (Microsoft 365)</h4>
              <p className="text-sm text-blue-400/80">
                Connect your Microsoft 365 account for professional email delivery.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-3 bg-blue-600 hover:bg-blue-700"
                onClick={() => addToast('Outlook OAuth coming soon! Use Resend for now.', 'info')}
              >
                Connect with Microsoft
              </Button>
            </div>
          )}

          {selectedProvider === 'resend' && (
            <>
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <h4 className="font-medium text-purple-400 mb-1">Resend - Recommended</h4>
                <p className="text-sm text-purple-400/80">
                  Professional email delivery with high deliverability. Perfect for investor outreach campaigns.
                </p>
              </div>

              <Input
                label="Sending Email"
                type="email"
                placeholder="you@yourdomain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isCreating}
                helperText="Use your verified domain email"
              />

              <Input
                label="Display Name"
                placeholder="Alex Chen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isCreating}
                helperText="How your name appears to investors"
              />
            </>
          )}
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={handleCloseModal} disabled={isCreating}>
            Cancel
          </Button>
          {selectedProvider === 'resend' && (
            <Button
              variant="primary"
              onClick={handleConnect}
              isLoading={isCreating}
              disabled={!email}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Connect Account
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </Card>
    </>
  );
}
