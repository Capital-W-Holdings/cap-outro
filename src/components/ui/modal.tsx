'use client';

import { useEffect, useRef, type ReactNode } from 'react';
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
  const onCloseRef = useRef(onClose);

  // Keep onClose ref updated
  onCloseRef.current = onClose;

  // Mobile-first responsive sizing
  const sizeClasses = {
    sm: 'max-w-[calc(100vw-2rem)] sm:max-w-sm',
    md: 'max-w-[calc(100vw-2rem)] sm:max-w-md',
    lg: 'max-w-[calc(100vw-2rem)] sm:max-w-lg md:max-w-2xl',
    xl: 'max-w-[calc(100vw-2rem)] sm:max-w-lg md:max-w-2xl lg:max-w-4xl',
  };

  useEffect(() => {
    if (!isOpen) return;

    // Save current focus only on open
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus first focusable element only on initial open
    const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    setTimeout(() => firstFocusable?.focus(), 0);

    // Handle escape key - don't close if typing in an input
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const target = e.target as HTMLElement;
        const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';
        if (!isTyping) {
          onCloseRef.current();
        }
      }
    };

    // Focus trap
    const handleTab = (e: KeyboardEvent) => {
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
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTab);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTab);
      document.body.style.overflow = 'unset';

      // Restore focus
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen]); // Only depend on isOpen, not on callbacks

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
          relative w-full ${sizeClasses[size]} mx-2 sm:mx-4 bg-white border border-gray-200
          rounded-xl shadow-2xl animate-in max-h-[90vh] flex flex-col
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? 'modal-description' : undefined}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex-shrink-0">
          <div className="min-w-0 flex-1 mr-2">
            <h2 id="modal-title" className="text-base sm:text-lg font-semibold text-black truncate">
              {title}
            </h2>
            {description && (
              <p id="modal-description" className="text-sm text-gray-500 mt-1 line-clamp-2">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="px-4 sm:px-6 py-4 overflow-y-auto flex-1">{children}</div>
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
