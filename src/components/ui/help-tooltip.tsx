'use client';

import { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface HelpTooltipProps {
  content: string;
  title?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function HelpTooltip({ content, title, size = 'sm', className = '' }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
        aria-label="Help"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <HelpCircle className={iconSize} />
      </button>

      {isOpen && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 w-64 sm:w-72 bg-gray-900 text-white rounded-lg shadow-lg p-3 text-sm"
        >
          {/* Arrow */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45" />

          {/* Close button for mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white rounded transition-colors sm:hidden"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {title && (
            <p className="font-medium text-white mb-1 pr-6 sm:pr-0">{title}</p>
          )}
          <p className="text-gray-300 leading-relaxed">{content}</p>
        </div>
      )}
    </div>
  );
}

// Inline help for section headers
interface SectionHelpProps {
  title: string;
  help: string;
  className?: string;
  children?: React.ReactNode;
}

export function SectionWithHelp({ title, help, className = '', children }: SectionHelpProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <HelpTooltip content={help} />
      {children}
    </div>
  );
}
