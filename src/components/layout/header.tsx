'use client';

import { Bell, Search, Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    <header className="h-16 border-b border-dark-600 bg-dark-800 px-6 flex items-center justify-between">
      {/* Left: Title */}
      <div>
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        {subtitle && (
          <p className="text-sm text-gray-400">{subtitle}</p>
        )}
      </div>

      {/* Center: Search (optional) */}
      {showSearch && (
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-dark-700 border-dark-500"
            />
          </div>
        </form>
      )}

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {action && (
          <Button 
            variant="primary" 
            onClick={action.onClick}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            {action.label}
          </Button>
        )}

        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-gold rounded-full" />
        </button>

        {/* User Menu */}
        <button className="flex items-center gap-2 p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors">
          <div className="w-8 h-8 rounded-full bg-dark-600 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
        </button>
      </div>
    </header>
  );
}
