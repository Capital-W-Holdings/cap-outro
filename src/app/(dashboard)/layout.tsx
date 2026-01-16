'use client';

import { Sidebar, Footer } from '@/components/layout';
import { MobileSidebarProvider } from '@/contexts/mobile-sidebar-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileSidebarProvider>
      <div className="flex h-screen bg-[#fafafa]">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <main className="flex-1 overflow-auto">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </MobileSidebarProvider>
  );
}
