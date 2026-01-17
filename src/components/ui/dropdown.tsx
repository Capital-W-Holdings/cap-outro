'use client';

import { useState, useRef, useEffect, ReactNode, useCallback } from 'react';
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

interface Position {
  top: number;
  left: number;
  right: number;
  transformOrigin: string;
  flipVertical: boolean;
}

const MENU_WIDTH = 180;
const VIEWPORT_PADDING = 8;

export function Dropdown({ trigger, items, align = 'right' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<Position>({
    top: 0,
    left: 0,
    right: 0,
    transformOrigin: 'top right',
    flipVertical: false,
  });
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !menuRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate available space
    const spaceBelow = viewportHeight - triggerRect.bottom - VIEWPORT_PADDING;
    const spaceAbove = triggerRect.top - VIEWPORT_PADDING;
    const spaceRight = viewportWidth - triggerRect.left - VIEWPORT_PADDING;
    const spaceLeft = triggerRect.right - VIEWPORT_PADDING;

    // Determine vertical position
    const flipVertical = spaceBelow < menuRect.height && spaceAbove > spaceBelow;
    const top = flipVertical
      ? triggerRect.top - menuRect.height - 4
      : triggerRect.bottom + 4;

    // Determine horizontal position with viewport boundary detection
    let left = 0;
    let right = 0;
    let transformOrigin = flipVertical ? 'bottom' : 'top';

    if (align === 'right') {
      // Prefer right alignment
      right = viewportWidth - triggerRect.right;

      // Check if menu would overflow left edge
      if (triggerRect.right - MENU_WIDTH < VIEWPORT_PADDING) {
        // Switch to left alignment
        left = Math.max(VIEWPORT_PADDING, triggerRect.left);
        right = 0;
        transformOrigin += ' left';
      } else {
        transformOrigin += ' right';
      }
    } else {
      // Prefer left alignment
      left = triggerRect.left;

      // Check if menu would overflow right edge
      if (triggerRect.left + MENU_WIDTH > viewportWidth - VIEWPORT_PADDING) {
        // Switch to right alignment
        right = viewportWidth - triggerRect.right;
        left = 0;
        transformOrigin += ' right';
      } else {
        transformOrigin += ' left';
      }
    }

    // Ensure menu doesn't go off screen on mobile
    if (viewportWidth < 400) {
      // On very small screens, center the menu
      const menuWidth = Math.min(MENU_WIDTH, viewportWidth - VIEWPORT_PADDING * 2);
      left = (viewportWidth - menuWidth) / 2;
      right = 0;
      transformOrigin = flipVertical ? 'bottom center' : 'top center';
    }

    setPosition({ top, left, right, transformOrigin, flipVertical });
  }, [align]);

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

    const handleResize = () => {
      if (isOpen) {
        calculatePosition();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleResize, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [isOpen, calculatePosition]);

  useEffect(() => {
    if (isOpen) {
      // Use requestAnimationFrame to ensure menu is rendered before calculating position
      requestAnimationFrame(() => {
        calculatePosition();
      });
    }
  }, [isOpen, calculatePosition]);

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
            className={`fixed z-50 min-w-[180px] max-w-[calc(100vw-16px)] bg-white border border-gray-200 rounded-lg shadow-lg py-1 animate-in fade-in duration-150 ${
              position.flipVertical ? 'slide-in-from-bottom-2' : 'slide-in-from-top-2'
            }`}
            style={{
              top: position.top,
              left: position.left || 'auto',
              right: position.right || 'auto',
              transformOrigin: position.transformOrigin,
            }}
          >
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors min-h-[44px]
                  ${item.danger ? 'text-red-600 hover:bg-red-50 active:bg-red-100' : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'}
                  ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {item.icon && <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
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
