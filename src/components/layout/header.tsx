'use client';

import { Bell, Search, Plus, User } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  showSearch?: boolean;
  onSearch?: (query: string) => void;
}

export function Header({
  title,
  subtitle,
  action,
  showSearch = false,
  onSearch,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <header className="h-16 border-b border-neutral-200 bg-white px-6 flex items-center justify-between">
      {/* Left: Title */}
      <div>
        <h1 className="text-xl font-semibold text-neutral-900 font-mono">{title}</h1>
        {subtitle && (
          <p className="text-sm text-neutral-500">{subtitle}</p>
        )}
      </div>

      {/* Center: Search (optional) */}
      {showSearch && (
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-md text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
          </div>
        </form>
      )}

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {action && (
          <button
            onClick={action.onClick}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white font-medium rounded-md hover:bg-neutral-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {action.label}
          </button>
        )}

        {/* Notifications */}
        <button className="relative p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-neutral-900 rounded-full" />
        </button>

        {/* User Menu */}
        <button className="flex items-center gap-2 p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors">
          <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
            <User className="w-4 h-4 text-neutral-600" />
          </div>
        </button>
      </div>
    </header>
  );
}
