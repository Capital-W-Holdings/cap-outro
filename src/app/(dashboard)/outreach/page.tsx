'use client';

import { Header } from '@/components/layout';
import { OutreachList } from '@/components/outreach';

export default function OutreachPage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Outreach"
        subtitle="Track all your investor communications"
      />

      <div className="flex-1 p-6 overflow-auto">
        <OutreachList />
      </div>
    </div>
  );
}
