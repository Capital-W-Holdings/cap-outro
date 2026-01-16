'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface DropdownItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
}

export function Dropdown({ trigger, items, align = 'right' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: align === 'right' ? rect.right : rect.left,
      });
    }
  }, [isOpen, align]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled) {
      item.onClick();
      setIsOpen(false);
    }
  };

  return (
    <>
      <div ref={triggerRef} onClick={handleToggle} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-50 min-w-[180px] bg-white border border-gray-200 rounded-lg shadow-lg py-1 animate-in fade-in slide-in-from-top-2 duration-150"
            style={{
              top: position.top,
              left: align === 'right' ? 'auto' : position.left,
              right: align === 'right' ? window.innerWidth - position.left : 'auto',
            }}
          >
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors
                  ${item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-100'}
                  ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}

interface DropdownDividerProps {}

export function DropdownDivider({}: DropdownDividerProps) {
  return <div className="my-1 border-t border-gray-200" />;
}
