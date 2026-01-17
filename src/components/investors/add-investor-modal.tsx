'use client';

import { useState } from 'react';
import { Modal, ModalFooter, Button, Input } from '@/components/ui';

interface AddInvestorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddInvestorModal({ isOpen, onClose, onSuccess }: AddInvestorModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [firm, setFirm] = useState('');
  const [title, setTitle] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/investors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || undefined,
          firm: firm.trim() || undefined,
          title: title.trim() || undefined,
          linkedin_url: linkedinUrl.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to add investor');
      }

      // Reset form
      setName('');
      setEmail('');
      setFirm('');
      setTitle('');
      setLinkedinUrl('');

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add investor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setEmail('');
    setFirm('');
    setTitle('');
    setLinkedinUrl('');
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Investor" size="md">
      <div className="space-y-4">
        <Input
          label="Name"
          placeholder="Investor name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Email"
          type="email"
          placeholder="investor@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Firm"
          placeholder="Investment firm or company"
          value={firm}
          onChange={(e) => setFirm(e.target.value)}
        />

        <Input
          label="Title"
          placeholder="Partner, Managing Director, etc."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Input
          label="LinkedIn URL"
          placeholder="https://linkedin.com/in/username"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
        />

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={!name.trim()}
        >
          Add Investor
        </Button>
      </ModalFooter>
    </Modal>
  );
}
