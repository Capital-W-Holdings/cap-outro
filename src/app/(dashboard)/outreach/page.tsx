'use client';

import { Header } from '@/components/layout';
import { OutreachList } from '@/components/outreach';

export default function OutreachPage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Outreach"
        subtitle="Track all your investor communications"
        help="View all scheduled and sent communications. Track email opens, replies, and follow-up status. Filter by status to see pending, sent, or failed outreach."
      />

      <div className="flex-1 p-4 sm:p-6 overflow-auto">
        <OutreachList />
      </div>
    </div>
  );
}
