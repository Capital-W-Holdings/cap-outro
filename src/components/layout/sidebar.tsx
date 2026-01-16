'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Kanban,
  Mail,
  GitBranch,
  FileText,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/campaigns', label: 'Campaigns', icon: LayoutDashboard },
  { href: '/investors', label: 'Investors', icon: Users },
  { href: '/pipeline', label: 'Pipeline', icon: Kanban },
  { href: '/sequences', label: 'Sequences', icon: GitBranch },
  { href: '/templates', label: 'Templates', icon: FileText },
  { href: '/outreach', label: 'Outreach', icon: Mail },
];

const bottomItems = [
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/help', label: 'Help', icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    document.cookie = 'cap-outro-demo-session=; path=/; max-age=0';
    router.push('/login');
  };

  return (
    <aside
      className={`
        flex flex-col h-screen bg-white border-r border-neutral-200 transition-all duration-300
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 p-4 border-b border-neutral-200">
        {!collapsed && (
          <span className="text-xl font-semibold text-neutral-900 font-mono tracking-tight">Cap Outro</span>
        )}
        {collapsed && (
          <span className="text-xl font-semibold text-neutral-900 font-mono">CO</span>
        )}
      </div>

      {/* Main Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors
                ${isActive
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }
              `}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div className="p-3 border-t border-neutral-200 space-y-1">
        {bottomItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors
                ${isActive
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }
              `}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 w-full transition-colors"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 w-full transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
