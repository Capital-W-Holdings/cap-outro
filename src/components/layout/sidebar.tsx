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
  HelpCircle as HelpCircleIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useMobileSidebar } from '@/contexts/mobile-sidebar-context';
import { HelpTooltip } from '@/components/ui/help-tooltip';
import { SetupProgressSidebar } from '@/components/onboarding';

type ColorKey = 'blue' | 'violet' | 'purple' | 'amber' | 'emerald' | 'rose' | 'gray';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  help: string;
  color: ColorKey;
}

// Nav items with colors for active states
const navItems: NavItem[] = [
  {
    href: '/investors',
    label: 'Investors',
    icon: Users,
    help: 'Step 1: Build your investor database. Import from CSV or add manually.',
    color: 'blue',
  },
  {
    href: '/campaigns',
    label: 'Campaigns',
    icon: LayoutDashboard,
    help: 'Step 2: Create a campaign to organize your fundraise (e.g., "Series A 2024").',
    color: 'violet',
  },
  {
    href: '/templates',
    label: 'Templates',
    icon: FileText,
    help: 'Step 3: Write email templates with merge fields like {{investor_name}}.',
    color: 'purple',
  },
  {
    href: '/sequences',
    label: 'Sequences',
    icon: GitBranch,
    help: 'Step 4: Create automated email sequences using your templates.',
    color: 'amber',
  },
  {
    href: '/pipeline',
    label: 'Pipeline',
    icon: Kanban,
    help: 'Step 5: Track investor progress from first contact to close.',
    color: 'emerald',
  },
  {
    href: '/outreach',
    label: 'Outreach',
    icon: Mail,
    help: 'Step 6: Monitor all scheduled and sent communications.',
    color: 'rose',
  },
];

const bottomItems: NavItem[] = [
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    help: 'Configure your email account and preferences.',
    color: 'gray',
  },
  {
    href: '/support',
    label: 'Support',
    icon: HelpCircleIcon,
    help: 'Get help and contact support.',
    color: 'gray',
  },
];

const colorClasses: Record<ColorKey, { active: string; icon: string; hover: string }> = {
  blue: {
    active: 'bg-blue-600 text-white shadow-lg shadow-blue-500/20',
    icon: 'text-blue-500',
    hover: 'hover:bg-blue-50 hover:text-blue-700'
  },
  violet: {
    active: 'bg-violet-600 text-white shadow-lg shadow-violet-500/20',
    icon: 'text-violet-500',
    hover: 'hover:bg-violet-50 hover:text-violet-700'
  },
  purple: {
    active: 'bg-purple-600 text-white shadow-lg shadow-purple-500/20',
    icon: 'text-purple-500',
    hover: 'hover:bg-purple-50 hover:text-purple-700'
  },
  amber: {
    active: 'bg-amber-500 text-white shadow-lg shadow-amber-500/20',
    icon: 'text-amber-500',
    hover: 'hover:bg-amber-50 hover:text-amber-700'
  },
  emerald: {
    active: 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20',
    icon: 'text-emerald-500',
    hover: 'hover:bg-emerald-50 hover:text-emerald-700'
  },
  rose: {
    active: 'bg-rose-500 text-white shadow-lg shadow-rose-500/20',
    icon: 'text-rose-500',
    hover: 'hover:bg-rose-50 hover:text-rose-700'
  },
  gray: {
    active: 'bg-gray-900 text-white',
    icon: 'text-gray-500',
    hover: 'hover:bg-gray-100 hover:text-gray-900'
  },
};

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { isOpen, close } = useMobileSidebar();

  // Close mobile sidebar on route change
  useEffect(() => {
    close();
  }, [pathname, close]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between gap-2 p-4 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
            <span className="text-white text-sm font-bold">CO</span>
          </div>
          {(isMobile || !collapsed) && (
            <span className="text-lg font-semibold text-gray-900 tracking-tight">
              Cap Outro
            </span>
          )}
        </Link>
        {isMobile && (
          <button
            onClick={close}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Setup Progress - Sidebar Card */}
      {(isMobile || !collapsed) && <SetupProgressSidebar />}

      {/* Main Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          const colors = colorClasses[item.color];

          return (
            <div key={item.href} className="flex items-center">
              <Link
                href={item.href}
                className={`
                  flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                  ${isActive
                    ? colors.active
                    : `text-gray-600 ${colors.hover}`
                  }
                `}
                title={!isMobile && collapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${!isActive ? colors.icon : ''}`} />
                {(isMobile || !collapsed) && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </Link>
              {(isMobile || !collapsed) && (
                <div className={`ml-1 ${isActive ? 'text-gray-400' : ''}`}>
                  <HelpTooltip content={item.help} />
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div className="p-3 border-t border-gray-100 space-y-1">
        {bottomItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          const colors = colorClasses[item.color];

          return (
            <div key={item.href} className="flex items-center">
              <Link
                href={item.href}
                className={`
                  flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                  ${isActive
                    ? colors.active
                    : `text-gray-600 ${colors.hover}`
                  }
                `}
                title={!isMobile && collapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${!isActive ? colors.icon : ''}`} />
                {(isMobile || !collapsed) && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </Link>
              {(isMobile || !collapsed) && (
                <div className={`ml-1 ${isActive ? 'text-gray-400' : ''}`}>
                  <HelpTooltip content={item.help} />
                </div>
              )}
            </div>
          );
        })}

        {/* Collapse Toggle - Desktop only */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 w-full transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium text-sm">Collapse</span>
              </>
            )}
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden md:flex flex-col h-screen bg-white border-r border-gray-100 transition-all duration-300
          ${collapsed ? 'w-16' : 'w-64'}
        `}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />

          {/* Sidebar Panel */}
          <aside
            className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white flex flex-col shadow-xl animate-in slide-in-from-left duration-300"
          >
            <SidebarContent isMobile />
          </aside>
        </div>
      )}
    </>
  );
}
