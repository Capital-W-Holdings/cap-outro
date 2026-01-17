'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, Search, Plus, User, Settings, LogOut, HelpCircle, X, Mail, Calendar, TrendingUp, Zap, RefreshCw, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dropdown } from '@/components/ui/dropdown';
import { useNotifications, useMarkNotificationsRead } from '@/hooks';
import { useMobileSidebar } from '@/contexts/mobile-sidebar-context';
import type { NotificationType } from '@/types';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  customAction?: React.ReactNode;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
}

export function Header({
  title,
  subtitle,
  action,
  customAction,
  showSearch = false,
  onSearch,
}: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const { open: openMobileSidebar } = useMobileSidebar();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const userMenuItems = [
    {
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      onClick: () => router.push('/settings'),
    },
    {
      label: 'Help & Support',
      icon: <HelpCircle className="w-4 h-4" />,
      onClick: () => window.open('mailto:support@capoutro.com', '_blank'),
    },
    {
      label: 'Sign Out',
      icon: <LogOut className="w-4 h-4" />,
      onClick: () => {
        // Clear any local storage/session
        localStorage.clear();
        router.push('/');
      },
      danger: true,
    },
  ];

  // Real notifications from API
  const { notifications, unreadCount, isLoading: notificationsLoading, refetch: refetchNotifications } = useNotifications({ pollInterval: 60000 });
  const { markAllAsRead } = useMarkNotificationsRead();

  // Get icon for notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'email_opened':
        return <Mail className="w-4 h-4 text-blue-500" />;
      case 'email_replied':
        return <Mail className="w-4 h-4 text-green-500" />;
      case 'meeting_scheduled':
        return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'stage_changed':
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      case 'campaign_started':
        return <Zap className="w-4 h-4 text-yellow-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  // Format relative time
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    refetchNotifications();
    setShowNotifications(false);
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Hamburger + Title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile hamburger menu */}
        <button
          onClick={openMobileSidebar}
          className="md:hidden p-2 -ml-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="font-mono text-lg sm:text-xl font-semibold text-black truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-500 truncate hidden sm:block">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Center: Search (optional) - hidden on mobile */}
      {showSearch && (
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4 hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
        </form>
      )}

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {customAction && (
          <div className="hidden sm:block">{customAction}</div>
        )}
        {action && !customAction && (
          <Button
            variant="primary"
            onClick={action.onClick}
            leftIcon={<Plus className="w-4 h-4" />}
            className="hidden sm:inline-flex"
          >
            {action.label}
          </Button>
        )}
        {/* Mobile-only compact action button */}
        {action && !customAction && (
          <Button
            variant="primary"
            onClick={action.onClick}
            className="sm:hidden !px-3"
            aria-label={action.label}
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
        {customAction && (
          <div className="sm:hidden">{customAction}</div>
        )}

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-black rounded-full" />
            )}
          </button>

          {/* Notifications Dropdown - Responsive */}
          {showNotifications && (
            <div className="absolute right-0 sm:right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm sm:max-w-none bg-white border border-gray-200 rounded-lg shadow-lg z-50 -mr-2 sm:mr-0">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-black text-white rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => refetchNotifications()}
                    className="p-1 hover:bg-gray-100 rounded-lg"
                    title="Refresh"
                  >
                    <RefreshCw className={`w-4 h-4 text-gray-500 ${notificationsLoading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="max-h-80 sm:max-h-96 overflow-y-auto">
                {notificationsLoading && notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 mx-auto mb-2 text-gray-300 animate-spin" />
                    <p className="text-sm">Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-medium">No notifications yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      When investors open emails or activity happens, you'll see it here
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <Link
                      key={notification.id}
                      href={notification.link || '#'}
                      onClick={() => setShowNotifications(false)}
                      className={`block px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors ${
                        !notification.is_read ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-sm text-gray-600 truncate">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(notification.created_at)}</p>
                        </div>
                        {!notification.is_read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </Link>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-100">
                  <button
                    onClick={handleMarkAllRead}
                    className="text-sm text-gray-600 hover:text-black w-full text-center py-1"
                  >
                    Mark all as read
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Menu */}
        <Dropdown
          trigger={
            <button className="flex items-center gap-2 p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
            </button>
          }
          items={userMenuItems}
          align="right"
        />
      </div>
    </header>
  );
}
