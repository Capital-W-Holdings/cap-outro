'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
}

export function Breadcrumbs({ items, showHome = false }: BreadcrumbsProps) {
  const allItems = showHome
    ? [{ label: 'Home', href: '/' }, ...items]
    : items;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm overflow-x-auto">
      {allItems.map((item, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="text-gray-500 hover:text-black transition-colors whitespace-nowrap px-1 py-0.5 rounded hover:bg-gray-100"
            >
              {index === 0 && showHome ? (
                <Home className="w-4 h-4" />
              ) : (
                item.label
              )}
            </Link>
          ) : (
            <span className="text-black font-medium whitespace-nowrap px-1">
              {item.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
