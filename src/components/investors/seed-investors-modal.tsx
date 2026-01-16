'use client';

import { useState, useEffect } from 'react';
import { Modal, Button } from '@/components/ui';
import { Database, Loader2, Check, ExternalLink } from 'lucide-react';

interface SeedInvestorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Category {
  id: string;
  name: string;
  count: number;
  description: string;
}

interface Source {
  name: string;
  url?: string;
  description: string;
}

export function SeedInvestorsModal({ isOpen, onClose, onSuccess }: SeedInvestorsModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [totalCount, setTotalCount] = useState(0);
  const [result, setResult] = useState<{ success: boolean; count: number; message: string } | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Fetch available categories when modal opens
  useEffect(() => {
    if (isOpen && !hasLoaded) {
      setLoadingCategories(true);
      fetch('/api/seed')
        .then(response => response.json())
        .then(data => {
          setCategories(data.categories || []);
          setSources(data.sources || []);
          setTotalCount(data.total || 0);
          setHasLoaded(true);
        })
        .catch(error => {
          console.error('Failed to load categories:', error);
        })
        .finally(() => {
          setLoadingCategories(false);
        });
    }
  }, [isOpen, hasLoaded]);

  // Seed investors
  const handleSeed = async () => {
    setLoading(true);
    setResult(null);

    try {
      const orgId = document.cookie
        .split('; ')
        .find(row => row.startsWith('cap_outro_org='))
        ?.split('=')[1];

      if (!orgId) {
        setResult({ success: false, count: 0, message: 'Please log in to seed investors' });
        return;
      }

      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: selectedCategory, orgId }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, count: data.count, message: data.message });
        onSuccess();
      } else {
        setResult({ success: false, count: 0, message: data.error || 'Failed to seed investors' });
      }
    } catch (error) {
      setResult({ success: false, count: 0, message: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Seed Public Investor Data"
      size="lg"
    >
      <div className="space-y-6">
        {/* Description */}
        <div className="bg-neutral-50 rounded-lg p-4">
          <p className="text-sm text-neutral-700">
            Import <strong>{totalCount}+ verified investors</strong> from public sources including SEC EDGAR 13F filings,
            OpenVC, Crunchbase, and AngelList. All data is sourced from publicly available information.
          </p>
        </div>

        {/* Category Selection */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-neutral-900">Select Category</h4>

          {loadingCategories ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-left p-3 rounded-lg border transition-colors ${
                    selectedCategory === cat.id
                      ? 'border-neutral-900 bg-neutral-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-neutral-900 text-sm">{cat.name}</span>
                    <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                      {cat.count}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{cat.description}</p>
                  {selectedCategory === cat.id && (
                    <Check className="w-4 h-4 text-neutral-900 absolute top-2 right-2" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Category Info */}
        {selectedCategoryData && (
          <div className="bg-neutral-100 rounded-lg p-3">
            <p className="text-sm text-neutral-700">
              <strong>{selectedCategoryData.count} investors</strong> will be imported from {selectedCategoryData.name}
            </p>
          </div>
        )}

        {/* Data Sources */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-neutral-900">Data Sources</h4>
          <div className="flex flex-wrap gap-2">
            {sources.map((source, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 rounded text-xs text-neutral-600"
              >
                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-neutral-900 flex items-center gap-1"
                  >
                    {source.name}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  source.name
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Result Message */}
        {result && (
          <div className={`p-3 rounded-lg ${
            result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            <p className="text-sm font-medium">
              {result.success ? `✓ ${result.message}` : `✗ ${result.message}`}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-neutral-200">
          <Button variant="outline" onClick={onClose}>
            {result?.success ? 'Done' : 'Cancel'}
          </Button>
          {!result?.success && (
            <Button onClick={handleSeed} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Import {selectedCategoryData?.count || 0} Investors
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
