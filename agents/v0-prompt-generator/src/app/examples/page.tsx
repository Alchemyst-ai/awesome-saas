'use client';

import { ExampleGallery } from '@/components/ExampleGallery';

export default function ExamplesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ExampleGallery
        onSelectExample={(prompt) => {
          console.log('Selected example:', prompt);
        }}
        onSelectTemplate={(template) => {
          console.log('Selected template:', template);
        }}
      />
    </div>
  );
}
