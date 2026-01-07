'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout';
import { TemplateList } from '@/components/templates';
import type { EmailTemplate } from '@/types';

export default function TemplatesPage() {
  const router = useRouter();

  const handleEdit = (template: EmailTemplate) => {
    router.push(`/templates/${template.id}`);
  };

  const handleCreate = () => {
    router.push('/templates/new');
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Email Templates"
        subtitle="Create and manage reusable email templates"
        action={{
          label: 'New Template',
          onClick: handleCreate,
        }}
      />

      <div className="flex-1 p-6 overflow-auto">
        <TemplateList 
          onEdit={handleEdit} 
          onCreateTemplate={handleCreate}
        />
      </div>
    </div>
  );
}
