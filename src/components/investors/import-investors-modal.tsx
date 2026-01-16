'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Modal, ModalFooter, Button } from '@/components/ui';
import { useBulkImportInvestors } from '@/hooks';

interface ImportInvestorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ParsedInvestor {
  name: string;
  email?: string;
  firm?: string;
  title?: string;
  linkedin_url?: string;
}

export function ImportInvestorsModal({ isOpen, onClose, onSuccess }: ImportInvestorsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedInvestor[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [result, setResult] = useState<{ imported: number; errors: number } | null>(null);

  const { mutate, isLoading, error } = useBulkImportInvestors();

  const parseCSV = useCallback((text: string): ParsedInvestor[] => {
    const lines = text.split('\n').filter((line) => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV must have a header row and at least one data row');
    }

    const headerLine = lines[0];
    if (!headerLine) {
      throw new Error('CSV must have a header row');
    }
    const headers = headerLine.toLowerCase().split(',').map((h) => h.trim());

    // Find column indices
    const nameIdx = headers.findIndex((h) => h === 'name' || h === 'full name' || h === 'investor');
    const emailIdx = headers.findIndex((h) => h === 'email' || h === 'e-mail');
    const firmIdx = headers.findIndex((h) => h === 'firm' || h === 'company' || h === 'fund');
    const titleIdx = headers.findIndex((h) => h === 'title' || h === 'role' || h === 'position');
    const linkedinIdx = headers.findIndex((h) => h.includes('linkedin'));

    if (nameIdx === -1) {
      throw new Error('CSV must have a "name" column');
    }

    const investors: ParsedInvestor[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      
      const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
      const name = values[nameIdx];

      if (name) {
        investors.push({
          name,
          email: emailIdx >= 0 ? values[emailIdx] : undefined,
          firm: firmIdx >= 0 ? values[firmIdx] : undefined,
          title: titleIdx >= 0 ? values[titleIdx] : undefined,
          linkedin_url: linkedinIdx >= 0 ? values[linkedinIdx] : undefined,
        });
      }
    }

    return investors;
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      setFile(selectedFile);
      setParseError(null);
      setParsed([]);
      setResult(null);

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const investors = parseCSV(text);
          setParsed(investors);
        } catch (err) {
          setParseError(err instanceof Error ? err.message : 'Failed to parse CSV');
        }
      };
      reader.readAsText(selectedFile);
    },
    [parseCSV]
  );

  const handleImport = async () => {
    if (parsed.length === 0) return;

    try {
      const data = await mutate({ investors: parsed });
      setResult(data);
      onSuccess?.();
    } catch {
      // Error handled by hook
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsed([]);
    setParseError(null);
    setResult(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import Investors" size="lg">
      {result ? (
        // Success state
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Import Complete</h3>
          <p className="text-gray-400">
            Successfully imported {result.imported} investor{result.imported !== 1 ? 's' : ''}.
            {result.errors > 0 && (
              <span className="text-yellow-400"> ({result.errors} failed)</span>
            )}
          </p>
          <Button variant="primary" onClick={handleClose} className="mt-6">
            Done
          </Button>
        </div>
      ) : (
        <>
          {/* Upload Area */}
          <div
            className={`
              border-2 border-dashed rounded-xl p-8 text-center transition-colors
              ${file ? 'border-brand-gold bg-brand-gold/5' : 'border-dark-500 hover:border-dark-400'}
            `}
          >
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-brand-gold" />
                <div className="text-left">
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-sm text-gray-400">
                    {parsed.length} investor{parsed.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setParsed([]);
                    setParseError(null);
                  }}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                <label className="cursor-pointer">
                  <span className="text-brand-gold hover:underline">Choose a CSV file</span>
                  <span className="text-gray-400"> or drag and drop</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Columns: name (required), email, firm, title, linkedin_url
                </p>
              </>
            )}
          </div>

          {/* Parse Error */}
          {parseError && (
            <div className="flex items-center gap-2 mt-4 text-red-500">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{parseError}</p>
            </div>
          )}

          {/* Preview */}
          {parsed.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">Preview (first 5):</p>
              <div className="bg-dark-700 rounded-lg p-3 max-h-40 overflow-auto">
                {parsed.slice(0, 5).map((inv, idx) => (
                  <div key={idx} className="flex items-center gap-4 py-1.5 border-b border-dark-600 last:border-0">
                    <span className="text-white font-medium">{inv.name}</span>
                    {inv.firm && <span className="text-gray-400 text-sm">{inv.firm}</span>}
                    {inv.email && <span className="text-gray-500 text-sm">{inv.email}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* API Error */}
          {error && (
            <p className="text-sm text-red-500 mt-4">{error.message}</p>
          )}

          <ModalFooter>
            <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleImport}
              disabled={parsed.length === 0}
              isLoading={isLoading}
            >
              Import {parsed.length} Investor{parsed.length !== 1 ? 's' : ''}
            </Button>
          </ModalFooter>
        </>
      )}
    </Modal>
  );
}
