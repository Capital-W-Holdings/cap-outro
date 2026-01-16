'use client';

import { useState } from 'react';
import { Send, CheckCircle, Lightbulb } from 'lucide-react';

export function Footer() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [email, setEmail] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!suggestion.trim()) {
      setError('Please enter a suggestion');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Submit to Formspree - sends results to jesse@uemembers.com
      const response = await fetch('https://formspree.io/f/jesse@uemembers.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim() || 'Not provided',
          suggestion: suggestion.trim(),
          _subject: 'Cap Outro Suggestion',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit suggestion');
      }

      setIsSubmitted(true);
      setEmail('');
      setSuggestion('');

      // Reset after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setIsExpanded(false);
      }, 5000);
    } catch {
      setError('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="px-4 sm:px-6 py-4">
        {!isExpanded && !isSubmitted ? (
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mx-auto"
          >
            <Lightbulb className="w-4 h-4" />
            <span>Have a suggestion?</span>
          </button>
        ) : isSubmitted ? (
          <div className="flex items-center justify-center gap-2 text-green-600 py-2">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">
              Thank you! Your suggestion has been submitted.
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Share Your Suggestion
              </h3>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Close
              </button>
            </div>

            <input
              type="email"
              placeholder="Your email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400"
            />

            <textarea
              placeholder="What would you like to see improved or added?"
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400 resize-none"
            />

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !suggestion.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Suggestion
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </footer>
  );
}
