'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Header } from '@/components/layout';
import { Button } from '@/components/ui';
import { SequenceBuilder } from '@/components/sequences';

export default function SequenceDetailPage() {
  const params = useParams();
  const sequenceId = params.id as string;

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Sequence Builder"
        subtitle="Build your automated outreach sequence"
      />

      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <Link href="/sequences">
            <Button variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Sequences
            </Button>
          </Link>
        </div>

        <SequenceBuilder sequenceId={sequenceId} />
      </div>
    </div>
  );
}
