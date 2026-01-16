'use client';

import { useEffect, useCallback, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  description?: string;
}

export function Modal({ isOpen, onClose, title, children, size = 'md', description }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  // Handle escape key
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  // Focus trap
  const handleTab = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement?.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement?.focus();
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Save current focus
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Focus first focusable element
      const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      setTimeout(() => firstFocusable?.focus(), 0);

      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleTab);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTab);
      document.body.style.overflow = 'unset';
      
      // Restore focus
      if (!isOpen && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, handleEscape, handleTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`
          relative w-full ${sizeClasses[size]} mx-4 bg-white border border-gray-200
          rounded-xl shadow-2xl animate-in
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? 'modal-description' : undefined}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-black">
              {title}
            </h2>
            {description && (
              <p id="modal-description" className="text-sm text-gray-500 mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-black hover:bg-gray-100 rounded transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

// Modal footer for action buttons
export function ModalFooter({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-gray-200">
      {children}
    </div>
  );
}
