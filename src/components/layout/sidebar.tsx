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
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useMobileSidebar } from '@/contexts/mobile-sidebar-context';

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
  { href: '/support', label: 'Support', icon: HelpCircle },
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
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                ${isActive
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }
              `}
              title={!isMobile && collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {(isMobile || !collapsed) && <span className="font-medium text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div className="p-3 border-t border-gray-200 space-y-1">
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
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }
              `}
              title={!isMobile && collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {(isMobile || !collapsed) && <span className="font-medium text-sm">{item.label}</span>}
            </Link>
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
