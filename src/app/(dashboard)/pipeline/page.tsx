'use client';

import { Header } from '@/components/layout';
import { PipelineKanban } from '@/components/pipeline';

export default function PipelinePage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Pipeline"
        subtitle="Track investor progress through your raise"
        help="Visual pipeline view showing investors at each stage of your fundraise. Drag and drop investors between stages to track progress from initial contact through to closing."
      />

      <div className="flex-1 overflow-hidden">
        <PipelineKanban />
      </div>
    </div>
  );
}
