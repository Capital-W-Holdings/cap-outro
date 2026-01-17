'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, GitBranch, Users } from 'lucide-react';
import { Header } from '@/components/layout';
import { Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { SequenceBuilder, SequenceEnrollments } from '@/components/sequences';

export default function SequenceDetailPage() {
  const params = useParams();
  const sequenceId = params.id as string;
  const [activeTab, setActiveTab] = useState('builder');

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Sequence Builder"
        subtitle="Build your automated outreach sequence"
      />

      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/sequences">
            <Button variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Sequences
            </Button>
          </Link>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="builder">
              <GitBranch className="w-4 h-4 mr-2" />
              Steps
            </TabsTrigger>
            <TabsTrigger value="enrollments">
              <Users className="w-4 h-4 mr-2" />
              Enrolled Investors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builder">
            <SequenceBuilder sequenceId={sequenceId} />
          </TabsContent>

          <TabsContent value="enrollments">
            <SequenceEnrollments sequenceId={sequenceId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
