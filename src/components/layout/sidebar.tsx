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

// Nav items ordered by workflow: Build database → Create campaign → Write templates → Set up sequences → Track pipeline → Monitor outreach
const navItems = [
  {
    href: '/investors',
    label: 'Investors',
    icon: Users,
    help: 'Step 1: Build your investor database. Import from CSV or add manually.',
    step: 1,
  },
  {
    href: '/campaigns',
    label: 'Campaigns',
    icon: LayoutDashboard,
    help: 'Step 2: Create a campaign to organize your fundraise (e.g., "Series A 2024").',
    step: 2,
  },
  {
    href: '/templates',
    label: 'Templates',
    icon: FileText,
    help: 'Step 3: Write email templates with merge fields like {{investor_name}}.',
    step: 3,
  },
  {
    href: '/sequences',
    label: 'Sequences',
    icon: GitBranch,
    help: 'Step 4: Create automated email sequences using your templates.',
    step: 4,
  },
  {
    href: '/pipeline',
    label: 'Pipeline',
    icon: Kanban,
    help: 'Step 5: Track investor progress from first contact to close.',
    step: 5,
  },
  {
    href: '/outreach',
    label: 'Outreach',
    icon: Mail,
    help: 'Step 6: Monitor all scheduled and sent communications.',
    step: 6,
  },
];

const bottomItems = [
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    help: 'Configure your email account and preferences.',
  },
  {
    href: '/support',
    label: 'Support',
    icon: HelpCircleIcon,
    help: 'Get help and contact support.',
  },
];

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
      <div className="flex items-center justify-between gap-2 p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-black flex items-center justify-center flex-shrink-0">
            <span className="font-mono text-white text-xs font-bold">CO</span>
          </div>
          {(isMobile || !collapsed) && (
            <span className="font-mono text-lg font-bold text-black tracking-tight">
              CAP OUTRO
            </span>
          )}
        </div>
        {isMobile && (
          <button
            onClick={close}
            className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <div key={item.href} className="flex items-center">
              <Link
                href={item.href}
                className={`
                  flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                  ${isActive
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-black hover:bg-gray-100'
                  }
                `}
                title={!isMobile && collapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
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
      <div className="p-3 border-t border-gray-200 space-y-1">
        {bottomItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <div key={item.href} className="flex items-center">
              <Link
                href={item.href}
                className={`
                  flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                  ${isActive
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-black hover:bg-gray-100'
                  }
                `}
                title={!isMobile && collapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
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
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100 w-full transition-colors"
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
          hidden md:flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300
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
