'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Target, 
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
} from 'lucide-react';
import { useState } from 'react';

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
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`
        flex flex-col h-screen bg-dark-800 border-r border-dark-600 transition-all duration-300
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 p-4 border-b border-dark-600">
        <div className="w-8 h-8 rounded-lg bg-brand-gold flex items-center justify-center flex-shrink-0">
          <Target className="w-5 h-5 text-dark-900" />
        </div>
        {!collapsed && (
          <span className="text-xl font-bold text-white">Cap Outro</span>
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
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-brand-gold/10 text-brand-gold' 
                  : 'text-gray-400 hover:text-white hover:bg-dark-700'
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
      <div className="p-3 border-t border-dark-600 space-y-1">
        {bottomItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-brand-gold/10 text-brand-gold' 
                  : 'text-gray-400 hover:text-white hover:bg-dark-700'
                }
              `}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700 w-full transition-colors"
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
