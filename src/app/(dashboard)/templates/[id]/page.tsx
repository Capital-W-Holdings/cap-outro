'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button, LoadingPage, ErrorState } from '@/components/ui';
import { TemplateEditor } from '@/components/templates';
import { useTemplate } from '@/hooks';

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;
  
  const isNew = templateId === 'new';
  const { data: template, isLoading, error, refetch } = useTemplate(templateId);

  // For new templates, show editor immediately
  if (isNew) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b border-dark-600 bg-dark-800 px-6 py-4">
          <Link href="/templates">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Templates
            </Button>
          </Link>
        </div>
        <div className="flex-1 p-6 overflow-auto">
          <TemplateEditor
            onSave={() => router.push('/templates')}
            onCancel={() => router.push('/templates')}
          />
        </div>
      </div>
    );
  }

  if (isLoading) return <LoadingPage />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!template) return <ErrorState error="Template not found" />;

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-dark-600 bg-dark-800 px-6 py-4">
        <Link href="/templates">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Templates
          </Button>
        </Link>
      </div>
      <div className="flex-1 p-6 overflow-auto">
        <TemplateEditor
          template={template}
          onSave={() => router.push('/templates')}
          onCancel={() => router.push('/templates')}
        />
      </div>
    </div>
  );
}
